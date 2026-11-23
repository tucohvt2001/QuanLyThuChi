import { pool } from '../config/db.js';

async function migrateFriends() {
  console.log('--- Đang tạo bảng friends và liên kết trên Neon PostgreSQL ---');
  try {
    const sql = `
      -- Bảng Danh bạ Bạn bè / Người quen
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(150),
        relationship VARCHAR(50) DEFAULT 'FRIEND', -- 'FRIEND' (Bạn bè), 'COLLEAGUE' (Đồng nghiệp), 'FAMILY' (Gia đình), 'OTHER' (Khác)
        avatar_color VARCHAR(30) DEFAULT '#3b82f6',
        note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Bổ sung cột friend_id vào bảng transactions (nếu chưa có)
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'transactions' AND column_name = 'friend_id'
        ) THEN
          ALTER TABLE transactions ADD COLUMN friend_id INTEGER REFERENCES friends(id) ON DELETE SET NULL;
        END IF;
      END $$;

      -- Bổ sung cột friend_id vào bảng debts (nếu chưa có)
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'debts' AND column_name = 'friend_id'
        ) THEN
          ALTER TABLE debts ADD COLUMN friend_id INTEGER REFERENCES friends(id) ON DELETE SET NULL;
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS idx_friends_name ON friends(name);
      CREATE INDEX IF NOT EXISTS idx_transactions_friend ON transactions(friend_id);
      CREATE INDEX IF NOT EXISTS idx_debts_friend ON debts(friend_id);
    `;

    await pool.query(sql);
    console.log('✅ Tạo bảng friends và các cột liên kết thành công!');

    // Seed danh sách bạn bè mẫu nếu chưa có
    const check = await pool.query('SELECT COUNT(*) FROM friends');
    if (parseInt(check.rows[0].count) === 0) {
      console.log('🌱 Thêm một số liên hệ bạn bè mẫu...');
      const sampleFriends = [
        { name: 'Nguyễn Văn Tuấn', phone: '0912345678', email: 'tuan.nguyen@gmail.com', relationship: 'FRIEND', avatar_color: '#3b82f6', note: 'Bạn đại học' },
        { name: 'Anh Hoàng', phone: '0987654321', email: 'hoang.team@company.com', relationship: 'COLLEAGUE', avatar_color: '#8b5cf6', note: 'Đồng nghiệp cùng team' },
        { name: 'Trần Thị Mai', phone: '0905123456', email: 'mai.tran@gmail.com', relationship: 'FRIEND', avatar_color: '#ec4899', note: 'Bạn cấp 3' },
        { name: 'Mẹ', phone: '0935112233', email: '', relationship: 'FAMILY', avatar_color: '#10b981', note: 'Gia đình' }
      ];

      for (const f of sampleFriends) {
        await pool.query(`
          INSERT INTO friends (name, phone, email, relationship, avatar_color, note)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [f.name, f.phone, f.email, f.relationship, f.avatar_color, f.note]);
      }

      // Gán liên kết khoản nợ mẫu với bạn bè tương ứng
      const tuan = await pool.query("SELECT id FROM friends WHERE name LIKE '%Tuấn%' LIMIT 1");
      if (tuan.rows.length > 0) {
        await pool.query("UPDATE debts SET friend_id = $1 WHERE person_name LIKE '%Tuấn%'", [tuan.rows[0].id]);
      }

      const hoang = await pool.query("SELECT id FROM friends WHERE name LIKE '%Hoàng%' LIMIT 1");
      if (hoang.rows.length > 0) {
        await pool.query("UPDATE debts SET friend_id = $1 WHERE person_name LIKE '%Hoàng%'", [hoang.rows[0].id]);
      }

      console.log('✅ Đã nạp danh bạ mẫu và liên kết vào sổ nợ!');
    }
  } catch (err) {
    console.error('❌ Lỗi migrate friends:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateFriends();

