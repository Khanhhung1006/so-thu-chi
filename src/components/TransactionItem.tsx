import { motion, useMotionValue, useTransform } from 'motion/react';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { getCategoryById } from '../constants/categories';
import { Currency, Transaction } from '../types';
import { formatCurrency, formatTimeOnly } from '../utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
  currency: Currency;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  currency,
  onEdit,
  onDelete,
}) => {
  const category = getCategoryById(transaction.categoryId);
  const isExpense = transaction.type === 'expense';
  const x = useMotionValue(0);
  const deleteBtnOpacity = useTransform(x, [-80, -20, 0], [1, 0.5, 0]);
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -60) {
      setIsSwipedOpen(true);
    } else {
      setIsSwipedOpen(false);
    }
  };

  const handleClick = () => {
    if (isSwipedOpen) {
      // If it was swiped open, a tap simply closes it
      setIsSwipedOpen(false);
      return;
    }
    onEdit(transaction);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl select-none group">
      {/* Background Delete Button Action (revealed on swipe left) */}
      <motion.div
        style={{ opacity: deleteBtnOpacity }}
        className="absolute inset-y-0 right-0 w-24 bg-rose-600 flex items-center justify-center rounded-r-2xl z-0"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(transaction.id);
          }}
          className="w-full h-full flex flex-col items-center justify-center text-white gap-1 active:scale-90 transition-transform"
          aria-label="Xóa giao dịch"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Xóa</span>
        </button>
      </motion.div>

      {/* Swipeable Foreground Item */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -90, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        animate={{ x: isSwipedOpen ? -88 : 0 }}
        style={{ x }}
        onClick={handleClick}
        className="relative z-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-2xl shadow-sm hover:border-slate-200 dark:hover:border-slate-700/80 active:bg-slate-50 dark:active:bg-slate-800/70 transition-colors flex items-center justify-between gap-3 cursor-pointer min-h-[58px]"
      >
        {/* Category Icon & Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm"
            style={{
              backgroundColor: `${category.color}15`,
              color: category.color,
            }}
          >
            <span>{category.icon}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                {category.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              <span>{formatTimeOnly(transaction.date)}</span>
              {transaction.note && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[150px] sm:max-w-[220px] text-slate-500 dark:text-slate-400">
                    {transaction.note}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <span
            className={`font-bold text-sm sm:text-base tabular-nums ${
              isExpense
                ? 'text-rose-500 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isExpense ? '-' : '+'}
            {formatCurrency(transaction.amount, currency)}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
