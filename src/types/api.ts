export type Role =
  | 'PAK_RT'
  | 'KOORDINATOR'
  | 'DANRU'
  | 'WAKIL_DANRU'
  | 'ANGGOTA'

export type AuthUser = {
  pengguna_id: number
  nama_pengguna: string
  peran: Role[]
  csrf_token: string
}

export type ApiError = {
  pesan?: string
}

export type Warga = {
  id: number
  pengguna_id: number
  nama: string
  alamat: string
  nomor_hp: string
  aktif: boolean
}

export type WargaDetail = Warga & {
  regu: string
  jabatan: string
}

export type Regu = {
  id: number
  kode: string
  nama: string
}
