import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { DynamicIcon, AVAILABLE_ICONS, AVAILABLE_COLORS } from '../utils/formatters';

export const CategoryModal = ({ isOpen, onClose, onSave, editingCategory, defaultType = 'EXPENSE' }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#3b82f6');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || '');
      setType(editingCategory.type || 'EXPENSE');
      setIcon(editingCategory.icon || 'Tag');
      setColor(editingCategory.color || '#3b82f6');
    } else {
      setName('');
      setType(defaultType);
      setIcon('Tag');
      setColor(defaultType === 'EXPENSE' ? '#ef4444' : '#16a34a');
      setError('');
    }
  }, [editingCategory, defaultType, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên danh mục');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        id: editingCategory?.id,
        name: name.trim(),
        type,
        icon,
        color
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi lưu danh mục');
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
            {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Loại danh mục: Chi tiêu hay Thu nhập */}
          {!editingCategory && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setType('EXPENSE'); setColor('#ef4444'); }}
                className={`py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                  type === 'EXPENSE' ? 'bg-red-500 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Chi tiêu
              </button>
              <button
                type="button"
                onClick={() => { setType('INCOME'); setColor('#16a34a'); }}
                className={`py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                  type === 'INCOME' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Thu nhập
              </button>
            </div>
          )}

          {/* Tên danh mục */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tên danh mục</label>
            <input
              type="text"
              required
              placeholder="VD: Cà phê, Du lịch, Xăng xe..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Màu sắc */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Màu sắc</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map(c => (
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

          {/* Icon */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Biểu tượng</label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border rounded-xl border-slate-100">
              {AVAILABLE_ICONS.map(iconName => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
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
                editingCategory ? 'Cập nhật' : 'Thêm danh mục'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

