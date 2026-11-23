import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Calendar, FileText, Tag, Wallet, Users, Loader2 } from 'lucide-react';
import { DynamicIcon, formatVND, formatNumberWithDots, parseNumberFromDots } from '../utils/formatters';

export const TransactionModal = ({ isOpen, onClose, onSave, editingTransaction, accounts = [], categories = [], friends = [] }) => {
  if (!isOpen) return null;

  const [type, setType] = useState('EXPENSE'); // 'EXPENSE', 'INCOME', 'TRANSFER'
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'EXPENSE');
      setAmount(editingTransaction.amount ? formatNumberWithDots(editingTransaction.amount) : '');
      setAccountId(editingTransaction.account_id ? String(editingTransaction.account_id) : '');
      setToAccountId(editingTransaction.to_account_id ? String(editingTransaction.to_account_id) : '');
      setCategoryId(editingTransaction.category_id ? String(editingTransaction.category_id) : '');
      setFriendId(editingTransaction.friend_id ? String(editingTransaction.friend_id) : '');
      const d = editingTransaction.transaction_date ? new Date(editingTransaction.transaction_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      setDate(d);
      setNote(editingTransaction.note || '');
    } else {
      setType('EXPENSE');
      setAmount('');
      setAccountId(accounts.length > 0 ? String(accounts[0].id) : '');
      setToAccountId(accounts.length > 1 ? String(accounts[1].id) : '');
      setFriendId('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setError('');
    }
  }, [editingTransaction, isOpen, accounts]);

  // Lọc danh mục theo loại (Chi tiêu hoặc Thu nhập)
  const filteredCategories = categories.filter(c => c.type === type);

  // Auto set category if available and empty
  useEffect(() => {
    if (type !== 'TRANSFER' && filteredCategories.length > 0) {
      if (!categoryId || !filteredCategories.find(c => String(c.id) === String(categoryId))) {
        setCategoryId(String(filteredCategories[0].id));
      }
    }
  }, [type, filteredCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseNumberFromDots(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Vui lòng nhập số tiền lớn hơn 0');
      return;
    }

    if (!accountId) {
      setError('Vui lòng chọn ví / tài khoản');
      return;
    }

    if (type === 'TRANSFER') {
      if (!toAccountId) {
        setError('Vui lòng chọn ví nhận');
        return;
      }
      if (accountId === toAccountId) {
        setError('Ví chuyển và ví nhận không được trùng nhau');
        return;
      }
    }

    try {
      setSubmitting(true);
      await onSave({
        id: editingTransaction?.id,
        type,
        amount: numAmount,
        account_id: parseInt(accountId),
        to_account_id: type === 'TRANSFER' ? parseInt(toAccountId) : null,
        category_id: type !== 'TRANSFER' && categoryId ? parseInt(categoryId) : null,
        friend_id: friendId ? parseInt(friendId) : null,
        transaction_date: date,
        note: note.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi lưu giao dịch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800">
            {editingTransaction ? 'Chỉnh sửa giao dịch' : 'Ghi chép giao dịch mới'}
          </h3>
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

          {/* Chọn Loại Giao dịch: Chi Tiền, Thu Tiền, Chuyển Khoản */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-2 px-3 rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'EXPENSE'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Tiền Chi</span>
            </button>

            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-2 px-3 rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Tiền Thu</span>
            </button>

            <button
              type="button"
              onClick={() => setType('TRANSFER')}
              className={`py-2 px-3 rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'TRANSFER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Chuyển ví</span>
            </button>
          </div>

          {/* Nhập số tiền */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Số tiền (VNĐ)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(formatNumberWithDots(e.target.value))}
                className={`w-full text-2xl font-bold px-4 py-3 rounded-xl border outline-none transition-all ${
                  type === 'EXPENSE' 
                    ? 'text-red-600 focus:border-red-500 bg-red-50/20' 
                    : type === 'INCOME'
                    ? 'text-emerald-600 focus:border-emerald-500 bg-emerald-50/20'
                    : 'text-blue-600 focus:border-blue-500 bg-blue-50/20'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₫</span>
            </div>
            {amount && !isNaN(amount) && parseFloat(amount) > 0 && (
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Bằng số: {formatVND(parseFloat(amount))}
              </p>
            )}
          </div>

          {/* Chọn Danh mục (Nếu không phải Chuyển tiền) */}
          {type !== 'TRANSFER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Danh mục</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 border rounded-xl border-slate-200">
                {filteredCategories.map((cat) => {
                  const isSelected = String(cat.id) === String(categoryId);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(String(cat.id))}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 font-semibold'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
                        style={{ backgroundColor: cat.color || '#3b82f6' }}
                      >
                        <DynamicIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chọn Ví tiền / Tài khoản */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                {type === 'TRANSFER' ? 'Từ ví / tài khoản' : 'Tài khoản / Ví'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-emerald-500 outline-none bg-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatVND(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            {type === 'TRANSFER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Đến ví nhận</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 outline-none bg-white"
                >
                  <option value="">-- Chọn ví nhận --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} disabled={String(acc.id) === String(accountId)}>
                      {acc.name} ({formatVND(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày giao dịch</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ghi chú</label>
            <input
              type="text"
              placeholder="VD: Cà phê sáng, ăn trưa, đổ xăng..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Gắn với Bạn bè / Đối tác */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Gắn với Bạn bè / Đối tác (Tùy chọn)</span>
            </label>
            <select
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none bg-white text-slate-700"
            >
              <option value="">-- Không gắn bạn bè --</option>
              {friends.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} {f.phone ? `(${f.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
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
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                editingTransaction ? 'Cập nhật' : 'Lưu giao dịch'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

