import React, { useState } from 'react';
import { X, ArrowRightLeft, Loader2 } from 'lucide-react';
import { formatVND } from '../utils/formatters';

export const TransferModal = ({ isOpen, onClose, onTransfer, accounts = [] }) => {
  if (!isOpen) return null;

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id ? String(accounts[0].id) : '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ? String(accounts[1].id) : '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('Chuyển tiền giữa các ví');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (fromAccountId === toAccountId) {
      setError('Ví chuyển và ví nhận không được trùng nhau');
      return;
    }

    try {
      setSubmitting(true);
      await onTransfer({
        from_account_id: parseInt(fromAccountId),
        to_account_id: parseInt(toAccountId),
        amount: numAmount,
        date,
        note: note.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi chuyển tiền');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Chuyển tiền giữa các ví</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Ví nguồn */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Từ ví nguồn</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatVND(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Ví đích */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Đến ví đích</label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} disabled={String(acc.id) === String(fromAccountId)}>
                  {acc.name} ({formatVND(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Số tiền */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Số tiền chuyển (VNĐ)</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xl font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-blue-600 focus:border-blue-500 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₫</span>
            </div>
            {amount && !isNaN(amount) && parseFloat(amount) > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {formatVND(parseFloat(amount))}
              </p>
            )}
          </div>

          {/* Ngày chuyển */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày thực hiện</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ghi chú</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
            />
          </div>

          {/* Actions */}
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
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang chuyển...</span>
                </>
              ) : (
                'Xác nhận chuyển'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

