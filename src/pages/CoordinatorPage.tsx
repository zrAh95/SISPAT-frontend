import { useEffect, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AppShell } from '../components/AppShell'
import { DataTable } from '../components/DataTable'
import { SuccessNotice } from '../components/SuccessNotice'
import { apiRequest } from '../services/api'

type Calon = {
  warga_id: number
  nama: string
  regu: string
  nomor_hp: string
  sudah_koordinator: boolean
  peran_utama: string
}

export function CoordinatorPage() {
  const [rows, setRows] = useState<Calon[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => apiRequest<Calon[]>('/koordinator/calon')
    .then((data) => setRows(Array.isArray(data) ? data : []))
    .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Gagal memuat daftar warga'))

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void load()
  }, [])

  const assign = async (wargaID: number, nama: string) => {
    setSaving(true)
    setError('')
    try {
      await apiRequest('/koordinator', { method: 'POST', body: { warga_id: wargaID } })
      setSuccess(`${nama} berhasil ditetapkan sebagai Koordinator.`)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menetapkan koordinator')
    } finally {
      setSaving(false)
    }
  }

  const columns: ColumnDef<Calon, any>[] = [
    { accessorKey: 'nama', header: 'Nama Warga' },
    { accessorKey: 'regu', header: 'Regu', cell: (info) => info.getValue() || '-' },
    { accessorKey: 'nomor_hp', header: 'Nomor HP' },
    { accessorKey: 'peran_utama', header: 'Peran Saat Ini', cell: (info) => String(info.getValue() || '-').replaceAll('_', ' ') },
    { accessorKey: 'sudah_koordinator', header: 'Status', cell: (info) => info.getValue() ? <b className="role-chip small">Koordinator</b> : <span className="muted-text">Belum</span> },
    {
      id: 'aksi',
      header: 'Aksi',
      enableSorting: false,
      cell: (info) => info.row.original.sudah_koordinator
        ? <span className="muted-text">-</span>
        : <button type="button" disabled={saving} onClick={() => void assign(info.row.original.warga_id, info.row.original.nama)}>Jadikan Koordinator</button>,
    },
  ]

  return (
    <AppShell>
      <div className="page-panel">
        <div className="page-heading">
          <div>
            <span>PAK RT</span>
            <h1>Kelola Koordinator</h1>
            <p>Tetapkan warga sebagai Koordinator RT 04.</p>
          </div>
        </div>
        {error && <p className="page-error">{error}</p>}
        {success && <SuccessNotice message={success} onDone={() => setSuccess('')} />}
        <section className="data-card">
          <div className="list-card-heading"><h2>Daftar warga</h2><span>{rows.length} warga</span></div>
          <DataTable data={rows} columns={columns} searchPlaceholder="Search warga..." emptyMessage="Belum ada warga." />
        </section>
      </div>
    </AppShell>
  )
}
