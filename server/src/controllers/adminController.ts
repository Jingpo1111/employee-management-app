import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { employeeSelect, getAdminDashboardMetrics } from '../services/analyticsService.js';
import { reconcileAllEmployeePerformance, reconcileEmployeePerformance } from '../services/attendancePolicyService.js';
import { createQrToken, dateKeyToDate, getDateKeyInTimezone } from '../utils/date.js';
import { generateEmployeeCsv } from '../utils/csv.js';
import { generateEmployeePdf } from '../utils/pdf.js';

const employeeSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  title: z.string().min(2),
  department: z.string().min(2),
  team: z.string().min(2),
  phone: z.string().optional().or(z.literal('')),
  location: z.string().min(2),
  status: z.string().min(2),
  bio: z.string().optional().or(z.literal('')),
  avatar: z.string().url().optional().or(z.literal('')),
  performanceScore: z.number().min(0).max(100),
  managerName: z.string().optional().or(z.literal('')),
  permissions: z.array(z.string()).min(1),
  startDate: z.string(),
  password: z.string().min(8)
});

const permissionSchema = z.object({
  permissions: z.array(z.string()).min(1)
});

const qrToggleSchema = z.object({
  isActive: z.boolean()
});

function buildEmployeeWhere(req: Request) {
  const { search, department, status } = req.query;

  return {
    AND: [
      department ? { department: String(department) } : {},
      status ? { status: String(status) } : {},
      search
        ? {
            OR: [
              { fullName: { contains: String(search), mode: 'insensitive' as const } },
              { title: { contains: String(search), mode: 'insensitive' as const } },
              { department: { contains: String(search), mode: 'insensitive' as const } },
              { employeeCode: { contains: String(search), mode: 'insensitive' as const } },
              { user: { is: { email: { contains: String(search), mode: 'insensitive' as const } } } }
            ]
          }
        : {}
    ]
  };
}

export async function getDashboard(req: Request, res: Response) {
  await reconcileAllEmployeePerformance();
  const metrics = await getAdminDashboardMetrics();
  return res.json(metrics);
}

export async function getDailyQrCode(_req: Request, res: Response) {
  const dateKey = getDateKeyInTimezone();
  const qrCode = await prisma.dailyQrCode.findUnique({
    where: { dateKey },
    include: {
      qrLogs: {
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              employeeCode: true,
              title: true,
              department: true,
              performanceScore: true
            }
          }
        },
        orderBy: { scannedAt: 'desc' }
      }
    }
  });

  const attendanceByEmployeeId = new Map<string, { checkIn: string | null; checkOut: string | null; status: string; note: string | null }>();

  if (qrCode?.qrLogs.length) {
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        date: dateKeyToDate(dateKey),
        employeeId: { in: qrCode.qrLogs.map((log) => log.employeeId) }
      },
      select: {
        employeeId: true,
        checkIn: true,
        checkOut: true,
        status: true,
        note: true
      }
    });

    attendanceRecords.forEach((record) => {
      attendanceByEmployeeId.set(record.employeeId, {
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        note: record.note
      });
    });
  }

  return res.json({
    dateKey,
    qrCode: qrCode
      ? {
          ...qrCode,
          qrLogs: qrCode.qrLogs.map((log) => ({
            ...log,
            attendance: attendanceByEmployeeId.get(log.employeeId) || null
          }))
        }
      : null,
    stats: {
      scanCount: qrCode?.qrLogs.length || 0
    }
  });
}

export async function regenerateDailyQrCode(_req: Request, res: Response) {
  const dateKey = getDateKeyInTimezone();
  const qrCode = await prisma.dailyQrCode.upsert({
    where: { dateKey },
    update: {
      token: createQrToken(),
      isActive: true
    },
    create: {
      dateKey,
      token: createQrToken(),
      isActive: true
    }
  });

  return res.status(StatusCodes.CREATED).json(qrCode);
}

export async function updateDailyQrCodeStatus(req: Request, res: Response) {
  const dateKey = getDateKeyInTimezone();
  const input = qrToggleSchema.parse(req.body);

  const existing = await prisma.dailyQrCode.findUnique({ where: { dateKey } });
  if (!existing) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Daily QR code has not been generated yet.' });
  }

  const qrCode = await prisma.dailyQrCode.update({
    where: { dateKey },
    data: { isActive: input.isActive }
  });

  return res.json(qrCode);
}

export async function listEmployees(req: Request, res: Response) {
  await reconcileAllEmployeePerformance();
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 8);
  const sortBy = ['fullName', 'department', 'performanceScore', 'startDate', 'status'].includes(String(req.query.sortBy))
    ? String(req.query.sortBy)
    : 'fullName';
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
  const where = buildEmployeeWhere(req);

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      select: employeeSelect,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder }
    }),
    prisma.employee.count({ where })
  ]);

  return res.json({
    data: employees,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
}

export async function getDailyAttendance(req: Request, res: Response) {
  await reconcileAllEmployeePerformance();
  const dateKey = req.query.date ? String(req.query.date) : getDateKeyInTimezone();
  const attendanceDate = dateKeyToDate(dateKey);

  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      employeeCode: true,
      fullName: true,
      title: true,
      department: true,
      team: true,
      performanceScore: true,
      attendanceRecords: {
        where: { date: attendanceDate },
        take: 1
      }
    },
    orderBy: { fullName: 'asc' }
  });

  const records = employees.map((employee) => {
    const attendance = employee.attendanceRecords[0];

    return {
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      title: employee.title,
      department: employee.department,
      team: employee.team,
      performanceScore: employee.performanceScore,
      attendance: attendance
        ? {
            id: attendance.id,
            date: attendance.date,
            checkIn: attendance.checkIn,
            checkOut: attendance.checkOut,
            status: attendance.status,
            note: attendance.note
          }
        : null
    };
  });

  const summary = records.reduce<Record<string, number>>((acc, row) => {
    const status = row.attendance?.status || 'NOT_SCANNED';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return res.json({
    dateKey,
    summary,
    records
  });
}

export async function getEmployeeById(req: Request, res: Response) {
  const employeeId = String(req.params.id);
  await reconcileEmployeePerformance(employeeId);
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: { select: { id: true, email: true, role: true } },
      attendanceRecords: { orderBy: { date: 'desc' }, take: 10 },
      tasks: { orderBy: { dueDate: 'asc' }, take: 10 },
      notifications: { orderBy: { createdAt: 'desc' }, take: 10 }
    }
  });

  if (!employee) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Employee not found.' });
  }

  return res.json(employee);
}

export async function createEmployee(req: Request, res: Response) {
  const input = employeeSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(input.password, 10);

  const latest = await prisma.employee.findFirst({ orderBy: { createdAt: 'desc' } });
  const nextNumber = latest ? Number(latest.employeeCode.split('-')[1]) + 1 : 1;
  const employeeCode = `EMP-${String(nextNumber).padStart(3, '0')}`;

  const employee = await prisma.employee.create({
    data: {
      employeeCode,
      fullName: input.fullName,
      title: input.title,
      department: input.department,
      team: input.team,
      phone: input.phone || null,
      location: input.location,
      status: input.status,
      bio: input.bio || null,
      avatar: input.avatar || null,
      performanceScore: 100,
      managerName: input.managerName || null,
      permissions: input.permissions,
      startDate: new Date(input.startDate),
      user: {
        create: {
          email: input.email,
          passwordHash,
          role: 'EMPLOYEE'
        }
      },
      notifications: {
        create: [
          {
            title: 'Welcome to the platform',
            message: 'Your employee portal is ready. Update your profile and review current tasks.'
          }
        ]
      }
    },
    include: { user: { select: { id: true, email: true, role: true } } }
  });

  return res.status(StatusCodes.CREATED).json(employee);
}

export async function updateEmployee(req: Request, res: Response) {
  const input = employeeSchema.omit({ password: true }).parse(req.body);
  const employeeId = String(req.params.id);

  const existing = await prisma.employee.findUnique({ where: { id: employeeId }, include: { user: true } });
  if (!existing) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Employee not found.' });
  }

  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      fullName: input.fullName,
      title: input.title,
      department: input.department,
      team: input.team,
      phone: input.phone || null,
      location: input.location,
      status: input.status,
      bio: input.bio || null,
      avatar: input.avatar || null,
      performanceScore: input.performanceScore,
      managerName: input.managerName || null,
      permissions: input.permissions,
      startDate: new Date(input.startDate),
      user: {
        update: {
          email: input.email
        }
      }
    },
    include: { user: { select: { id: true, email: true, role: true } } }
  });

  return res.json(employee);
}

export async function deleteEmployee(req: Request, res: Response) {
  const employeeId = String(req.params.id);
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Employee not found.' });
  }

  await prisma.employee.delete({ where: { id: employeeId } });
  return res.status(StatusCodes.NO_CONTENT).send();
}

export async function updatePermissions(req: Request, res: Response) {
  const input = permissionSchema.parse(req.body);
  const employeeId = String(req.params.id);

  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: { permissions: input.permissions },
    include: { user: { select: { id: true, email: true, role: true } } }
  });

  return res.json(employee);
}

export async function exportEmployees(req: Request, res: Response) {
  const format = req.query.format === 'pdf' ? 'pdf' : 'csv';
  const where = buildEmployeeWhere(req);

  const employees = await prisma.employee.findMany({
    where,
    include: { user: { select: { email: true } } },
    orderBy: { fullName: 'asc' }
  });

  const rows = employees.map((employee: (typeof employees)[number]) => ({
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    email: employee.user.email,
    title: employee.title,
    department: employee.department,
    team: employee.team,
    location: employee.location,
    status: employee.status,
    performanceScore: employee.performanceScore
  }));

  if (format === 'pdf') {
    const pdf = await generateEmployeePdf(rows);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="employees.pdf"');
    return res.send(pdf);
  }

  const csv = generateEmployeeCsv(rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
  return res.send(csv);
}
