export type TransactionType = 'expense' | 'income';

export type Currency = 'VND' | 'USD' | 'EUR';

export type ThemeMode = 'system' | 'light' | 'dark';

export type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export type TabType = 'transactions' | 'analytics' | 'settings';

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string;
  date: string; // ISO string YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD
  createdAt: number;
}

export interface AppSettings {
  currency: Currency;
  theme: ThemeMode;
  hapticEnabled: boolean;
  lastTab: TabType;
}

export interface PeriodSummary {
  income: number;
  expense: number;
  balance: number;
}
