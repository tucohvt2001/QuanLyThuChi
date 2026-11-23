import { pool } from '../config/db.js';

// Lấy danh sách giao dịch có phân trang và bộ lọc
export const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category_id,
      account_id,
      friend_id,
      start_date,
      end_date,
      month,
      year,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let pIdx = 1;

    if (type) {
      if (type.toUpperCase() === 'DEBT_ALL') {
        conditions.push(`t.type IN ('LOAN', 'BORROW', 'DEBT_COLLECTION', 'DEBT_REPAYMENT')`);
      } else {
        conditions.push(`t.type = $${pIdx++}`);
        params.push(type.toUpperCase());
      }
    }

    if (category_id) {
      conditions.push(`t.category_id = $${pIdx++}`);
      params.push(category_id);
    }

    if (account_id) {
      conditions.push(`(t.account_id = $${pIdx} OR t.to_account_id = $${pIdx})`);
      params.push(account_id);
      pIdx++;
    }

    if (friend_id) {
      conditions.push(`t.friend_id = $${pIdx++}`);
      params.push(friend_id);
    }

    if (start_date) {
      conditions.push(`t.transaction_date >= $${pIdx++}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`t.transaction_date <= $${pIdx++}`);
      params.push(end_date);
    }

    if (month && year) {
      conditions.push(`EXTRACT(MONTH FROM t.transaction_date) = $${pIdx++}`);
      params.push(month);
      conditions.push(`EXTRACT(YEAR FROM t.transaction_date) = $${pIdx++}`);
      params.push(year);
    } else if (year) {
      conditions.push(`EXTRACT(YEAR FROM t.transaction_date) = $${pIdx++}`);
      params.push(year);
    }

    if (search) {
      conditions.push(`(t.note ILIKE $${pIdx} OR c.name ILIKE $${pIdx} OR a.name ILIKE $${pIdx} OR f.name ILIKE $${pIdx})`);
      params.push(`%${search}%`);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Đếm tổng số bản ghi
    const countSql = `
      SELECT COUNT(*) 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN friends f ON t.friend_id = f.id
      ${whereClause}
    `;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0].count);

    // Lấy dữ liệu chi tiết
    const dataSql = `
      SELECT 
        t.*,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        a.name AS account_name,
        a.icon AS account_icon,
        a.color AS account_color,
        to_acc.name AS to_account_name,
        f.name AS friend_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.id
      LEFT JOIN friends f ON t.friend_id = f.id
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT $${pIdx++} OFFSET $${pIdx++}
    `;

    params.push(parseInt(limit), offset);
    const result = await pool.query(dataSql, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Lỗi getTransactions:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách giao dịch' });
  }
};

// Thêm giao dịch mới (Hỗ trợ EXPENSE, INCOME, TRANSFER)
export const createTransaction = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      type, // 'EXPENSE', 'INCOME', 'TRANSFER'
      amount,
      category_id,
      account_id,
      to_account_id,
      friend_id,
      transaction_date,
      note = '',
      image_url = ''
    } = req.body;

    const numAmount = parseFloat(amount);
    if (!type || !numAmount || numAmount <= 0 || !account_id) {
      return res.status(400).json({ success: false, message: 'Thông tin giao dịch không hợp lệ' });
    }

    const tDate = transaction_date || new Date().toISOString().split('T')[0];

    await client.query('BEGIN');

    // 1. Tạo giao dịch
    const txResult = await client.query(
      `INSERT INTO transactions (type, amount, category_id, account_id, to_account_id, friend_id, transaction_date, note, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [type, numAmount, category_id || null, account_id, to_account_id || null, friend_id || null, tDate, note.trim(), image_url]
    );
    const newTx = txResult.rows[0];

    // 2. Cập nhật số dư tài khoản
    if (['EXPENSE', 'LOAN', 'DEBT_REPAYMENT'].includes(type)) {
      await client.query('UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2', [numAmount, account_id]);
    } else if (['INCOME', 'BORROW', 'DEBT_COLLECTION'].includes(type)) {
      await client.query('UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2', [numAmount, account_id]);
    } else if (type === 'TRANSFER' && to_account_id) {
      await client.query('UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2', [numAmount, account_id]);
      await client.query('UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2', [numAmount, to_account_id]);
    }

    await client.query('COMMIT');

    // Lấy thông tin đầy đủ kèm category & account & friend name để trả về UI
    const fullTx = await pool.query(
      `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
              a.name AS account_name, to_acc.name AS to_account_name, f.name AS friend_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts a ON t.account_id = a.id
       LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.id
       LEFT JOIN friends f ON t.friend_id = f.id
       WHERE t.id = $1`,
      [newTx.id]
    );

    res.status(201).json({ success: true, data: fullTx.rows[0], message: 'Tạo giao dịch thành công' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi createTransaction:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lưu giao dịch' });
  } finally {
    client.release();
  }
};

// Cập nhật giao dịch
export const updateTransaction = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      type,
      amount,
      category_id,
      account_id,
      to_account_id,
      friend_id,
      transaction_date,
      note,
      image_url
    } = req.body;

    await client.query('BEGIN');

    // 1. Lấy thông tin giao dịch cũ
    const oldRes = await client.query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (oldRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch cần sửa' });
    }
    const oldTx = oldRes.rows[0];

    // 2. Hoàn lại số dư cũ
    const oldAmount = parseFloat(oldTx.amount);
    if (['EXPENSE', 'LOAN', 'DEBT_REPAYMENT'].includes(oldTx.type)) {
      await client.query('UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2', [oldAmount, oldTx.account_id]);
    } else if (['INCOME', 'BORROW', 'DEBT_COLLECTION'].includes(oldTx.type)) {
      await client.query('UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2', [oldAmount, oldTx.account_id]);
    } else if (oldTx.type === 'TRANSFER' && oldTx.to_account_id) {
      await client.query('UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2', [oldAmount, oldTx.account_id]);
      await client.query('UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2', [oldAmount, oldTx.to_account_id]);
    }

    // 3. Cập nhật thông tin mới
    const newType = type || oldTx.type;
    const newAmount = amount !== undefined ? parseFloat(amount) : parseFloat(oldTx.amount);
    const newCatId = category_id !== undefined ? category_id : oldTx.category_id;
    const newAccId = account_id !== undefined ? account_id : oldTx.account_id;
    const newToAccId = to_account_id !== undefined ? to_account_id : oldTx.to_account_id;
    const newFriendId = friend_id !== undefined ? (friend_id || null) : oldTx.friend_id;
    const newDate = transaction_date || oldTx.transaction_date;
    const newNote = note !== undefined ? note.trim() : oldTx.note;
    const newImg = image_url !== undefined ? image_url : oldTx.image_url;

    await client.query(
      `UPDATE transactions
       SET type = $1, amount = $2, category_id = $3, account_id = $4, to_account_id = $5,
           friend_id = $6, transaction_date = $7, note = $8, image_url = $9, updated_at = NOW()
       WHERE id = $10`,
      [newType, newAmount, newCatId, newAccId, newToAccId, newFriendId, newDate, newNote, newImg, id]
    );

    // 4. Áp dụng số dư mới
    if (['EXPENSE', 'LOAN', 'DEBT_REPAYMENT'].includes(newType)) {
      await client.query('UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2', [newAmount, newAccId]);
    } else if (['INCOME', 'BORROW', 'DEBT_COLLECTION'].includes(newType)) {
      await client.query('UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2', [newAmount, newAccId]);
    } else if (newType === 'TRANSFER' && newToAccId) {
      await client.query('UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2', [newAmount, newAccId]);
      await client.query('UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2', [newAmount, newToAccId]);
    }

    await client.query('COMMIT');

    const updatedRes = await pool.query(
      `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
              a.name AS account_name, to_acc.name AS to_account_name, f.name AS friend_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts a ON t.account_id = a.id
       LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.id
       LEFT JOIN friends f ON t.friend_id = f.id
       WHERE t.id = $1`,
      [id]
    );

    res.json({ success: true, data: updatedRes.rows[0], message: 'Cập nhật giao dịch thành công' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi updateTransaction:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật giao dịch' });
  } finally {
    client.release();
  }
};

// Xóa giao dịch
export const deleteTransaction = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const check = await client.query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch để xóa' });
    }

    const tx = check.rows[0];
    const amount = parseFloat(tx.amount);

    // Hoàn lại số dư
    if (['EXPENSE', 'LOAN', 'DEBT_REPAYMENT'].includes(tx.type)) {
      await client.query('UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2', [amount, tx.account_id]);
    } else if (['INCOME', 'BORROW', 'DEBT_COLLECTION'].includes(tx.type)) {
      await client.query('UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2', [amount, tx.account_id]);
    } else if (tx.type === 'TRANSFER' && tx.to_account_id) {
      await client.query('UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2', [amount, tx.account_id]);
      await client.query('UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2', [amount, tx.to_account_id]);
    }

    await client.query('DELETE FROM transactions WHERE id = $1', [id]);
    await client.query('COMMIT');

    res.json({ success: true, message: 'Đã xóa giao dịch thành công' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi deleteTransaction:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa giao dịch' });
  } finally {
    client.release();
  }
};

// Xuất file CSV giao dịch
export const exportTransactionsCSV = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.transaction_date,
        t.type,
        t.amount,
        COALESCE(c.name, 'Chuyển tiền') AS category,
        a.name AS from_account,
        COALESCE(to_acc.name, '') AS to_account,
        COALESCE(t.note, '') AS note
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.id
      ORDER BY t.transaction_date DESC
    `);

    let csv = '\uFEFFMã GD,Ngày,Loại,Số tiền (VNĐ),Danh mục,Ví/Tài khoản,Chuyển đến ví,Ghi chú\n';
    result.rows.forEach(r => {
      const typeStr = r.type === 'EXPENSE' ? 'Chi tiêu' : r.type === 'INCOME' ? 'Thu nhập' : 'Chuyển khoản';
      const cleanNote = (r.note || '').replace(/"/g, '""');
      csv += `${r.id},"${r.transaction_date}","${typeStr}",${r.amount},"${r.category}","${r.from_account}","${r.to_account}","${cleanNote}"\n`;
    });

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('lich-su-thu-chi.csv');
    res.send(csv);
  } catch (error) {
    console.error('Lỗi export CSV:', error);
    res.status(500).json({ success: false, message: 'Lỗi xuất dữ liệu' });
  }
};

