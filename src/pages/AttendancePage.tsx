import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { SuccessNotice } from '../components/SuccessNotice'
import { apiRequest } from '../services/api'
import type { SesiRow } from '../types/dashboard'

export function AttendancePage() {
  const [sessions, setSessions] = useState<SesiRow[]>([]); const [file, setFile] = useState<File | null>(null); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  const load = () => apiRequest<SesiRow[]>('/sesi-ronda').then((data) => setSessions(Array.isArray(data) ? data : [])).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Gagal memuat sesi'))
  useEffect(() => { void load() }, [])
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(''); setMessage(''); const form = new FormData(event.currentTarget); if (!file) { setError('Pilih foto selfie terlebih dahulu.'); return } const body = new FormData(); body.append('selfie', file); try { const result = await apiRequest<{ absensi_id: number; status: string }>(`/sesi-ronda/${Number(form.get('sesi_id'))}/absensi`, { method: 'POST', body }); setMessage(`Absensi terkirim dengan status ${result.status}.`); event.currentTarget.reset(); setFile(null) } catch (e) { setError(e instanceof Error ? e.message : 'Gagal mengirim absensi') } }
  return <AppShell><div className="page-panel"><div className="page-heading"><div><span>ANGGOTA / PETUGAS</span><h1>Absensi Ronda</h1><p>Ambil selfie dan kirim absensi pada sesi yang sedang berlangsung.</p></div></div>{error && <p className="page-error">{error}</p>}{message && <SuccessNotice message={message} onDone={() => setMessage('')} />}<section className="form-card attendance-form"><h2>Kirim absensi</h2><form className="stack-form" onSubmit={submit}><label>Sesi ronda<select name="sesi_id" required><option value="">Pilih sesi</option>{sessions.filter((item) => item.status === 'BERLANGSUNG').map((item) => <option key={item.id} value={item.id}>Sesi #{item.id} · Regu {item.regu_id}</option>)}</select></label><label>Foto selfie<input type="file" accept="image/jpeg,image/png" capture="user" onChange={(event) => setFile(event.target.files?.[0] || null)} required /></label>{file && <p className="file-name">Dipilih: {file.name}</p>}<button className="page-submit" type="submit">Kirim absensi</button></form></section></div></AppShell>
}
