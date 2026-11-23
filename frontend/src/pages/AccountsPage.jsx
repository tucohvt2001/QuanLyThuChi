import React from 'react';
import { Plus, ArrowRightLeft, Edit2, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { formatVND, DynamicIcon } from '../utils/formatters';
import { CardSkeleton } from '../components/LoadingState';

export const AccountsPage = ({ 
  accounts = [], 
  loading = false,
  onRefresh, 
  onOpenNewAccount, 
  onOpenEditAccount, 
  onOpenTransfer 
}) => {
  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có muốn xóa ví này không? Lưu ý: Ví đã có giao dịch sẽ không thể xóa để bảo toàn số liệu.')) {
      try {
        await api.deleteAccount(id);
        onRefresh();
      } catch (err) {
        alert(err.message || 'Lỗi xóa ví');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-safe-nav md:pb-8">
      {/* Banner Tổng tài sản */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Tổng tài sản khả dụng</span>
          <h2 className="text-2xl md:text-4xl font-black mt-1 tracking-tight text-white">
            {formatVND(totalBalance)}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Được quản lý trong {accounts.length} ví & tài khoản</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onOpenTransfer}
            className="flex-1 sm:flex-none py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs md:text-sm font-semibold backdrop-blur-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Chuyển tiền</span>
          </button>
          <button
            onClick={onOpenNewAccount}
            className="flex-1 sm:flex-none py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm ví mới</span>
          </button>
        </div>
      </div>

      {/* Danh sách các ví / thẻ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <CardSkeleton count={3} />
        ) : accounts.length > 0 ? (
          accounts.map((acc) => {
          return (
            <div
              key={acc.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Header card */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-slate-200"
                    style={{ backgroundColor: acc.color || '#16a34a' }}
                  >
                    <DynamicIcon name={acc.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{acc.name}</h3>
                    <span className="text-xs text-slate-400 capitalize">{acc.type.toLowerCase()}</span>
                  </div>
                </div>

                {/* Actions button */}
                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onOpenEditAccount(acc)}
                    title="Chỉnh sửa ví"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    title="Xóa ví"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Số dư */}
              <div className="my-6">
                <span className="text-xs text-slate-400 font-medium">Số dư hiện tại</span>
                <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mt-0.5">
                  {formatVND(acc.balance)}
                </p>
                {acc.account_number && (
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    STK: {acc.account_number}
                  </p>
                )}
              </div>

              {/* Footer info */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Số ban đầu: {formatVND(acc.initial_balance)}</span>
                <span className="font-medium text-slate-600">{acc.transaction_count || 0} giao dịch</span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full py-12 text-center text-slate-400 text-sm">
          Chưa có ví tiền nào. Bấm "+ Thêm ví mới" để bắt đầu!
        </div>
      )}
      </div>
    </div>
  );
};

