import { pool } from '../config/db.js';

async function migrateDebts() {
  console.log('--- Đang tạo bảng debts và debt_payments trên Neon PostgreSQL ---');
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS debts (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL, -- 'LOAN' (Người khác nợ tôi), 'DEBT' (Tôi nợ người khác)
        person_name VARCHAR(150) NOT NULL,
        phone VARCHAR(50),
        amount NUMERIC(15, 2) NOT NULL,
        paid_amount NUMERIC(15, 2) DEFAULT 0,
        account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
        start_date DATE NOT NULL DEFAULT CURRENT_DATE,
        due_date DATE,
        status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PARTIAL', 'PAID'
        note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS debt_payments (
        id SERIAL PRIMARY KEY,
        debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE,
        amount NUMERIC(15, 2) NOT NULL,
        payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
        note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(type);
      CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
      CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);
      CREATE INDEX IF NOT EXISTS idx_debt_payments_debt ON debt_payments(debt_id);
    `;

    await pool.query(sql);
    console.log('✅ Tạo bảng debts và debt_payments thành công!');

    // Seed 2 khoản mẫu để người dùng thấy trực quan ngay
    const check = await pool.query('SELECT COUNT(*) FROM debts');
    if (parseInt(check.rows[0].count) === 0) {
      console.log('🌱 Thêm một số khoản nợ mẫu...');
      const accRes = await pool.query('SELECT id FROM accounts LIMIT 1');
      const accId = accRes.rows[0]?.id || null;

      // 1. Cho bạn vay (Người khác nợ mình)
      await pool.query(`
        INSERT INTO debts (type, person_name, phone, amount, paid_amount, account_id, start_date, due_date, status, note)
        VALUES ('LOAN', 'Nguyễn Văn Tuấn (Bạn ĐH)', '0912345678', 5000000, 1000000, $1, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'PARTIAL', 'Vay mượn mua điện thoại mới')
      `, [accId]);

      // 2. Đi vay người khác (Mình nợ người khác)
      await pool.query(`
        INSERT INTO debts (type, person_name, phone, amount, paid_amount, account_id, start_date, due_date, status, note)
        VALUES ('DEBT', 'Anh Hoàng (Đồng nghiệp)', '0987654321', 2000000, 0, $1, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 'PENDING', 'Tạm ứng tiền liên hoan công ty')
      `, [accId]);

      console.log('✅ Đã nạp dữ liệu nợ mẫu thành công!');
    }
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateDebts();

