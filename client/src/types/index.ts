export type Role = 'ADMIN' | 'EMPLOYEE';

export type User = {
  id: string;
  email: string;
  role: Role;
  employee?: Employee;
};

export type Employee = {
  id: string;
  employeeCode: string;
  fullName: string;
  title: string;
  department: string;
  team: string;
  phone?: string | null;
  location: string;
  status: string;
  bio?: string | null;
  avatar?: string | null;
  startDate: string;
  performanceScore: number;
  managerName?: string | null;
  permissions: string[];
  user: {
    id: string;
    email: string;
    role: Role;
  };
};

export type AttendanceRecord = {
  id: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: 'PRESENT' | 'REMOTE' | 'LEAVE' | 'ABSENT';
  hoursWorked?: number | null;
  note?: string | null;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type DashboardStat = {
  label: string;
  value: number | string;
  delta: string;
};

export type AdminDashboardResponse = {
  stats: DashboardStat[];
  attendanceTrend: Array<{ date: string; status: string; count: number }>;
  employeesByDepartment: Array<{ department: string; count: number }>;
};

export type EmployeeDashboardResponse = {
  overview: {
    name: string;
    title: string;
    department: string;
    performanceScore: number;
    attendanceRate: string;
    completedTasks: number;
  };
  attendance: AttendanceRecord[];
  tasks: Task[];
  notifications: Notification[];
  profile: Employee;
};

export type PaginatedEmployees = {
  data: Employee[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};