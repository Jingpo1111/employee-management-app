import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(error);
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || 'Unexpected server error.' });
}