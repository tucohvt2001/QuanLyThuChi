import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowRightLeft,
  ChevronRight,
  PlusCircle,
  AlertCircle,
  HandCoins,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { formatVND, formatDate, DynamicIcon, getTransactionTypeInfo } from '../utils/formatters';
import { PageLoadingState } from '../components/LoadingState';

export const DashboardPage = ({ 
  data, 
  loading, 
  onOpenNewTx, 
  onViewAllTx, 
  onOpenAccountModal, 
  onOpenTransferModal,
  onOpenEditTx,
  onViewDebts,
  onViewFriends,
  friendsCount = 0
}) => {
  if (loading || !data) {
    return <PageLoadingState title="Đang tải dữ liệu tổng quan tài chính..." />;
  }

  const {
    totalBalance = 0,
    netWorth = 0,
    thisMonthIncome = 0,
    thisMonthExpense = 0,
    netSavings = 0,
    savingsRate = 0,
    growth = {},
    monthlyTrend = [],
    categoryBreakdown = [],
    recentTransactions = [],
    accounts = [],
    debts = { remainingLoan: 0, remainingDebt: 0, overdueCount: 0 }
  } = data;

  return (
    <div className="space-y-6 animate-fadeIn pb-safe-nav md:pb-8">
      {/* 1. Header 4 Thẻ Thống kê Tài chính Trắng Sáng Tinh Tế */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Tổng tài sản ròng & Số dư */}
        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Tổng số dư ví</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-base sm:text-2xl font-black text-slate-800 tracking-tight truncate">
              {formatVND(totalBalance)}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100 gap-1">
            <span className="shrink-0">{accounts.length} ví</span>
            <span className="text-purple-600 font-semibold truncate" title="Đã bù trừ nợ cần thu và nợ cần trả">
              Ròng: {formatVND(netWorth || totalBalance)}
            </span>
          </div>
        </div>

        {/* Thu nhập tháng này */}
        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 uppercase tracking-wider truncate">Thu tháng này</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-base sm:text-2xl font-black text-emerald-600 tracking-tight truncate">
              +{formatVND(thisMonthIncome)}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs pt-1 border-t border-slate-100 truncate">
            {growth.incomeGrowth >= 0 ? (
              <span className="text-emerald-600 font-semibold flex items-center shrink-0">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +{growth.incomeGrowth}%
              </span>
            ) : (
              <span className="text-red-500 font-semibold flex items-center shrink-0">
                <TrendingDown className="w-3 h-3 mr-0.5" /> {growth.incomeGrowth}%
              </span>
            )}
            <span className="text-slate-400 truncate">vs trước</span>
          </div>
        </div>

        {/* Chi tiêu tháng này */}
        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-red-600 uppercase tracking-wider truncate">Chi tháng này</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-base sm:text-2xl font-black text-red-600 tracking-tight truncate">
              -{formatVND(thisMonthExpense)}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs pt-1 border-t border-slate-100 truncate">
            {growth.expenseGrowth <= 0 ? (
              <span className="text-emerald-600 font-semibold flex items-center shrink-0">
                <TrendingDown className="w-3 h-3 mr-0.5" /> {growth.expenseGrowth}%
              </span>
            ) : (
              <span className="text-red-500 font-semibold flex items-center shrink-0">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +{growth.expenseGrowth}%
              </span>
            )}
            <span className="text-slate-400 truncate">vs trước</span>
          </div>
        </div>

        {/* Tiết kiệm ròng */}
        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider truncate">Tích lũy ròng</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className={`text-base sm:text-2xl font-black tracking-tight truncate ${netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {netSavings >= 0 ? '+' : ''}{formatVND(netSavings)}
            </p>
          </div>
          <div className="mt-2 flex items-center text-[10px] sm:text-xs text-slate-500 font-medium pt-1 border-t border-slate-100 truncate">
            <span className="truncate">Tích lũy: <strong className="text-slate-700">{savingsRate}%</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Banner Truy cập Nhanh: Sổ Vay & Nợ + Danh bạ Bạn bè */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Banner Sổ Vay & Nợ Nhanh */}
        <div 
          onClick={onViewDebts}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-purple-200 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-800">Sổ Vay & Ghi Nợ</h4>
                {debts.overdueCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                    {debts.overdueCount} quá hạn!
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cho vay: <strong className="text-purple-600">{formatVND(debts.remainingLoan)}</strong> • Nợ: <strong className="text-amber-600">{formatVND(debts.remainingDebt)}</strong>
              </p>
            </div>
          </div>

          <button className="text-xs font-bold text-purple-600 group-hover:text-purple-700 flex items-center gap-1 shrink-0 ml-auto">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Banner Danh bạ Bạn bè & Đối tác */}
        <div 
          onClick={onViewFriends}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-200 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-800">Bạn bè & Đối tác</h4>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                  {friendsCount} liên hệ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Gắn liên hệ khi chi tiêu, vay mượn & đối soát nhanh
              </p>
            </div>
          </div>

          <button className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1 shrink-0 ml-auto">
            Xem danh bạ <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Biểu đồ Phân tích Tài chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ Xu hướng Thu - Chi 6 tháng */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Xu hướng Thu & Chi</h3>
              <p className="text-xs text-slate-500">Thống kê 6 tháng gần nhất</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-slate-600 font-medium">Thu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-500" />
                <span className="text-slate-600 font-medium">Chi</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}Tr` : val}
                />
                <Tooltip 
                  formatter={(value) => [formatVND(value), '']}
                  labelFormatter={(label) => `Tháng ${label}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="income" name="Thu" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Chi" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Cơ cấu Chi tiêu (Donut / Pie Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <h3 className="font-bold text-slate-800 text-base mb-1">Cơ cấu Chi tiêu</h3>
          <p className="text-xs text-slate-500 mb-2">Tỷ trọng các danh mục trong tháng</p>

          {categoryBreakdown.length > 0 ? (
            <>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatVND(value), 'Đã chi']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Danh sách top danh mục */}
              <div className="space-y-2 mt-auto overflow-y-auto max-h-40 pr-1">
                {categoryBreakdown.slice(0, 4).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-700 font-medium truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-semibold text-slate-800">
                      <span>{cat.percentage}%</span>
                      <span className="text-slate-400 font-normal">({formatVND(cat.total)})</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <AlertCircle className="w-8 h-8 mb-2 stroke-1 text-slate-300" />
              <p className="text-xs">Chưa có khoản chi nào trong tháng này</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Danh sách Ví tiền & Giao dịch gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách Ví tiền (Accounts) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base">Ví của bạn</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenTransferModal}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Chuyển ví
              </button>
              <button
                onClick={onOpenAccountModal}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 ml-2"
              >
                + Thêm ví
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div 
                key={acc.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/50"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: acc.color || '#16a34a' }}
                  >
                    <DynamicIcon name={acc.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800">{acc.name}</h4>
                    <p className="text-xs text-slate-400 capitalize">{acc.type.toLowerCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-800">{formatVND(acc.balance)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Giao dịch gần đây */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Giao dịch gần đây</h3>
              <p className="text-xs text-slate-500">Các phát sinh chi tiêu & thu nhập mới nhất</p>
            </div>
            <button
              onClick={onViewAllTx}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => {
                const typeInfo = getTransactionTypeInfo(tx.type);
                const isTransfer = tx.type === 'TRANSFER';

                return (
                  <div 
                    key={tx.id} 
                    onClick={() => onOpenEditTx && onOpenEditTx(tx)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer gap-2"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div 
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: tx.category_color || typeInfo.defaultBg }}
                      >
                        <DynamicIcon name={tx.category_icon || typeInfo.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-800 truncate max-w-[140px] sm:max-w-none">
                            {isTransfer ? `Chuyển sang ${tx.to_account_name || 'ví khác'}` : (tx.category_name || typeInfo.label)}
                          </h4>
                          {['LOAN', 'BORROW', 'DEBT_COLLECTION', 'DEBT_REPAYMENT'].includes(tx.type) && (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                              {typeInfo.label}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="truncate max-w-[80px]">{tx.account_name}</span>
                          <span>•</span>
                          <span className="shrink-0">{formatDate(tx.transaction_date)}</span>
                          {tx.friend_name && (
                            <span className="text-blue-600 font-semibold text-[10px] sm:text-[11px] truncate max-w-[80px]">👤 {tx.friend_name}</span>
                          )}
                          {tx.note && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[90px] sm:max-w-[140px] text-slate-400 italic">"{tx.note}"</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-1">
                      <p className={`font-bold text-xs sm:text-sm ${typeInfo.color}`}>
                        {typeInfo.prefix}{formatVND(tx.amount)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                Chưa có giao dịch nào gần đây. Bấm "+ Ghi chép mới" để bắt đầu!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
