export type UserRole = 'admin' | 'student' | 'faculty' | 'staff';
export type UserStatus = 'approved' | 'pending_approval';
export type UserClassification = 'Student' | 'Faculty' | 'Staff' | 'Admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
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
  destination: string;
  timestamp: any;
}
