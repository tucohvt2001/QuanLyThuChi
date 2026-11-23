import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Phone, 
  Calendar,
  History,
  HandCoins,
  Receipt
} from 'lucide-react';
import { api } from '../services/api';
import { formatVND, formatDate } from '../utils/formatters';
import { CardSkeleton } from '../components/LoadingState';

export const DebtsPage = ({ 
  accounts = [], 
  friends = [],
  onRefreshSummary,
  onOpenNewDebt,
  onOpenEditDebt,
  onOpenPayment
}) => {
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState({
    totalLoan: 0,
    remainingLoan: 0,
    totalDebt: 0,
    remainingDebt: 0,
    overdueCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'LOAN', 'DEBT'
  const [statusFilter, setStatusFilter] = useState(''); // '', 'PENDING', 'PARTIAL', 'PAID'
  const [search, setSearch] = useState('');
  const [selectedDebtHistory, setSelectedDebtHistory] = useState(null);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const res = await api.getDebts({
        type: activeFilter !== 'ALL' ? activeFilter : undefined,
        status: statusFilter || undefined,
        search: search || undefined
      });
      setDebts(res.data);
      if (res.summary) setSummary(res.summary);
    } catch (err) {
      console.error('Lỗi tải sổ nợ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [activeFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDebts();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khoản nợ này khỏi sổ ghi chép?')) {
      try {
        await api.deleteDebt(id);
        fetchDebts();
        if (onRefreshSummary) onRefreshSummary();
      } catch (err) {
        alert(err.message || 'Lỗi khi xóa');
      }
    }
  };

  const handleViewHistory = async (debt) => {
    try {
      const res = await api.getDebtById(debt.id);
      setSelectedDebtHistory(res.data);
    } catch (err) {
      alert(err.message || 'Lỗi tải lịch sử trả');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-safe-nav md:pb-8">
      {/* 1. Header 3 Thẻ Chỉ số Sổ Nợ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Người khác nợ tôi */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider truncate">Người khác nợ tôi</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-600 tracking-tight truncate">
            {formatVND(summary.remainingLoan)}
          </p>
          <p className="text-xs text-slate-400 mt-1 truncate">
            Tổng cho vay: {formatVND(summary.totalLoan)}
          </p>
        </div>

        {/* Tôi nợ người khác */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider truncate">Tôi nợ người khác</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight truncate">
            {formatVND(summary.remainingDebt)}
          </p>
          <p className="text-xs text-slate-400 mt-1 truncate">
            Tổng đi vay: {formatVND(summary.totalDebt)}
          </p>
        </div>

        {/* Cảnh báo quá hạn */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider truncate">Hẹn trả quá hạn</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-red-600 tracking-tight truncate">
            {summary.overdueCount} khoản
          </p>
          <p className="text-xs text-slate-400 mt-1 truncate">
            Cần nhắc nhở / thanh toán ngay
          </p>
        </div>
      </div>

      {/* 2. Thanh Tìm kiếm, Bộ lọc & Nút Thêm mới */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Ô tìm kiếm */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên người, SĐT, ghi chú..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
            />
          </div>

          {/* Nút Thêm Khoản nợ mới */}
          <button
            onClick={onOpenNewDebt}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khoản vay / nợ</span>
          </button>
        </div>

        {/* Bộ lọc Loại: Tất cả / Người khác nợ tôi / Tôi nợ người khác */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({debts.length})
          </button>
          <button
            onClick={() => setActiveFilter('LOAN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              activeFilter === 'LOAN' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" /> Người khác nợ tôi
          </button>
          <button
            onClick={() => setActiveFilter('DEBT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              activeFilter === 'DEBT' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" /> Tôi nợ người khác
          </button>

          {/* Lọc theo Trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none ml-auto"
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="PENDING">Chưa thanh toán</option>
            <option value="PARTIAL">Đang trả dở</option>
            <option value="PAID">Đã hoàn tất</option>
          </select>
        </div>
      </div>

      {/* 3. Danh sách Sổ nợ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <CardSkeleton count={4} />
        ) : debts.length > 0 ? (
          debts.map((d) => {
            const isLoan = d.type === 'LOAN';
            const isPaid = d.status === 'PAID';
            const isPartial = d.status === 'PARTIAL';
            const remaining = parseFloat(d.remaining_amount);
            const total = parseFloat(d.amount);
            const percent = total > 0 ? Math.round((parseFloat(d.paid_amount) / total) * 100) : 0;

            return (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all relative overflow-hidden"
              >
                <div>
                  {/* Top Bar: Loại + Trạng thái + Actions */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                        isLoan ? 'bg-purple-600' : 'bg-amber-600'
                      }`}>
                        {isLoan ? <HandCoins className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-[130px] sm:max-w-none">{d.person_name}</h4>
                          {d.friend_name && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-semibold shrink-0">
                              👤 {d.friend_name}
                            </span>
                          )}
                          {d.is_overdue && (
                            <span className="px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold shrink-0">
                              Quá hạn!
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] font-semibold block truncate ${isLoan ? 'text-purple-600' : 'text-amber-600'}`}>
                          {isLoan ? 'Người khác nợ tôi' : 'Tôi nợ người khác'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewHistory(d)}
                        title="Xem lịch sử trả nợ"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenEditDebt(d)}
                        title="Chỉnh sửa"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        title="Xóa khoản nợ"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Thông tin số tiền */}
                  <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Còn lại phải {isLoan ? 'thu' : 'trả'}:</span>
                      <strong className={`text-base font-black ${isPaid ? 'text-emerald-600' : isLoan ? 'text-purple-600' : 'text-amber-600'}`}>
                        {formatVND(remaining)}
                      </strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isPaid ? 'bg-emerald-500' : isLoan ? 'bg-purple-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>Đã trả: {formatVND(d.paid_amount)} ({percent}%)</span>
                      <span>Gốc: {formatVND(d.amount)}</span>
                    </div>
                  </div>

                  {/* Chi tiết ngày tháng & ghi chú */}
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ngày vay: {formatDate(d.start_date)}</span>
                      {d.due_date && (
                        <span className="ml-auto font-medium text-slate-700">
                          Hạn trả: {formatDate(d.due_date)}
                        </span>
                      )}
                    </div>
                    {d.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>SĐT: {d.phone}</span>
                      </div>
                    )}
                    {d.note && (
                      <p className="text-slate-500 italic mt-1 line-clamp-1">"{d.note}"</p>
                    )}
                  </div>
                </div>

                {/* Footer Action: Nút Thanh toán / Thu tiền */}
                <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    isPaid 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : isPartial 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isPaid ? 'Đã hoàn tất' : isPartial ? 'Đang trả dở' : 'Chưa trả'}
                  </span>

                  {!isPaid && (
                    <button
                      onClick={() => onOpenPayment(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center gap-1.5 active:scale-95 ${
                        isLoan ? 'bg-purple-600 hover:bg-purple-700' : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{isLoan ? 'Ghi nhận thu nợ' : 'Ghi nhận trả nợ'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Chưa có khoản vay hoặc nợ nào trong danh mục này.
          </div>
        )}
      </div>

      {/* Modal Lịch sử Thanh toán */}
      {selectedDebtHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Lịch sử thanh toán</h3>
                <p className="text-xs text-slate-500">{selectedDebtHistory.person_name}</p>
              </div>
              <button 
                onClick={() => setSelectedDebtHistory(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5 max-h-80 overflow-y-auto divide-y divide-slate-100">
              {selectedDebtHistory.payments && selectedDebtHistory.payments.length > 0 ? (
                selectedDebtHistory.payments.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{formatDate(p.payment_date)}</p>
                      {p.account_name && <span className="text-slate-400">Ví: {p.account_name}</span>}
                      {p.note && <p className="text-slate-500 italic mt-0.5">"{p.note}"</p>}
                    </div>
                    <span className="font-bold text-emerald-600 text-sm">
                      +{formatVND(p.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 text-xs py-6">Chưa có lần thanh toán nào.</p>
              )}
            </div>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedDebtHistory(null)}
                className="w-full py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

