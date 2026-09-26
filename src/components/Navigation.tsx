import React from 'react';
import { Receipt, PieChart, Settings, Plus } from 'lucide-react';
import { TabType } from '../types';
import { triggerHaptic } from '../utils/storage';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAddModal: () => void;
  hapticEnabled: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
  hapticEnabled,
}) => {
  const handleTabClick = (tab: TabType) => {
    triggerHaptic('light', hapticEnabled);
    onTabChange(tab);
  };

  const handleAddClick = () => {
    triggerHaptic('medium', hapticEnabled);
    onOpenAddModal();
  };

  return (
    <>
      {/* Floating Action Button (+) on bottom right */}
      <button
        onClick={handleAddClick}
        aria-label="Thêm giao dịch"
        className="fixed right-5 bottom-20 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center active:scale-90 transition-transform duration-200"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* iOS Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-800/80 pb-safe-bottom">
        <div className="max-w-md mx-auto flex items-center justify-around h-14 px-2">
          {/* Tab 1: Sổ thu chi */}
          <button
            onClick={() => handleTabClick('transactions')}
            className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'transactions'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Receipt className={`w-5 h-5 ${currentTab === 'transactions' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Sổ thu chi</span>
          </button>

          {/* Tab 2: Biểu đồ & Thống kê */}
          <button
            onClick={() => handleTabClick('analytics')}
            className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'analytics'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <PieChart className={`w-5 h-5 ${currentTab === 'analytics' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Thống kê</span>
          </button>

          {/* Tab 3: Cài đặt */}
          <button
            onClick={() => handleTabClick('settings')}
            className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              currentTab === 'settings'
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Settings className={`w-5 h-5 ${currentTab === 'settings' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Cài đặt</span>
          </button>
        </div>
      </nav>
    </>
  );
};
