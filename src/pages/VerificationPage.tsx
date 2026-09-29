import { useEffect, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AppShell } from '../components/AppShell'
import { DataTable } from '../components/DataTable'
import { SuccessNotice } from '../components/SuccessNotice'
import { apiRequest } from '../services/api'
import type { SesiRow } from '../types/dashboard'

type Item = { absensi_id: number; warga_id: number; nama: string; status: string; foto_id: number | null; foto_ada: boolean }

export function VerificationPage() {
  const [sessions, setSessions] = useState<SesiRow[]>([])
  const [sessionId, setSessionId] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { void apiRequest<SesiRow[]>('/sesi-ronda').then((data) => { const list = Array.isArray(data) ? data : []; setSessions(list); setSessionId(list[0]?.id ? String(list[0].id) : '') }) }, [])
  useEffect(() => { if (!sessionId) return; void apiRequest<Item[]>(`/sesi-ronda/${sessionId}/absensi`).then((data) => setItems(Array.isArray(data) ? data : [])).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Gagal memuat absensi')) }, [sessionId])

  const process = async (id: number, action: 'verifikasi' | 'tolak') => {
    const nama = items.find((item) => item.absensi_id === id)?.nama ?? 'Anggota'
    try {
      await apiRequest(`/absensi/${id}/${action}`, { method: 'POST', body: action === 'tolak' ? { alasan_ditolak: 'Tidak dapat diverifikasi' } : undefined })
      const data = await apiRequest<Item[]>(`/sesi-ronda/${sessionId}/absensi`)
      setItems(Array.isArray(data) ? data : [])
      setSuccess(action === 'verifikasi' ? `Absensi ${nama} berhasil diverifikasi.` : `Absensi ${nama} berhasil ditolak.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal memproses absensi') }
  }

  const columns: ColumnDef<Item, any>[] = [
    { accessorKey: 'nama', header: 'Nama' },
    {
      id: 'foto',
      header: 'Foto',
      accessorFn: (row) => (row.foto_id ? 'ada' : 'tidak ada'),
      cell: (info) => info.row.original.foto_id
        ? <a className="photo-link" href={`/api/foto-absensi/${info.row.original.foto_id}`} target="_blank" rel="noreferrer">Lihat</a>
        : 'Tidak ada',
    },
    { accessorKey: 'status', header: 'Status' },
    {
      id: 'aksi',
      header: 'Aksi',
      enableSorting: false,
      cell: (info) => info.row.original.status === 'MENUNGGU'
        ? <div className="row-actions"><button type="button" onClick={() => void process(info.row.original.absensi_id, 'verifikasi')}>Verifikasi</button><button type="button" className="danger" onClick={() => void process(info.row.original.absensi_id, 'tolak')}>Tolak</button></div>
        : <span className="muted-text">-</span>,
    },
  ]

  return <AppShell><div className="page-panel"><div className="page-heading"><div><span>DANRU / WAKIL DANRU</span><h1>Verifikasi Absensi</h1><p>Periksa foto anggota dan tentukan status kehadiran.</p></div></div>{error && <p className="page-error">{error}</p>}{success && <SuccessNotice message={success} onDone={() => setSuccess('')} />}<section className="filter-card verification-filter"><label>Sesi ronde<select value={sessionId} onChange={(event) => setSessionId(event.target.value)}><option value="">Pilih sesi</option>{sessions.map((item) => <option key={item.id} value={item.id}>Sesi #{item.id} · Regu {item.regu_id}</option>)}</select></label></section><section className="data-card"><div className="list-card-heading"><h2>Daftar absensi</h2><span>{items.length} anggota</span></div><DataTable data={items} columns={columns} searchPlaceholder="Search anggota..." emptyMessage="Belum ada absensi pada sesi ini." /></section></div></AppShell>
}
