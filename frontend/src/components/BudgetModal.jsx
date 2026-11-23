import React, { useState } from 'react';
import { X, PiggyBank, Loader2 } from 'lucide-react';
import { DynamicIcon, formatVND } from '../utils/formatters';

export const BudgetModal = ({ isOpen, onClose, onSave, categories = [], month, year, initialCategory = null }) => {
  if (!isOpen) return null;

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const [categoryId, setCategoryId] = useState(initialCategory ? String(initialCategory.category_id || initialCategory.id) : (expenseCategories[0]?.id ? String(expenseCategories[0].id) : ''));
  const [amount, setAmount] = useState(initialCategory?.budget_amount ? String(Math.round(initialCategory.budget_amount)) : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!categoryId || !numAmount || numAmount <= 0) {
      setError('Vui lòng chọn danh mục và nhập hạn mức ngân sách hợp lệ');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        category_id: parseInt(categoryId),
        month,
        year,
        amount: numAmount
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi lưu hạn mức');
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
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">
              Hạn mức chi tiêu Tháng {month}/{year}
            </h3>
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

          {/* Chọn danh mục */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Danh mục chi tiêu</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-emerald-500 outline-none"
            >
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hạn mức số tiền */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Hạn mức tối đa (VNĐ / Tháng)</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xl font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-emerald-600 focus:border-emerald-500 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₫</span>
            </div>
            {amount && !isNaN(amount) && parseFloat(amount) > 0 && (
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {formatVND(parseFloat(amount))}
              </p>
            )}
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
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                'Đặt hạn mức'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

