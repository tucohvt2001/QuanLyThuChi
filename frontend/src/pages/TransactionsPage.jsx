import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit2, 
  Calendar, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ArrowRightLeft,
  Tag,
  Wallet,
  ChevronLeft,
  ChevronRight,
  HandCoins
} from 'lucide-react';
import { api } from '../services/api';
import { formatVND, formatDate, DynamicIcon, getTransactionTypeInfo } from '../utils/formatters';
import { ListSkeleton } from '../components/LoadingState';

export const TransactionsPage = ({ 
  accounts = [], 
  categories = [], 
  friends = [],
  onOpenEditTx, 
  onRefreshSummary 
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState(''); // 'EXPENSE', 'INCOME', 'TRANSFER'
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.getTransactions({
        page,
        limit: 15,
        type: type || undefined,
        category_id: categoryId || undefined,
        account_id: accountId || undefined,
        friend_id: friendId || undefined,
        search: search || undefined
      });
      setTransactions(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error('Lỗi tải giao dịch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, type, categoryId, accountId, friendId]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchTransactions();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này? Số dư ví sẽ được tự động hoàn lại.')) {
      try {
        await api.deleteTransaction(id);
        fetchTransactions();
        if (onRefreshSummary) onRefreshSummary();
      } catch (err) {
        alert(err.message || 'Lỗi khi xóa giao dịch');
      }
    }
  };

  const handleExportCSV = () => {
    window.open('/api/transactions/export/csv', '_blank');
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-safe-nav md:pb-8">
      {/* Thanh Tìm kiếm & Bộ lọc */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Ô tìm kiếm */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo ghi chú, danh mục, ví..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Nút Xuất file CSV */}
          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Xuất file Excel / CSV</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => { setType(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              type === '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => { setType('EXPENSE'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              type === 'EXPENSE' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Chi tiêu
          </button>
          <button
            onClick={() => { setType('INCOME'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              type === 'INCOME' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" /> Thu nhập
          </button>
          <button
            onClick={() => { setType('TRANSFER'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              type === 'TRANSFER' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Chuyển khoản
          </button>
          <button
            onClick={() => { setType('DEBT_ALL'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              type === 'DEBT_ALL' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" /> Vay & Nợ
          </button>

          {/* Filter Ví */}
          <select
            value={accountId}
            onChange={(e) => { setAccountId(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none"
          >
            <option value="">-- Tất cả ví --</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>

          {/* Filter Danh mục */}
          {type !== 'TRANSFER' && (
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none"
            >
              <option value="">-- Tất cả danh mục --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name} ({cat.type === 'EXPENSE' ? 'Chi' : 'Thu'})</option>
              ))}
            </select>
          )}

          {/* Filter Bạn bè */}
          {friends.length > 0 && (
            <select
              value={friendId}
              onChange={(e) => { setFriendId(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none"
            >
              <option value="">-- Tất cả bạn bè --</option>
              {friends.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Danh sách Giao dịch */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <ListSkeleton rows={8} />
        ) : transactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const typeInfo = getTransactionTypeInfo(tx.type);
              const isTransfer = tx.type === 'TRANSFER';
              const isDebtRelated = ['LOAN', 'BORROW', 'DEBT_COLLECTION', 'DEBT_REPAYMENT'].includes(tx.type);

              return (
                <div 
                  key={tx.id}
                  className="p-3.5 md:p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  {/* Trái: Icon + Thông tin */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: tx.category_color || typeInfo.defaultBg }}
                    >
                      <DynamicIcon name={tx.category_icon || typeInfo.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-800">
                          {isTransfer ? `Chuyển sang ${tx.to_account_name || 'ví khác'}` : (tx.category_name || typeInfo.label)}
                        </h4>
                        {isDebtRelated && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                            {typeInfo.label}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-600">{tx.account_name}</span>
                        <span>•</span>
                        <span>{formatDate(tx.transaction_date)}</span>
                        {tx.friend_name && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                            👤 {tx.friend_name}
                          </span>
                        )}
                        {tx.note && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 italic font-normal">"{tx.note}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Phải: Số tiền + Nút Sửa / Xóa */}
                  <div className="flex items-center gap-3">
                    <p className={`font-black text-sm md:text-base ${typeInfo.color}`}>
                      {typeInfo.prefix}{formatVND(tx.amount)}
                    </p>

                    <div className="flex items-center gap-1 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onOpenEditTx(tx)}
                        title="Chỉnh sửa"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        title="Xóa giao dịch"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">
            Không tìm thấy giao dịch nào phù hợp với bộ lọc.
          </div>
        )}

        {/* Phân trang */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng {pagination.total} giao dịch (Trang {pagination.page}/{pagination.totalPages})</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ArrowUpRight = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
  </svg>
);

const ArrowDownRight = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 7 10 10"/><path d="M17 7v10H7"/>
  </svg>
);

