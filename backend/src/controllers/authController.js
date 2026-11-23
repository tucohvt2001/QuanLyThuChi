import crypto from 'crypto';

// Token bí mật hoặc sinh ngẫu nhiên
const SECRET_KEY = process.env.JWT_SECRET || 'thuchi247-secure-auth-secret-key-2026';

// Quản lý token phiên đang hoạt động trong bộ nhớ (hoặc xác thực đối chiếu)
const activeTokens = new Set();

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
      });
    }

    const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin@123';

    // So sánh thông tin đăng nhập
    if (username.trim() === defaultUsername && password === defaultPassword) {
      // Tạo token xác thực
      const tokenPayload = `${username}-${Date.now()}`;
      const token = crypto.createHmac('sha256', SECRET_KEY).update(tokenPayload).digest('hex');
      
      activeTokens.add(token);

      return res.json({
        success: true,
        message: 'Đăng nhập thành công',
        token,
        user: {
          username: defaultUsername,
          name: 'Quản trị viên',
          role: 'ADMIN'
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
      });
    }
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xác thực'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập hoặc token không hợp lệ'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    const defaultUsername = process.env.ADMIN_USERNAME || 'admin';

    return res.json({
      success: true,
      user: {
        username: defaultUsername,
        name: 'Quản trị viên',
        role: 'ADMIN'
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực người dùng'
    });
  }
};

export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeTokens.delete(token);
  }
  return res.json({
    success: true,
    message: 'Đã đăng xuất thành công'
  });
};
