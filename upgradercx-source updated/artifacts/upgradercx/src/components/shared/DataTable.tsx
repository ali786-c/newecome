import * as React from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileX } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  /** Custom render — if omitted, accesses row[key] */
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string | number;
}

/**
 * Reusable data table with loading skeletons, empty state, and row click.
 * Designed to be used across admin and customer pages.
 */
export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data found.',
  emptyIcon,
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col.key}><Skeleton className="h-4 w-full" /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon || <FileX className="h-10 w-10 text-muted-foreground" />}
        title={emptyMessage}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key} className={col.className}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow
            key={rowKey ? rowKey(row) : i}
            className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col) => (
              <TableCell key={col.key} className={col.className}>
                {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
