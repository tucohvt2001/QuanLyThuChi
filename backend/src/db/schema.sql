-- Bảng Danh sách Ví / Tài khoản (Tiền mặt, Ngân hàng, Ví điện tử, Sổ tiết kiệm)
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) DEFAULT 'CASH', -- CASH, BANK, EWALLET, SAVINGS, CREDIT
  balance NUMERIC(15, 2) DEFAULT 0,
  initial_balance NUMERIC(15, 2) DEFAULT 0,
  account_number VARCHAR(100),
  icon VARCHAR(50) DEFAULT 'Wallet',
  color VARCHAR(30) DEFAULT '#16a34a',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Danh mục thu chi (Ăn uống, Đi lại, Lương, Mua sắm, Hóa đơn...)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'EXPENSE' hoặc 'INCOME'
  icon VARCHAR(50) DEFAULT 'Tag',
  color VARCHAR(30) DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Danh bạ Bạn bè / Người quen
CREATE TABLE IF NOT EXISTS friends (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(150),
  relationship VARCHAR(50) DEFAULT 'FRIEND', -- 'FRIEND', 'COLLEAGUE', 'FAMILY', 'OTHER'
  avatar_color VARCHAR(30) DEFAULT '#3b82f6',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Giao dịch thu / chi / chuyển khoản
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- 'EXPENSE', 'INCOME', 'TRANSFER'
  amount NUMERIC(15, 2) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL, -- Dùng cho loại TRANSFER
  friend_id INTEGER REFERENCES friends(id) ON DELETE SET NULL, -- Gắn bạn bè vào giao dịch
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Ngân sách chi tiêu theo danh mục hàng tháng
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,  -- e.g. 2026
  amount NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, month, year)
);

-- Bảng Quản lý Vay & Nợ (Tôi nợ người khác / Người khác nợ tôi)
CREATE TABLE IF NOT EXISTS debts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- 'LOAN' (Người khác nợ tôi), 'DEBT' (Tôi nợ người khác)
  friend_id INTEGER REFERENCES friends(id) ON DELETE SET NULL, -- Liên kết bạn bè
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

-- Bảng Lịch sử các lần trả nợ / thu hồi nợ
CREATE TABLE IF NOT EXISTS debt_payments (
  id SERIAL PRIMARY KEY,
  debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON budgets(month, year);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(type);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt ON debt_payments(debt_id);
