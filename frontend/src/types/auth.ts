export type UserRole = 'guest' | 'passenger' | 'employee' | 'admin';

export interface AuthUser {
  role: UserRole;
  id?: number | string;
  name: string;
  badge?: string;
  contact?: string;
  balance?: number;
}

export const GUEST_USER: AuthUser = {
  role: 'guest',
  name: 'Guest Visitor',
};

export const DEMO_USERS = {
  passenger: {
    role: 'passenger' as UserRole,
    id: 1,
    name: 'Rahul Sharma',
    contact: '9876543210',
    balance: 390.0,
  },
  employee: {
    role: 'employee' as UserRole,
    id: 'EMP-101',
    name: 'Vikram Singh',
    badge: 'Senior Pilot & Operations',
  },
  admin: {
    role: 'admin' as UserRole,
    id: 'ADMIN-01',
    name: 'Chief Operations Officer',
    badge: 'Executive Command Access',
  },
};
