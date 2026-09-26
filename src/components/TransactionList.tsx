import { motion, AnimatePresence } from 'motion/react';
import { Search, X, RotateCcw, Plus, Receipt } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Currency, Transaction, TransactionType } from '../types';
import { formatDateGroup, formatCurrency } from '../utils/formatters';
import { TransactionItem } from './TransactionItem';
import { getCategoryById } from '../constants/categories';

interface TransactionListProps {
  transactions: Transaction[];
  currency: Currency;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  undoItem: Transaction | null;
  onUndo: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currency,
  onEdit,
  onDelete,
  onAddClick,
  undoItem,
  onUndo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const cat = getCategoryById(t.categoryId);
        const matchesCategory = cat.name.toLowerCase().includes(query);
        const matchesNote = (t.note || '').toLowerCase().includes(query);
        const matchesAmount = t.amount.toString().includes(query);
        return matchesCategory || matchesNote || matchesAmount;
      }
      return true;
    });
  }, [transactions, typeFilter, searchQuery]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: { dateStr: string; items: Transaction[]; dailyExpense: number; dailyIncome: number } } = {};

    // Sort by date descending
    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sorted.forEach((item) => {
      const dayKey = item.date.slice(0, 10);
      if (!groups[dayKey]) {
        groups[dayKey] = {
          dateStr: item.date,
          items: [],
          dailyExpense: 0,
          dailyIncome: 0,
        };
      }
      groups[dayKey].items.push(item);
      if (item.type === 'expense') {
        groups[dayKey].dailyExpense += item.amount;
      } else {
        groups[dayKey].dailyIncome += item.amount;
      }
    });

    return Object.values(groups);
  }, [filteredTransactions]);

  return (
    <div className="space-y-3.5 pb-24">
      {/* Search Bar & Type Segment */}
      <div className="space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo danh mục, ghi chú, số tiền..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Type Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              typeFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              typeFilter === 'expense'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
            }`}
          >
            Chỉ Chi tiêu
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              typeFilter === 'income'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
            }`}
          >
            Chỉ Thu nhập
          </button>
        </div>
      </div>

      {/* Transactions Grouped or Empty State */}
      {groupedTransactions.length === 0 ? (
        <div className="py-14 text-center space-y-3 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              Không có giao dịch nào
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? 'Không tìm thấy kết quả phù hợp với từ khóa này.'
                : 'Hãy bắt đầu ghi lại các khoản thu chi hôm nay.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={onAddClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              Ghi khoản đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map((group) => {
            const netDaily = group.dailyIncome - group.dailyExpense;
            return (
              <div key={group.dateStr} className="space-y-2">
                {/* Daily Subtotal Header */}
                <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>{formatDateGroup(group.dateStr)}</span>
                  <div className="flex items-center gap-2">
                    {group.dailyExpense > 0 && (
                      <span className="text-rose-500 dark:text-rose-400 font-medium">
                        Chi: {formatCurrency(group.dailyExpense, currency)}
                      </span>
                    )}
                    {group.dailyIncome > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Thu: {formatCurrency(group.dailyIncome, currency)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in Day */}
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <TransactionItem
                      key={item.id}
                      transaction={item}
                      currency={currency}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5-Second Undo Toast */}
      <AnimatePresence>
        {undoItem && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 border border-slate-700/50 dark:border-slate-300"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">🗑️</span>
              <p className="text-xs font-medium truncate">
                Đã xóa "{getCategoryById(undoItem.categoryId).name}" ({formatCurrency(undoItem.amount, currency)})
              </p>
            </div>
            <button
              onClick={onUndo}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold active:scale-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Hoàn tác
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
