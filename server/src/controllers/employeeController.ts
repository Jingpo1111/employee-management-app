import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { getEmployeeDashboard } from '../services/analyticsService.js';

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

  const data = await getEmployeeDashboard(auth.userId);
  if (!data) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Employee profile not found.' });
  }

  return res.json(data);
}

export async function getProfile(req: Request, res: Response) {
  const auth = req.auth!;
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