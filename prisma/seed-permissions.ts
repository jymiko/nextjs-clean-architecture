import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default permissions untuk DCMS
const DEFAULT_PERMISSIONS = [
  // Documents
  { resource: 'documents', action: 'create', category: 'documents', description: 'Create new documents' },
  { resource: 'documents', action: 'read', category: 'documents', description: 'View documents' },
  { resource: 'documents', action: 'update', category: 'documents', description: 'Edit documents' },
  { resource: 'documents', action: 'delete', category: 'documents', description: 'Delete documents' },
  { resource: 'documents', action: 'approve', category: 'documents', description: 'Approve documents' },
  { resource: 'documents', action: 'reject', category: 'documents', description: 'Reject documents' },
  { resource: 'documents', action: 'distribute', category: 'documents', description: 'Distribute documents' },
  { resource: 'documents', action: 'export', category: 'documents', description: 'Export documents' },
  { resource: 'documents', action: 'import', category: 'documents', description: 'Import documents' },

  // Users
  { resource: 'users', action: 'create', category: 'users', description: 'Create new users' },
  { resource: 'users', action: 'read', category: 'users', description: 'View users' },
  { resource: 'users', action: 'update', category: 'users', description: 'Edit users' },
  { resource: 'users', action: 'delete', category: 'users', description: 'Delete users' },
  { resource: 'users', action: 'manage', category: 'users', description: 'Full user management' },

  // Roles
  { resource: 'roles', action: 'create', category: 'roles', description: 'Create new roles' },
  { resource: 'roles', action: 'read', category: 'roles', description: 'View roles' },
  { resource: 'roles', action: 'update', category: 'roles', description: 'Edit roles' },
  { resource: 'roles', action: 'delete', category: 'roles', description: 'Delete roles' },
  { resource: 'roles', action: 'manage-permissions', category: 'roles', description: 'Manage role permissions' },

  // Departments
  { resource: 'departments', action: 'create', category: 'departments', description: 'Create departments' },
  { resource: 'departments', action: 'read', category: 'departments', description: 'View departments' },
  { resource: 'departments', action: 'update', category: 'departments', description: 'Edit departments' },
  { resource: 'departments', action: 'delete', category: 'departments', description: 'Delete departments' },

  // Positions
  { resource: 'positions', action: 'create', category: 'positions', description: 'Create positions' },
  { resource: 'positions', action: 'read', category: 'positions', description: 'View positions' },
  { resource: 'positions', action: 'update', category: 'positions', description: 'Edit positions' },
  { resource: 'positions', action: 'delete', category: 'positions', description: 'Delete positions' },

  // Approvals
  { resource: 'approvals', action: 'view', category: 'approvals', description: 'View approval requests' },
  { resource: 'approvals', action: 'approve', category: 'approvals', description: 'Approve requests' },
  { resource: 'approvals', action: 'reject', category: 'approvals', description: 'Reject requests' },
  { resource: 'approvals', action: 'delegate', category: 'approvals', description: 'Delegate approvals' },

  // Reports
  { resource: 'reports', action: 'view', category: 'reports', description: 'View reports' },
  { resource: 'reports', action: 'create', category: 'reports', description: 'Create reports' },
  { resource: 'reports', action: 'export', category: 'reports', description: 'Export reports' },
  { resource: 'reports', action: 'schedule', category: 'reports', description: 'Schedule reports' },

  // Settings
  { resource: 'settings', action: 'view', category: 'settings', description: 'View settings' },
  { resource: 'settings', action: 'update', category: 'settings', description: 'Update settings' },

  // System
  { resource: 'system', action: 'admin', category: 'system', description: 'System administration' },
  { resource: 'system', action: 'audit', category: 'system', description: 'View audit logs' },
  { resource: 'system', action: 'backup', category: 'system', description: 'Manage backups' },
];

async function seedPermissions() {
  console.log('Seeding permissions...');

  for (const perm of DEFAULT_PERMISSIONS) {
    const name = `${perm.resource}.${perm.action}`;

    await prisma.permission.upsert({
      where: { name },
      update: {
        resource: perm.resource,
        action: perm.action,
        category: perm.category,
        description: perm.description,
      },
      create: {
        name,
        resource: perm.resource,
        action: perm.action,
        category: perm.category,
        description: perm.description,
        isActive: true,
      },
    });
  }

  console.log(`Created/updated ${DEFAULT_PERMISSIONS.length} permissions`);
}

async function assignAdminPermissions() {
  console.log('Assigning permissions to admin user...');

  // Find admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    console.log('No admin user found, skipping permission assignment');
    return;
  }

  // Get all permissions
  const allPermissions = await prisma.permission.findMany();

  // Assign all permissions to admin
  for (const permission of allPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: adminUser.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        permissionId: permission.id,
        grantedBy: adminUser.id,
      },
    });
  }

  console.log(`Assigned ${allPermissions.length} permissions to admin user`);
}

async function main() {
  try {
    await seedPermissions();
    await assignAdminPermissions();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
