import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  BarController,
} from 'chart.js';
import { PieChart, BarChart3, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Currency, TimeFilter, Transaction } from '../types';
import { getCategoryById } from '../constants/categories';
import { formatCurrency, filterTransactionsByTime } from '../utils/formatters';

// Register Chart.js elements
Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  BarController
);

interface AnalyticsViewProps {
  transactions: Transaction[];
  currency: Currency;
  isDark: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  currency,
  isDark,
}) => {
  const [period, setPeriod] = useState<TimeFilter>('month');
  const doughnutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutChartInstance = useRef<Chart | null>(null);
  const barChartInstance = useRef<Chart | null>(null);

  // Filter transactions for current view
  const currentTransactions = useMemo(() => {
    return filterTransactionsByTime(transactions, period);
  }, [transactions, period]);

  // Overall totals in this period
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    currentTransactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: inc - exp,
    };
  }, [currentTransactions]);

  // Expense by category breakdown
  const categoryStats = useMemo(() => {
    const expenseTx = currentTransactions.filter((t) => t.type === 'expense');
    const map: { [key: string]: number } = {};

    expenseTx.forEach((t) => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });

    const list = Object.entries(map).map(([catId, amount]) => {
      const cat = getCategoryById(catId);
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        cat,
        amount,
        percentage,
      };
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [currentTransactions, totalExpense]);

  // Monthly Income vs Expense over the year
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: `T${i + 1}`,
      income: 0,
      expense: 0,
    }));

    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === currentYear) {
        const m = d.getMonth();
        if (t.type === 'income') months[m].income += t.amount;
        else months[m].expense += t.amount;
      }
    });

    return months;
  }, [transactions]);

  // Render Doughnut Chart
  useEffect(() => {
    if (!doughnutCanvasRef.current) return;

    if (doughnutChartInstance.current) {
      doughnutChartInstance.current.destroy();
    }

    if (categoryStats.length === 0) return;

    const ctx = doughnutCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = categoryStats.map((c) => `${c.cat.icon} ${c.cat.name}`);
    const data = categoryStats.map((c) => c.amount);
    const backgroundColors = categoryStats.map((c) => c.cat.color);

    doughnutChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderColor: isDark ? '#0f172a' : '#ffffff',
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 12,
              color: isDark ? '#94a3b8' : '#475569',
              font: {
                family: '-apple-system, sans-serif',
                size: 11,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.raw as number;
                const pct = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : '0';
                return ` ${formatCurrency(val, currency)} (${pct}%)`;
              },
            },
          },
        },
        cutout: '68%',
      },
    });

    return () => {
      if (doughnutChartInstance.current) {
        doughnutChartInstance.current.destroy();
      }
    };
  }, [categoryStats, isDark, currency, totalExpense]);

  // Render Bar Chart
  useEffect(() => {
    if (!barCanvasRef.current) return;

    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }

    const ctx = barCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = monthlyData.map((m) => m.label);
    const incomeData = monthlyData.map((m) => m.income);
    const expenseData = monthlyData.map((m) => m.expense);

    barChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Thu nhập',
            data: incomeData,
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            borderRadius: 6,
          },
          {
            label: 'Chi tiêu',
            data: expenseData,
            backgroundColor: 'rgba(244, 63, 94, 0.85)',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: isDark ? '#94a3b8' : '#64748b',
              font: { size: 10 },
            },
          },
          y: {
            grid: {
              color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            },
            ticks: {
              color: isDark ? '#94a3b8' : '#64748b',
              font: { size: 10 },
              callback: (val) => {
                const n = Number(val);
                if (n >= 1000000) return `${(n / 1000000).toFixed(0)}tr`;
                if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
                return `${n}`;
              },
            },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              color: isDark ? '#94a3b8' : '#475569',
              font: { size: 11 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return ` ${context.dataset.label}: ${formatCurrency(context.raw as number, currency)}`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
    };
  }, [monthlyData, isDark, currency]);

  return (
    <div className="space-y-4 pb-24">
      {/* Header & Filter */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Báo cáo & Thống kê
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Tổng quan tài chính trực quan
          </p>
        </div>

        {/* Time period toggle */}
        <div className="bg-slate-200/70 dark:bg-slate-800/80 p-0.5 rounded-xl flex gap-1">
          {(['month', 'year', 'all'] as TimeFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                period === p
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {p === 'month' ? 'Tháng' : p === 'year' ? 'Năm' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm text-center">
          <span className="text-[11px] font-medium text-slate-400">Thu nhập</span>
          <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
            +{formatCurrency(totalIncome, currency)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm text-center">
          <span className="text-[11px] font-medium text-slate-400">Chi tiêu</span>
          <p className="text-xs sm:text-sm font-bold text-rose-500 dark:text-rose-400 mt-0.5 truncate">
            -{formatCurrency(totalExpense, currency)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm text-center">
          <span className="text-[11px] font-medium text-slate-400">Số dư kỳ</span>
          <p
            className={`text-xs sm:text-sm font-bold mt-0.5 truncate ${
              balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'
            }`}
          >
            {balance < 0 ? '-' : ''}
            {formatCurrency(balance, currency)}
          </p>
        </div>
      </div>

      {/* Doughnut Chart: Chi theo danh mục */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Chi theo danh mục
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Tổng: {formatCurrency(totalExpense, currency)}
          </span>
        </div>

        {categoryStats.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            Chưa có khoản chi tiêu nào trong khoảng thời gian này
          </div>
        ) : (
          <>
            <div className="h-56 relative flex items-center justify-center">
              <canvas ref={doughnutCanvasRef} />
            </div>

            {/* Category progress list */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {categoryStats.map((item) => (
                <div key={item.cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span>{item.cat.icon}</span>
                      <span>{item.cat.name}</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount, currency)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bar Chart: Thu và chi từng tháng */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Thu và chi các tháng ({new Date().getFullYear()})
            </h3>
            <p className="text-[11px] text-slate-400">
              So sánh dòng tiền qua từng tháng trong năm
            </p>
          </div>
        </div>

        <div className="h-52 relative">
          <canvas ref={barCanvasRef} />
        </div>
      </div>
    </div>
  );
};
