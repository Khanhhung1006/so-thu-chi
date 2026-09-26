import { Category } from '../types';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Ăn uống', icon: '🍜', type: 'expense', color: '#f97316' },
  { id: 'transport', name: 'Đi lại', icon: '🚗', type: 'expense', color: '#3b82f6' },
  { id: 'bills', name: 'Điện nước', icon: '💡', type: 'expense', color: '#eab308' },
  { id: 'shopping', name: 'Mua sắm', icon: '🛒', type: 'expense', color: '#ec4899' },
  { id: 'house', name: 'Nhà cửa', icon: '🏠', type: 'expense', color: '#8b5cf6' },
  { id: 'coffee', name: 'Cà phê', icon: '☕', type: 'expense', color: '#a16207' },
  { id: 'health', name: 'Y tế', icon: '💊', type: 'expense', color: '#ef4444' },
  { id: 'entertainment', name: 'Giải trí', icon: '🎮', type: 'expense', color: '#06b6d4' },
  { id: 'education', name: 'Học tập', icon: '📚', type: 'expense', color: '#10b981' },
  { id: 'other_expense', name: 'Khác', icon: '❤️', type: 'expense', color: '#64748b' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Lương', icon: '💰', type: 'income', color: '#10b981' },
  { id: 'bonus', name: 'Thưởng', icon: '🎁', type: 'income', color: '#f59e0b' },
  { id: 'freelance', name: 'Làm thêm', icon: '💼', type: 'income', color: '#6366f1' },
  { id: 'investment', name: 'Đầu tư', icon: '📈', type: 'income', color: '#14b8a6' },
  { id: 'gift', name: 'Tiền mừng', icon: '🧧', type: 'income', color: '#ef4444' },
  { id: 'other_income', name: 'Khác', icon: '❤️', type: 'income', color: '#64748b' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string): Category {
  const found = ALL_CATEGORIES.find((c) => c.id === id);
  if (found) return found;
  return {
    id,
    name: 'Khác',
    icon: '🏷️',
    type: 'expense',
    color: '#64748b',
  };
}
