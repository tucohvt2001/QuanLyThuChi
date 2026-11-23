import { pool } from '../config/db.js';

async function seedData() {
  console.log('--- Đang khởi tạo dữ liệu mẫu (Seed Data) ---');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Kiểm tra nếu đã có danh mục thì không seed trùng
    const catCheck = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count) === 0) {
      console.log('🌱 Thêm các danh mục chi tiêu & thu nhập thực tế...');
      
      const categories = [
        // Chi tiêu (EXPENSE)
        { name: 'Ăn uống & Cà phê', type: 'EXPENSE', icon: 'Utensils', color: '#ef4444' },
        { name: 'Đi chợ & Siêu thị', type: 'EXPENSE', icon: 'ShoppingCart', color: '#f97316' },
        { name: 'Nhà cửa & Tiền trọ', type: 'EXPENSE', icon: 'Home', color: '#eab308' },
        { name: 'Hóa đơn & Điện nước', type: 'EXPENSE', icon: 'Zap', color: '#06b6d4' },
        { name: 'Đi lại & Xăng xe', type: 'EXPENSE', icon: 'Car', color: '#3b82f6' },
        { name: 'Mua sắm & Quần áo', type: 'EXPENSE', icon: 'ShoppingBag', color: '#ec4899' },
        { name: 'Giải trí & Phim ảnh', type: 'EXPENSE', icon: 'Film', color: '#8b5cf6' },
        { name: 'Sức khỏe & Thuốc men', type: 'EXPENSE', icon: 'HeartPulse', color: '#10b981' },
        { name: 'Học tập & Phát triển', type: 'EXPENSE', icon: 'GraduationCap', color: '#6366f1' },
        { name: 'Hiếu hỉ & Quà tặng', type: 'EXPENSE', icon: 'Gift', color: '#f43f5e' },
        
        // Thu nhập (INCOME)
        { name: 'Lương chính', type: 'INCOME', icon: 'Briefcase', color: '#16a34a' },
        { name: 'Thưởng & Làm thêm', type: 'INCOME', icon: 'Award', color: '#059669' },
        { name: 'Đầu tư & Cổ tức', type: 'INCOME', icon: 'TrendingUp', color: '#0284c7' },
        { name: 'Tiền lãi ngân hàng', type: 'INCOME', icon: 'Percent', color: '#2563eb' },
        { name: 'Thu nhập khác', type: 'INCOME', icon: 'Coins', color: '#d97706' },
      ];

      for (const cat of categories) {
        await client.query(
          'INSERT INTO categories (name, type, icon, color) VALUES ($1, $2, $3, $4)',
          [cat.name, cat.type, cat.icon, cat.color]
        );
      }
    }

    // 2. Tài khoản / Ví tiền
    const accCheck = await client.query('SELECT COUNT(*) FROM accounts');
    if (parseInt(accCheck.rows[0].count) === 0) {
      console.log('🌱 Thêm các tài khoản / ví mẫu...');
      const accounts = [
        { name: 'Tiền mặt ví cá nhân', type: 'CASH', balance: 2500000, initial_balance: 2500000, icon: 'Banknote', color: '#16a34a', account_number: '' },
        { name: 'Tài khoản Vietcombank', type: 'BANK', balance: 35000000, initial_balance: 35000000, icon: 'Landmark', color: '#0284c7', account_number: '1029384756' },
        { name: 'Ví MoMo', type: 'EWALLET', balance: 1250000, initial_balance: 1250000, icon: 'Smartphone', color: '#d946ef', account_number: '0988776655' },
        { name: 'Sổ tiết kiệm Techcombank', type: 'SAVINGS', balance: 50000000, initial_balance: 50000000, icon: 'PiggyBank', color: '#ea580c', account_number: 'TK-889922' },
      ];

      for (const acc of accounts) {
        await client.query(
          'INSERT INTO accounts (name, type, balance, initial_balance, icon, color, account_number) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [acc.name, acc.type, acc.balance, acc.initial_balance, acc.icon, acc.color, acc.account_number]
        );
      }
    }

    // 3. Giao dịch mẫu
    const txCheck = await client.query('SELECT COUNT(*) FROM transactions');
    if (parseInt(txCheck.rows[0].count) === 0) {
      console.log('🌱 Thêm một số giao dịch mẫu trong tháng...');
      const catsRes = await client.query('SELECT id, name, type FROM categories');
      const accsRes = await client.query('SELECT id, name FROM accounts');
      
      const catMap = {};
      catsRes.rows.forEach(c => catMap[c.name] = c.id);
      
      const accCash = accsRes.rows.find(a => a.name.includes('Tiền mặt'))?.id || accsRes.rows[0].id;
      const accBank = accsRes.rows.find(a => a.name.includes('Vietcombank'))?.id || accsRes.rows[1].id;
      const accMomo = accsRes.rows.find(a => a.name.includes('MoMo'))?.id || accsRes.rows[2].id;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

      const sampleTxs = [
        // Thu nhập
        { type: 'INCOME', amount: 25000000, category_id: catMap['Lương chính'], account_id: accBank, date: `${currentYear}-${currentMonth}-05`, note: 'Nhận lương tháng' },
        { type: 'INCOME', amount: 2000000, category_id: catMap['Thưởng & Làm thêm'], account_id: accBank, date: `${currentYear}-${currentMonth}-10`, note: 'Thưởng dự án hoàn thành' },
        // Chi tiêu
        { type: 'EXPENSE', amount: 4500000, category_id: catMap['Nhà cửa & Tiền trọ'], account_id: accBank, date: `${currentYear}-${currentMonth}-06`, note: 'Thanh toán tiền thuê nhà tháng này' },
        { type: 'EXPENSE', amount: 850000, category_id: catMap['Hóa đơn & Điện nước'], account_id: accBank, date: `${currentYear}-${currentMonth}-07`, note: 'Tiền điện + nước + internet' },
        { type: 'EXPENSE', amount: 150000, category_id: catMap['Ăn uống & Cà phê'], account_id: accCash, date: `${currentYear}-${currentMonth}-08`, note: 'Cà phê sáng cùng đồng nghiệp' },
        { type: 'EXPENSE', amount: 620000, category_id: catMap['Đi chợ & Siêu thị'], account_id: accMomo, date: `${currentYear}-${currentMonth}-09`, note: 'Mua thực phẩm tuần tại WinMart' },
        { type: 'EXPENSE', amount: 350000, category_id: catMap['Đi lại & Xăng xe'], account_id: accCash, date: `${currentYear}-${currentMonth}-11`, note: 'Đổ xăng xe máy' },
        { type: 'EXPENSE', amount: 450000, category_id: catMap['Ăn uống & Cà phê'], account_id: accMomo, date: `${currentYear}-${currentMonth}-12`, note: 'Ăn lẩu cuối tuần' },
        { type: 'EXPENSE', amount: 1200000, category_id: catMap['Mua sắm & Quần áo'], account_id: accBank, date: `${currentYear}-${currentMonth}-15`, note: 'Mua áo sơ mi mới' },
        { type: 'EXPENSE', amount: 260000, category_id: catMap['Giải trí & Phim ảnh'], account_id: accMomo, date: `${currentYear}-${currentMonth}-18`, note: 'Vé xem phim CGV 2 người' },
      ];

      for (const tx of sampleTxs) {
        if (tx.category_id) {
          await client.query(
            'INSERT INTO transactions (type, amount, category_id, account_id, transaction_date, note) VALUES ($1, $2, $3, $4, $5, $6)',
            [tx.type, tx.amount, tx.category_id, tx.account_id, tx.date, tx.note]
          );
        }
      }

      // 4. Ngân sách mẫu
      console.log('🌱 Thêm ngân sách mẫu tháng này...');
      const monthNum = now.getMonth() + 1;
      const sampleBudgets = [
        { category_id: catMap['Ăn uống & Cà phê'], amount: 3500000 },
        { category_id: catMap['Đi chợ & Siêu thị'], amount: 3000000 },
        { category_id: catMap['Mua sắm & Quần áo'], amount: 2000000 },
        { category_id: catMap['Giải trí & Phim ảnh'], amount: 1000000 },
        { category_id: catMap['Đi lại & Xăng xe'], amount: 800000 },
      ];

      for (const b of sampleBudgets) {
        if (b.category_id) {
          await client.query(
            'INSERT INTO budgets (category_id, month, year, amount) VALUES ($1, $2, $3, $4) ON CONFLICT (category_id, month, year) DO NOTHING',
            [b.category_id, monthNum, currentYear, b.amount]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ Khởi tạo dữ liệu mẫu thành công!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi seed data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();

