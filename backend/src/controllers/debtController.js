import { pool } from '../config/db.js';

// 1. Lấy danh sách các khoản vay & nợ
export const getDebts = async (req, res) => {
  try {
    const { type, status, search, friend_id } = req.query;

    const conditions = [];
    const params = [];
    let pIdx = 1;

    if (type && ['LOAN', 'DEBT'].includes(type.toUpperCase())) {
      conditions.push(`d.type = $${pIdx++}`);
      params.push(type.toUpperCase());
    }

    if (status && ['PENDING', 'PARTIAL', 'PAID'].includes(status.toUpperCase())) {
      conditions.push(`d.status = $${pIdx++}`);
      params.push(status.toUpperCase());
    }

    if (friend_id) {
      conditions.push(`d.friend_id = $${pIdx++}`);
      params.push(friend_id);
    }

    if (search) {
      conditions.push(`(d.person_name ILIKE $${pIdx} OR d.phone ILIKE $${pIdx} OR d.note ILIKE $${pIdx} OR f.name ILIKE $${pIdx})`);
      params.push(`%${search}%`);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        d.*,
        a.name AS account_name,
        a.icon AS account_icon,
        a.color AS account_color,
        f.name AS friend_name,
        (d.amount - d.paid_amount) AS remaining_amount,
        CASE 
          WHEN d.due_date IS NOT NULL AND d.due_date < CURRENT_DATE AND d.status != 'PAID' THEN true 
          ELSE false 
        END AS is_overdue,
        COALESCE((SELECT COUNT(*) FROM debt_payments dp WHERE dp.debt_id = d.id), 0) AS payment_count
      FROM debts d
      LEFT JOIN accounts a ON d.account_id = a.id
      LEFT JOIN friends f ON d.friend_id = f.id
      ${whereClause}
      ORDER BY 
        CASE WHEN d.status = 'PAID' THEN 2 ELSE 1 END,
        d.due_date ASC NULLS LAST,
        d.start_date DESC
    `;

    const result = await pool.query(sql, params);

    // Tính toán thống kê tổng quan
    const summaryRes = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'LOAN' THEN amount ELSE 0 END), 0) AS total_loan,
        COALESCE(SUM(CASE WHEN type = 'LOAN' THEN (amount - paid_amount) ELSE 0 END), 0) AS remaining_loan,
        COALESCE(SUM(CASE WHEN type = 'DEBT' THEN amount ELSE 0 END), 0) AS total_debt,
        COALESCE(SUM(CASE WHEN type = 'DEBT' THEN (amount - paid_amount) ELSE 0 END), 0) AS remaining_debt,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'PAID' THEN 1 END) AS overdue_count
      FROM debts
    `);

    const summary = {
      totalLoan: parseFloat(summaryRes.rows[0].total_loan),
      remainingLoan: parseFloat(summaryRes.rows[0].remaining_loan),
      totalDebt: parseFloat(summaryRes.rows[0].total_debt),
      remainingDebt: parseFloat(summaryRes.rows[0].remaining_debt),
      overdueCount: parseInt(summaryRes.rows[0].overdue_count)
    };

    res.json({ success: true, data: result.rows, summary });
  } catch (error) {
    console.error('Lỗi getDebts:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách sổ nợ' });
  }
};

// 2. Lấy chi tiết khoản nợ kèm lịch sử trả
export const getDebtById = async (req, res) => {
  try {
    const { id } = req.params;
    const debtRes = await pool.query(`
      SELECT d.*, a.name AS account_name, (d.amount - d.paid_amount) AS remaining_amount
      FROM debts d
      LEFT JOIN accounts a ON d.account_id = a.id
      WHERE d.id = $1
    `, [id]);

    if (debtRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khoản nợ' });
    }

    const paymentsRes = await pool.query(`
      SELECT dp.*, a.name AS account_name
      FROM debt_payments dp
      LEFT JOIN accounts a ON dp.account_id = a.id
      WHERE dp.debt_id = $1
      ORDER BY dp.payment_date DESC, dp.id DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...debtRes.rows[0],
        payments: paymentsRes.rows
      }
    });
  } catch (error) {
    console.error('Lỗi getDebtById:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// 3. Tạo khoản vay/nợ mới
export const createDebt = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      type, // 'LOAN' (Cho vay / Người khác nợ mình), 'DEBT' (Đi vay / Mình nợ người khác)
      person_name,
      phone = '',
      amount,
      account_id,
      friend_id,
      start_date,
      due_date,
      note = '',
      create_transaction = false // Có ghi nhận biến động số dư ví hay không
    } = req.body;

    const numAmount = parseFloat(amount);
    if (!type || !['LOAN', 'DEBT'].includes(type) || !person_name?.trim() || !numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Thông tin khoản nợ không hợp lệ' });
    }

    await client.query('BEGIN');

    const sDate = start_date || new Date().toISOString().split('T')[0];

    const result = await client.query(`
      INSERT INTO debts (type, person_name, phone, amount, paid_amount, account_id, friend_id, start_date, due_date, status, note)
      VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8, 'PENDING', $9)
      RETURNING *
    `, [type, person_name.trim(), phone.trim(), numAmount, account_id || null, friend_id || null, sDate, due_date || null, note.trim()]);

    const newDebt = result.rows[0];

    // Nếu người dùng chọn liên kết thay đổi số dư ví ngay lúc tạo:
    if (create_transaction && account_id) {
      if (type === 'LOAN') {
        // Cho vay: trừ tiền ví nguồn (LOAN - Không tính vào Chi tiêu)
        await client.query('UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2', [numAmount, account_id]);
        await client.query(`
          INSERT INTO transactions (type, amount, account_id, friend_id, debt_id, transaction_date, note)
          VALUES ('LOAN', $1, $2, $3, $4, $5, $6)
        `, [numAmount, account_id, friend_id || null, newDebt.id, sDate, `Cho ${person_name.trim()} vay tiền: ${note.trim()}`.trim()]);
      } else if (type === 'DEBT') {
        // Đi vay: cộng tiền vào ví nhận (BORROW - Không tính vào Thu nhập)
        await client.query('UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2', [numAmount, account_id]);
        await client.query(`
          INSERT INTO transactions (type, amount, account_id, friend_id, debt_id, transaction_date, note)
          VALUES ('BORROW', $1, $2, $3, $4, $5, $6)
        `, [numAmount, account_id, friend_id || null, newDebt.id, sDate, `Vay tiền từ ${person_name.trim()}: ${note.trim()}`.trim()]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: newDebt, message: 'Đã thêm khoản nợ vào sổ thành công' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi createDebt:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lưu khoản nợ' });
  } finally {
    client.release();
  }
};

// 4. Cập nhật thông tin khoản nợ
export const updateDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const { person_name, phone, friend_id, due_date, note } = req.body;

    const check = await pool.query('SELECT * FROM debts WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khoản nợ' });
    }

    const current = check.rows[0];
    const newName = person_name !== undefined ? person_name.trim() : current.person_name;
    const newPhone = phone !== undefined ? phone.trim() : current.phone;
    const newFriendId = friend_id !== undefined ? (friend_id || null) : current.friend_id;
    const newDueDate = due_date !== undefined ? due_date : current.due_date;
    const newNote = note !== undefined ? note.trim() : current.note;

    const result = await pool.query(`
      UPDATE debts
      SET person_name = $1, phone = $2, friend_id = $3, due_date = $4, note = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [newName, newPhone, newFriendId, newDueDate, newNote, id]);

    res.json({ success: true, data: result.rows[0], message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi updateDebt:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật khoản nợ' });
  }
};

// 5. Xóa khoản nợ
export const deleteDebt = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    // 1. Tìm các transactions liên quan đến khoản nợ này để hoàn số dư ví nếu có
    const relatedTx = await client.query('SELECT * FROM transactions WHERE debt_id = $1', [id]);
    for (const tx of relatedTx.rows) {
      const amt = parseFloat(tx.amount);
      if (['EXPENSE', 'LOAN', 'DEBT_REPAYMENT'].includes(tx.type)) {
        await client.query('UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2', [amt, tx.account_id]);
      } else if (['INCOME', 'BORROW', 'DEBT_COLLECTION'].includes(tx.type)) {
        await client.query('UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2', [amt, tx.account_id]);
      }
    }

    // 2. Xóa các transactions liên quan
    await client.query('DELETE FROM transactions WHERE debt_id = $1', [id]);

    // 3. Xóa các payments
    await client.query('DELETE FROM debt_payments WHERE debt_id = $1', [id]);

    // 4. Xóa khoản nợ
    const result = await client.query('DELETE FROM debts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy khoản nợ cần xóa' });
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Đã xóa khoản nợ và hoàn lại số dư liên quan thành công' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi deleteDebt:', error);
    res.status(500).json({ success: false, message: 'Lỗi xóa khoản nợ' });
  } finally {
    client.release();
  }
};

// 6. Ghi nhận thanh toán (Trả nợ / Thu hồi nợ)
export const addDebtPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { amount, payment_date, account_id, note, create_transaction = true } = req.body;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền thanh toán phải lớn hơn 0' });
    }

    await client.query('BEGIN');

    const debtRes = await client.query('SELECT * FROM debts WHERE id = $1 FOR UPDATE', [id]);
    if (debtRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy khoản nợ' });
    }

    const debt = debtRes.rows[0];
    const newPaidAmount = parseFloat(debt.paid_amount) + numAmount;
    const totalAmount = parseFloat(debt.amount);

    let newStatus = 'PARTIAL';
    if (newPaidAmount >= totalAmount) {
      newStatus = 'PAID';
    }

    const pDate = payment_date || new Date().toISOString().split('T')[0];

    // 1. Ghi nhận lượt thanh toán
    const payResult = await client.query(`
      INSERT INTO debt_payments (debt_id, amount, payment_date, account_id, note)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, numAmount, pDate, account_id || null, note || '']);

    // 2. Cập nhật khoản nợ
    await client.query(`
      UPDATE debts 
      SET paid_amount = $1, status = $2, updated_at = NOW()
      WHERE id = $3
    `, [newPaidAmount, newStatus, id]);

    // 3. Tự động cập nhật số dư ví nếu được chọn (Tách riêng khỏi Thu nhập / Chi tiêu)
    if (create_transaction && account_id) {
      if (debt.type === 'LOAN') {
        // Thu nợ: người khác trả tiền cho mình -> Tiền vào ví (DEBT_COLLECTION - Không tính vào Thu nhập)
        await client.query('UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2', [numAmount, account_id]);
        await client.query(`
          INSERT INTO transactions (type, amount, account_id, friend_id, debt_id, transaction_date, note)
          VALUES ('DEBT_COLLECTION', $1, $2, $3, $4, $5, $6)
        `, [numAmount, account_id, debt.friend_id || null, debt.id, pDate, `Thu nợ từ ${debt.person_name}: ${note || ''}`.trim()]);
      } else if (debt.type === 'DEBT') {
        // Trả nợ: mình trả tiền cho chủ nợ -> Tiền ra khỏi ví (DEBT_REPAYMENT - Không tính vào Chi tiêu)
        await client.query('UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2', [numAmount, account_id]);
        await client.query(`
          INSERT INTO transactions (type, amount, account_id, friend_id, debt_id, transaction_date, note)
          VALUES ('DEBT_REPAYMENT', $1, $2, $3, $4, $5, $6)
        `, [numAmount, account_id, debt.friend_id || null, debt.id, pDate, `Trả nợ cho ${debt.person_name}: ${note || ''}`.trim()]);
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: payResult.rows[0],
      newPaidAmount,
      newStatus,
      message: newStatus === 'PAID' ? '🎉 Tuyệt vời! Khoản nợ đã được thanh toán hoàn tất!' : 'Đã ghi nhận thanh toán thành công'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi addDebtPayment:', error);
    res.status(500).json({ success: false, message: 'Lỗi ghi nhận thanh toán' });
  } finally {
    client.release();
  }
};

