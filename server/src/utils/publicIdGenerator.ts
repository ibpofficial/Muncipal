import { prisma } from '../db/prisma';

const ROLE_PREFIXES: Record<string, string> = {
  USER: 'CIT',
  PROFESSIONAL: 'PRO',
  AUTHORITY: 'AUT',
  WORKER: 'WRK',
};

export async function generatePublicId(role: string): Promise<string> {
  const prefix = ROLE_PREFIXES[role.toUpperCase()] || 'CIT';

  // Count existing users with this prefix
  const count = await (prisma as any).user.count({
    where: {
      publicId: {
        startsWith: `${prefix}-`,
      },
    },
  });

  const nextNumber = count + 1;
  const padded = String(nextNumber).padStart(6, '0');
  return `${prefix}-${padded}`;
}
