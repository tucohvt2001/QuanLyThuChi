import { pool } from '../config/db.js';

// Lấy danh sách tài khoản / ví
export const getAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
        COALESCE((
          SELECT COUNT(*) FROM transactions t 
          WHERE t.account_id = a.id OR t.to_account_id = a.id
        ), 0) AS transaction_count
       FROM accounts a 
       ORDER BY a.is_active DESC, a.id ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Lỗi getAccounts:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách ví' });
  }
};

// Lấy chi tiết tài khoản
export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM accounts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ví' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Lỗi getAccountById:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Tạo tài khoản mới
export const createAccount = async (req, res) => {
  try {
    const { name, type = 'CASH', initial_balance = 0, account_number = '', icon = 'Wallet', color = '#16a34a' } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên ví không được để trống' });
    }

    const balance = parseFloat(initial_balance) || 0;

    const result = await pool.query(
      `INSERT INTO accounts (name, type, balance, initial_balance, account_number, icon, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name.trim(), type, balance, balance, account_number, icon, color]
    );

    res.status(201).json({ success: true, data: result.rows[0], message: 'Tạo ví mới thành công' });
  } catch (error) {
    console.error('Lỗi createAccount:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo ví mới' });
  }
};

// Cập nhật tài khoản
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, account_number, icon, color, is_active } = req.body;

    const check = await pool.query('SELECT * FROM accounts WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ví cần sửa' });
    }

    const current = check.rows[0];
    const newName = name !== undefined ? name.trim() : current.name;
    const newType = type !== undefined ? type : current.type;
    const newAccNumber = account_number !== undefined ? account_number : current.account_number;
    const newIcon = icon !== undefined ? icon : current.icon;
    const newColor = color !== undefined ? color : current.color;
    const newActive = is_active !== undefined ? is_active : current.is_active;

    const result = await pool.query(
      `UPDATE accounts 
       SET name = $1, type = $2, account_number = $3, icon = $4, color = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [newName, newType, newAccNumber, newIcon, newColor, newActive, id]
    );

    res.json({ success: true, data: result.rows[0], message: 'Cập nhật ví thành công' });
  } catch (error) {
    console.error('Lỗi updateAccount:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật ví' });
  }
};

// Xóa tài khoản
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra xem có giao dịch liên quan không
    const txCheck = await pool.query(
      'SELECT COUNT(*) FROM transactions WHERE account_id = $1 OR to_account_id = $1',
      [id]
    );

    if (parseInt(txCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa ví này vì đã có các giao dịch liên quan. Bạn có thể chọn Ẩn ví đi.'
      });
    }

    const result = await pool.query('DELETE FROM accounts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ví cần xóa' });
    }

    res.json({ success: true, message: 'Đã xóa ví thành công' });
  } catch (error) {
    console.error('Lỗi deleteAccount:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa ví' });
  }
};

// Chuyển tiền giữa 2 ví
export const transferMoney = async (req, res) => {
  const client = await pool.connect();
  try {
    const { from_account_id, to_account_id, amount, note, date } = req.body;
    const transferAmount = parseFloat(amount);

    if (!from_account_id || !to_account_id || !transferAmount || transferAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Thông tin chuyển khoản không hợp lệ' });
    }

    if (from_account_id === to_account_id) {
      return res.status(400).json({ success: false, message: 'Ví nguồn và ví đích không được trùng nhau' });
    }

    await client.query('BEGIN');

    // 1. Trừ tiền ví nguồn
    await client.query(
      'UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2',
      [transferAmount, from_account_id]
    );

    // 2. Cộng tiền ví đích
    await client.query(
      'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2',
      [transferAmount, to_account_id]
    );

    // 3. Tạo bản ghi giao dịch TRANSFER
    const txDate = date || new Date().toISOString().split('T')[0];
    const txNote = note || 'Chuyển tiền giữa các ví';

    const txResult = await client.query(
      `INSERT INTO transactions (type, amount, account_id, to_account_id, transaction_date, note)
       VALUES ('TRANSFER', $1, $2, $3, $4, $5)
       RETURNING *`,
      [transferAmount, from_account_id, to_account_id, txDate, txNote]
    );

    await client.query('COMMIT');
    res.json({ success: true, data: txResult.rows[0], message: 'Chuyển tiền thành công' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi transferMoney:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi thực hiện chuyển tiền' });
  } finally {
    client.release();
  }
};

