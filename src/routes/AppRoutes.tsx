import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { CoordinatorPage } from '../pages/CoordinatorPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { AttendancePage } from '../pages/AttendancePage'
import { GroupsPage } from '../pages/GroupsPage'
import { RekapPage } from '../pages/RekapPage'
import { ReportPage } from '../pages/ReportPage'
import { ResidentsPage } from '../pages/ResidentsPage'
import { SessionsPage } from '../pages/SessionsPage'
import { VerificationPage } from '../pages/VerificationPage'
import { SchedulePage } from '../pages/SchedulePage'
import type { Role } from '../types/api'


function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth()
  if (loading) return <main className="container"><p>Memuat...</p></main>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.some((role) => user.peran.includes(role))) {
    return <main className="container"><h1>Akses ditolak</h1><p>Anda tidak memiliki akses ke halaman ini.</p></main>
  }
  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/warga" element={<ProtectedRoute roles={['KOORDINATOR']}><ResidentsPage /></ProtectedRoute>} />
      <Route path="/regu" element={<ProtectedRoute roles={['PAK_RT', 'KOORDINATOR']}><GroupsPage /></ProtectedRoute>} />
      <Route path="/koordinator" element={<ProtectedRoute roles={['PAK_RT']}><CoordinatorPage /></ProtectedRoute>} />
      <Route path="/jadwal-ronda" element={<ProtectedRoute roles={['PAK_RT']}><SchedulePage /></ProtectedRoute>} />
      <Route path="/sesi-ronda/:id" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
      <Route path="/verifikasi/:id" element={<ProtectedRoute roles={['DANRU', 'WAKIL_DANRU']}><VerificationPage /></ProtectedRoute>} />
      <Route path="/laporan/:id" element={<ProtectedRoute roles={['DANRU', 'WAKIL_DANRU']}><ReportPage /></ProtectedRoute>} />
      <Route path="/rekap" element={<ProtectedRoute roles={['PAK_RT', 'KOORDINATOR']}><RekapPage /></ProtectedRoute>} />
      <Route path="/absensi" element={<ProtectedRoute roles={['ANGGOTA', 'DANRU', 'WAKIL_DANRU']}><AttendancePage /></ProtectedRoute>} />
      <Route path="/verifikasi" element={<ProtectedRoute roles={['DANRU', 'WAKIL_DANRU']}><VerificationPage /></ProtectedRoute>} />
      <Route path="/laporan" element={<ProtectedRoute roles={['DANRU', 'WAKIL_DANRU']}><ReportPage /></ProtectedRoute>} />
      <Route path="/sesi-ronda" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
