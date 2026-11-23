import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Layers } from 'lucide-react';
import { api } from '../services/api';
import { formatVND, DynamicIcon } from '../utils/formatters';
import { CardSkeleton } from '../components/LoadingState';

export const CategoriesPage = ({ 
  categories = [], 
  loading = false,
  onRefresh, 
  onOpenNewCategory, 
  onOpenEditCategory 
}) => {
  const [activeType, setActiveType] = useState('EXPENSE'); // 'EXPENSE' hoặc 'INCOME'

  const filteredCategories = categories.filter(c => c.type === activeType);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await api.deleteCategory(id);
        onRefresh();
      } catch (err) {
        alert(err.message || 'Lỗi xóa danh mục');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-safe-nav md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Tab switch Chi tiêu vs Thu nhập */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveType('EXPENSE')}
            className={`flex-1 sm:flex-none py-2 px-5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeType === 'EXPENSE' ? 'bg-red-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Danh mục Chi tiêu ({categories.filter(c => c.type === 'EXPENSE').length})
          </button>
          <button
            onClick={() => setActiveType('INCOME')}
            className={`flex-1 sm:flex-none py-2 px-5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeType === 'INCOME' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Danh mục Thu nhập ({categories.filter(c => c.type === 'INCOME').length})
          </button>
        </div>

        {/* Nút thêm mới */}
        <button
          onClick={() => onOpenNewCategory(activeType)}
          className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      {/* Grid danh mục */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {loading ? (
          <CardSkeleton count={5} />
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col items-center text-center group relative"
            >
              {/* Action buttons (top right) */}
              <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onOpenEditCategory(cat)}
                  className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-2 shadow-sm"
                style={{ backgroundColor: cat.color || '#3b82f6' }}
              >
                <DynamicIcon name={cat.icon} className="w-6 h-6" />
              </div>

              {/* Tên */}
              <h4 className="font-bold text-sm text-slate-800 leading-snug line-clamp-1">{cat.name}</h4>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {cat.type === 'EXPENSE' ? 'Khoản chi' : 'Khoản thu'}
              </span>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Chưa có danh mục nào cho loại này.
          </div>
        )}
      </div>
    </div>
  );
};

