import { motion, AnimatePresence } from 'motion/react';
import { Share, PlusSquare, X, Smartphone, Download } from 'lucide-react';
import React from 'react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  onInstall: () => void;
  isIOS: boolean;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  onInstall,
  isIOS,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 pb-safe-bottom"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                    Cài đặt ứng dụng PWA
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sử dụng mượt mà không cần mở Safari
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct install button for Chrome/Android if available */}
            {isInstallable && (
              <div className="my-4">
                <button
                  onClick={() => {
                    onInstall();
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition"
                >
                  <Download className="w-5 h-5" />
                  Cài đặt ngay vào máy
                </button>
              </div>
            )}

            {/* iOS Safari Instructions */}
            <div className="mt-4 space-y-3.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isIOS ? 'Hướng dẫn cài trên iPhone (Safari)' : 'Thao tác trên Safari / Trình duyệt'}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">Bước 1:</span> Nhấn vào biểu tượng <span className="font-medium text-blue-600 dark:text-blue-400">Chia sẻ (Share)</span> ở thanh công cụ dưới Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">Bước 2:</span> Cuộn xuống và chọn <span className="font-semibold text-emerald-600 dark:text-emerald-400">"Thêm vào Màn hình chính"</span> (Add to Home Screen).
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">Bước 3:</span> Nhấn <span className="font-semibold">"Thêm" (Add)</span> ở góc trên bên phải để hoàn tất.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition"
              >
                Đã hiểu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
