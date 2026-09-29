import { useEffect, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AppShell } from '../components/AppShell'
import { DataTable } from '../components/DataTable'
import { SuccessNotice } from '../components/SuccessNotice'
import { apiRequest } from '../services/api'
import type { SesiRow } from '../types/dashboard'

export function SessionsPage() {
  const [rows, setRows] = useState<SesiRow[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => apiRequest<SesiRow[]>('/sesi-ronda').then((data) => setRows(Array.isArray(data) ? data : [])).catch((e: unknown) => {
    const status = e instanceof Error ? (e as Error & { status?: number }).status : undefined
    if (status !== 403) setError(e instanceof Error ? e.message : 'Gagal memuat sesi')
  })
  useEffect(() => { void load() }, [])

  const start = async (id: number) => {
    try {
      await apiRequest(`/sesi-ronda/${id}/mulai`, { method: 'POST' })
      await load()
      setSuccess(`Sesi #${id} berhasil dimulai.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memulai sesi')
    }
  }

  const columns: ColumnDef<SesiRow, any>[] = [
    { accessorKey: 'id', header: 'Sesi', cell: (info) => `#${info.getValue()}` },
    { id: 'regu', header: 'Regu', accessorFn: (row) => row.regu_id, cell: (info) => `Regu ${info.getValue()}` },
    { accessorKey: 'tanggal_ronda', header: 'Tanggal', cell: (info) => formatDate(String(info.getValue())) },
    { id: 'waktu', header: 'Waktu', accessorFn: (row) => row.mulai_at, cell: (info) => { const row = info.row.original; return `${formatTime(row.mulai_at)} - ${formatTime(row.selesai_at)}` } },
    { accessorKey: 'status', header: 'Status', cell: (info) => <b>{String(info.getValue())}</b> },
    {
      id: 'aksi',
      header: 'Aksi',
      enableSorting: false,
      cell: (info) => info.row.original.status === 'TERJADWAL'
        ? <button type="button" onClick={() => void start(info.row.original.id)}>Mulai</button>
        : <span className="muted-text">-</span>,
    },
  ]

  return <AppShell><div className="page-panel"><div className="page-heading"><div><span>DANRU / WAKIL DANRU / ANGGOTA</span><h1>Sesi Ronda</h1><p>Kelola sesi ronda berdasarkan jadwal yang tersedia.</p></div></div>{error && <p className="page-error">{error}</p>}{success && <SuccessNotice message={success} onDone={() => setSuccess('')} />}<section className="data-card"><div className="list-card-heading"><h2>Daftar sesi</h2><span>{rows.length} sesi</span></div><DataTable data={rows} columns={columns} searchPlaceholder="Search sesi..." emptyMessage="Belum ada sesi ronda." /></section></div></AppShell>
}

function formatDate(value: string) { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) }
function formatTime(value: string) { return new Intl.DateTimeFormat('id-ID', { timeStyle: 'short', hourCycle: 'h23' }).format(new Date(value)) }
