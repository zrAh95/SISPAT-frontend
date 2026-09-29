import { useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { WargaDetail } from '../types/api'

type Props = {
  rows: WargaDetail[]
  onEdit: (row: WargaDetail) => void
  onDelete: (row: WargaDetail) => void
}

export function ResidentsDataTable({ rows, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const helper = createColumnHelper<WargaDetail>()

  const columns = [
    helper.accessor('nama', { header: 'Nama' }),
    helper.accessor('regu', { header: 'Regu' }),
    helper.accessor('jabatan', {
      header: 'Jabatan',
      cell: (info) => info.getValue() || 'Anggota',
    }),
    helper.accessor('nomor_hp', { header: 'Nomor HP' }),
    helper.display({
      id: 'actions',
      header: 'Aksi',
      cell: (info) => (
        <div className="action-cell">
          <button className="icon-action" type="button" title="Edit" onClick={() => onEdit(info.row.original)}>
            <FontAwesomeIcon icon={faPen} />
          </button>
          <button className="icon-action danger" type="button" title="Hapus" onClick={() => onDelete(info.row.original)}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ),
    }),
  ]

  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter: search, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="data-table-wrap">
      <div className="data-table-toolbar">
        <span>{rows.length} warga</span>
        <div className="data-table-controls">
          <label>Jumlah <select value={pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search warga..." />
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>{table.getHeaderGroups().map((headerGroup) => <tr key={headerGroup.id}>{headerGroup.headers.map((header) => <th key={header.id} onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}<span>{header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}</span></th>)}</tr>)}</thead>
          <tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="data-table-footer"><span>Menampilkan {table.getRowModel().rows.length} dari {rows.length} warga</span><div><button type="button" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Sebelumnya</button><span>Halaman {pagination.pageIndex + 1}</span><button type="button" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Berikutnya</button></div></div>
    </div>
  )
}
