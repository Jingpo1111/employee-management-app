import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { getEmployeeDashboard } from '../services/analyticsService.js';
import { reconcileEmployeePerformance, reconcileEmployeePerformanceForUser } from '../services/attendancePolicyService.js';
import { sendTelegramAttendanceMessage } from '../services/telegramService.js';
import { dateKeyToDate, getCheckInTimeLabel, getDateKeyInTimezone, getQrAttendanceStatus } from '../utils/date.js';

const profileSchema = z.object({
  fullName: z.string().min(2),
  title: z.string().min(2),
  phone: z.string().optional().or(z.literal('')),
  location: z.string().min(2),
  bio: z.string().optional().or(z.literal('')),
  avatar: z.string().url().optional().or(z.literal(''))
});

export async function getDashboard(req: Request, res: Response) {
  const auth = req.auth;
  if (!auth) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required.' });
  }

  await reconcileEmployeePerformanceForUser(auth.userId);
  const data = await getEmployeeDashboard(auth.userId);
  if (!data) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Employee profile not found.' });
  }

  return res.json(data);
}

export async function getProfile(req: Request, res: Response) {
  const auth = req.auth!;
  await reconcileEmployeePerformanceForUser(auth.userId);
  const employee = await prisma.employee.findUnique({ where: { userId: auth.userId }, include: { user: { select: { email: true } } } });

  if (!employee) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Employee profile not found.' });
  }

  return res.json(employee);
}

export async function updateProfile(req: Request, res: Response) {
  const auth = req.auth!;
  const input = profileSchema.parse(req.body);

  const employee = await prisma.employee.update({
    where: { userId: auth.userId },
    data: {
      fullName: input.fullName,
      title: input.title,
      phone: input.phone || null,
      location: input.location,
      bio: input.bio || null,
      avatar: input.avatar || null
    },
    include: { user: { select: { email: true } } }
  });

  return res.json(employee);
}

export async function getAttendance(req: Request, res: Response) {
  const auth = req.auth!;
  await reconcileEmployeePerformanceForUser(auth.userId);
  const attendance = await prisma.attendanceRecord.findMany({
    where: { employee: { userId: auth.userId } },
    orderBy: { date: 'desc' }
  });

  return res.json(attendance);
}

export async function getTasks(req: Request, res: Response) {
  const auth = req.auth!;
  const tasks = await prisma.task.findMany({
    where: { employee: { userId: auth.userId } },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }]
  });

  return res.json(tasks);
}

export async function getNotifications(req: Request, res: Response) {
  const auth = req.auth!;
  const notifications = await prisma.notification.findMany({
    where: { employee: { userId: auth.userId } },
    orderBy: { createdAt: 'desc' }
  });

  return res.json(notifications);
}

export async function getQrScanStatus(req: Request, res: Response) {
  const token = String(req.params.token);
  const dateKey = getDateKeyInTimezone();

  const qrCode = await prisma.dailyQrCode.findUnique({
    where: { token }
  });

  if (!qrCode) {
    return res.status(StatusCodes.NOT_FOUND).json({ valid: false, message: 'QR code was not found.' });
  }

  if (qrCode.dateKey !== dateKey) {
    return res.status(StatusCodes.BAD_REQUEST).json({ valid: false, message: 'This QR code is no longer valid for today.' });
  }

  if (!qrCode.isActive) {
    return res.status(StatusCodes.BAD_REQUEST).json({ valid: false, message: 'This QR code has been paused by admin.' });
  }

  return res.json({
    valid: true,
    dateKey,
    message: 'QR code is valid for today.',
    qrCode: {
      id: qrCode.id,
      dateKey: qrCode.dateKey,
      isActive: qrCode.isActive
    }
  });
}

export async function claimQrAttendance(req: Request, res: Response) {
  const auth = req.auth!;
  const token = String(req.params.token);
  const dateKey = getDateKeyInTimezone();

  const qrCode = await prisma.dailyQrCode.findUnique({ where: { token } });
  if (!qrCode) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'QR code was not found.' });
  }

  if (qrCode.dateKey !== dateKey || !qrCode.isActive) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'This QR code is not valid right now.' });
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: auth.userId }
  });

  if (!employee) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Employee profile not found.' });
  }

  const attendanceDate = dateKeyToDate(dateKey);
  const checkInTime = getCheckInTimeLabel();
  const attendanceStatus = getQrAttendanceStatus(checkInTime);
  const existingLog = await prisma.qrAttendanceLog.findUnique({
    where: {
      dailyQrCodeId_employeeId: {
        dailyQrCodeId: qrCode.id,
        employeeId: employee.id
      }
    }
  });

  const attendance = await prisma.attendanceRecord.upsert({
    where: {
      employeeId_date: {
        employeeId: employee.id,
        date: attendanceDate
      }
    },
    update: {
      status: existingLog ? undefined : attendanceStatus,
      checkIn: existingLog ? undefined : checkInTime
    },
    create: {
      employeeId: employee.id,
      date: attendanceDate,
      status: attendanceStatus,
      checkIn: checkInTime
    }
  });

  let telegramNotification: { sent: boolean; reason?: string } = { sent: false };

  if (!existingLog) {
    await prisma.qrAttendanceLog.create({
      data: {
        dailyQrCodeId: qrCode.id,
        employeeId: employee.id,
        source: 'telegram-scan'
      }
    });
  }

  const performanceScore = await reconcileEmployeePerformance(employee.id);

  if (!existingLog) {
    await prisma.notification.create({
      data: {
        employeeId: employee.id,
        title: 'Attendance scan successful',
        message: `Your ${attendance.status.toLowerCase()} check-in was recorded at ${attendance.checkIn}. Performance is now ${performanceScore}%.`
      }
    });

    try {
      telegramNotification = await sendTelegramAttendanceMessage({
        employeeName: employee.fullName,
        employeeCode: employee.employeeCode,
        dateKey,
        checkIn: attendance.checkIn,
        attendanceStatus: attendance.status,
        performanceScore,
        alreadyClaimed: false
      });
    } catch (error) {
      console.error(error);
      telegramNotification = {
        sent: false,
        reason: error instanceof Error ? error.message : 'Telegram notification failed.'
      };
    }
  } else {
    telegramNotification = {
      sent: false,
      reason: 'Telegram notification already sent for this employee today.'
    };
  }

  return res.json({
    message: existingLog ? 'You were already checked in for today.' : 'Attendance recorded successfully.',
    attendance,
    alreadyClaimed: Boolean(existingLog),
    performanceScore,
    telegramNotification
  });
}
