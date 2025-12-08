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

// Default roles with permissions
const DEFAULT_ROLES = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Full system access',
    level: 100,
    isSystem: true,
    permissions: '*', // All permissions
  },
  {
    code: 'ADMIN',
    name: 'Administrator',
    description: 'Administrative access without system settings',
    level: 90,
    isSystem: true,
    permissions: [
      'documents.*',
      'users.*',
      'roles.read',
      'departments.*',
      'positions.*',
      'approvals.*',
      'reports.*',
      'settings.view',
    ],
  },
  {
    code: 'MANAGER',
    name: 'Manager',
    description: 'Department manager with approval rights',
    level: 70,
    isSystem: false,
    permissions: [
      'documents.create',
      'documents.read',
      'documents.update',
      'documents.approve',
      'documents.reject',
      'documents.distribute',
      'users.read',
      'departments.read',
      'positions.read',
      'approvals.*',
      'reports.view',
      'reports.export',
    ],
  },
  {
    code: 'STAFF',
    name: 'Staff',
    description: 'Regular staff member',
    level: 50,
    isSystem: false,
    permissions: [
      'documents.create',
      'documents.read',
      'documents.update',
      'users.read',
      'departments.read',
      'positions.read',
      'approvals.view',
      'reports.view',
    ],
  },
  {
    code: 'VIEWER',
    name: 'Viewer',
    description: 'Read-only access',
    level: 10,
    isSystem: false,
    permissions: [
      'documents.read',
      'users.read',
      'departments.read',
      'positions.read',
      'reports.view',
    ],
  },
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

async function seedRoles() {
  console.log('Seeding roles...');

  // Get all permissions for assignment
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(allPermissions.map((p) => [p.name, p.id]));

  for (const roleData of DEFAULT_ROLES) {
    // Create or update role
    const role = await prisma.role.upsert({
      where: { code: roleData.code },
      update: {
        name: roleData.name,
        description: roleData.description,
        level: roleData.level,
        isSystem: roleData.isSystem,
      },
      create: {
        code: roleData.code,
        name: roleData.name,
        description: roleData.description,
        level: roleData.level,
        isSystem: roleData.isSystem,
        isActive: true,
      },
    });

    // Delete existing role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Assign permissions
    const permissionIds: string[] = [];

    if (roleData.permissions === '*') {
      // All permissions
      permissionIds.push(...allPermissions.map((p) => p.id));
    } else {
      // Specific permissions
      for (const permPattern of roleData.permissions) {
        if (permPattern.endsWith('.*')) {
          // Wildcard: get all permissions for resource
          const resource = permPattern.replace('.*', '');
          const matchingPerms = allPermissions.filter((p) => p.resource === resource);
          permissionIds.push(...matchingPerms.map((p) => p.id));
        } else {
          // Exact match
          const permId = permissionMap.get(permPattern);
          if (permId) {
            permissionIds.push(permId);
          }
        }
      }
    }

    // Create role permissions
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }

    console.log(`Role "${roleData.name}" created with ${permissionIds.length} permissions`);
  }
}

async function main() {
  try {
    await seedPermissions();
    await seedRoles();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
