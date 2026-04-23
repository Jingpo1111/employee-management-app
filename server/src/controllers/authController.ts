import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { signToken } from '../utils/jwt.js';
import { employeeSelect } from '../services/analyticsService.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { employee: { select: employeeSelect } }
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid email or password.' });
  }

  const token = signToken({ userId: user.id, role: user.role });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      employee: user.employee
    }
  });
}

export async function me(req: Request, res: Response) {
  const auth = req.auth;
  if (!auth) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required.' });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: { employee: { select: employeeSelect } }
  });

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found.' });
  }

  return res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    employee: user.employee
  });
}