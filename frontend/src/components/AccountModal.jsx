import React, { useState, useEffect } from 'react';
import { X, Wallet, Landmark, Smartphone, PiggyBank, CreditCard, Loader2 } from 'lucide-react';
import { DynamicIcon, AVAILABLE_ICONS, AVAILABLE_COLORS, formatVND } from '../utils/formatters';

export const AccountModal = ({ isOpen, onClose, onSave, editingAccount }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [type, setType] = useState('CASH'); // CASH, BANK, EWALLET, SAVINGS, CREDIT
  const [initialBalance, setInitialBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [icon, setIcon] = useState('Wallet');
  const [color, setColor] = useState('#16a34a');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const accountTypes = [
    { id: 'CASH', label: 'Tiền mặt', defaultIcon: 'Banknote', defaultColor: '#16a34a' },
    { id: 'BANK', label: 'Ngân hàng', defaultIcon: 'Landmark', defaultColor: '#0284c7' },
    { id: 'EWALLET', label: 'Ví điện tử', defaultIcon: 'Smartphone', defaultColor: '#d946ef' },
    { id: 'SAVINGS', label: 'Tiết kiệm', defaultIcon: 'PiggyBank', defaultColor: '#ea580c' },
    { id: 'CREDIT', label: 'Thẻ tín dụng', defaultIcon: 'CreditCard', defaultColor: '#6366f1' },
  ];

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name || '');
      setType(editingAccount.type || 'CASH');
      setInitialBalance(editingAccount.initial_balance ? String(Math.round(editingAccount.initial_balance)) : '0');
      setAccountNumber(editingAccount.account_number || '');
      setIcon(editingAccount.icon || 'Wallet');
      setColor(editingAccount.color || '#16a34a');
    } else {
      setName('');
      setType('CASH');
      setInitialBalance('0');
      setAccountNumber('');
      setIcon('Wallet');
      setColor('#16a34a');
      setError('');
    }
  }, [editingAccount, isOpen]);

  const handleTypeChange = (t) => {
    setType(t);
    const found = accountTypes.find(at => at.id === t);
    if (found && !editingAccount) {
      setIcon(found.defaultIcon);
      setColor(found.defaultColor);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên ví / tài khoản');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        id: editingAccount?.id,
        name: name.trim(),
        type,
        initial_balance: parseFloat(initialBalance) || 0,
        account_number: accountNumber.trim(),
        icon,
        color
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi lưu ví');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800">
            {editingAccount ? 'Chỉnh sửa ví / tài khoản' : 'Thêm ví / tài khoản mới'}
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

          {/* Chọn Loại tài khoản */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Loại ví / Tài khoản</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {accountTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeChange(t.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                    type === t.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tên ví */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tên ví / Tài khoản</label>
            <input
              type="text"
              required
              placeholder="VD: Ví tiền mặt, Vietcombank, Ví MoMo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Số dư ban đầu (Chỉ nhập khi tạo mới) */}
          {!editingAccount && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Số dư ban đầu (VNĐ)</label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:border-emerald-500 outline-none"
              />
              {initialBalance && !isNaN(initialBalance) && (
                <p className="text-xs text-slate-500 mt-1">
                  {formatVND(parseFloat(initialBalance))}
                </p>
              )}
            </div>
          )}

          {/* Số tài khoản (tùy chọn) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Số tài khoản / Thẻ (nếu có)</label>
            <input
              type="text"
              placeholder="VD: 1029384756..."
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Chọn Màu sắc */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Màu sắc nhận diện</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-110 border-slate-900 shadow-sm' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Chọn Icon */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Biểu tượng</label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1 border rounded-xl border-slate-100">
              {['Wallet', 'Banknote', 'Landmark', 'Smartphone', 'PiggyBank', 'CreditCard', 'Coins', 'TrendingUp'].map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={`p-2 rounded-xl border transition-all ${
                    icon === iconName
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <DynamicIcon name={iconName} className="w-5 h-5" />
                </button>
              ))}
            </div>
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
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                editingAccount ? 'Cập nhật' : 'Tạo ví mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

