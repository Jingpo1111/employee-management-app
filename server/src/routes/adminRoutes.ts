import { Router } from 'express';
import {
  createEmployee,
  deleteEmployee,
  exportEmployees,
  getAdminNotifications,
  getDashboard,
  getDailyQrCode,
  getDailyAttendance,
  getEmployeeById,
  listEmployees,
  regenerateDailyQrCode,
  updateEmployee,
  updateDailyQrCodeStatus,
  updatePermissions
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));
router.get('/dashboard', getDashboard);
router.get('/notifications', getAdminNotifications);
router.get('/attendance', getDailyAttendance);
router.get('/qr-code', getDailyQrCode);
router.post('/qr-code', regenerateDailyQrCode);
router.patch('/qr-code', updateDailyQrCodeStatus);
router.get('/employees/export', exportEmployees);
router.get('/employees', listEmployees);
router.get('/employees/:id', getEmployeeById);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.patch('/employees/:id/permissions', updatePermissions);
router.delete('/employees/:id', deleteEmployee);

export default router;
