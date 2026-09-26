import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { Currency, TimeFilter } from '../types';
import { formatCurrency } from '../utils/formatters';

interface HeaderCardProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  income: number;
  expense: number;
  balance: number;
  currency: Currency;
  count: number;
}

const FILTER_OPTIONS: { id: TimeFilter; label: string }[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: 'Tuần này' },
  { id: 'month', label: 'Tháng này' },
  { id: 'year', label: 'Năm nay' },
  { id: 'all', label: 'Tất cả' },
];

export const HeaderCard: React.FC<HeaderCardProps> = ({
  timeFilter,
  onTimeFilterChange,
  income,
  expense,
  balance,
  currency,
  count,
}) => {
  const currentDateFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="space-y-3.5">
      {/* Date Header & App Title */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs uppercase font-medium tracking-wider text-slate-400 dark:text-slate-500">
            {currentDateFormatted}
          </p>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Sổ Thu Chi</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              {count} giao dịch
            </span>
          </h1>
        </div>
      </div>

      {/* iOS Segmented Period Selector */}
      <div className="bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center justify-between gap-1 shadow-inner backdrop-blur-md">
        {FILTER_OPTIONS.map((item) => {
          const isActive = timeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTimeFilterChange(item.id)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-[1.02]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-indigo-950/20 border border-indigo-900/40">
        {/* Soft background glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-200/80 text-xs font-medium tracking-wide">
              <Wallet className="w-3.5 h-3.5 text-indigo-300" />
              <span>Số dư khả dụng</span>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-indigo-100 border border-white/10">
              {FILTER_OPTIONS.find((f) => f.id === timeFilter)?.label}
            </span>
          </div>

          <div className="mt-2.5">
            <div
              className={`text-3xl font-extrabold tracking-tight ${
                balance < 0 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {balance < 0 ? '-' : ''}
              {formatCurrency(balance, currency)}
            </div>
          </div>

          {/* Income & Expense Sub-Cards */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-white/10">
            {/* Total Income */}
            <div className="bg-white/5 rounded-2xl p-2.5 backdrop-blur-sm border border-white/5">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                </div>
                <span>Tổng thu</span>
              </div>
              <p className="mt-1 text-base font-bold text-emerald-300 tracking-tight">
                +{formatCurrency(income, currency)}
              </p>
            </div>

            {/* Total Expense */}
            <div className="bg-white/5 rounded-2xl p-2.5 backdrop-blur-sm border border-white/5">
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-3 h-3 text-rose-400" />
                </div>
                <span>Tổng chi</span>
              </div>
              <p className="mt-1 text-base font-bold text-rose-300 tracking-tight">
                -{formatCurrency(expense, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
