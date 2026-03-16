export type UserRole = 'admin' | 'user';
export type UserClassification = 'Student' | 'Faculty' | 'Staff' | 'Admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  classification?: UserClassification;
  college_office?: string;
  isBlocked: boolean;
  lastLogin: any;
  createdAt: any;
}

export interface VisitLog {
  id?: string;
  userUid: string;
  email: string;
  displayName: string;
  classification: string;
  college: string;
  reason: string;
  timestamp: any;
}
