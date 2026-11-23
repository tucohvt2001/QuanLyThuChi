import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Plus, 
  HandCoins, 
  Wallet 
} from 'lucide-react';

export const MobileBottomNav = ({ activeTab, setActiveTab, onOpenNewTx }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2">
      <div className="flex items-center justify-around relative">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-all ${
            activeTab === 'dashboard' ? 'text-emerald-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[11px] mt-1">Tổng quan</span>
        </button>

        {/* Tab 2: Sổ giao dịch */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-all ${
            activeTab === 'transactions' ? 'text-emerald-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[11px] mt-1">Giao dịch</span>
        </button>

        {/* Central Action Button: Ghi chép mới */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenNewTx}
            aria-label="Thêm thu chi mới"
            className="w-13 h-13 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transform active:scale-90 transition-all border-4 border-slate-50"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: Sổ Vay & Nợ */}
        <button
          onClick={() => setActiveTab('debts')}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-all ${
            activeTab === 'debts' ? 'text-purple-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <HandCoins className="w-5 h-5" />
          <span className="text-[11px] mt-1">Sổ Nợ</span>
        </button>

        {/* Tab 5: Tài khoản / Ví */}
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex flex-col items-center justify-center py-1 flex-1 transition-all ${
            activeTab === 'accounts' ? 'text-emerald-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[11px] mt-1">Ví tiền</span>
        </button>
      </div>
    </div>
  );
};
