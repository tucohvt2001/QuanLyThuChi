import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  Tags, 
  PiggyBank, 
  BarChart3,
  PlusCircle,
  HandCoins,
  Users,
  LogOut
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, onOpenNewTx, currentUser, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Sổ giao dịch', icon: ArrowLeftRight },
    { id: 'debts', label: 'Sổ Vay & Nợ', icon: HandCoins },
    { id: 'friends', label: 'Bạn bè & Đối tác', icon: Users },
    { id: 'accounts', label: 'Tài khoản & Ví', icon: Wallet },
    { id: 'budgets', label: 'Hạn mức chi tiêu', icon: PiggyBank },
    { id: 'categories', label: 'Danh mục thu chi', icon: Tags },
    { id: 'reports', label: 'Báo cáo tài chính', icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen p-4 sticky top-0 h-screen select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 font-black text-xl">
          ₫
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-800 leading-tight">ThuChi 247</h1>
          <p className="text-xs text-slate-500 font-medium">Quản lý tài chính cá nhân</p>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="mb-6 px-1">
        <button
          onClick={onOpenNewTx}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Ghi chép mới</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-5 rounded-full bg-emerald-600" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="mt-auto pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 mb-2">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {(currentUser?.username || 'A')[0].toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name || 'Quản trị viên'}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">@{currentUser?.username || 'admin'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Database Status Tag */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium truncate">Neon DB Connected</span>
        </div>
      </div>
    </aside>
  );
};
