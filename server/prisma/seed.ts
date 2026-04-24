import bcrypt from 'bcryptjs';
import { PrismaClient, AttendanceStatus, TaskStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const legacyAdminEmail = 'admin@acmehr.com';

type EmployeeSeed = {
  employeeCode: string;
  fullName: string;
  email: string;
  title: string;
  department: string;
  team: string;
  phone: string;
  location: string;
  status: string;
  bio: string;
  avatar: string;
  startDate: Date;
  performanceScore: number;
  managerName: string;
  permissions: string[];
  attendance: Array<{
    date: Date;
    checkIn?: string;
    checkOut?: string;
    status: AttendanceStatus;
    hoursWorked?: number;
    note?: string;
  }>;
  tasks: Array<{
    title: string;
    description: string;
    priority: string;
    dueDate: Date;
    status: TaskStatus;
  }>;
  notifications: Array<{
    title: string;
    message: string;
  }>;
};

const employeeSeeds: EmployeeSeed[] = [
  {
    employeeCode: 'EMP-001',
    fullName: 'Sokha Chan',
    email: 'sokha.chan@acmehr.com',
    title: 'Product Designer',
    department: 'Design',
    team: 'Experience',
    phone: '+855 12 345 678',
    location: 'Phnom Penh',
    status: 'Active',
    bio: 'Owns the design system and cross-platform UX consistency.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    startDate: new Date('2023-06-12'),
    performanceScore: 91,
    managerName: 'Dara Lim',
    permissions: ['profile:view', 'profile:edit', 'tasks:view', 'attendance:view'],
    attendance: [
      { date: new Date('2026-04-19'), checkIn: '08:53', checkOut: '17:31', status: AttendanceStatus.PRESENT, hoursWorked: 8.2 },
      { date: new Date('2026-04-20'), checkIn: '09:05', checkOut: '18:01', status: AttendanceStatus.REMOTE, hoursWorked: 8.4 },
      { date: new Date('2026-04-21'), checkIn: '08:47', checkOut: '17:28', status: AttendanceStatus.PRESENT, hoursWorked: 8.1 },
      { date: new Date('2026-04-22'), checkIn: '09:12', checkOut: '17:55', status: AttendanceStatus.PRESENT, hoursWorked: 7.9 }
    ],
    tasks: [
      { title: 'Refresh onboarding flow', description: 'Ship simplified empty states and mobile navigation.', priority: 'High', dueDate: new Date('2026-04-29'), status: TaskStatus.IN_PROGRESS },
      { title: 'Design review for payroll widgets', description: 'Prepare handoff for analytics card refinement.', priority: 'Medium', dueDate: new Date('2026-05-02'), status: TaskStatus.REVIEW }
    ],
    notifications: [
      { title: 'Quarterly review scheduled', message: 'Your Q2 review is scheduled for April 30 at 10:00 AM.' },
      { title: 'Policy update', message: 'Remote work handbook was updated. Please review section 3.2.' }
    ]
  },
  {
    employeeCode: 'EMP-002',
    fullName: 'Rina Vann',
    email: 'rina.vann@acmehr.com',
    title: 'Software Engineer',
    department: 'Engineering',
    team: 'Platform',
    phone: '+855 96 444 111',
    location: 'Siem Reap',
    status: 'Active',
    bio: 'Builds internal admin tooling and workflow automation.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    startDate: new Date('2022-09-02'),
    performanceScore: 96,
    managerName: 'Dara Lim',
    permissions: ['profile:view', 'profile:edit', 'tasks:view', 'attendance:view'],
    attendance: [
      { date: new Date('2026-04-19'), checkIn: '08:40', checkOut: '17:45', status: AttendanceStatus.PRESENT, hoursWorked: 8.6 },
      { date: new Date('2026-04-20'), checkIn: '08:58', checkOut: '17:44', status: AttendanceStatus.PRESENT, hoursWorked: 8.3 },
      { date: new Date('2026-04-21'), checkIn: '09:15', checkOut: '18:12', status: AttendanceStatus.REMOTE, hoursWorked: 8.1 },
      { date: new Date('2026-04-22'), status: AttendanceStatus.LEAVE, note: 'Medical leave' }
    ],
    tasks: [
      { title: 'Refactor auth middleware', description: 'Reduce duplication across admin and employee APIs.', priority: 'High', dueDate: new Date('2026-04-25'), status: TaskStatus.IN_PROGRESS },
      { title: 'Implement audit trail API', description: 'Capture employee mutations for compliance reporting.', priority: 'High', dueDate: new Date('2026-05-04'), status: TaskStatus.TODO }
    ],
    notifications: [
      { title: 'Deployment window', message: 'Platform maintenance window starts Friday at 8:00 PM.' }
    ]
  },
  {
    employeeCode: 'EMP-003',
    fullName: 'Mony Roth',
    email: 'mony.roth@acmehr.com',
    title: 'HR Business Partner',
    department: 'People Ops',
    team: 'Operations',
    phone: '+855 88 222 909',
    location: 'Phnom Penh',
    status: 'Probation',
    bio: 'Owns people operations workflows and onboarding readiness.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    startDate: new Date('2026-01-10'),
    performanceScore: 84,
    managerName: 'Dara Lim',
    permissions: ['profile:view', 'profile:edit', 'tasks:view', 'attendance:view'],
    attendance: [
      { date: new Date('2026-04-19'), checkIn: '09:02', checkOut: '17:18', status: AttendanceStatus.PRESENT, hoursWorked: 7.8 },
      { date: new Date('2026-04-20'), checkIn: '09:08', checkOut: '17:33', status: AttendanceStatus.PRESENT, hoursWorked: 7.9 },
      { date: new Date('2026-04-21'), checkIn: '08:55', checkOut: '17:41', status: AttendanceStatus.PRESENT, hoursWorked: 8.2 },
      { date: new Date('2026-04-22'), checkIn: '09:10', checkOut: '17:20', status: AttendanceStatus.PRESENT, hoursWorked: 7.7 }
    ],
    tasks: [
      { title: 'Prepare onboarding deck', description: 'Create a concise onboarding deck for new hires.', priority: 'Medium', dueDate: new Date('2026-04-28'), status: TaskStatus.DONE },
      { title: 'Complete handbook audit', description: 'Review employee handbook changes before export.', priority: 'Medium', dueDate: new Date('2026-05-01'), status: TaskStatus.IN_PROGRESS }
    ],
    notifications: [
      { title: 'Reminder', message: 'Finalize handbook review comments before Monday.' }
    ]
  }
];

async function upsertEmployee(seed: EmployeeSeed, passwordHash: string) {
  const user = await prisma.user.upsert({
    where: { email: seed.email },
    update: {
      passwordHash,
      role: 'EMPLOYEE'
    },
    create: {
      email: seed.email,
      passwordHash,
      role: 'EMPLOYEE'
    }
  });

  await prisma.employee.upsert({
    where: { employeeCode: seed.employeeCode },
    update: {
      userId: user.id,
      fullName: seed.fullName,
      title: seed.title,
      department: seed.department,
      team: seed.team,
      phone: seed.phone,
      location: seed.location,
      status: seed.status,
      bio: seed.bio,
      avatar: seed.avatar,
      startDate: seed.startDate,
      performanceScore: seed.performanceScore,
      managerName: seed.managerName,
      permissions: seed.permissions,
      attendanceRecords: {
        deleteMany: {},
        create: seed.attendance
      },
      tasks: {
        deleteMany: {},
        create: seed.tasks
      },
      notifications: {
        deleteMany: {},
        create: seed.notifications
      }
    },
    create: {
      userId: user.id,
      employeeCode: seed.employeeCode,
      fullName: seed.fullName,
      title: seed.title,
      department: seed.department,
      team: seed.team,
      phone: seed.phone,
      location: seed.location,
      status: seed.status,
      bio: seed.bio,
      avatar: seed.avatar,
      startDate: seed.startDate,
      performanceScore: seed.performanceScore,
      managerName: seed.managerName,
      permissions: seed.permissions,
      attendanceRecords: {
        create: seed.attendance
      },
      tasks: {
        create: seed.tasks
      },
      notifications: {
        create: seed.notifications
      }
    }
  });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'phaijingpo016441653@gmail.com';
  const configuredAdminPassword = process.env.ADMIN_PASSWORD;
  const employeePasswordHash = await bcrypt.hash('Employee@123', 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  const legacyAdmin = adminEmail === legacyAdminEmail ? null : await prisma.user.findUnique({ where: { email: legacyAdminEmail } });
  const shouldSetAdminPassword = Boolean(configuredAdminPassword) || (!existingAdmin && !legacyAdmin);
  const generatedAdminPassword = shouldSetAdminPassword && !configuredAdminPassword ? randomBytes(18).toString('base64url') : null;
  const adminPasswordHash = shouldSetAdminPassword ? await bcrypt.hash(configuredAdminPassword || generatedAdminPassword!, 10) : null;

  if (!configuredAdminPassword) {
    console.warn('ADMIN_PASSWORD is not set. Existing admin password will be preserved if possible.');
    if (generatedAdminPassword) {
      console.warn(`Temporary admin password for this new database: ${generatedAdminPassword}`);
      console.warn('Set ADMIN_PASSWORD in Render and redeploy to replace this temporary password.');
    }
  }

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        role: 'ADMIN',
        ...(adminPasswordHash ? { passwordHash: adminPasswordHash } : {})
      }
    });
  } else if (legacyAdmin) {
    await prisma.user.update({
      where: { id: legacyAdmin.id },
      data: {
        email: adminEmail,
        role: 'ADMIN',
        ...(adminPasswordHash ? { passwordHash: adminPasswordHash } : {})
      }
    });
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash!,
        role: 'ADMIN'
      }
    });
  }

  for (const employee of employeeSeeds) {
    await upsertEmployee(employee, employeePasswordHash);
  }

  console.log('Seed complete.');
  console.log(`Admin login email: ${adminEmail}`);
  console.log('Employee login email: sokha.chan@acmehr.com');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
