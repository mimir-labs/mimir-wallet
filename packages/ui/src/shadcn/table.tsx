// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils.js';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /**
   * Enable sticky header with scrollable body.
   * When enabled, the table will have a fixed header and scrollable content.
   */
  stickyHeader?: boolean;
  /**
   * Outer container className. Controls the wrapper div with background and shadow.
   */
  containerClassName?: string;
  /**
   * Inner scroll container className. Controls the scrollable area.
   */
  scrollClassName?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    { className, stickyHeader, containerClassName, scrollClassName, ...props },
    ref,
  ) => {
    const table = (
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-sm',
          stickyHeader &&
            '[&_thead_th]:bg-background/70 [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead_th]:backdrop-blur-sm [&_thead_th]:backdrop-saturate-150',
          className,
        )}
        {...props}
      />
    );

    return (
      <div
        className={cn(
          'group bg-background overflow-hidden shadow-md',
          containerClassName,
        )}
      >
        <div className={cn('scroll-hover-show overflow-auto', scrollClassName)}>
          {table}
        </div>
      </div>
    );
  },
);

Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={className} {...props} />
));

TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={className} {...props} />
));

TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-muted/50 font-medium', className)}
    {...props}
  />
));

TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('transition-colors', className)} {...props} />
));

TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'text-foreground/50 h-auto bg-transparent px-2 text-left align-middle text-xs font-medium',
      className,
    )}
    {...props}
  />
));

TableHead.displayName = 'TableHead';

const TableColumn = TableHead;

TableColumn.displayName = 'TableColumn';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-2 py-1.5 align-middle text-sm', className)}
    {...props}
  />
));

TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('text-muted-foreground mt-4 text-sm', className)}
    {...props}
  />
));

TableCaption.displayName = 'TableCaption';

// Sorting types and components
export type SortDirection = 'ascending' | 'descending';

export interface SortDescriptor {
  column: string;
  direction: SortDirection;
}

interface SortableTableColumnProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  columnKey: string;
  sortDescriptor?: SortDescriptor;
  onSortChange?: (descriptor: SortDescriptor) => void;
  allowsSorting?: boolean;
}

const SortIcon = ({ direction }: { direction?: SortDirection }) => {
  if (direction === 'ascending') {
    return <ArrowUpIcon className="h-3 w-3" />;
  }

  if (direction === 'descending') {
    return <ArrowDownIcon className="h-3 w-3" />;
  }

  return <ChevronsUpDownIcon className="h-3 w-3 opacity-50" />;
};

const SortableTableColumn = React.forwardRef<
  HTMLTableCellElement,
  SortableTableColumnProps
>(
  (
    {
      className,
      columnKey,
      sortDescriptor,
      onSortChange,
      allowsSorting = true,
      children,
      ...props
    },
    ref,
  ) => {
    const isSorted = sortDescriptor?.column === columnKey;
    const direction = isSorted ? sortDescriptor.direction : undefined;

    const handleClick = () => {
      if (!allowsSorting || !onSortChange) return;

      const newDirection: SortDirection =
        isSorted && direction === 'ascending' ? 'descending' : 'ascending';

      onSortChange({ column: columnKey, direction: newDirection });
    };

    return (
      <th
        ref={ref}
        className={cn(
          'text-foreground/50 h-auto bg-transparent px-2 text-left align-middle text-xs font-medium',
          allowsSorting && 'hover:text-foreground cursor-pointer select-none',
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="inline-flex items-center gap-1">
          {children}
          {allowsSorting && <SortIcon direction={direction} />}
        </span>
      </th>
    );
  },
);

SortableTableColumn.displayName = 'SortableTableColumn';

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableColumn,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  SortableTableColumn,
};
