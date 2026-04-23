import { Router } from 'express';
import {
  getAttendance,
  getDashboard,
  getNotifications,
  getProfile,
  getTasks,
  updateProfile
} from '../controllers/employeeController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('EMPLOYEE'));
router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/attendance', getAttendance);
router.get('/tasks', getTasks);
router.get('/notifications', getNotifications);

export default router;