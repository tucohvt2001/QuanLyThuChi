import { pool } from '../config/db.js';

async function cleanDatabase() {
  const client = await pool.connect();
  const includeCategories = process.argv.includes('--include-categories');

  try {
    await client.query('BEGIN');
    console.log('🧹 Đang tiến hành dọn dẹp database...');

    // Xóa toàn bộ dữ liệu phát sinh & người dùng
    await client.query(`
      TRUNCATE TABLE 
        debt_payments, 
        debts, 
        transactions, 
        budgets, 
        friends, 
        accounts 
      RESTART IDENTITY CASCADE;
    `);

    console.log('✅ Đã xóa sạch: Giao dịch (transactions), Sổ Nợ (debts), Lịch sử trả nợ (debt_payments), Ngân sách (budgets), Bạn bè (friends), Tài khoản/Ví (accounts).');

    if (includeCategories) {
      await client.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE;');
      console.log('✅ Đã xóa sạch Danh mục (categories).');
    } else {
      console.log('ℹ️ Giữ lại 15 danh mục thu/chi mặc định (Ăn uống, Lương, Mua sắm...) để bạn có thể ghi chép ngay.');
    }

    await client.query('COMMIT');
    console.log('🎉 Hoàn tất dọn dẹp database! Hệ thống sẵn sàng cho bạn chạy thử nghiệm.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi dọn dẹp database:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanDatabase();

