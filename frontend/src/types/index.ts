// ── Tipos compartilhados do frontend ──────────────────

export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Group {
  id: string;
  name: string;
  order: number;
  accounts: Account[];
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentStatus = 'PENDING' | 'PAID_ON_TIME' | 'PAID_LATE';

export interface Account {
  id: string;
  name: string;
  groupId: string;
  order: number;
  group?: Group;
  createdAt?: string;
  updatedAt?: string;
}

export interface Entry {
  id: string;
  accountId: string;
  year: number;
  month: number;
  value: number;
  installment: number | null;
  totalInstallments: number | null;
  notes: string | null;
  paymentStatus: PaymentStatus;
  account?: Account & { group?: Group };
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardData {
  year: number;
  yearTotal: number;
  monthAverage: number;
  monthlyData: MonthlyTotal[];
  groupData: GroupTotal[];
}

export interface MonthlyTotal {
  month: number;
  label: string;
  total: number;
}

export interface GroupTotal {
  name: string;
  total: number;
}

// ── Constantes ──────────────────────────────────────────

export const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
] as const;

export const MONTH_FULL_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
] as const;
