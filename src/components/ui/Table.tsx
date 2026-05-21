import React from "react";

export const TableContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`w-full overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TableContainer.displayName = "TableContainer";

export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <table
        ref={ref}
        className={`w-full min-w-[700px] border-collapse text-left text-sm text-slate-600 ${className}`}
        {...props}
      >
        {children}
      </table>
    );
  }
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={`bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider ${className}`}
        {...props}
      >
        {children}
      </thead>
    );
  }
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={`divide-y divide-slate-50 ${className}`}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={`hover:bg-slate-50/50 transition-all duration-150 ${className}`}
        {...props}
      >
        {children}
      </tr>
    );
  }
);
TableRow.displayName = "TableRow";

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`px-6 py-4.5 align-middle whitespace-nowrap font-medium text-slate-700 ${className}`}
        {...props}
      >
        {children}
      </td>
    );
  }
);
TableCell.displayName = "TableCell";

export const TableHeadCell = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`px-6 py-4 font-bold align-middle whitespace-nowrap text-slate-400 ${className}`}
        {...props}
      >
        {children}
      </th>
    );
  }
);
TableHeadCell.displayName = "TableHeadCell";
