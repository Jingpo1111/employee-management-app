import { Router } from 'express';
import {
  claimQrAttendance,
  getAttendance,
  getDashboard,
  getNotifications,
  getProfile,
  getQrScanStatus,
  getTasks,
  updateProfile
} from '../controllers/employeeController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/scan/:token', getQrScanStatus);
router.use(requireAuth, requireRole('EMPLOYEE'));
router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/attendance', getAttendance);
router.get('/tasks', getTasks);
router.get('/notifications', getNotifications);
router.post('/scan/:token/claim', claimQrAttendance);

export default router;
