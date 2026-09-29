import { useMemo, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import type { SortingState } from '@tanstack/react-table'

type TableColumn = {
  accessorKey: string
  header: string
}

type DashboardTableProps = {
  title?: string
  columns: TableColumn[]
  rows: Record<string, unknown>[]
  emptyMessage: string
}

export function DashboardTable({ title = 'Rekap Kegiatan', columns, rows, emptyMessage }: DashboardTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const columnHelper = useMemo(() => createColumnHelper<Record<string, unknown>>(), [])
  const tableColumns = useMemo(() => columns.map((column) => columnHelper.accessor(column.accessorKey, { header: column.header, cell: (info) => String(info.getValue() ?? '-') })), [columns, columnHelper])
  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <section className="dashboard-table-card">
      <div className="table-card-header">
        <h2>{title}</h2>
        <input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Filter data..." />
      </div>
      {rows.length === 0 ? <p className="table-empty">{emptyMessage}</p> : (
        <div className="table-scroll">
          <table>
            <thead>{table.getHeaderGroups().map((headerGroup) => <tr key={headerGroup.id}>{headerGroup.headers.map((header) => <th key={header.id} onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}<span className="sort-mark">{header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ''}</span></th>)}</tr>)}</thead>
            <tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}
