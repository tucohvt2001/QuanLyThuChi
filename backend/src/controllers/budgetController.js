import { pool } from '../config/db.js';

// Lấy danh sách ngân sách theo tháng và năm
export const getBudgets = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || (now.getMonth() + 1);
    const year = parseInt(req.query.year) || now.getFullYear();

    // Lấy tất cả ngân sách đã tạo kèm số tiền thực tế đã chi trong tháng đó
    const result = await pool.query(
      `SELECT 
        b.id,
        b.category_id,
        b.month,
        b.year,
        b.amount AS budget_amount,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        COALESCE(
          (SELECT SUM(t.amount) 
           FROM transactions t 
           WHERE t.category_id = b.category_id 
             AND t.type = 'EXPENSE'
             AND EXTRACT(MONTH FROM t.transaction_date) = b.month
             AND EXTRACT(YEAR FROM t.transaction_date) = b.year
          ), 0
        ) AS spent_amount
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       WHERE b.month = $1 AND b.year = $2
       ORDER BY b.amount DESC`,
      [month, year]
    );

    const budgets = result.rows.map(item => {
      const budgetAmount = parseFloat(item.budget_amount);
      const spentAmount = parseFloat(item.spent_amount);
      const percentage = budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0;
      const remaining = budgetAmount - spentAmount;

      let status = 'SAFE'; // SAFE, WARNING, OVER
      if (percentage >= 100) {
        status = 'OVER';
      } else if (percentage >= 80) {
        status = 'WARNING';
      }

      return {
        ...item,
        budget_amount: budgetAmount,
        spent_amount: spentAmount,
        remaining_amount: remaining,
        percentage,
        status
      };
    });

    res.json({ success: true, data: budgets, month, year });
  } catch (error) {
    console.error('Lỗi getBudgets:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách ngân sách' });
  }
};

// Đặt hoặc cập nhật hạn mức ngân sách cho danh mục
export const setBudget = async (req, res) => {
  try {
    const { category_id, month, year, amount } = req.body;
    const numAmount = parseFloat(amount);

    if (!category_id || !month || !year || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Dữ liệu ngân sách không hợp lệ' });
    }

    const result = await pool.query(
      `INSERT INTO budgets (category_id, month, year, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (category_id, month, year)
       DO UPDATE SET amount = EXCLUDED.amount
       RETURNING *`,
      [category_id, month, year, numAmount]
    );

    res.json({ success: true, data: result.rows[0], message: 'Lưu ngân sách thành công' });
  } catch (error) {
    console.error('Lỗi setBudget:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lưu ngân sách' });
  }
};

// Xóa ngân sách
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM budgets WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ngân sách cần xóa' });
    }
    res.json({ success: true, message: 'Đã xóa ngân sách thành công' });
  } catch (error) {
    console.error('Lỗi deleteBudget:', error);
    res.status(500).json({ success: false, message: 'Lỗi xóa ngân sách' });
  }
};

