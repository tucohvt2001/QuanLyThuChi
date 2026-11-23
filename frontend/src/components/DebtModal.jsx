import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  Wallet, 
  FileText, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users,
  CheckCircle2,
  Info,
  BookOpen,
  Loader2
} from 'lucide-react';
import { formatVND, formatNumberWithDots, parseNumberFromDots } from '../utils/formatters';

export const DebtModal = ({ isOpen, onClose, onSave, editingDebt, accounts = [], friends = [] }) => {
  if (!isOpen) return null;

  const [type, setType] = useState('LOAN'); // 'LOAN': Cho vay (Người khác nợ tôi), 'DEBT': Đi vay (Tôi nợ người khác)
  const [recordMethod, setRecordMethod] = useState('WALLET'); // 'WALLET': Giao dịch tiền qua ví, 'RECORD_ONLY': Chỉ ghi sổ theo dõi
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [friendId, setFriendId] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id ? String(accounts[0].id) : '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingDebt) {
      setType(editingDebt.type || 'LOAN');
      setPersonName(editingDebt.person_name || '');
      setPhone(editingDebt.phone || '');
      setFriendId(editingDebt.friend_id ? String(editingDebt.friend_id) : '');
      setAmount(editingDebt.amount ? formatNumberWithDots(editingDebt.amount) : '');
      setAccountId(editingDebt.account_id ? String(editingDebt.account_id) : (accounts[0]?.id ? String(accounts[0].id) : ''));
      setStartDate(editingDebt.start_date ? new Date(editingDebt.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setDueDate(editingDebt.due_date ? new Date(editingDebt.due_date).toISOString().split('T')[0] : '');
      setNote(editingDebt.note || '');
      setRecordMethod('RECORD_ONLY'); // Khi sửa thì mặc định chỉ cập nhật thông tin sổ nợ
    } else {
      setType('LOAN');
      setRecordMethod('WALLET');
      setPersonName('');
      setPhone('');
      setFriendId('');
      setAmount('');
      setAccountId(accounts[0]?.id ? String(accounts[0].id) : '');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setNote('');
      setError('');
    }
  }, [editingDebt, isOpen, accounts]);

  const handleSelectFriend = (fId) => {
    setFriendId(fId);
    if (fId) {
      const found = friends.find(f => String(f.id) === String(fId));
      if (found) {
        setPersonName(found.name);
        if (found.phone) setPhone(found.phone);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseNumberFromDots(amount);

    if (!personName.trim()) {
      setError('Vui lòng nhập họ tên người liên quan');
      return;
    }

    if (!numAmount || numAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }

    if (recordMethod === 'WALLET' && !accountId) {
      setError('Vui lòng chọn ví thực hiện giao dịch');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        id: editingDebt?.id,
        type,
        person_name: personName.trim(),
        phone: phone.trim(),
        friend_id: friendId ? parseInt(friendId) : null,
        amount: numAmount,
        account_id: recordMethod === 'WALLET' && accountId ? parseInt(accountId) : null,
        start_date: startDate,
        due_date: dueDate || null,
        note: note.trim(),
        create_transaction: recordMethod === 'WALLET'
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu khoản nợ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              {editingDebt ? 'Chỉnh sửa khoản nợ' : 'Ghi chép Khoản Vay & Nợ'}
            </h3>
            <p className="text-xs text-slate-500">Quản lý nợ tách riêng khỏi Chi tiêu & Thu nhập</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* 1. Chọn Bản chất Khoản nợ: Cho vay vs Đi vay */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Loại nghiệp vụ</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                disabled={!!editingDebt}
                onClick={() => setType('LOAN')}
                className={`py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'LOAN'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Cho vay (Cần đòi)</span>
              </button>

              <button
                type="button"
                disabled={!!editingDebt}
                onClick={() => setType('DEBT')}
                className={`py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'DEBT'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Đi vay (Cần trả)</span>
              </button>
            </div>
          </div>

          {/* 2. Tách riêng Phương thức phát sinh (Rất quan trọng cho nghiệp vụ) */}
          {!editingDebt && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phương thức phát sinh nợ</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRecordMethod('WALLET')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    recordMethod === 'WALLET'
                      ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Wallet className={`w-4 h-4 ${recordMethod === 'WALLET' ? 'text-purple-600' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold text-slate-800">Giao dịch qua Ví</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {type === 'LOAN' ? 'Rút tiền ví đưa cho vay' : 'Nhận tiền vào ví từ người cho vay'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRecordMethod('RECORD_ONLY')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    recordMethod === 'RECORD_ONLY'
                      ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <BookOpen className={`w-4 h-4 ${recordMethod === 'RECORD_ONLY' ? 'text-purple-600' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold text-slate-800">Chỉ ghi sổ nợ</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Chi hộ, ăn uống share bill, nợ cũ... Không đổi tiền ví
                  </p>
                </button>
              </div>

              {/* Thông báo nghiệp vụ chuẩn */}
              <div className="mt-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2 text-[11px] text-blue-800">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  {recordMethod === 'WALLET' ? (
                    type === 'LOAN' ? (
                      <span>Số dư ví được chọn sẽ <strong>giảm đi</strong>, nhưng được hạch toán là <strong>Cho vay (Khoản phải thu)</strong>, <strong>KHÔNG</strong> bị tính vào Báo cáo Chi tiêu của tháng.</span>
                    ) : (
                      <span>Số dư ví được chọn sẽ <strong>tăng lên</strong>, nhưng được hạch toán là <strong>Đi vay (Nợ phải trả)</strong>, <strong>KHÔNG</strong> bị tính vào Báo cáo Thu nhập của tháng.</span>
                    )
                  ) : (
                    <span>Chỉ ghi chép vào Sổ Nợ để theo dõi và nhắc hẹn trả. <strong>Số dư các ví tiền hoàn toàn giữ nguyên</strong> (chuẩn nghiệp vụ trả hộ / nợ cũ).</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chọn ví nếu là giao dịch tiền qua ví */}
          {!editingDebt && recordMethod === 'WALLET' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                {type === 'LOAN' ? 'Trích tiền từ ví (Cho vay)' : 'Nhận tiền vào ví (Đi vay)'} *
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-purple-500 outline-none bg-white"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatVND(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chọn nhanh từ danh bạ bạn bè */}
          {friends.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Chọn nhanh từ Danh bạ Bạn bè & Đối tác</span>
              </label>
              <select
                value={friendId}
                onChange={(e) => handleSelectFriend(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none bg-purple-50/20 text-slate-700"
              >
                <option value="">-- Nhập thủ công hoặc chọn người quen có sẵn --</option>
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.phone ? `(${f.phone})` : ''} - {f.relationship === 'FRIEND' ? 'Bạn bè' : f.relationship === 'COLLEAGUE' ? 'Đồng nghiệp' : f.relationship === 'FAMILY' ? 'Gia đình' : 'Khác'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Người liên quan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                {type === 'LOAN' ? 'Người vay tiền (Ai nợ bạn?)' : 'Chủ nợ (Người cho bạn vay)'} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={type === 'LOAN' ? 'Tên người vay tiền' : 'Tên chủ nợ'}
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Số điện thoại (tùy chọn)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="09xx..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Số tiền */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Số tiền vay / nợ (VNĐ) *</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                disabled={!!editingDebt}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(formatNumberWithDots(e.target.value))}
                className="w-full text-2xl font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:border-purple-500 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₫</span>
            </div>
            {amount && !isNaN(amount) && parseFloat(amount) > 0 && (
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Bằng chữ / định dạng: {formatVND(parseFloat(amount))}
              </p>
            )}
          </div>

          {/* Ngày bắt đầu & Ngày hẹn trả */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày vay / ghi nợ</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Hạn hẹn trả (nếu có)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ghi chú lý do nợ</label>
            <input
              type="text"
              placeholder="VD: Mượn mua xe, trả tiền cơm trưa, mua quà hộ..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                editingDebt ? 'Cập nhật' : 'Ghi vào sổ nợ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
