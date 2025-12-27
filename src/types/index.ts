export type UserRole = 'admin' | 'ophthalmologist' | 'technician';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
}

export type PatientStatus = 'pending' | 'reviewed' | 'urgent';
export type ReviewDecision = 'normal' | 'abnormal' | 'urgent' | 'refer';

export interface PatientImage {
  url: string;
  format: string;
  resolution: string;
  eye: 'left' | 'right';
}

export interface Patient {
  id: string;
  uid: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  department: string;
  visitDate: string;
  status: PatientStatus;
  images: {
    left: PatientImage;
    right: PatientImage;
  };
  reviewedAt?: string;
  reviewedBy?: string;
  decision?: ReviewDecision;
  findings?: string;
  condition?: string;
  aiScore?: number;
  createdAt: string;
}

export interface DashboardStats {
  pending: number;
  reviewed: number;
  urgent: number;
  total: number;
  avgReviewTime: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}
