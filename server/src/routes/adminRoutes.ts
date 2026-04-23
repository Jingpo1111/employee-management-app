import { Router } from 'express';
import {
  createEmployee,
  deleteEmployee,
  exportEmployees,
  getDashboard,
  getEmployeeById,
  listEmployees,
  updateEmployee,
  updatePermissions
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));
router.get('/dashboard', getDashboard);
router.get('/employees/export', exportEmployees);
router.get('/employees', listEmployees);
router.get('/employees/:id', getEmployeeById);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.patch('/employees/:id/permissions', updatePermissions);
router.delete('/employees/:id', deleteEmployee);

export default router;