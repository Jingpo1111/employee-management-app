import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(error);

  if (error instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: error.issues.map((issue) => issue.message).join(' ')
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return res.status(StatusCodes.CONFLICT).json({
      message: 'A record with this unique value already exists.'
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || 'Unexpected server error.' });
}
