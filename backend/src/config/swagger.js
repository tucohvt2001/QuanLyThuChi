export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'ThuChi 247 - Financial Management API',
    version: '1.0.0',
    description: 'Hệ thống REST API Quản lý Thu Chi Cá Nhân, Sổ Vay Nợ, Ví Tiền & Bạn Bè (Backend Node.js + Express + Neon PostgreSQL).',
    contact: {
      name: 'ThuChi 247 Development Team',
      email: 'tucohvt2001@gmail.com'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'Current Environment API'
    },
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Xác thực người dùng & Đăng nhập (Mặc định: admin / admin@123)' },
    { name: 'Health', description: 'Kiểm tra trạng thái hệ thống & Neon PostgreSQL' },
    { name: 'Dashboard', description: 'Dữ liệu tổng quan tài chính, tài sản ròng & biểu đồ' },
    { name: 'Transactions', description: 'Ghi chép thu, chi và chuyển khoản giữa các ví' },
    { name: 'Accounts', description: 'Quản lý các tài khoản & ví tiền' },
    { name: 'Debts', description: 'Quản lý Sổ Vay & Ghi Nợ, thanh toán nợ' },
    { name: 'Friends', description: 'Quản lý danh bạ Bạn bè & Đối tác' },
    { name: 'Categories', description: 'Danh mục phân loại thu chi' },
    { name: 'Budgets', description: 'Hạn mức ngân sách chi tiêu hàng tháng' }
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập hệ thống (Mặc định: admin / admin@123)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', example: 'admin@123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Đăng nhập thành công',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Đăng nhập thành công',
                  token: 'a1b2c3d4e5...',
                  user: { username: 'admin', name: 'Quản trị viên', role: 'ADMIN' }
                }
              }
            }
          },
          401: {
            description: 'Sai tên đăng nhập hoặc mật khẩu'
          }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Lấy thông tin người dùng đang đăng nhập',
        responses: {
          200: {
            description: 'Thông tin tài khoản'
          }
        }
      }
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Kiểm tra trạng thái server & database',
        description: 'Trả về trạng thái hoạt động của server Express và thời gian kết nối của Neon PostgreSQL.',
        responses: {
          200: {
            description: 'Hệ thống hoạt động bình thường',
            content: {
              'application/json': {
                example: {
                  status: 'ok',
                  service: 'QuanLyThuChi API',
                  time: '2026-11-23T14:15:00.000Z'
                }
              }
            }
          },
          500: {
            description: 'Lỗi kết nối cơ sở dữ liệu'
          }
        }
      }
    },
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Lấy dữ liệu thống kê tổng quan theo tháng/năm',
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'integer', default: 11 }, description: 'Tháng cần xem (1-12)' },
          { name: 'year', in: 'query', schema: { type: 'integer', default: 2026 }, description: 'Năm cần xem' }
        ],
        responses: {
          200: {
            description: 'Dữ liệu tổng hợp thành công',
            content: {
              'application/json': {
                example: {
                  totalBalance: 38750000,
                  netWorth: 40750000,
                  thisMonthIncome: 27000000,
                  thisMonthExpense: 7280000,
                  netSavings: 19720000,
                  savingsRate: 73,
                  accounts: [],
                  debts: { remainingLoan: 4000000, remainingDebt: 2000000, overdueCount: 0 }
                }
              }
            }
          }
        }
      }
    },
    '/accounts': {
      get: {
        tags: ['Accounts'],
        summary: 'Lấy danh sách tất cả ví tiền & tài khoản',
        responses: {
          200: {
            description: 'Danh sách ví tiền',
            content: {
              'application/json': {
                example: [
                  { id: 1, name: 'Tiền mặt ví cá nhân', type: 'CASH', balance: 2500000, color: '#16a34a', icon: 'Banknote' },
                  { id: 2, name: 'Tài khoản Vietcombank', type: 'BANK', balance: 35000000, color: '#0284c7', icon: 'Landmark' }
                ]
              }
            }
          }
        }
      },
      post: {
        tags: ['Accounts'],
        summary: 'Tạo ví mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type'],
                properties: {
                  name: { type: 'string', example: 'Ví MoMo' },
                  type: { type: 'string', enum: ['CASH', 'BANK', 'EWALLET', 'SAVINGS', 'CREDIT'], example: 'EWALLET' },
                  balance: { type: 'number', example: 1000000 },
                  account_number: { type: 'string', example: '0988776655' },
                  icon: { type: 'string', example: 'Smartphone' },
                  color: { type: 'string', example: '#d946ef' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Tạo ví thành công' }
        }
      }
    },
    '/accounts/{id}': {
      put: {
        tags: ['Accounts'],
        summary: 'Cập nhật thông tin ví',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  balance: { type: 'number' },
                  account_number: { type: 'string' },
                  icon: { type: 'string' },
                  color: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Cập nhật thành công' } }
      },
      delete: {
        tags: ['Accounts'],
        summary: 'Xóa ví tài khoản',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Xóa ví thành công' } }
      }
    },
    '/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'Lấy danh sách giao dịch có lọc & phân trang',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string' }, description: 'EXPENSE, INCOME, TRANSFER, DEBT_ALL' },
          { name: 'accountId', in: 'query', schema: { type: 'integer' } },
          { name: 'categoryId', in: 'query', schema: { type: 'integer' } },
          { name: 'friendId', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 15 } }
        ],
        responses: {
          200: { description: 'Danh sách giao dịch' }
        }
      },
      post: {
        tags: ['Transactions'],
        summary: 'Thêm giao dịch mới (Thu/Chi)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'amount', 'account_id', 'transaction_date'],
                properties: {
                  type: { type: 'string', enum: ['EXPENSE', 'INCOME'], example: 'EXPENSE' },
                  amount: { type: 'number', example: 65000 },
                  account_id: { type: 'integer', example: 1 },
                  category_id: { type: 'integer', example: 1 },
                  friend_id: { type: 'integer', example: null },
                  transaction_date: { type: 'string', format: 'date', example: '2026-11-23' },
                  note: { type: 'string', example: 'Ăn trưa cơm tấm' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Lưu giao dịch thành công' } }
      }
    },
    '/transactions/transfer': {
      post: {
        tags: ['Transactions'],
        summary: 'Chuyển tiền giữa 2 ví',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['from_account_id', 'to_account_id', 'amount', 'transaction_date'],
                properties: {
                  from_account_id: { type: 'integer', example: 2 },
                  to_account_id: { type: 'integer', example: 1 },
                  amount: { type: 'number', example: 500000 },
                  transaction_date: { type: 'string', format: 'date', example: '2026-11-23' },
                  note: { type: 'string', example: 'Rút tiền ATM về ví tiền mặt' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Chuyển tiền thành công' } }
      }
    },
    '/transactions/export/csv': {
      get: {
        tags: ['Transactions'],
        summary: 'Xuất file CSV danh sách giao dịch',
        responses: { 200: { description: 'Tải về file CSV utf-8' } }
      }
    },
    '/transactions/{id}': {
      put: {
        tags: ['Transactions'],
        summary: 'Sửa giao dịch',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Cập nhật thành công' } }
      },
      delete: {
        tags: ['Transactions'],
        summary: 'Xóa giao dịch và hoàn lại số dư ví',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Xóa thành công' } }
      }
    },
    '/debts': {
      get: {
        tags: ['Debts'],
        summary: 'Lấy danh sách các khoản vay & nợ',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['LOAN', 'DEBT'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'PARTIAL', 'PAID'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Danh sách khoản nợ & thống kê tổng' } }
      },
      post: {
        tags: ['Debts'],
        summary: 'Ghi chép khoản vay / nợ mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'person_name', 'amount', 'start_date'],
                properties: {
                  type: { type: 'string', enum: ['LOAN', 'DEBT'], example: 'LOAN' },
                  person_name: { type: 'string', example: 'Nguyễn Văn Tuấn' },
                  phone: { type: 'string', example: '0912345678' },
                  amount: { type: 'number', example: 5000000 },
                  account_id: { type: 'integer', example: 1 },
                  create_transaction: { type: 'boolean', example: true, description: 'Trừ/cộng tiền ví ngay lúc này' },
                  friend_id: { type: 'integer', example: 1 },
                  start_date: { type: 'string', format: 'date', example: '2026-11-23' },
                  due_date: { type: 'string', format: 'date', example: '2026-12-31' },
                  note: { type: 'string', example: 'Cho vay mượn sửa xe' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Ghi sổ nợ thành công' } }
      }
    },
    '/debts/{id}/payments': {
      post: {
        tags: ['Debts'],
        summary: 'Thanh toán / Thu hồi nợ',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'payment_date'],
                properties: {
                  amount: { type: 'number', example: 1000000 },
                  account_id: { type: 'integer', example: 1 },
                  create_transaction: { type: 'boolean', example: true },
                  payment_date: { type: 'string', format: 'date', example: '2026-11-23' },
                  note: { type: 'string', example: 'Trả trước đợt 1' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Ghi nhận thanh toán thành công' } }
      }
    },
    '/debts/{id}': {
      delete: {
        tags: ['Debts'],
        summary: 'Xóa khoản nợ',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Xóa thành công' } }
      }
    },
    '/friends': {
      get: {
        tags: ['Friends'],
        summary: 'Lấy danh bạ Bạn bè & Đối tác',
        responses: { 200: { description: 'Danh sách bạn bè kèm thống kê nợ' } }
      },
      post: {
        tags: ['Friends'],
        summary: 'Thêm bạn bè / đối tác mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Trần Thị Mai' },
                  phone: { type: 'string', example: '0988112233' },
                  email: { type: 'string', example: 'mai@example.com' },
                  relationship: { type: 'string', enum: ['FRIEND', 'COLLEAGUE', 'FAMILY', 'OTHER'], example: 'FRIEND' },
                  avatar_color: { type: 'string', example: '#3b82f6' },
                  note: { type: 'string', example: 'Bạn học đại học' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Tạo thành công' } }
      }
    },
    '/friends/{id}': {
      put: {
        tags: ['Friends'],
        summary: 'Cập nhật bạn bè',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Cập nhật thành công' } }
      },
      delete: {
        tags: ['Friends'],
        summary: 'Xóa bạn bè',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Xóa thành công' } }
      }
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Lấy danh mục thu chi',
        parameters: [{ name: 'type', in: 'query', schema: { type: 'string', enum: ['EXPENSE', 'INCOME'] } }],
        responses: { 200: { description: 'Danh sách danh mục' } }
      },
      post: {
        tags: ['Categories'],
        summary: 'Tạo danh mục mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type'],
                properties: {
                  name: { type: 'string', example: 'Mua sắm sách' },
                  type: { type: 'string', enum: ['EXPENSE', 'INCOME'], example: 'EXPENSE' },
                  icon: { type: 'string', example: 'Book' },
                  color: { type: 'string', example: '#6366f1' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Tạo danh mục thành công' } }
      }
    },
    '/budgets': {
      get: {
        tags: ['Budgets'],
        summary: 'Lấy hạn mức chi tiêu theo tháng',
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'integer', default: 11 } },
          { name: 'year', in: 'query', schema: { type: 'integer', default: 2026 } }
        ],
        responses: { 200: { description: 'Danh sách ngân sách kèm số tiền đã chi thực tế' } }
      },
      post: {
        tags: ['Budgets'],
        summary: 'Thiết lập hạn mức ngân sách',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['category_id', 'month', 'year', 'amount'],
                properties: {
                  category_id: { type: 'integer', example: 1 },
                  month: { type: 'integer', example: 11 },
                  year: { type: 'integer', example: 2026 },
                  amount: { type: 'number', example: 3000000 }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Lưu hạn mức thành công' } }
      }
    }
  }
};

