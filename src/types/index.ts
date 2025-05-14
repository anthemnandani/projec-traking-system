
export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string; // If role is client
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ClientStatus = 'active' | 'idle' | 'gone';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: ClientStatus;
  hasAccount: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'requirements' | 'quote' | 'approved' | 'progress' | 'submitted' | 'feedback' | 'complete';

export interface Task {
  id: string;
  title: string;
  clientId: string;
  description: string;
  status: TaskStatus;
  estimatedHours: number;
  estimatedCost: number;
  actualHours?: number;
  actualCost?: number;
  project?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
}

export type PaymentStatus = 'due' | 'invoiced' | 'pending' | 'received' | 'overdue' | 'canceled';

export interface Payment {
  id: string;
  taskId: string;
  clientId: string;
  amount: number;
  status: PaymentStatus;
  dueDate: Date;
  invoiceNumber?: string;
  invoicedAt?: Date;
  receivedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface DashboardStat {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface Invoice {
  id: string;
  clientId: string;
  taskId: string;
  amount: number;
  status: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}
