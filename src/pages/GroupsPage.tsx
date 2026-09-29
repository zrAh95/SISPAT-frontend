import { useEffect, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AppShell } from '../components/AppShell'
import { DataTable } from '../components/DataTable'
import { SuccessNotice } from '../components/SuccessNotice'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../services/api'
import type { Regu } from '../types/api'

type Member = { warga_id: number; nama: string; nomor_hp: string }
type Officer = { warga_id: number; nama: string; jabatan: string }
export function GroupsPage() {
  const [groups, setGroups] = useState<Regu[]>([]); const [selected, setSelected] = useState<Regu | null>(null); const [members, setMembers] = useState<Member[]>([]); const [officers, setOfficers] = useState<Officer[]>([]); const [error, setError] = useState(''); const [success, setSuccess] = useState('')
  const { user } = useAuth()
  const canManage = user?.peran.includes('KOORDINATOR') ?? false
  useEffect(() => { void apiRequest<Regu[]>('/regu').then((data) => { const list = Array.isArray(data) ? data : []; setGroups(list); setSelected(list[0] || null) }).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Gagal memuat regu')) }, [])
  useEffect(() => { if (!selected) return; void Promise.all([apiRequest<Member[]>(`/regu/${selected.id}/anggota`), apiRequest<Officer[]>(`/regu/${selected.id}/petugas`)]).then(([a, b]) => { setMembers(Array.isArray(a) ? a : []); setOfficers(Array.isArray(b) ? b : []) }).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Gagal memuat anggota')) }, [selected])
  const assign = async (jabatan: 'danru' | 'wakil-danru', wargaId: number) => {
    if (!selected) return
    const nama = members.find((item) => item.warga_id === wargaId)?.nama ?? 'Anggota'
    const label = jabatan === 'danru' ? 'Danru' : 'Wakil Danru'
    try {
      await apiRequest(`/regu/${selected.id}/${jabatan}`, { method: 'POST', body: { warga_id: wargaId } })
      const data = await apiRequest<Officer[]>(`/regu/${selected.id}/petugas`)
      setOfficers(Array.isArray(data) ? data : [])
      setSuccess(`${nama} berhasil ditetapkan sebagai ${label} regu ${selected.nama}.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menetapkan petugas') }
  }
  const memberColumns: ColumnDef<Member, any>[] = [
    { accessorKey: 'nama', header: 'Nama' },
    { accessorKey: 'nomor_hp', header: 'Nomor HP' },
    ...(canManage ? [{
      id: 'aksi',
      header: 'Jadikan Petugas',
      enableSorting: false,
      cell: (info: { row: { original: Member } }) => <div className="officer-actions"><button type="button" onClick={() => void assign('danru', info.row.original.warga_id)}>Danru</button><button type="button" onClick={() => void assign('wakil-danru', info.row.original.warga_id)}>Wakil</button></div>,
    }] : []),
  ]

  const officerColumns: ColumnDef<Officer, any>[] = [
    { accessorKey: 'nama', header: 'Nama' },
    { accessorKey: 'jabatan', header: 'Jabatan', cell: (info) => String(info.getValue()).replace('_', ' ') },
  ]

  return <AppShell><div className="page-panel"><div className="page-heading"><div><span>{canManage ? 'KOORDINATOR' : 'PAK RT'}</span><h1>Regu</h1><p>{canManage ? 'Kelola anggota regu dan petugas ronda.' : 'Lihat struktur anggota dan petugas setiap regu.'}</p></div></div>{error && <p className="page-error">{error}</p>}{success && <SuccessNotice message={success} onDone={() => setSuccess('')} />}<div className="group-tabs">{groups.map((group) => <button type="button" key={group.id} className={selected?.id === group.id ? 'active' : ''} onClick={() => setSelected(group)}>{group.nama}</button>)}</div>{selected && <div className="group-content"><section className="data-card"><div className="list-card-heading"><h2>Anggota {selected.nama}</h2><span>{members.length} anggota</span></div><DataTable data={members} columns={memberColumns} searchPlaceholder="Search anggota..." emptyMessage="Belum ada anggota." /></section><section className="data-card"><div className="list-card-heading"><h2>Petugas Ronda</h2><span>{officers.length} petugas</span></div><DataTable data={officers} columns={officerColumns} searchPlaceholder="Search petugas..." emptyMessage="Belum ada petugas." /></section></div>}</div></AppShell>
}
