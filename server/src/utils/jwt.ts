import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AuthPayload = {
  userId: string;
  role: 'ADMIN' | 'EMPLOYEE';
};

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '1d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as AuthPayload;
}