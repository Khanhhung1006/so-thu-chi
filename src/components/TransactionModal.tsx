import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, FileText, Check, DollarSign } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { Currency, Transaction, TransactionType } from '../types';
import { formatThousands, parseRawAmount, toInputDateFormat } from '../utils/formatters';
import { triggerHaptic } from '../utils/storage';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  editingTransaction?: Transaction | null;
  currency: Currency;
  hapticEnabled: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  currency,
  hapticEnabled,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(toInputDateFormat());
  const [error, setError] = useState('');

  // Synchronize state when opening or editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(formatThousands(editingTransaction.amount.toString()));
      setCategoryId(editingTransaction.categoryId);
      setNote(editingTransaction.note || '');
      setDate(toInputDateFormat(editingTransaction.date));
    } else {
      setType('expense');
      setAmountStr('');
      setCategoryId('food');
      setNote('');
      setDate(toInputDateFormat());
    }
    setError('');
  }, [editingTransaction, isOpen]);

  // When type changes, adjust default category if current category does not belong to new type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    triggerHaptic('light', hapticEnabled);
    if (newType === 'expense') {
      const match = EXPENSE_CATEGORIES.some((c) => c.id === categoryId);
      if (!match) setCategoryId(EXPENSE_CATEGORIES[0].id);
    } else {
      const match = INCOME_CATEGORIES.some((c) => c.id === categoryId);
      if (!match) setCategoryId(INCOME_CATEGORIES[0].id);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatThousands(raw);
    setAmountStr(formatted);
    if (error) setError('');
  };

  // Quick Amount Additions
  const addAmount = (delta: number) => {
    triggerHaptic('light', hapticEnabled);
    const current = parseRawAmount(amountStr);
    const updated = current + delta;
    setAmountStr(formatThousands(updated.toString()));
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseRawAmount(amountStr);

    if (numericAmount <= 0) {
      setError('Vui lòng nhập số tiền lớn hơn 0');
      triggerHaptic('warning', hapticEnabled);
      return;
    }

    // Safely parse date across all browsers and iOS Safari
    let safeIsoDate = new Date().toISOString();
    try {
      if (date) {
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
          safeIsoDate = parsed.toISOString();
        } else {
          const [dPart, tPart] = date.split('T');
          if (dPart) {
            const [y, m, d] = dPart.split('-').map(Number);
            const [h, min] = (tPart || '00:00').split(':').map(Number);
            const fallback = new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0);
            if (!isNaN(fallback.getTime())) {
              safeIsoDate = fallback.toISOString();
            }
          }
        }
      }
    } catch {
      safeIsoDate = new Date().toISOString();
    }

    triggerHaptic('success', hapticEnabled);

    // Subtle celebration confetti burst
    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 },
        colors: type === 'income' ? ['#10b981', '#34d399', '#6ee7b7'] : ['#f43f5e', '#fb7185', '#fda4af'],
      });
    } catch {
      // Ignore if canvas-confetti is not rendered
    }

    onSave(
      {
        type,
        amount: numericAmount,
        categoryId,
        note: note.trim(),
        date: safeIsoDate,
      },
      editingTransaction?.id
    );

    onClose();
  };

  const availableCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          {/* Overlay dismissal */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden pb-safe-bottom"
          >
            {/* Sheet Pull Bar indicator for iOS */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-3 pb-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-6 py-2 space-y-4 no-scrollbar">
              {/* Type Switcher: Segmented Control iOS Style */}
              <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex gap-1">
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span className="text-base">💸</span>
                  <span>Khoản Chi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span className="text-base">💰</span>
                  <span>Khoản Thu</span>
                </button>
              </div>

              {/* Amount Input with Large Typo */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-2">
                <label className="text-xs uppercase font-semibold text-slate-400 dark:text-slate-500">
                  Số tiền ({currency})
                </label>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-slate-400">
                    {currency === 'VND' ? '₫' : currency === 'USD' ? '$' : '€'}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus={!editingTransaction}
                    value={amountStr}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full text-center text-3xl sm:text-4xl font-extrabold bg-transparent text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none tracking-tight"
                  />
                </div>

                {error && (
                  <p className="text-xs font-semibold text-rose-500 pt-1 animate-pulse">
                    {error}
                  </p>
                )}

                {/* Quick Add Chips for Quick Entry */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {(currency === 'VND'
                    ? [20000, 50000, 100000, 200000, 500000]
                    : [5, 10, 20, 50, 100]
                  ).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => addAmount(val)}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 active:scale-95 transition"
                    >
                      +{formatThousands(val.toString())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Chọn danh mục
                  </label>
                </div>
                <div className="grid grid-cols-5 gap-2.5 max-h-48 overflow-y-auto no-scrollbar p-1">
                  {availableCategories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(cat.id);
                          triggerHaptic('light', hapticEnabled);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-105 shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <span className="text-2xl leading-none">{cat.icon}</span>
                        <span className="text-[11px] font-medium mt-1 truncate max-w-full">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Note Inputs */}
              <div className="space-y-3">
                {/* Note */}
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nội dung ghi chú (ví dụ: Ăn trưa bún chả)..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition"
                  />
                </div>

                {/* Date Picker */}
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 pb-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition active:scale-[0.98]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`flex-[2] py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${
                    type === 'expense'
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTransaction ? 'Cập nhật' : 'Lưu giao dịch'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
