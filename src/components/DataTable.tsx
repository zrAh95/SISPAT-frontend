import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'

type Props<T> = {
  data: T[]
  columns: ColumnDef<T, any>[]
  searchPlaceholder?: string
  pageSize?: number
  emptyMessage?: string
}

export function DataTable<T>({ data, columns, searchPlaceholder = 'Search...', pageSize = 10, emptyMessage = 'Belum ada data.' }: Props<T>) {
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize })
  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({ data, columns, state: { sorting, globalFilter: search, pagination }, onSortingChange: setSorting, onGlobalFilterChange: setSearch, onPaginationChange: setPagination, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() })

  if (data.length === 0) return <p className="empty-state">{emptyMessage}</p>
  return <div className="data-table-wrap"><div className="data-table-toolbar"><span>{data.length} data</span><div className="data-table-controls"><label>Jumlah <select value={pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder} /></div></div><div className="table-scroll"><table><thead>{table.getHeaderGroups().map((headerGroup) => <tr key={headerGroup.id}>{headerGroup.headers.map((header) => <th key={header.id} onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}<span>{header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}</span></th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div><div className="data-table-footer"><span>Menampilkan {table.getRowModel().rows.length} dari {data.length} data</span><div><button type="button" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Sebelumnya</button><span>Halaman {pagination.pageIndex + 1}</span><button type="button" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Berikutnya</button></div></div></div>
}
