import { pool } from '../config/db.js';

// Tổng quan Dashboard tài chính
export const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = parseInt(req.query.month) || (now.getMonth() + 1);
    const currentYear = parseInt(req.query.year) || now.getFullYear();

    // Tháng trước để so sánh tăng/giảm
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    // 1. Tổng tài sản hiện tại qua các ví
    const totalAssetsRes = await pool.query(
      'SELECT COALESCE(SUM(balance), 0) AS total_balance FROM accounts WHERE is_active = TRUE'
    );
    const totalBalance = parseFloat(totalAssetsRes.rows[0].total_balance);

    // 2. Thu nhập & Chi tiêu tháng hiện tại
    const currentMonthFlowRes = await pool.query(
      `SELECT 
        type, 
        COALESCE(SUM(amount), 0) AS total 
       FROM transactions 
       WHERE EXTRACT(MONTH FROM transaction_date) = $1 
         AND EXTRACT(YEAR FROM transaction_date) = $2
         AND type IN ('INCOME', 'EXPENSE')
       GROUP BY type`,
      [currentMonth, currentYear]
    );

    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    currentMonthFlowRes.rows.forEach(r => {
      if (r.type === 'INCOME') thisMonthIncome = parseFloat(r.total);
      if (r.type === 'EXPENSE') thisMonthExpense = parseFloat(r.total);
    });

    const netSavings = thisMonthIncome - thisMonthExpense;
    const savingsRate = thisMonthIncome > 0 ? Math.round((netSavings / thisMonthIncome) * 100) : 0;

    // 3. Thu nhập & Chi tiêu tháng trước (để tính % tăng trưởng)
    const prevMonthFlowRes = await pool.query(
      `SELECT 
        type, 
        COALESCE(SUM(amount), 0) AS total 
       FROM transactions 
       WHERE EXTRACT(MONTH FROM transaction_date) = $1 
         AND EXTRACT(YEAR FROM transaction_date) = $2
         AND type IN ('INCOME', 'EXPENSE')
       GROUP BY type`,
      [prevMonth, prevYear]
    );

    let prevMonthIncome = 0;
    let prevMonthExpense = 0;
    prevMonthFlowRes.rows.forEach(r => {
      if (r.type === 'INCOME') prevMonthIncome = parseFloat(r.total);
      if (r.type === 'EXPENSE') prevMonthExpense = parseFloat(r.total);
    });

    const incomeGrowth = prevMonthIncome > 0 
      ? Math.round(((thisMonthIncome - prevMonthIncome) / prevMonthIncome) * 100) 
      : 0;
    const expenseGrowth = prevMonthExpense > 0 
      ? Math.round(((thisMonthExpense - prevMonthExpense) / prevMonthExpense) * 100) 
      : 0;

    // 4. Biểu đồ thu chi 6 tháng gần nhất
    const monthlyTrendRes = await pool.query(
      `SELECT 
        TO_CHAR(transaction_date, 'MM/YYYY') AS period,
        EXTRACT(YEAR FROM transaction_date) AS year,
        EXTRACT(MONTH FROM transaction_date) AS month,
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expense
       FROM transactions
       WHERE transaction_date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY period, year, month
       ORDER BY year ASC, month ASC`
    );

    // 5. Cơ cấu chi tiêu theo danh mục tháng này (Donut / Pie chart)
    const expenseByCategoryRes = await pool.query(
      `SELECT 
        c.id,
        c.name,
        c.icon,
        c.color,
        COALESCE(SUM(t.amount), 0) AS total,
        COUNT(t.id) AS tx_count
       FROM categories c
       JOIN transactions t ON c.id = t.category_id
       WHERE t.type = 'EXPENSE'
         AND EXTRACT(MONTH FROM t.transaction_date) = $1
         AND EXTRACT(YEAR FROM t.transaction_date) = $2
       GROUP BY c.id, c.name, c.icon, c.color
       ORDER BY total DESC`,
      [currentMonth, currentYear]
    );

    const categoryBreakdown = expenseByCategoryRes.rows.map(item => {
      const total = parseFloat(item.total);
      const percentage = thisMonthExpense > 0 ? Math.round((total / thisMonthExpense) * 100) : 0;
      return {
        ...item,
        total,
        percentage
      };
    });

    // 6. Giao dịch gần nhất (Recent transactions)
    const recentTxRes = await pool.query(
      `SELECT 
        t.*,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        a.name AS account_name,
        to_acc.name AS to_account_name,
        f.name AS friend_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts a ON t.account_id = a.id
       LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.id
       LEFT JOIN friends f ON t.friend_id = f.id
       ORDER BY t.transaction_date DESC, t.id DESC
       LIMIT 6`
    );

    // 7. Danh sách ví đang hoạt động
    const accountsRes = await pool.query(
      'SELECT id, name, type, balance, icon, color FROM accounts WHERE is_active = TRUE ORDER BY balance DESC'
    );

    // 8. Thống kê Sổ Vay & Nợ (Người khác nợ mình vs Mình nợ người khác)
    const debtsRes = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'LOAN' AND status != 'PAID' THEN (amount - paid_amount) ELSE 0 END), 0) AS remaining_loan,
        COALESCE(SUM(CASE WHEN type = 'DEBT' AND status != 'PAID' THEN (amount - paid_amount) ELSE 0 END), 0) AS remaining_debt,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'PAID' THEN 1 END) AS overdue_count
      FROM debts
    `);

    const debtStats = {
      remainingLoan: parseFloat(debtsRes.rows[0].remaining_loan),
      remainingDebt: parseFloat(debtsRes.rows[0].remaining_debt),
      overdueCount: parseInt(debtsRes.rows[0].overdue_count)
    };

    // Tài sản ròng thực tế = Tổng số dư ví + Khoản phải thu (cho vay) - Khoản phải trả (đi vay)
    const netWorth = totalBalance + debtStats.remainingLoan - debtStats.remainingDebt;

    res.json({
      success: true,
      data: {
        totalBalance,
        netWorth,
        thisMonthIncome,
        thisMonthExpense,
        netSavings,
        savingsRate,
        growth: {
          incomeGrowth,
          expenseGrowth
        },
        monthlyTrend: monthlyTrendRes.rows.map(r => ({
          period: r.period,
          income: parseFloat(r.income),
          expense: parseFloat(r.expense),
          savings: parseFloat(r.income) - parseFloat(r.expense)
        })),
        categoryBreakdown,
        recentTransactions: recentTxRes.rows,
        accounts: accountsRes.rows,
        debts: debtStats,
        month: currentMonth,
        year: currentYear
      }
    });
  } catch (error) {
    console.error('Lỗi getDashboardSummary:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải dữ liệu tổng quan' });
  }
};

