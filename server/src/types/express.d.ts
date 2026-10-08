import { UserRole } from '../utils/permissions';

export interface AuthenticatedUser {
  id: string;
  publicId: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: UserRole;
  crewId?: string | null;
  accountStatus: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  emailVerified: boolean;
  profileCompleted: boolean;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
