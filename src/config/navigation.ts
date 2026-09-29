import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowRightFromBracket,
  faCalendarDays,
  faChartColumn,
  faCircleCheck,
  faFileLines,
  faGaugeHigh,
  faPeopleGroup,
  faShieldHalved,
  faUserCheck,
  faUsers,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import type { Role } from '../types/api'

export type NavItem = {
  label: string
  path: string
  icon: IconDefinition
  roles: Role[]
}

export const navigation: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: faGaugeHigh, roles: ['PAK_RT', 'KOORDINATOR', 'DANRU', 'WAKIL_DANRU', 'ANGGOTA'] },
  { label: 'Jadwal Ronda', path: '/jadwal-ronda', icon: faCalendarDays, roles: ['PAK_RT', 'ANGGOTA'] },
  { label: 'Sesi Ronda', path: '/sesi-ronda', icon: faShieldHalved, roles: ['DANRU', 'WAKIL_DANRU', 'ANGGOTA'] },
  { label: 'Absensi', path: '/absensi', icon: faUserCheck, roles: ['ANGGOTA'] },
  { label: 'Verifikasi', path: '/verifikasi', icon: faCircleCheck, roles: ['DANRU', 'WAKIL_DANRU'] },
  { label: 'Laporan Ronda', path: '/laporan', icon: faFileLines, roles: ['DANRU', 'WAKIL_DANRU'] },
  { label: 'Data Warga', path: '/warga', icon: faUsers, roles: ['KOORDINATOR'] },
  { label: 'Regu', path: '/regu', icon: faPeopleGroup, roles: ['PAK_RT', 'KOORDINATOR'] },
  { label: 'Rekap', path: '/rekap', icon: faChartColumn, roles: ['PAK_RT', 'KOORDINATOR'] },
  { label: 'Kelola Koordinator', path: '/koordinator', icon: faUserTie, roles: ['PAK_RT'] },
]

export function getNavigation(roles: Role[]) {
  return navigation.filter((item) => roles.some((role) => item.roles.includes(role)))
}

export { faArrowRightFromBracket }
