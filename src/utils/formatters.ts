import { Currency, TimeFilter, Transaction, TransactionType } from '../types';

export function formatCurrency(amount: number, currency: Currency = 'VND'): string {
  const absAmount = Math.abs(amount);
  switch (currency) {
    case 'VND':
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(absAmount);
    case 'USD':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(absAmount);
    case 'EUR':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(absAmount);
    default:
      return `${absAmount}`;
  }
}

/**
 * Format raw number string with thousand separators as user types
 */
export function formatThousands(val: string): string {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('vi-VN').format(Number(digits));
}

export function parseRawAmount(val: string): number {
  const digits = val.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

export function toInputDateFormat(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

export function formatDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dayName = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);
  const dayMonth = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

  if (isToday) {
    return `Hôm nay • ${dayMonth}`;
  }
  if (isYesterday) {
    return `Hôm qua • ${dayMonth}`;
  }
  return `${dayName} • ${dayMonth}/${date.getFullYear()}`;
}

export function formatTimeOnly(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function filterTransactionsByTime(
  transactions: Transaction[],
  filter: TimeFilter,
  referenceDate: Date = new Date()
): Transaction[] {
  if (filter === 'all') return transactions;

  const now = new Date(referenceDate);

  return transactions.filter((t) => {
    const tDate = new Date(t.date);

    if (filter === 'today') {
      return (
        tDate.getDate() === now.getDate() &&
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear()
      );
    }

    if (filter === 'week') {
      // Find start of current week (Monday)
      const currentDay = now.getDay();
      const diffToMonday = (currentDay + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      return tDate >= monday && tDate <= sunday;
    }

    if (filter === 'month') {
      return (
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear()
      );
    }

    if (filter === 'year') {
      return tDate.getFullYear() === now.getFullYear();
    }

    return true;
  });
}
