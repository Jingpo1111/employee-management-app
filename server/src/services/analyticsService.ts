import { prisma } from '../config/prisma.js';

export async function getAdminDashboardMetrics() {
  const totalEmployees = await prisma.employee.count();
  const activeEmployees = await prisma.employee.count({ where: { status: 'Active' } });
  const pendingReviews = await prisma.employee.count({ where: { performanceScore: { lt: 85 } } });
  const unreadMessages = await prisma.notification.count({ where: { read: false } });

  const attendanceRaw = await prisma.attendanceRecord.groupBy({
    by: ['date', 'status'],
    _count: { _all: true },
    orderBy: { date: 'asc' }
  });

  const attendanceTrend = attendanceRaw.map((entry: { date: Date; status: string; _count: { _all: number } }) => ({
    date: entry.date.toISOString().slice(0, 10),
    status: entry.status,
    count: entry._count._all
  }));

  const departmentRaw = await prisma.employee.groupBy({
    by: ['department'],
    _count: { _all: true },
    orderBy: { department: 'asc' }
  });

  const employeesByDepartment = departmentRaw.map((entry: { department: string; _count: { _all: number } }) => ({
    department: entry.department,
    count: entry._count._all
  }));

  return {
    stats: [
      { label: 'Total Employees', value: totalEmployees, delta: '+8% vs last month' },
      { label: 'Active Staff', value: activeEmployees, delta: 'Stable this week' },
      { label: 'Needs Attention', value: pendingReviews, delta: 'Below target performance' },
      { label: 'Unread Notifications', value: unreadMessages, delta: 'Broadcasts and alerts' }
    ],
    attendanceTrend,
    employeesByDepartment
  };
}

export async function getEmployeeDashboard(userId: string) {
  const employee = await prisma.employee.findUnique({
    where: { userId },
    include: {
      attendanceRecords: { orderBy: { date: 'desc' }, take: 5 },
      tasks: { orderBy: { dueDate: 'asc' }, take: 5 },
      notifications: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  });

  if (!employee) {
    return null;
  }

  const completedTasks = employee.tasks.filter((task: { status: string }) => task.status === 'DONE').length;

  return {
    overview: {
      name: employee.fullName,
      title: employee.title,
      department: employee.department,
      performanceScore: employee.performanceScore,
      attendanceRate: `${Math.round((employee.attendanceRecords.filter((record: { status: string }) => record.status !== 'ABSENT').length / Math.max(employee.attendanceRecords.length, 1)) * 100)}%`,
      completedTasks
    },
    attendance: employee.attendanceRecords,
    tasks: employee.tasks,
    notifications: employee.notifications,
    profile: employee
  };
}

export const employeeSelect = {
  id: true,
  employeeCode: true,
  fullName: true,
  title: true,
  department: true,
  team: true,
  phone: true,
  location: true,
  status: true,
  bio: true,
  avatar: true,
  startDate: true,
  performanceScore: true,
  managerName: true,
  permissions: true,
  user: {
    select: {
      id: true,
      email: true,
      role: true
    }
  }
};
