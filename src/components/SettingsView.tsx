import React, { useRef, useState } from 'react';
import {
  Moon,
  Sun,
  Laptop,
  FileSpreadsheet,
  FileText,
  Download,
  Upload,
  Smartphone,
  Vibrate,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AppSettings, Currency, ThemeMode, Transaction } from '../types';
import {
  exportToExcelCSV,
  exportToStandardCSV,
  exportToJSON,
  readJSONFile,
} from '../utils/exportImport';
import { triggerHaptic, getSampleTransactions } from '../utils/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  transactions: Transaction[];
  onRestoreTransactions: (transactions: Transaction[]) => void;
  onResetAllData: () => void;
  onOpenInstallGuide: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  transactions,
  onRestoreTransactions,
  onResetAllData,
  onOpenInstallGuide,
  isInstallable,
  isInstalled,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCurrencyChange = (currency: Currency) => {
    onUpdateSettings({ currency });
    triggerHaptic('light', settings.hapticEnabled);
    showToast(`Đã đổi đơn vị tiền tệ sang ${currency}`);
  };

  const handleThemeChange = (theme: ThemeMode) => {
    onUpdateSettings({ theme });
    triggerHaptic('light', settings.hapticEnabled);
  };

  const handleExportExcel = () => {
    triggerHaptic('light', settings.hapticEnabled);
    exportToExcelCSV(transactions, settings);
    showToast('Đã tải xuống file Excel (.csv)');
  };

  const handleExportCSV = () => {
    triggerHaptic('light', settings.hapticEnabled);
    exportToStandardCSV(transactions, settings);
    showToast('Đã tải xuống file CSV');
  };

  const handleBackupJSON = () => {
    triggerHaptic('light', settings.hapticEnabled);
    exportToJSON(transactions, settings);
    showToast('Đã sao lưu tệp JSON thành công');
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await readJSONFile(file);
      onRestoreTransactions(result.transactions);
      if (result.settings) {
        onUpdateSettings(result.settings);
      }
      triggerHaptic('success', settings.hapticEnabled);
      showToast(`Đã khôi phục ${result.transactions.length} giao dịch thành công!`);
    } catch (err: unknown) {
      triggerHaptic('warning', settings.hapticEnabled);
      showToast(err instanceof Error ? err.message : 'Lỗi khôi phục tệp', 'error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLoadSample = () => {
    const samples = getSampleTransactions();
    onRestoreTransactions(samples);
    triggerHaptic('success', settings.hapticEnabled);
    showToast('Đã nạp dữ liệu mẫu thành công!');
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Cài đặt & Dữ liệu
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Tùy chỉnh trải nghiệm và sao lưu bảo mật
        </p>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold shadow-md transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* PWA Home Screen Banner */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-indigo-600/10 dark:from-emerald-950/40 dark:to-indigo-950/40 p-4 rounded-3xl border border-emerald-500/20 dark:border-emerald-500/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {isInstalled ? 'Đã cài đặt PWA' : 'Cài đặt lên iPhone'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isInstalled
                ? 'Ứng dụng đang chạy ở chế độ Standalone'
                : 'Thêm vào MH chính để dùng mượt như app native'}
            </p>
          </div>
        </div>
        {!isInstalled && (
          <button
            onClick={onOpenInstallGuide}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-sm active:scale-95 transition"
          >
            Hướng dẫn
          </button>
        )}
      </div>

      {/* SECTION: Giao diện & Tiền tệ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-4 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Tùy chọn hiển thị
        </h3>

        {/* Currency Selector */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Đơn vị tiền tệ
            </div>
            <div className="text-xs text-slate-400">
              Định dạng số tiền hiển thị
            </div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1">
            {(['VND', 'USD', 'EUR'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => handleCurrencyChange(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  settings.currency === c
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {c === 'VND' ? '₫ VND' : c === 'USD' ? '$ USD' : '€ EUR'}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Theme Mode Selector */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Chế độ màu
            </div>
            <div className="text-xs text-slate-400">
              Giao diện Sáng / Tối
            </div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => handleThemeChange('system')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                settings.theme === 'system'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-400'
              }`}
              title="Theo hệ thống"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleThemeChange('light')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                settings.theme === 'light'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-400'
              }`}
              title="Giao diện sáng"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                settings.theme === 'dark'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-400'
              }`}
              title="Giao diện tối"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Haptic Feedback Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Vibrate className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Rung phản hồi (Haptic)
              </div>
              <div className="text-xs text-slate-400">
                Hiệu ứng rung nhẹ khi chạm
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const updated = !settings.hapticEnabled;
              onUpdateSettings({ hapticEnabled: updated });
              triggerHaptic('medium', updated);
            }}
            className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
              settings.hapticEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                settings.hapticEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SECTION: Xuất & Nhập dữ liệu */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Quản lý & Xuất dữ liệu ({transactions.length} bản ghi)
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-left hover:bg-emerald-100/70 transition flex flex-col justify-between gap-2 active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Xuất Excel
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                File .csv chuẩn UTF-8
              </div>
            </div>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-left hover:bg-blue-100/70 transition flex flex-col justify-between gap-2 active:scale-[0.98]"
          >
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Xuất CSV
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Dữ liệu thô chuẩn
              </div>
            </div>
          </button>

          {/* Backup JSON */}
          <button
            onClick={handleBackupJSON}
            className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-left hover:bg-purple-100/70 transition flex flex-col justify-between gap-2 active:scale-[0.98]"
          >
            <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Sao lưu JSON
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Lưu toàn bộ dữ liệu
              </div>
            </div>
          </button>

          {/* Restore JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-left hover:bg-amber-100/70 transition flex flex-col justify-between gap-2 active:scale-[0.98]"
          >
            <Upload className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Khôi phục JSON
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Nhập file đã sao lưu
              </div>
            </div>
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleRestoreFile}
            className="hidden"
          />
        </div>
      </div>

      {/* SECTION: Tác vụ dữ liệu & Mẫu */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Khác
        </h3>

        {/* Load Sample Data */}
        <button
          onClick={handleLoadSample}
          className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-between transition"
        >
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-slate-400" />
            <span>Nạp lại dữ liệu mẫu thực tế</span>
          </span>
          <span className="text-[11px] text-slate-400">Thử nghiệm</span>
        </button>

        {/* Reset All Data with Confirmation */}
        {showConfirmReset ? (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 space-y-2">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              Bạn có chắc chắn muốn xóa toàn bộ giao dịch? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onResetAllData();
                  setShowConfirmReset(false);
                  triggerHaptic('warning', settings.hapticEnabled);
                  showToast('Đã xóa toàn bộ dữ liệu');
                }}
                className="flex-1 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full py-2.5 px-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100/60 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Xóa toàn bộ dữ liệu</span>
            </span>
            <span className="text-[11px] text-rose-400">Đặt lại</span>
          </button>
        )}
      </div>

      {/* Offline Storage Notice */}
      <div className="text-center space-y-1 text-xs text-slate-400 px-4">
        <p className="flex items-center justify-center gap-1">
          <span>🔒</span>
          <span>Dữ liệu được lưu trữ 100% riêng tư trên thiết bị của bạn</span>
        </p>
        <p className="text-[11px]">Không yêu cầu máy chủ • Hoạt động hoàn toàn Offline</p>
      </div>
    </div>
  );
};
