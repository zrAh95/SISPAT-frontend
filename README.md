# SISPAT Frontend

Antarmuka web untuk Sistem Informasi Ronda Khusus RT Empat.

## Stack

```text
React 19
TypeScript
Vite
React Router
TanStack Table
Font Awesome
```

## Menjalankan

```bash
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`.

Backend API dijalankan terpisah di `http://localhost:8080`. Request ke `/api` diproksi ke backend oleh Vite, jadi tidak perlu konfigurasi CORS.

## Build

```bash
npm run build
```

Hasil build ada di `dist/`.

## Lint

```bash
npm run lint
```

## Halaman

```text
/dashboard     Ringkasan dan monitoring, menyesuaikan peran
/warga         Kelola warga, tambah edit hapus          Koordinator
/regu          Anggota regu dan petugas ronda           Koordinator, Pak RT
/koordinator   Tetapkan warga sebagai Koordinator        Pak RT
/jadwal-ronda  Buat jadwal ronda                         Pak RT
/rekap         Rekap kegiatan dengan filter              Pak RT, Koordinator
/sesi-ronda    Daftar dan mulai sesi ronda               Danru, Wakil, Anggota
/verifikasi    Verifikasi dan tolak absensi               Danru, Wakil
/laporan       Laporan akhir ronda                       Danru, Wakil
/absensi       Kirim absensi dengan foto selfie          Anggota, Petugas
```

## Struktur

```text
src/components   AppShell, DataTable, Modal, notifikasi
src/config       Menu sidebar per peran
src/contexts     AuthContext
src/pages        Halaman per fitur
src/routes       Routing dan proteksi akses
src/services     Client API
src/types        Tipe data TypeScript
```

## Format Waktu

Semua waktu memakai format 24 jam (`00` sampai `23`) dan dropdown jam manual, bukan input time native, supaya tampilan konsisten di semua browser dan mudah dipahami orang tua.
