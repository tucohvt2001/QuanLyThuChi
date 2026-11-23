import React, { useState, useEffect } from 'react';
import { Plus, PiggyBank, AlertTriangle, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import { formatVND, DynamicIcon } from '../utils/formatters';
import { CardSkeleton } from '../components/LoadingState';

export const BudgetsPage = ({ 
  categories = [], 
  month, 
  year, 
  onOpenBudgetModal 
}) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.getBudgets(month, year);
      setBudgets(res.data);
    } catch (err) {
      console.error('Lỗi tải ngân sách:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có muốn xóa hạn mức ngân sách này?')) {
      try {
        await api.deleteBudget(id);
        fetchBudgets();
      } catch (err) {
        alert(err.message || 'Lỗi khi xóa');
      }
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + (parseFloat(b.budget_amount) || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (parseFloat(b.spent_amount) || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-safe-nav md:pb-8">
      {/* Banner Tổng kết Ngân sách tháng */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800">
              Kế hoạch Ngân sách Tháng {month}/{year}
            </h2>
            <p className="text-xs text-slate-500">Thiết lập hạn mức chi tiêu để không bị 'vung tay quá trán'</p>
          </div>

          <button
            onClick={() => onOpenBudgetModal()}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm hạn mức</span>
          </button>
        </div>

        {/* Progress Bar Tổng */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">
              Đã chi: <strong className="text-slate-800">{formatVND(totalSpent)}</strong> / Hạn mức: <strong className="text-slate-800">{formatVND(totalBudget)}</strong>
            </span>
            <span className={overallPercentage > 100 ? 'text-red-600' : overallPercentage > 80 ? 'text-amber-600' : 'text-emerald-600'}>
              {overallPercentage}% ({formatVND(totalRemaining)} còn lại)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                overallPercentage > 100 
                  ? 'bg-red-500' 
                  : overallPercentage > 80 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Danh sách Hạn mức theo Danh mục */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <CardSkeleton count={4} />
        ) : budgets.length > 0 ? (
          budgets.map((b) => {
            const isOver = b.status === 'OVER';
            const isWarning = b.status === 'WARNING';

            return (
              <div 
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Top: Icon + Tên + Nút sửa/xóa */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: b.category_color || '#ef4444' }}
                      >
                        <DynamicIcon name={b.category_icon || 'Tag'} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{b.category_name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isOver ? (
                            <span className="text-[11px] font-semibold text-red-600 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Vượt ngân sách {formatVND(Math.abs(b.remaining_amount))}
                            </span>
                          ) : isWarning ? (
                            <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Sắp chạm hạn mức ({b.percentage}%)
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle className="w-3 h-3" /> Còn lại {formatVND(b.remaining_amount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenBudgetModal(b)}
                        title="Sửa hạn mức"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        title="Xóa ngân sách"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Số tiền chi / hạn mức */}
                  <div className="flex items-center justify-between text-xs mt-4 mb-1.5">
                    <span className="text-slate-500 font-medium">Đã tiêu: <strong>{formatVND(b.spent_amount)}</strong></span>
                    <span className="text-slate-700 font-bold">Hạn mức: {formatVND(b.budget_amount)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Chưa có danh mục nào được đặt hạn mức chi tiêu trong tháng này.
          </div>
        )}
      </div>
    </div>
  );
};

