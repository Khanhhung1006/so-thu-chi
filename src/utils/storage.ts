import { AppSettings, Transaction } from '../types';

const TRANSACTIONS_KEY = 'so_thu_chi_transactions_v1';
const SETTINGS_KEY = 'so_thu_chi_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'VND',
  theme: 'system',
  hapticEnabled: true,
  lastTab: 'transactions',
};

// Realistic initial transactions so new users immediately see a populated, beautiful UI
export function getSampleTransactions(): Transaction[] {
  const now = new Date();
  const todayStr = (hours: number, mins: number) => {
    const d = new Date(now);
    d.setHours(hours, mins, 0, 0);
    return d.toISOString();
  };

  const daysAgoStr = (days: number, hours: number, mins: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(hours, mins, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'tx-1',
      type: 'expense',
      amount: 45000,
      categoryId: 'food',
      note: 'Phở bò tái lăn & quẩy',
      date: todayStr(8, 15),
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 35000,
      categoryId: 'coffee',
      note: 'Cà phê muối sáng',
      date: todayStr(9, 30),
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
    {
      id: 'tx-3',
      type: 'income',
      amount: 15000000,
      categoryId: 'salary',
      note: 'Lương tháng này',
      date: daysAgoStr(1, 10, 0),
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 120000,
      categoryId: 'transport',
      note: 'Đổ xăng xe máy',
      date: daysAgoStr(1, 17, 45),
      createdAt: Date.now() - 1000 * 60 * 60 * 18,
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 350000,
      categoryId: 'shopping',
      note: 'Mua sắm siêu thị cuối tuần',
      date: daysAgoStr(3, 15, 20),
      createdAt: Date.now() - 1000 * 60 * 60 * 70,
    },
    {
      id: 'tx-6',
      type: 'income',
      amount: 1200000,
      categoryId: 'freelance',
      note: 'Tiền thiết kế banner',
      date: daysAgoStr(4, 14, 0),
      createdAt: Date.now() - 1000 * 60 * 60 * 95,
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 250000,
      categoryId: 'bills',
      note: 'Tiền điện thoại & Internet',
      date: daysAgoStr(6, 11, 10),
      createdAt: Date.now() - 1000 * 60 * 60 * 140,
    },
  ];
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      const initial = getSampleTransactions();
      saveTransactions(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error loading transactions from localStorage:', error);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (error) {
    console.error('Error loading settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
  }
}

/**
 * Trigger subtle iOS-like haptic feedback if browser supports navigator.vibrate
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light', enabled = true): void {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'success':
        navigator.vibrate([15, 40, 20]);
        break;
      case 'warning':
        navigator.vibrate([30, 60, 30]);
        break;
    }
  } catch {
    // Ignore any browser limitation
  }
}
