import React from 'react';
import * as Icons from 'lucide-react';

// Format số tiền VNĐ
export const formatVND = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Định dạng số có dấu chấm phân cách hàng nghìn khi người dùng nhập liệu (VD: 1000000 -> "1.000.000")
export const formatNumberWithDots = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const clean = String(val).replace(/\D/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('vi-VN').format(Number(clean));
};

// Chuyển chuỗi có dấu phân cách hàng nghìn về số nguyên chuẩn (VD: "1.000.000" -> 1000000)
export const parseNumberFromDots = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  const clean = String(val).replace(/\D/g, '');
  return clean ? Number(clean) : 0;
};

// Format ngày tháng tiếng Việt
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Component render Icon linh hoạt từ tên icon string của Lucide
export const DynamicIcon = ({ name, className = 'w-5 h-5', style = {} }) => {
  const IconComponent = Icons[name] || Icons.Tag;
  return <IconComponent className={className} style={style} />;
};

// Danh sách các icon phổ biến để chọn
export const AVAILABLE_ICONS = [
  'Utensils', 'ShoppingCart', 'Home', 'Zap', 'Car', 'ShoppingBag',
  'Film', 'HeartPulse', 'GraduationCap', 'Gift', 'Briefcase', 'Award',
  'TrendingUp', 'Percent', 'Coins', 'Wallet', 'Landmark', 'Smartphone',
  'PiggyBank', 'CreditCard', 'Coffee', 'Plane', 'BookOpen', 'Music',
  'Smile', 'Wifi', 'Dumbbell', 'Gamepad2', 'Baby'
];

// Danh sách màu sắc đẹp mắt
export const AVAILABLE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
  '#06b6d4', '#0284c7', '#3b82f6', '#6366f1', '#8b5cf6',
  '#ec4899', '#f43f5e', '#64748b'
];

// Thông tin loại giao dịch chuẩn nghiệp vụ tài chính
export const getTransactionTypeInfo = (type) => {
  switch (type) {
    case 'EXPENSE':
      return { label: 'Chi tiêu', prefix: '-', color: 'text-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: 'ArrowDownCircle', defaultBg: '#ef4444' };
    case 'INCOME':
      return { label: 'Thu nhập', prefix: '+', color: 'text-emerald-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', icon: 'ArrowUpCircle', defaultBg: '#10b981' };
    case 'TRANSFER':
      return { label: 'Chuyển ví', prefix: '', color: 'text-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-700', icon: 'ArrowRightLeft', defaultBg: '#3b82f6' };
    case 'LOAN':
      return { label: 'Cho vay', prefix: '-', color: 'text-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-700', icon: 'HandCoins', defaultBg: '#9333ea' };
    case 'BORROW':
      return { label: 'Đi vay', prefix: '+', color: 'text-amber-600', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: 'Landmark', defaultBg: '#d97706' };
    case 'DEBT_COLLECTION':
      return { label: 'Thu hồi nợ', prefix: '+', color: 'text-teal-600', bgColor: 'bg-teal-50', textColor: 'text-teal-700', icon: 'Coins', defaultBg: '#0d9488' };
    case 'DEBT_REPAYMENT':
      return { label: 'Trả nợ', prefix: '-', color: 'text-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-700', icon: 'Receipt', defaultBg: '#ea580c' };
    default:
      return { label: type, prefix: '', color: 'text-slate-600', bgColor: 'bg-slate-50', textColor: 'text-slate-700', icon: 'Tag', defaultBg: '#64748b' };
  }
};

