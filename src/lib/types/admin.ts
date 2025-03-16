// Admin user types
export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: AdminRole;
  status: AdminStatus;
  permissions: AdminPermissions;
  lastLoginAt?: Date;
  failedAttempts: number;
  lockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminRole = 
  | 'super_admin'
  | 'admin' 
  | 'moderator'
  | 'support'
  | 'finance'
  | 'content';

export type AdminStatus = 
  | 'active'
  | 'suspended'
  | 'inactive';

export interface AdminPermissions {
  all?: AdminAction[];
  users?: AdminAction[];
  doctors?: AdminAction[];
  content?: AdminAction[];
  settings?: AdminAction[];
  [key: string]: AdminAction[] | undefined;
}

export type AdminAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'verify';

// Admin session types
export interface AdminSession {
  id: string;
  adminId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
}

// Admin audit log types
export interface AdminAuditLog {
  id: string;
  adminId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}