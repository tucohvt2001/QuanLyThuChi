import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Edit2, 
  Trash2, 
  History, 
  HandCoins,
  Receipt,
  Heart,
  Briefcase,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { formatVND, formatDate } from '../utils/formatters';
import { CardSkeleton } from '../components/LoadingState';

export const FriendsPage = ({ 
  onRefreshSummary, 
  onOpenNewFriend, 
  onOpenEditFriend,
  onNavigateToTx
}) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('');
  const [selectedFriendDetail, setSelectedFriendDetail] = useState(null);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await api.getFriends({
        relationship: relationshipFilter || undefined,
        search: search || undefined
      });
      setFriends(res.data);
    } catch (err) {
      console.error('Lỗi tải danh bạ bạn bè:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [relationshipFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchFriends, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${name}" khỏi danh bạ? Các giao dịch và khoản nợ cũ vẫn sẽ được giữ an toàn.`)) {
      try {
        await api.deleteFriend(id);
        fetchFriends();
        if (onRefreshSummary) onRefreshSummary();
      } catch (err) {
        alert(err.message || 'Lỗi khi xóa bạn bè');
      }
    }
  };

  const handleViewDetail = async (friend) => {
    try {
      const res = await api.getFriendById(friend.id);
      setSelectedFriendDetail(res.data);
    } catch (err) {
      alert(err.message || 'Lỗi tải lịch sử liên quan');
    }
  };

  const getRelationshipBadge = (rel) => {
    switch (rel) {
      case 'FRIEND':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">Bạn bè</span>;
      case 'COLLEAGUE':
        return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">Đồng nghiệp</span>;
      case 'FAMILY':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">Gia đình</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">Khác</span>;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const totalLoanFromFriends = friends.reduce((sum, f) => sum + (parseFloat(f.remaining_loan) || 0), 0);
  const totalDebtToFriends = friends.reduce((sum, f) => sum + (parseFloat(f.remaining_debt) || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-safe-nav md:pb-8">
      {/* 1. Header 3 Thẻ Tổng quan Bạn bè */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng danh bạ</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">
            {friends.length} người
          </p>
          <p className="text-xs text-slate-400 mt-1">Sẵn sàng để gắn vào chi tiêu & nợ</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider truncate">Bạn bè đang nợ bạn</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-600 tracking-tight truncate">
            {formatVND(totalLoanFromFriends)}
          </p>
          <p className="text-xs text-slate-400 mt-1 truncate">Cần thu hồi</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider truncate">Bạn đang nợ bạn bè</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight truncate">
            {formatVND(totalDebtToFriends)}
          </p>
          <p className="text-xs text-slate-400 mt-1 truncate">Cần thanh toán</p>
        </div>
      </div>

      {/* 2. Thanh Tìm kiếm, Bộ lọc & Thêm mới */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, ghi chú..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
            />
          </div>

          <button
            onClick={onOpenNewFriend}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bạn bè mới</span>
          </button>
        </div>

        {/* Lọc theo mối quan hệ */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setRelationshipFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              relationshipFilter === '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({friends.length})
          </button>
          <button
            onClick={() => setRelationshipFilter('FRIEND')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              relationshipFilter === 'FRIEND' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bạn bè
          </button>
          <button
            onClick={() => setRelationshipFilter('COLLEAGUE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              relationshipFilter === 'COLLEAGUE' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Đồng nghiệp
          </button>
          <button
            onClick={() => setRelationshipFilter('FAMILY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              relationshipFilter === 'FAMILY' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Gia đình
          </button>
          <button
            onClick={() => setRelationshipFilter('OTHER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              relationshipFilter === 'OTHER' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Khác
          </button>
        </div>
      </div>

      {/* 3. Danh sách Thẻ Bạn bè */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <CardSkeleton count={6} />
        ) : friends.length > 0 ? (
          friends.map((friend) => {
            const hasLoan = parseFloat(friend.remaining_loan) > 0;
            const hasDebt = parseFloat(friend.remaining_debt) > 0;

            return (
              <div
                key={friend.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all relative overflow-hidden group"
              >
                <div>
                  {/* Top: Avatar + Tên + Badge + Actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                        style={{ backgroundColor: friend.avatar_color || '#3b82f6' }}
                      >
                        {getInitials(friend.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-800 text-base">{friend.name}</h4>
                        </div>
                        <div className="mt-0.5">
                          {getRelationshipBadge(friend.relationship)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewDetail(friend)}
                        title="Xem lịch sử giao dịch & nợ"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenEditFriend(friend)}
                        title="Chỉnh sửa thông tin"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(friend.id, friend.name)}
                        title="Xóa bạn bè"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Thông tin liên hệ */}
                  <div className="space-y-1.5 text-xs text-slate-600 my-3">
                    {friend.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`tel:${friend.phone}`} className="hover:text-blue-600 font-medium">
                          {friend.phone}
                        </a>
                      </div>
                    )}
                    {friend.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{friend.email}</span>
                      </div>
                    )}
                    {friend.note && (
                      <p className="text-slate-400 italic text-[11px] line-clamp-1">"{friend.note}"</p>
                    )}
                  </div>
                </div>

                {/* Phần Trạng thái Nợ & Giao dịch */}
                <div className="pt-3 border-t border-slate-100 space-y-2 mt-2">
                  {/* Trạng thái Nợ nếu có */}
                  {hasLoan && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50 text-xs">
                      <span className="text-purple-700 font-semibold flex items-center gap-1">
                        <ArrowDownLeft className="w-3.5 h-3.5" /> Đang nợ bạn:
                      </span>
                      <strong className="text-purple-700 font-black">{formatVND(friend.remaining_loan)}</strong>
                    </div>
                  )}

                  {hasDebt && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-xs">
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Bạn đang nợ:
                      </span>
                      <strong className="text-amber-700 font-black">{formatVND(friend.remaining_debt)}</strong>
                    </div>
                  )}

                  {/* Chi tiêu chung */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                    <span>Giao dịch chung:</span>
                    <span className="text-slate-800 font-semibold">
                      {friend.transaction_count} lần {parseFloat(friend.total_spent) > 0 && `(${formatVND(friend.total_spent)})`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Chưa có người bạn nào trong danh bạ. Bấm "Thêm bạn bè mới" để bắt đầu!
          </div>
        )}
      </div>

      {/* Modal Xem Chi Tiết & Lịch Sử Bạn Bè */}
      {selectedFriendDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                  style={{ backgroundColor: selectedFriendDetail.avatar_color || '#3b82f6' }}
                >
                  {getInitials(selectedFriendDetail.name)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{selectedFriendDetail.name}</h3>
                  <p className="text-xs text-slate-500">{selectedFriendDetail.phone || 'Chưa có SĐT'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFriendDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Khoản nợ liên quan */}
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">
                  Khoản vay & nợ liên quan ({selectedFriendDetail.debts?.length || 0})
                </h4>
                {selectedFriendDetail.debts && selectedFriendDetail.debts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFriendDetail.debts.map(d => (
                      <div key={d.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                        <div>
                          <span className={`font-bold ${d.type === 'LOAN' ? 'text-purple-600' : 'text-amber-600'}`}>
                            {d.type === 'LOAN' ? 'Họ nợ bạn' : 'Bạn nợ họ'}
                          </span>
                          <p className="text-slate-500 mt-0.5">{d.note || 'Không có ghi chú'} ({formatDate(d.start_date)})</p>
                        </div>
                        <div className="text-right">
                          <strong className="text-slate-800 text-sm font-black">{formatVND(d.amount)}</strong>
                          <p className={`font-semibold ${d.status === 'PAID' ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {d.status === 'PAID' ? 'Đã trả xong' : `Còn: ${formatVND(d.remaining_amount)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Không có khoản nợ nào.</p>
                )}
              </div>

              {/* Lịch sử giao dịch chi tiêu chung */}
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">
                  Lịch sử giao dịch có gắn ({selectedFriendDetail.transactions?.length || 0})
                </h4>
                {selectedFriendDetail.transactions && selectedFriendDetail.transactions.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {selectedFriendDetail.transactions.map(t => (
                      <div key={t.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div>
                          <p className="font-bold text-slate-800">{t.category_name || 'Chi tiêu'}</p>
                          <p className="text-slate-400">{formatDate(t.transaction_date)} • {t.account_name}</p>
                          {t.note && <p className="text-slate-500 italic">"{t.note}"</p>}
                        </div>
                        <span className={`font-bold ${t.type === 'EXPENSE' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {t.type === 'EXPENSE' ? '-' : '+'}{formatVND(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Chưa có giao dịch nào được gắn với bạn này.</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedFriendDetail(null)}
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

