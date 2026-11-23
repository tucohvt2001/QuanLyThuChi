import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  Wallet, 
  Users, 
  Info, 
  BookOpen, 
  Loader2,
  HandCoins,
  Receipt,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { formatVND, formatNumberWithDots, parseNumberFromDots } from '../utils/formatters';

export const DebtModal = ({ isOpen, onClose, onSave, editingDebt, accounts = [], friends = [] }) => {
  if (!isOpen) return null;

  const [type, setType] = useState('LOAN'); // 'LOAN': Cho vay (Người khác nợ tôi), 'DEBT': Đi vay (Tôi nợ người khác)
  const [recordMethod, setRecordMethod] = useState('RECORD_ONLY'); // MẶC ĐỊNH: Chỉ ghi sổ theo dõi nợ, không tự động cộng/trừ ví
  const [walletAction, setWalletAction] = useState('PLUS'); // 'PLUS' | 'MINUS' (dành riêng khi Đi vay và chọn qua ví)
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
      setRecordMethod('RECORD_ONLY'); // Khi sửa thì chỉ cập nhật thông tin sổ nợ
    } else {
      setType('LOAN');
      setRecordMethod('RECORD_ONLY'); // Mặc định luôn là chỉ ghi sổ nợ an toàn
      setWalletAction('PLUS');
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
        create_transaction: recordMethod === 'WALLET',
        wallet_action: type === 'DEBT' ? walletAction : 'MINUS'
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu khoản nợ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-800">
              {editingDebt ? 'Chỉnh sửa khoản nợ' : 'Ghi chép Khoản Vay & Nợ'}
            </h3>
            <p className="text-xs text-slate-500">Quản lý nợ tách riêng biệt khỏi Chi tiêu & Thu nhập</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* 1. Chọn Bản chất Khoản nợ: Cho vay vs Đi vay */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Bản chất nghiệp vụ nợ</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                disabled={!!editingDebt}
                onClick={() => setType('LOAN')}
                className={`py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'LOAN'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HandCoins className="w-4 h-4 shrink-0" />
                <span className="truncate">Cho vay (Người nợ tôi)</span>
              </button>

              <button
                type="button"
                disabled={!!editingDebt}
                onClick={() => setType('DEBT')}
                className={`py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'DEBT'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-4 h-4 shrink-0" />
                <span className="truncate">Đi vay (Tôi nợ người khác)</span>
              </button>
            </div>
          </div>

          {/* 2. Phương thức ghi nhận: Chỉ ghi sổ nợ (Khuyên dùng) vs Qua Ví */}
          {!editingDebt && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500">Tác động đến số dư ví tiền</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Lựa chọn 1: Chỉ ghi sổ nợ (MẶC ĐỊNH & KHUYÊN DÙNG) */}
                <button
                  type="button"
                  onClick={() => setRecordMethod('RECORD_ONLY')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    recordMethod === 'RECORD_ONLY'
                      ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className={`w-4 h-4 ${recordMethod === 'RECORD_ONLY' ? 'text-purple-600' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold text-slate-800">Chỉ ghi sổ theo dõi nợ</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Khuyên dùng
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Số dư ví <strong>giữ nguyên 100%</strong>. Phù hợp nợ ăn uống, mua hàng bạn trả hộ, nợ cũ...
                  </p>
                </button>

                {/* Lựa chọn 2: Giao dịch có tiền thật qua ví */}
                <button
                  type="button"
                  onClick={() => setRecordMethod('WALLET')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    recordMethod === 'WALLET'
                      ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Wallet className={`w-4 h-4 ${recordMethod === 'WALLET' ? 'text-purple-600' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold text-slate-800">Giao dịch qua Ví tiền</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    {type === 'LOAN' ? 'Trích tiền từ ví đưa cho vay (-)' : 'Thực tế tiền đã chuyển vào hoặc trừ ví'}
                  </p>
                </button>
              </div>

              {/* Giải thích nghiệp vụ & Tùy chọn nâng cao khi chọn Qua Ví */}
              {recordMethod === 'WALLET' && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
                  {type === 'LOAN' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Trích tiền từ ví đưa cho vay (Số dư ví sẽ giảm) *
                      </label>
                      <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:border-purple-500 outline-none bg-white"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({formatVND(acc.balance)})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Chọn cách thay đổi số dư ví khi Đi vay:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setWalletAction('PLUS')}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2 ${
                            walletAction === 'PLUS'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span>+ Cộng tiền vào ví</span>
                            <p className="text-[10px] font-normal text-slate-500 mt-0.5">
                              Người cho vay đã đưa tiền mặt/chuyển khoản vào tài khoản của bạn
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setWalletAction('MINUS')}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2 ${
                            walletAction === 'MINUS'
                              ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <MinusCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                          <div>
                            <span>- Trừ tiền ví ngay</span>
                            <p className="text-[10px] font-normal text-slate-500 mt-0.5">
                              Tính khoản nợ này trừ thẳng vào số dư ví của bạn
                            </p>
                          </div>
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Ví / Tài khoản áp dụng *
                        </label>
                        <select
                          value={accountId}
                          onChange={(e) => setAccountId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:border-purple-500 outline-none bg-white"
                        >
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name} ({formatVND(acc.balance)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Thông báo hướng dẫn ngắn gọn */}
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2 text-[11px] text-blue-800">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  {recordMethod === 'RECORD_ONLY' ? (
                    <span>Khoản vay nợ sẽ được lưu vào <strong>Sổ Vay & Nợ</strong> để quản lý, tính hạn trả. <strong>Số dư ví hoàn toàn giữ nguyên</strong> không bị cộng trừ.</span>
                  ) : (
                    <span>Giao dịch này được hạch toán tách biệt với Thu chi thông thường, <strong>KHÔNG</strong> làm sai lệch Báo cáo Thu nhập / Chi tiêu của tháng.</span>
                  )}
                </div>
              </div>
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
                  placeholder={type === 'LOAN' ? 'Tên người vay' : 'Tên chủ nợ'}
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
                className="w-full text-xl sm:text-2xl font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:border-purple-500 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₫</span>
            </div>
            {amount && parseNumberFromDots(amount) > 0 && (
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Bằng số: <strong>{formatVND(parseNumberFromDots(amount))}</strong>
              </p>
            )}
          </div>

          {/* Ngày bắt đầu & Ngày hẹn trả */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày phát sinh nợ</label>
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
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ghi chú mục đích / nội dung nợ</label>
            <input
              type="text"
              placeholder="VD: Mượn mua đồ, trả tiền cơm trưa, mua quà hộ..."
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
