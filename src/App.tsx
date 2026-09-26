/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppSettings, TabType, TimeFilter, Transaction } from './types';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  loadTransactions,
  saveSettings,
  saveTransactions,
  triggerHaptic,
} from './utils/storage';
import { filterTransactionsByTime } from './utils/formatters';
import { HeaderCard } from './components/HeaderCard';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { Navigation } from './components/Navigation';
import { InstallGuideModal } from './components/InstallGuideModal';
import { usePWA } from './hooks/usePWA';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [currentTab, setCurrentTab] = useState<TabType>(() => settings.lastTab || 'transactions');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);

  // 5-second Undo state
  const [undoItem, setUndoItem] = useState<Transaction | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // PWA detection & installer
  const { isInstallable, isInstalled, isIOS, install } = usePWA();

  // Dark mode effect
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      let dark = false;
      if (settings.theme === 'dark') {
        dark = true;
      } else if (settings.theme === 'light') {
        dark = false;
      } else {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (settings.theme === 'system') {
        updateTheme();
      }
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [settings.theme]);

  // Persist transactions
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Persist settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Switch tab & persist lastTab
  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    setSettings((prev) => ({ ...prev, lastTab: tab }));
  };

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  // Add or Edit Transaction
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...data } : t))
      );
    } else {
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  // Delete with 5-second Undo
  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    triggerHaptic('medium', settings.hapticEnabled);

    // Save for undo
    setUndoItem(target);
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // Clear previous timer if exists
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }

    // Set 5-second timer
    undoTimerRef.current = setTimeout(() => {
      setUndoItem(null);
    }, 5000);
  };

  const handleUndo = () => {
    if (!undoItem) return;
    triggerHaptic('success', settings.hapticEnabled);
    setTransactions((prev) => [undoItem, ...prev]);
    setUndoItem(null);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
  };

  const handleOpenEdit = (t: Transaction) => {
    triggerHaptic('light', settings.hapticEnabled);
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    triggerHaptic('light', settings.hapticEnabled);
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleResetAll = () => {
    setTransactions([]);
    setUndoItem(null);
  };

  // Filtered transactions for header summary
  const filteredForSummary = useMemo(() => {
    return filterTransactionsByTime(transactions, timeFilter);
  }, [transactions, timeFilter]);

  const { income, expense, balance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredForSummary.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return {
      income: inc,
      expense: exp,
      balance: inc - exp,
    };
  }, [filteredForSummary]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Dynamic safe area top spacer */}
      <div className="pt-safe-top" />

      {/* Main Container - Optimized for iPhone screen widths (375px - 430px) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-3">
        {currentTab === 'transactions' && (
          <div className="space-y-4">
            <HeaderCard
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
              income={income}
              expense={expense}
              balance={balance}
              currency={settings.currency}
              count={filteredForSummary.length}
            />

            <TransactionList
              transactions={filteredForSummary}
              currency={settings.currency}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTransaction}
              onAddClick={handleOpenNew}
              undoItem={undoItem}
              onUndo={handleUndo}
            />
          </div>
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            transactions={transactions}
            currency={settings.currency}
            isDark={isDark}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            transactions={transactions}
            onRestoreTransactions={setTransactions}
            onResetAllData={handleResetAll}
            onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
          />
        )}
      </main>

      {/* iOS Bottom Navigation & Floating (+) Button */}
      <Navigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenAddModal={handleOpenNew}
        hapticEnabled={settings.hapticEnabled}
      />

      {/* Transaction Modal (Bottom Sheet on mobile) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        currency={settings.currency}
        hapticEnabled={settings.hapticEnabled}
      />

      {/* Install on iPhone / PWA Guide Modal */}
      <InstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
        isInstallable={isInstallable}
        onInstall={install}
        isIOS={isIOS}
      />
    </div>
  );
}
