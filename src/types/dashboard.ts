export type DashboardSummary = {
  jumlah_warga: number
  jumlah_regu: number
  jumlah_ronda: number
  ronda_selesai: number
  ronda_belum_selesai: number
  hadir: number
  belum_hadir: number
  pending: number
  total_jimpitan: number
}

export type ReguAttendance = {
  kode: string
  nama: string
  jumlah_anggota: number
  hadir: number
  belum_hadir: number
  pending: number
}

export type RekapRow = {
  id: number
  jadwal_id: number
  regu_id: number
  regu: string
  tanggal_ronda: string
  mulai_at: string
  selesai_at: string
  status_sesi: string
  jumlah_anggota: number
  hadir: number
  belum_hadir: number
  pending: number
  status_laporan: string
  ringkasan_jimpitan: string
}

export type SesiRow = {
  id: number
  jadwal_id: number
  regu_id: number
  tanggal_ronda: string
  mulai_at: string
  selesai_at: string
  status: string
}
