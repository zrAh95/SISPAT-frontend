import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { Modal } from '../components/Modal'
import { SuccessNotice } from '../components/SuccessNotice'
import { ResidentsDataTable } from '../components/ResidentsDataTable'
import { apiRequest } from '../services/api'
import type { Regu, Warga, WargaDetail } from '../types/api'

type ConfirmAction = 'delete'

export function ResidentsPage() {
  const [rows, setRows] = useState<WargaDetail[]>([])
  const [regu, setRegu] = useState<Regu[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Warga | null>(null)
  const [confirm, setConfirm] = useState<{ row: Warga; action: ConfirmAction } | null>(null)

  const load = async () => {
    const [wargaData, reguData] = await Promise.all([apiRequest<WargaDetail[]>('/warga'), apiRequest<Regu[]>('/regu')])
    if (Array.isArray(wargaData)) setRows(wargaData)
    if (Array.isArray(reguData)) setRegu(reguData)
  }
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void load().catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Gagal memuat warga'))
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const element = event.currentTarget
    setSaving(true)
    setError('')
    const form = new FormData(element)
    const nama = String(form.get('nama') || '').trim()
    const body = { nama, kata_sandi: form.get('kata_sandi'), alamat: form.get('alamat'), nomor_hp: form.get('nomor_hp'), regu_id: Number(form.get('regu_id')) }
    try {
      if (editing) {
        await apiRequest<Warga>(`/warga/${editing.id}`, { method: 'PUT', body: { nama: body.nama, alamat: body.alamat, nomor_hp: body.nomor_hp, regu_id: body.regu_id } })
        setSuccess(`Data warga ${nama} berhasil diperbarui.`)
      } else {
        await apiRequest<Warga>('/warga', { method: 'POST', body })
        setSuccess(`Data warga ${nama} berhasil ditambahkan.`)
      }
      element.reset()
      setEditing(null)
      await load()
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan warga') } finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!confirm) return
    try { await apiRequest(`/warga/${confirm.row.id}`, { method: 'DELETE' }); setSuccess(`Data warga ${confirm.row.nama} berhasil dihapus.`); setConfirm(null); await load() } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Gagal menghapus warga') }
  }

  return <AppShell><div className="page-panel"><div className="page-heading"><div><span>KOORDINATOR</span><h1>Data Warga</h1><p>Kelola warga dan akun akses ronda.</p></div></div>{error && <p className="page-error">{error}</p>}{success && <SuccessNotice message={success} onDone={() => setSuccess('')} />}<div className="page-columns"><section className="form-card"><h2>{editing ? 'Edit warga' : 'Tambah warga'}</h2><form className="stack-form" key={editing?.id || 'new'} onSubmit={submit}><label>Nama warga<input name="nama" defaultValue={editing?.nama || ''} required /></label>{!editing && <label>Password<input name="kata_sandi" type="password" minLength={8} required /></label>}<label>Alamat<textarea name="alamat" defaultValue={editing?.alamat || ''} required /></label><label>Nomor HP<input name="nomor_hp" defaultValue={editing?.nomor_hp || ''} required /></label><label>Regu<select name="regu_id" required><option value="">Pilih regu</option>{regu.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></label><button className="page-submit" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Simpan warga'}</button>{editing && <button className="cancel-form" type="button" onClick={() => setEditing(null)}>Batal edit</button>}</form></section><section className="data-card"><div className="list-card-heading"><h2>Daftar warga</h2><span>{rows.length} warga</span></div>{rows.length === 0 ? <p className="empty-state">Belum ada warga.</p> : <ResidentsDataTable rows={rows} onEdit={setEditing} onDelete={(row) => setConfirm({ row, action: 'delete' })} />}</section></div></div><Modal isOpen={Boolean(confirm)} variant="error" title="Hapus warga?" message="Data warga akan dihapus permanen dari daftar SISPAT. Tindakan ini tidak dapat dibatalkan." confirmLabel="Hapus" onConfirm={() => void confirmDelete()} onClose={() => setConfirm(null)} /></AppShell>
}
