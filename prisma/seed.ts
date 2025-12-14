import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Super Admin user
  const superAdminEmail = 'admin@miegacoan.id';
  const superAdminPassword = 'admin123456';

  // Hash password
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  // Check if super admin already exists
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail }
  });

  if (existingSuperAdmin) {
    console.log('✅ Super admin already exists');
  } else {
    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        employeeId: 'SA001',
        email: superAdminEmail,
        name: 'Super Administrator',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      }
    });

    console.log('✅ Created super admin:', {
      id: superAdmin.id,
      email: superAdmin.email,
      employeeId: superAdmin.employeeId,
      name: superAdmin.name,
      role: superAdmin.role
    });

    // Create user preferences for super admin
    await prisma.userPreference.create({
      data: {
        userId: superAdmin.id,
        language: 'id',
        timezone: 'Asia/Jakarta',
        dateFormat: 'DD/MM/YYYY',
        notifyEmail: true,
        notifyInApp: true,
        theme: 'light'
      }
    });

    console.log('✅ Created user preferences for super admin');
  }

  // Create sample departments if they don't exist
  const departments = [
    {
      code: 'IT',
      name: 'Information Technology',
      description: 'Department responsible for technology infrastructure'
    },
    {
      code: 'HR',
      name: 'Human Resources',
      description: 'Department responsible for employee management'
    },
    {
      code: 'FIN',
      name: 'Finance',
      description: 'Department responsible for financial management'
    }
  ];

  for (const dept of departments) {
    const existingDept = await prisma.department.findUnique({
      where: { code: dept.code }
    });

    if (!existingDept) {
      await prisma.department.create({
        data: dept
      });
      console.log(`✅ Created department: ${dept.name}`);
    }
  }

  // Create sample positions if they don't exist
  const itDept = await prisma.department.findUnique({ where: { code: 'IT' } });
  const hrDept = await prisma.department.findUnique({ where: { code: 'HR' } });
  const finDept = await prisma.department.findUnique({ where: { code: 'FIN' } });

  const positions = [
    { code: 'IT-MGR', name: 'IT Manager', departmentId: itDept?.id, level: 3 },
    { code: 'IT-DEV', name: 'IT Developer', departmentId: itDept?.id, level: 2 },
    { code: 'HR-MGR', name: 'HR Manager', departmentId: hrDept?.id, level: 3 },
    { code: 'HR-STF', name: 'HR Staff', departmentId: hrDept?.id, level: 1 },
    { code: 'FIN-MGR', name: 'Finance Manager', departmentId: finDept?.id, level: 3 },
    { code: 'FIN-STF', name: 'Finance Staff', departmentId: finDept?.id, level: 1 }
  ];

  for (const pos of positions) {
    if (pos.departmentId) {
      const existingPos = await prisma.position.findUnique({
        where: { code: pos.code }
      });

      if (!existingPos) {
        await prisma.position.create({
          data: pos
        });
        console.log(`✅ Created position: ${pos.name}`);
      }
    }
  }

  // Create document categories if they don't exist
  const documentCategories = [
    {
      code: 'SOP',
      name: 'Standard Operating Procedure',
      description: 'Standard operating procedure documents',
      prefix: 'SOP'
    },
    {
      code: 'WI',
      name: 'Work Instruction',
      description: 'Work instruction documents',
      prefix: 'WI'
    },
    {
      code: 'SPEC',
      name: 'Specification',
      description: 'Specification documents',
      prefix: 'SPEC'
    },
    {
      code: 'FORM',
      name: 'Form',
      description: 'Form documents',
      prefix: 'FORM'
    },
    {
      code: 'POL',
      name: 'Policy',
      description: 'Policy documents',
      prefix: 'POL'
    },
    {
      code: 'MAN',
      name: 'Manual',
      description: 'Manual documents',
      prefix: 'MAN'
    },
    {
      code: 'STD',
      name: 'Standard',
      description: 'Standard documents',
      prefix: 'STD'
    }
  ];

  for (const category of documentCategories) {
    const existingCategory = await prisma.documentCategory.findUnique({
      where: { code: category.code }
    });

    if (!existingCategory) {
      await prisma.documentCategory.create({
        data: category
      });
      console.log(`✅ Created document category: ${category.name}`);
    }
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Super Admin Login Details:');
  console.log('   Email:', superAdminEmail);
  console.log('   Password:', superAdminPassword);
  console.log('\n⚠️  Please change the password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });