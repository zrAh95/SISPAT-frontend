import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { DashboardTable } from '../components/DashboardTable'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../services/api'
import type { DashboardSummary, ReguAttendance, RekapRow, SesiRow } from '../types/dashboard'

type DashboardTableRow = Record<string, unknown>

export function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [reguAttendance, setReguAttendance] = useState<ReguAttendance[]>([])
  const [rows, setRows] = useState<DashboardTableRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const role = user?.peran[0] || 'ANGGOTA'
  const isOperator = role === 'PAK_RT' || role === 'KOORDINATOR'
  const isDanru = role === 'DANRU' || role === 'WAKIL_DANRU'
  const isAnggota = role === 'ANGGOTA'

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const dashboard = await apiRequest<DashboardSummary>('/dashboard')
        if (!active) return
        setSummary(dashboard)
        if (role === 'PAK_RT' || role === 'KOORDINATOR') {
          const [rekap, kehadiran] = await Promise.all([
            apiRequest<RekapRow[]>('/rekap'),
            apiRequest<ReguAttendance[]>('/dashboard/kehadiran'),
          ])
          if (active) setReguAttendance(Array.isArray(kehadiran) ? kehadiran : [])
          if (active) setRows(Array.isArray(rekap) ? rekap.map(toRekapRow) : [])
        } else {
          setReguAttendance([])
          const sesi = await apiRequest<SesiRow[]>('/sesi-ronda')
          if (active) setRows(Array.isArray(sesi) ? sesi.map(toSesiRow) : [])
        }
      } catch (requestError) {
        if (!active) return
        const status = requestError instanceof Error ? (requestError as Error & { status?: number }).status : undefined
        if (status === 403) {
          setError('')
          setSummary(null)
          setRows([])
        } else {
          setError(requestError instanceof Error ? requestError.message : 'Gagal memuat dashboard')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [role])

  const activeSessions = rows.filter((row) => String(row.status) === 'BERLANGSUNG' || String(row.status_sesi) === 'BERLANGSUNG').length
  const totalSessions = rows.length

  const columns = useMemo(() => isOperator ? [
    { accessorKey: 'tanggal_ronda', header: 'Tanggal' },
    { accessorKey: 'regu', header: 'Regu' },
    { accessorKey: 'jumlah_anggota', header: 'Anggota' },
    { accessorKey: 'hadir', header: 'Hadir' },
    { accessorKey: 'pending', header: 'Pending' },
    { accessorKey: 'status_sesi', header: 'Status' },
  ] : [
    { accessorKey: 'tanggal_ronda', header: 'Tanggal' },
    { accessorKey: 'regu_id', header: 'Regu' },
    { accessorKey: 'mulai_at', header: 'Mulai' },
    { accessorKey: 'selesai_at', header: 'Selesai' },
    { accessorKey: 'status', header: 'Status' },
  ], [isOperator])

  return (
    <AppShell>
      <div className="dashboard-heading">
        <div><span className="dashboard-eyebrow">Halo User</span><h1>Welcome to dashboard sispat</h1><p>Ringkasan kegiatan ronda {roleLabel(role)}.</p></div>
        <span className="role-chip">{roleLabel(role)}</span>
      </div>
      {error && <p className="dashboard-error">{error}</p>}
      {loading ? <p className="dashboard-loading">Memuat data dashboard...</p> : <>
        <div className="stat-grid">
          {isOperator ? <>
            <StatCard label="Total Warga" value={summary?.jumlah_warga} tone="blue" />
            <StatCard label="Total Regu" value={summary?.jumlah_regu} tone="violet" />
            <StatCard label="Ronda Selesai" value={summary?.ronda_selesai} tone="green" />
            <StatCard label="Pending" value={summary?.pending} tone="orange" />
            <StatCard label="Total Jimpitan" value={formatCurrency(summary?.total_jimpitan)} tone="indigo" />
          </> : isDanru ? <>
            <StatCard label="Sesi Aktif" value={activeSessions} tone="blue" />
            <StatCard label="Anggota Regu" value={summary?.jumlah_warga} tone="violet" />
            <StatCard label="Sudah Hadir" value={summary?.hadir} tone="green" />
            <StatCard label="Belum Hadir" value={summary?.belum_hadir} tone="orange" />
            <StatCard label="Pending" value={summary?.pending} tone="indigo" />
          </> : <>
            <StatCard label="Jadwal Ronda" value={totalSessions} tone="blue" />
            <StatCard label="Riwayat Ronda" value={summary?.ronda_selesai} tone="violet" />
            <StatCard label="Sudah Hadir" value={summary?.hadir} tone="green" />
            <StatCard label="Total Regu" value={summary?.jumlah_regu} tone="orange" />
          </>}
        </div>
        <div className="dashboard-grid">
          <section className="activity-card">
            <div className="card-heading"><div><h2>{isAnggota ? 'Riwayat Kehadiran' : 'Monitoring Kehadiran'}</h2><p>{isAnggota ? 'Riwayat ronda Anda' : 'Overview kegiatan regu'}</p></div><span className="status-pill">{isAnggota ? `${totalSessions} jadwal` : `${activeSessions} sesi aktif`}</span></div>
            {isOperator ? <div className="regu-chart">{reguAttendance.map((regu, index) => { const percent = regu.jumlah_anggota ? Math.round((regu.hadir / regu.jumlah_anggota) * 100) : 0; return <div className="regu-chart-item" key={regu.kode} style={{ animationDelay: `${index * 70}ms` }}><div className="regu-chart-label"><strong>{regu.nama}</strong><span>{percent}%</span></div><div className="regu-progress"><i style={{ width: `${percent}%` }} /></div><div className="regu-chart-meta"><span>Hadir {regu.hadir}</span><span>Pending {regu.pending}</span><span>Belum {regu.belum_hadir}</span></div></div> })}</div> : <><div className="bar-chart">{[45, 70, 52, 88, 62, 76, 90].map((height, index) => <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 60}ms` }} />)}</div><div className="chart-legend"><span><i className="legend-dot blue" /> Hadir <strong>{summary?.hadir || 0}</strong></span><span><i className="legend-dot pale" /> Belum hadir <strong>{summary?.belum_hadir || 0}</strong></span></div></>}
          </section>
          <section className="activity-card list-card"><div className="card-heading"><div><h2>{isAnggota ? 'Jadwal Mendatang' : 'Aktivitas Terbaru'}</h2><p>Data kegiatan terakhir</p></div></div>{rows.length === 0 ? <p className="table-empty">Belum ada aktivitas</p> : <ul className="activity-list">{rows.slice(0, 4).map((row) => <li key={String(row.id)}><span className="activity-icon">R</span><div><strong>{role === 'PAK_RT' || role === 'KOORDINATOR' ? `Ronda ${row.regu}` : `Sesi ${row.id}`}</strong><small>{String(row.tanggal_ronda)}</small></div><b>{String(row.status_sesi || row.status || '-')}</b></li>)}</ul>}</section>
        </div>
        <DashboardTable title={isOperator ? 'Rekap Kegiatan' : isDanru ? 'Absensi Regu' : 'Riwayat Ronda'} columns={columns} rows={rows} emptyMessage={isOperator ? 'Belum ada data rekap ronda' : 'Belum ada sesi ronda'} />
      </>}
    </AppShell>
  )
}

function StatCard({ label, value, tone }: { label: string; value?: number | string; tone: string }) { return <article className={`stat-card stat-${tone}`}><span>{label}</span><strong>{value ?? 0}</strong><i /></article> }
function toRekapRow(row: RekapRow): DashboardTableRow { return { ...row, tanggal_ronda: formatDate(row.tanggal_ronda), status_sesi: formatStatus(row.status_sesi) } }
function toSesiRow(row: SesiRow): DashboardTableRow { return { ...row, tanggal_ronda: formatDate(row.tanggal_ronda), mulai_at: formatTime(row.mulai_at), selesai_at: formatTime(row.selesai_at), status: formatStatus(row.status) } }
function formatDate(value: string) { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) }
function formatTime(value: string) { return new Intl.DateTimeFormat('id-ID', { timeStyle: 'short', hourCycle: 'h23' }).format(new Date(value)) }
function formatStatus(value: string) { return value.replaceAll('_', ' ') }
function formatCurrency(value = 0) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value) }
function roleLabel(role: string) { return role.replaceAll('_', ' ') }
