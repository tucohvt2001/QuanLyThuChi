import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.login({ username: username.trim(), password });
      
      if (res.token) {
        localStorage.setItem('thuchi_token', res.token);
        localStorage.setItem('thuchi_user', JSON.stringify(res.user || { username: 'admin', name: 'Quản trị viên' }));
        onLoginSuccess(res.user || { username: 'admin', name: 'Quản trị viên' });
      }
    } catch (err) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-emerald-600/30 mx-auto mb-3">
            ₫
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ThuChi 247</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Hệ thống Quản lý Thu Chi & Sổ Nợ Thông Minh</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-lg shadow-slate-200/50">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Đăng nhập tài khoản</h2>
            <p className="text-xs text-slate-500 mt-0.5">Vui lòng nhập thông tin xác thực để tiếp tục</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tên đăng nhập */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nút Đăng nhập */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 ThuChi 247 • Bảo mật kết nối Neon PostgreSQL
        </p>
      </div>
    </div>
  );
};

