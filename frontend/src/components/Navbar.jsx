import React from 'react';
import { Calendar, Plus, RefreshCw, Users, Tags, LogOut } from 'lucide-react';

export const Navbar = ({ 
  title, 
  currentMonth, 
  currentYear, 
  onChangePeriod, 
  onOpenNewTx, 
  onRefresh,
  loading = false,
  activeTab,
  setActiveTab,
  currentUser,
  onLogout
}) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [2024, 2025, 2026, 2027];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500 hidden sm:block">Theo dõi & kiểm soát dòng tiền thông minh</p>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Bộ chọn Tháng / Năm */}
        <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl text-xs md:text-sm font-medium text-slate-700 transition-colors">
          <Calendar className="w-4 h-4 text-slate-500 hidden xs:block" />
          <select
            value={currentMonth}
            onChange={(e) => onChangePeriod(parseInt(e.target.value), currentYear)}
            className="bg-transparent font-semibold cursor-pointer outline-none text-slate-800"
          >
            {months.map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
          <span className="text-slate-400">/</span>
          <select
            value={currentYear}
            onChange={(e) => onChangePeriod(currentMonth, parseInt(e.target.value))}
            className="bg-transparent font-semibold cursor-pointer outline-none text-slate-800"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Nút Làm mới */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title={loading ? 'Đang làm mới...' : 'Tải lại dữ liệu'}
          className={`p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors active:scale-95 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* Nút Bạn bè & Đối tác */}
        <button
          onClick={() => setActiveTab(activeTab === 'friends' ? 'dashboard' : 'friends')}
          className={`p-2 rounded-xl transition-colors active:scale-95 flex items-center gap-1.5 text-xs font-semibold ${
            activeTab === 'friends'
              ? 'bg-blue-100 text-blue-700 font-bold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Danh bạ Bạn bè & Đối tác"
        >
          <Users className="w-4 h-4" />
          <span className="hidden lg:inline">Bạn bè</span>
        </button>

        {/* Nút Danh mục nhanh trên mobile */}
        <button
          onClick={() => setActiveTab(activeTab === 'categories' ? 'dashboard' : 'categories')}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95"
          title="Danh mục"
        >
          <Tags className="w-4 h-4" />
        </button>

        {/* Nút Ghi chép mới trên Top Nav (Desktop) */}
        <button
          onClick={onOpenNewTx}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi chép</span>
        </button>

        {/* Nút Đăng xuất */}
        <button
          onClick={onLogout}
          title="Đăng xuất khỏi hệ thống"
          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors active:scale-95"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
