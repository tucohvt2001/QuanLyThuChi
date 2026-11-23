import { pool } from '../config/db.js';

// Lấy danh sách bạn bè kèm thống kê chi tiêu & nợ
export const getFriends = async (req, res) => {
  try {
    const { relationship, search } = req.query;
    const conditions = [];
    const params = [];
    let pIdx = 1;

    if (relationship) {
      conditions.push(`f.relationship = $${pIdx++}`);
      params.push(relationship.toUpperCase());
    }

    if (search) {
      conditions.push(`(f.name ILIKE $${pIdx} OR f.phone ILIKE $${pIdx} OR f.email ILIKE $${pIdx} OR f.note ILIKE $${pIdx})`);
      params.push(`%${search}%`);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        f.*,
        COALESCE((SELECT COUNT(*) FROM transactions t WHERE t.friend_id = f.id), 0) AS transaction_count,
        COALESCE((
          SELECT SUM(t.amount) 
          FROM transactions t 
          WHERE t.friend_id = f.id AND t.type = 'EXPENSE'
        ), 0) AS total_spent,
        COALESCE((
          SELECT SUM(d.amount - d.paid_amount) 
          FROM debts d 
          WHERE (d.friend_id = f.id OR d.person_name = f.name) AND d.type = 'LOAN' AND d.status != 'PAID'
        ), 0) AS remaining_loan,
        COALESCE((
          SELECT SUM(d.amount - d.paid_amount) 
          FROM debts d 
          WHERE (d.friend_id = f.id OR d.person_name = f.name) AND d.type = 'DEBT' AND d.status != 'PAID'
        ), 0) AS remaining_debt
      FROM friends f
      ${whereClause}
      ORDER BY f.name ASC
    `;

    const result = await pool.query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Lỗi getFriends:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải danh bạ bạn bè' });
  }
};

// Chi tiết bạn bè và lịch sử các lần giao dịch/nợ liên quan
export const getFriendById = async (req, res) => {
  try {
    const { id } = req.params;
    const friendRes = await pool.query('SELECT * FROM friends WHERE id = $1', [id]);
    if (friendRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người bạn này' });
    }

    const friend = friendRes.rows[0];

    // Lịch sử giao dịch có gắn bạn bè này
    const txRes = await pool.query(`
      SELECT t.*, c.name AS category_name, c.color AS category_color, a.name AS account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.friend_id = $1
      ORDER BY t.transaction_date DESC
      LIMIT 20
    `, [id]);

    // Các khoản nợ liên quan đến bạn bè này
    const debtsRes = await pool.query(`
      SELECT d.*, (d.amount - d.paid_amount) AS remaining_amount
      FROM debts d
      WHERE d.friend_id = $1 OR d.person_name = $2
      ORDER BY d.start_date DESC
    `, [id, friend.name]);

    res.json({
      success: true,
      data: {
        ...friend,
        transactions: txRes.rows,
        debts: debtsRes.rows
      }
    });
  } catch (error) {
    console.error('Lỗi getFriendById:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Thêm bạn bè mới
export const createFriend = async (req, res) => {
  try {
    const {
      name,
      phone = '',
      email = '',
      relationship = 'FRIEND',
      avatar_color = '#3b82f6',
      note = ''
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên bạn bè không được để trống' });
    }

    const result = await pool.query(`
      INSERT INTO friends (name, phone, email, relationship, avatar_color, note)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name.trim(), phone.trim(), email.trim(), relationship, avatar_color, note.trim()]);

    res.status(201).json({ success: true, data: result.rows[0], message: 'Thêm bạn bè thành công' });
  } catch (error) {
    console.error('Lỗi createFriend:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lưu bạn bè' });
  }
};

// Sửa thông tin bạn bè
export const updateFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, relationship, avatar_color, note } = req.body;

    const check = await pool.query('SELECT * FROM friends WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bạn bè cần sửa' });
    }

    const current = check.rows[0];
    const newName = name !== undefined ? name.trim() : current.name;
    const newPhone = phone !== undefined ? phone.trim() : current.phone;
    const newEmail = email !== undefined ? email.trim() : current.email;
    const newRel = relationship !== undefined ? relationship : current.relationship;
    const newColor = avatar_color !== undefined ? avatar_color : current.avatar_color;
    const newNote = note !== undefined ? note.trim() : current.note;

    const result = await pool.query(`
      UPDATE friends
      SET name = $1, phone = $2, email = $3, relationship = $4, avatar_color = $5, note = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [newName, newPhone, newEmail, newRel, newColor, newNote, id]);

    res.json({ success: true, data: result.rows[0], message: 'Cập nhật bạn bè thành công' });
  } catch (error) {
    console.error('Lỗi updateFriend:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật bạn bè' });
  }
};

// Xóa bạn bè
export const deleteFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM friends WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bạn bè để xóa' });
    }
    res.json({ success: true, message: 'Đã xóa bạn bè khỏi danh bạ thành công' });
  } catch (error) {
    console.error('Lỗi deleteFriend:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa bạn bè' });
  }
};

