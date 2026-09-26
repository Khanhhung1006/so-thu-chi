import { getCategoryById } from '../constants/categories';
import { AppSettings, Transaction } from '../types';

export function exportToExcelCSV(transactions: Transaction[], settings: AppSettings): void {
  // Add UTF-8 BOM so Excel opens Vietnamese characters cleanly
  const BOM = '\uFEFF';
  const headers = ['Mã GD', 'Ngày', 'Giờ', 'Loại', 'Danh mục', 'Số tiền', 'Đơn vị', 'Ghi chú'];

  const rows = transactions.map((t) => {
    const d = new Date(t.date);
    const dateStr = d.toLocaleDateString('vi-VN');
    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const cat = getCategoryById(t.categoryId);
    const typeLabel = t.type === 'income' ? 'Thu nhập' : 'Chi tiêu';
    const amountStr = t.type === 'expense' ? `-${t.amount}` : `+${t.amount}`;
    const cleanNote = (t.note || '').replace(/"/g, '""');

    return [
      `"${t.id}"`,
      `"${dateStr}"`,
      `"${timeStr}"`,
      `"${typeLabel}"`,
      `"${cat.icon} ${cat.name}"`,
      amountStr,
      `"${settings.currency}"`,
      `"${cleanNote}"`,
    ].join(',');
  });

  const csvContent = BOM + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `SoThuChi_Excel_${getTimestampString()}.csv`);
}

export function exportToStandardCSV(transactions: Transaction[], settings: AppSettings): void {
  const headers = ['id', 'date', 'time', 'type', 'category', 'amount', 'currency', 'note'];
  const rows = transactions.map((t) => {
    const d = new Date(t.date);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().split(' ')[0];
    const cat = getCategoryById(t.categoryId);
    const cleanNote = (t.note || '').replace(/"/g, '""');

    return [
      `"${t.id}"`,
      `"${dateStr}"`,
      `"${timeStr}"`,
      `"${t.type}"`,
      `"${cat.name}"`,
      t.amount,
      `"${settings.currency}"`,
      `"${cleanNote}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `SoThuChi_${getTimestampString()}.csv`);
}

export function exportToJSON(transactions: Transaction[], settings: AppSettings): void {
  const payload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    settings,
    totalTransactions: transactions.length,
    transactions,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, `SoThuChi_Backup_${getTimestampString()}.json`);
}

export function readJSONFile(file: File): Promise<{ transactions: Transaction[]; settings?: Partial<AppSettings> }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Validation
        let txList: Transaction[] = [];
        if (Array.isArray(parsed)) {
          txList = parsed;
        } else if (parsed && Array.isArray(parsed.transactions)) {
          txList = parsed.transactions;
        } else {
          throw new Error('Định dạng tệp sao lưu không hợp lệ.');
        }

        // Validate transactions structure
        const validated = txList.filter(
          (t) => t && typeof t.amount === 'number' && t.type && t.categoryId && t.date
        );

        if (validated.length === 0 && txList.length > 0) {
          throw new Error('Dữ liệu giao dịch trong tệp không đúng cấu trúc.');
        }

        resolve({
          transactions: validated,
          settings: parsed.settings,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc tệp này.'));
    reader.readAsText(file);
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getTimestampString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${y}${m}${d}_${h}${min}`;
}
