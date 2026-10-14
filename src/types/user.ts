export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  canPersist: boolean;
  emailVerified: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}
