import React from 'react';
import { Loader2 } from 'lucide-react';

// Spinner đơn giản dùng trong modal hoặc nút bấm
export const LoadingSpinner = ({ size = 'md', text = '', color = 'text-emerald-600', className = '' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClass} ${color} animate-spin`} />
      {text && <span className="text-xs text-slate-500 font-medium">{text}</span>}
    </div>
  );
};

// Shimmer Skeleton cho các thẻ Dashboard / Ví / Sổ Nợ / Danh mục
export const CardSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded-md w-28" />
            <div className="w-8 h-8 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-7 bg-slate-200 rounded-lg w-36" />
          <div className="h-3 bg-slate-100 rounded-md w-24" />
        </div>
      ))}
    </>
  );
};

// Shimmer Skeleton cho danh sách giao dịch
export const ListSkeleton = ({ rows = 5 }) => {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-200 rounded-xl shrink-0" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded-md w-32" />
              <div className="h-3 bg-slate-100 rounded-md w-48" />
            </div>
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-5 bg-slate-200 rounded-md w-24 ml-auto" />
            <div className="h-3 bg-slate-100 rounded-md w-16 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Full Page Skeleton / Loading State
export const PageLoadingState = ({ title = 'Đang tải dữ liệu...' }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-700 animate-pulse">{title}</p>
      <p className="text-xs text-slate-400">Vui lòng chờ trong giây lát</p>
    </div>
  );
};
