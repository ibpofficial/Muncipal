import { prisma } from '../db/prisma';

export interface AuditLogOptions {
  userId?: string;
  publicId?: string;
  role?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

export async function logAudit(options: AuditLogOptions) {
  try {
    const { userId, publicId, role, action, entityType, entityId, metadata } = options;
    await (prisma as any).auditLog.create({
      data: {
        userId: userId || null,
        publicId: publicId || null,
        role: role || null,
        action,
        entityType: entityType || null,
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to record audit log:', error);
  }
}
