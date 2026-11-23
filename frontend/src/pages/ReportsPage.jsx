import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { formatVND, DynamicIcon } from '../utils/formatters';
import { PageLoadingState } from '../components/LoadingState';

export const ReportsPage = ({ data, loading = false, month, year }) => {
  if (loading || !data) {
    return <PageLoadingState title={`Đang tổng hợp báo cáo phân tích Tháng ${month}/${year}...`} />;
  }

  const {
    totalBalance = 0,
    netWorth = 0,
    thisMonthIncome = 0,
    thisMonthExpense = 0,
    netSavings = 0,
    savingsRate = 0,
    categoryBreakdown = [],
    monthlyTrend = [],
    accounts = [],
    debts = { remainingLoan: 0, remainingDebt: 0 }
  } = data;

  return (
    <div className="space-y-6 animate-fadeIn pb-safe-nav md:pb-8">
      {/* Thống kê Tổng hợp */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-slate-800 text-lg mb-1">Báo cáo Phân tích Tháng {month}/{year}</h3>
        <p className="text-xs text-slate-500 mb-6">Đánh giá hiệu quả quản lý chi tiêu và khả năng tiết kiệm cá nhân</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-xs font-semibold text-emerald-700 uppercase">Tổng Thu Nhập</span>
            <p className="text-xl font-black text-emerald-600 mt-1">{formatVND(thisMonthIncome)}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50/60 border border-red-100">
            <span className="text-xs font-semibold text-red-700 uppercase">Tổng Chi Tiêu</span>
            <p className="text-xl font-black text-red-600 mt-1">{formatVND(thisMonthExpense)}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-xs font-semibold text-blue-700 uppercase">Tỷ Lệ Tiết Kiệm</span>
            <p className="text-xl font-black text-blue-600 mt-1">{savingsRate}%</p>
          </div>
        </div>
      </div>

      {/* Vị thế Tài sản & Công nợ (Tách riêng chuẩn kế toán) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-slate-800 text-base mb-1">Cơ cấu Tài sản & Nghĩa vụ Nợ</h3>
        <p className="text-xs text-slate-500 mb-4">Các khoản phải thu & phải trả được tách riêng, không làm sai lệch báo cáo chi tiêu tiêu dùng</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100">
            <span className="text-xs font-semibold text-purple-700">Người khác nợ bạn (Phải thu)</span>
            <p className="text-lg font-black text-purple-600 mt-1">{formatVND(debts?.remainingLoan || 0)}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="text-xs font-semibold text-amber-700">Bạn nợ người khác (Phải trả)</span>
            <p className="text-lg font-black text-amber-600 mt-1">{formatVND(debts?.remainingDebt || 0)}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200">
            <span className="text-xs font-semibold text-slate-700">Tài sản ròng thực tế (Net Worth)</span>
            <p className="text-lg font-black text-slate-900 mt-1">{formatVND(netWorth || totalBalance)}</p>
          </div>
        </div>
      </div>

      {/* Chi tiết Chi tiêu theo từng Danh mục */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-slate-800 text-base mb-4">Chi tiết Chi phí theo Từng Nhóm</h3>
        <div className="space-y-4">
          {categoryBreakdown.map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-800">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-900 font-bold mr-2">{formatVND(cat.total)}</span>
                  <span className="text-slate-500 font-normal">({cat.percentage}%)</span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color || '#3b82f6' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

