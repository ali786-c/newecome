/**
 * CSV Export utility for admin tables.
 * Pure client-side — no backend dependency.
 */

export type CsvColumn<T> = {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
};

export function exportToCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[],
) {
  const headers = columns.map((c) => c.header);
  const csvRows = rows.map((row) =>
    columns.map((col) => {
      const val = col.accessor(row);
      const str = val == null ? '' : String(val);
      // Escape quotes and wrap in quotes if contains comma/quote/newline
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );

  const csvContent = [headers.join(','), ...csvRows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
