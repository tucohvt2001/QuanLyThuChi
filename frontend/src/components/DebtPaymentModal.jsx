import React, { useState } from 'react';
import { X, CheckCircle2, Wallet, BookOpen, Info, Loader2 } from 'lucide-react';
import { formatVND, formatNumberWithDots, parseNumberFromDots } from '../utils/formatters';

export const DebtPaymentModal = ({ isOpen, onClose, onSavePayment, debt = null, accounts = [] }) => {
  if (!isOpen || !debt) return null;

  const remaining = parseFloat(debt.amount) - parseFloat(debt.paid_amount);
  const [amount, setAmount] = useState(formatNumberWithDots(Math.round(remaining)));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('WALLET'); // 'WALLET' | 'RECORD_ONLY'
  const [accountId, setAccountId] = useState(accounts[0]?.id ? String(accounts[0].id) : '');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isLoan = debt.type === 'LOAN'; // Người khác trả mình
  const isDebt = debt.type === 'DEBT'; // Mình trả người khác

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseNumberFromDots(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Vui lòng nhập số tiền thanh toán hợp lệ');
      return;
    }

    if (paymentMethod === 'WALLET' && !accountId) {
      setError('Vui lòng chọn ví nhận/trích tiền');
      return;
    }

    try {
      setSubmitting(true);
      await onSavePayment(debt.id, {
        amount: numAmount,
        payment_date: paymentDate,
        account_id: paymentMethod === 'WALLET' && accountId ? parseInt(accountId) : null,
        note: note.trim(),
        create_transaction: paymentMethod === 'WALLET'
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi ghi nhận thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              {isLoan ? 'Ghi nhận Thu hồi nợ' : 'Ghi nhận Trả nợ'}
            </h3>
            <p className="text-xs text-slate-500">
              Đối tác: <strong className="text-slate-700">{debt.person_name}</strong>
            </p>
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

          {/* Thông tin số dư nợ */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Số tiền gốc:</span>
              <p className="font-bold text-slate-800 text-sm">{formatVND(debt.amount)}</p>
            </div>
            <div>
              <span className="text-slate-500">Đã thanh toán:</span>
              <p className="font-bold text-emerald-600 text-sm">{formatVND(debt.paid_amount)}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Còn lại:</span>
              <p className="font-black text-purple-600 text-sm">{formatVND(remaining)}</p>
            </div>
          </div>

          {/* Số tiền thanh toán đợt này */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-500">
                {isLoan ? 'Số tiền thu hồi đợt này' : 'Số tiền trả đợt này'} (VNĐ) *
              </label>
              <button
                type="button"
                onClick={() => setAmount(formatNumberWithDots(Math.round(remaining)))}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
              >
                Tất toán hết ({formatVND(remaining)})
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(formatNumberWithDots(e.target.value))}
                className="w-full text-xl font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-purple-600 focus:border-purple-500 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₫</span>
            </div>
          </div>

          {/* Ngày thanh toán */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày thực hiện</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
            />
          </div>

          {/* Phương thức thanh toán: Qua ví vs Chỉ cấn trừ */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phương thức thực hiện</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('WALLET')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  paymentMethod === 'WALLET'
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Wallet className="w-3.5 h-3.5 text-purple-600" />
                  <span>Qua Ví tiền</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isLoan ? 'Cộng tiền vào ví' : 'Trừ tiền khỏi ví'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('RECORD_ONLY')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  paymentMethod === 'RECORD_ONLY'
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>Cấn trừ ngoài ví</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Không đổi tiền ví
                </p>
              </button>
            </div>
          </div>

          {/* Ví nhận / Ví trích nếu qua ví */}
          {paymentMethod === 'WALLET' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                {isLoan ? 'Tiền thu về ví nào?' : 'Trích tiền từ ví nào để trả?'}
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

              <p className="text-[11px] text-slate-400 mt-1 italic">
                {isLoan
                  ? 'Khoản thu nợ này sẽ cộng vào số dư ví và KHÔNG tính vào Thu nhập của tháng.'
                  : 'Khoản trả nợ này sẽ trừ khỏi số dư ví và KHÔNG tính vào Chi tiêu của tháng.'}
              </p>
            </div>
          )}

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ghi chú thanh toán</label>
            <input
              type="text"
              placeholder="VD: Trả đợt 1, tất toán hết..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
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
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                'Xác nhận thanh toán'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
