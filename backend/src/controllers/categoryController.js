import { pool } from '../config/db.js';

// Lấy danh sách danh mục
export const getCategories = async (req, res) => {
  try {
    const { type } = req.query; // 'EXPENSE' hoặc 'INCOME'
    let sql = 'SELECT * FROM categories';
    const params = [];

    if (type && ['EXPENSE', 'INCOME'].includes(type.toUpperCase())) {
      sql += ' WHERE type = $1';
      params.push(type.toUpperCase());
    }

    sql += ' ORDER BY type ASC, name ASC';

    const result = await pool.query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Lỗi getCategories:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải danh mục' });
  }
};

// Tạo danh mục mới
export const createCategory = async (req, res) => {
  try {
    const { name, type, icon = 'Tag', color = '#3b82f6' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên danh mục không được để trống' });
    }

    if (!type || !['EXPENSE', 'INCOME'].includes(type.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Loại danh mục phải là EXPENSE hoặc INCOME' });
    }

    const result = await pool.query(
      `INSERT INTO categories (name, type, icon, color)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), type.toUpperCase(), icon, color]
    );

    res.status(201).json({ success: true, data: result.rows[0], message: 'Tạo danh mục thành công' });
  } catch (error) {
    console.error('Lỗi createCategory:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo danh mục' });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const check = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    const current = check.rows[0];
    const newName = name !== undefined ? name.trim() : current.name;
    const newIcon = icon !== undefined ? icon : current.icon;
    const newColor = color !== undefined ? color : current.color;

    const result = await pool.query(
      `UPDATE categories
       SET name = $1, icon = $2, color = $3
       WHERE id = $4
       RETURNING *`,
      [newName, newIcon, newColor, id]
    );

    res.json({ success: true, data: result.rows[0], message: 'Cập nhật danh mục thành công' });
  } catch (error) {
    console.error('Lỗi updateCategory:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật danh mục' });
  }
};

// Xóa danh mục
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const txCheck = await pool.query('SELECT COUNT(*) FROM transactions WHERE category_id = $1', [id]);
    if (parseInt(txCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh mục này đã có giao dịch, không thể xóa để đảm bảo toàn vẹn dữ liệu.'
      });
    }

    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục để xóa' });
    }

    res.json({ success: true, message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Lỗi deleteCategory:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa danh mục' });
  }
};

