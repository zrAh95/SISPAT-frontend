import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AppShell } from '../components/AppShell'
import { DataTable } from '../components/DataTable'
import { SuccessNotice } from '../components/SuccessNotice'
import { TimeField } from '../components/TimeField'
import { apiRequest } from '../services/api'
import type { Regu } from '../types/api'

type Jadwal = {
  id: number
  regu_id: number
  tanggal_ronda: string
  mulai_at: string
  selesai_at: string
  status: string
}

export function SchedulePage() {
  const [jadwal, setJadwal] = useState<Jadwal[]>([])
  const [regu, setRegu] = useState<Regu[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => Promise.all([apiRequest<Jadwal[]>('/jadwal-ronda'), apiRequest<Regu[]>('/regu')])
    .then(([a, b]) => {
      setJadwal(Array.isArray(a) ? a : [])
      setRegu(Array.isArray(b) ? b : [])
    })
    .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Gagal memuat jadwal'))

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void load()
  }, [])

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const element = event.currentTarget
    setSaving(true)
    setError('')
    const form = new FormData(element)
    const tanggal = String(form.get('tanggal_ronda'))
    const waktuMulai = `${form.get('mulai_at_jam')}:${form.get('mulai_at_menit')}`
    const waktuSelesai = `${form.get('selesai_at_jam')}:${form.get('selesai_at_menit')}`
    try {
      await apiRequest('/jadwal-ronda', {
        method: 'POST',
        body: {
          regu_id: Number(form.get('regu_id')),
          tanggal_ronda: tanggal,
          mulai_at: `${tanggal}T${waktuMulai}:00`,
          selesai_at: `${tanggal}T${waktuSelesai}:00`,
        },
      })
      const reguName = regu.find((item) => item.id === Number(form.get('regu_id')))?.nama ?? 'regu'
      element.reset()
      await load()
      setSuccess(`Jadwal ronda ${reguName} pada ${formatDate(String(form.get('tanggal_ronda')))} berhasil disimpan.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal membuat jadwal')
    } finally {
      setSaving(false)
    }
  }

  const reguName = (id: number) => regu.find((item) => item.id === id)?.nama ?? `Regu ${id}`

  const columns: ColumnDef<Jadwal, any>[] = [
    { accessorKey: 'tanggal_ronda', header: 'Tanggal', cell: (info) => formatDate(String(info.getValue())) },
    { id: 'regu', header: 'Regu', accessorFn: (row) => reguName(row.regu_id), cell: (info) => reguName(info.row.original.regu_id) },
    { id: 'waktu', header: 'Waktu', accessorFn: (row) => row.mulai_at, cell: (info) => `${formatTime(info.row.original.mulai_at)} - ${formatTime(info.row.original.selesai_at)}` },
    { accessorKey: 'status', header: 'Status' },
  ]

  return (
    <AppShell>
      <div className="page-panel">
        <div className="page-heading">
          <div>
            <span>PAK RT</span>
            <h1>Jadwal Ronda</h1>
            <p>Buat dan pantau jadwal ronda seluruh regu.</p>
          </div>
        </div>
        {error && <p className="page-error">{error}</p>}
        {success && <SuccessNotice message={success} onDone={() => setSuccess('')} />}
        <div className="page-columns">
          <section className="form-card">
            <h2>Buat jadwal baru</h2>
            <form className="stack-form" onSubmit={create}>
              <label>
                Regu
                <select name="regu_id" required>
                  <option value="">Pilih regu</option>
                  {regu.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}
                </select>
              </label>
              <label>
                Tanggal ronda
                <input name="tanggal_ronda" type="date" required />
              </label>
              <div className="form-row">
                <TimeField name="mulai_at" label="Waktu mulai" defaultValue="19:00" />
                <TimeField name="selesai_at" label="Waktu selesai" defaultValue="21:00" />
              </div>
              <button className="page-submit" type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan jadwal'}
              </button>
            </form>
          </section>
          <section className="data-card">
            <div className="list-card-heading"><h2>Jadwal terbaru</h2><span>{jadwal.length} jadwal</span></div>
            <DataTable data={jadwal} columns={columns} searchPlaceholder="Search jadwal..." emptyMessage="Belum ada jadwal ronda." />
          </section>
        </div>
      </div>
    </AppShell>
  )
}

function formatDate(value: string) { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) }
function formatTime(value: string) { return new Intl.DateTimeFormat('id-ID', { timeStyle: 'short', hourCycle: 'h23' }).format(new Date(value)) }
