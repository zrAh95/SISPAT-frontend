import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { DataTable } from '../components/DataTable'
import { apiRequest } from '../services/api'
import type { Regu } from '../types/api'
import type { RekapRow } from '../types/dashboard'
import type { ColumnDef } from '@tanstack/react-table'

export function RekapPage() {
  const [rows, setRows] = useState<RekapRow[]>([])
  const [regu, setRegu] = useState<Regu[]>([])
  const [filter, setFilter] = useState({ regu_id: '', tanggal_awal: '', tanggal_akhir: '' })
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const params = new URLSearchParams()
      if (filter.regu_id) params.set('regu_id', filter.regu_id)
      if (filter.tanggal_awal) params.set('tanggal_awal', filter.tanggal_awal)
      if (filter.tanggal_akhir) params.set('tanggal_akhir', filter.tanggal_akhir)
      const data = await apiRequest<RekapRow[]>(`/rekap?${params.toString()}`)
      setRows(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal memuat rekap')
    }
  }

  useEffect(() => {
    void apiRequest<Regu[]>('/regu').then((data) => setRegu(Array.isArray(data) ? data : [])).catch(() => undefined)
    // oxlint-disable-next-line react/set-state-in-effect
    void load()
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rekapColumns: ColumnDef<RekapRow, any>[] = [
    { accessorKey: 'tanggal_ronda', header: 'Tanggal', cell: (info) => formatDate(String(info.getValue())) },
    { accessorKey: 'regu', header: 'Regu' },
    { accessorKey: 'jumlah_anggota', header: 'Anggota' },
    { accessorKey: 'hadir', header: 'Hadir' },
    { accessorKey: 'belum_hadir', header: 'Belum' },
    { accessorKey: 'pending', header: 'Pending' },
    { id: 'waktu', header: 'Waktu Ronda', accessorFn: (row) => row.mulai_at, cell: (info) => { const row = info.row.original; return `${formatTime(row.mulai_at)} - ${formatTime(row.selesai_at)}` } },
    { accessorKey: 'status_sesi', header: 'Status Sesi' },
    { accessorKey: 'status_laporan', header: 'Status Laporan', cell: (info) => String(info.getValue() || 'Belum ada') },
    { accessorKey: 'ringkasan_jimpitan', header: 'Ringkasan Jimpitan' },
  ]

  return (
    <AppShell><div className="page-panel">
      <div className="page-heading"><div><span>PAK RT / KOORDINATOR</span><h1>Rekap Kegiatan</h1><p>Pantau kehadiran ronda berdasarkan periode dan regu.</p></div></div>
      {error && <p className="page-error">{error}</p>}
      <section className="filter-card"><label>Regu<select value={filter.regu_id} onChange={(event) => setFilter({ ...filter, regu_id: event.target.value })}><option value="">Semua regu</option>{regu.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></label><label>Tanggal mulai<input type="date" value={filter.tanggal_awal} onChange={(event) => setFilter({ ...filter, tanggal_awal: event.target.value })} /></label><label>Tanggal selesai<input type="date" value={filter.tanggal_akhir} onChange={(event) => setFilter({ ...filter, tanggal_akhir: event.target.value })} /></label><button className="filter-button" type="button" onClick={() => void load()}>Terapkan</button></section>
      <section className="data-card"><div className="list-card-heading"><h2>Daftar rekap</h2><span>{rows.length} data</span></div><DataTable data={rows} columns={rekapColumns} searchPlaceholder="Search rekap..." emptyMessage="Belum ada data rekap." /></section>
    </div></AppShell>
  )
}

function formatDate(value: string) { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) }
function formatTime(value: string) { return new Intl.DateTimeFormat('id-ID', { timeStyle: 'short', hourCycle: 'h23' }).format(new Date(value)) }
