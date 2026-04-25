import { prisma } from '../config/prisma.js';
import {
  dateKeyToDate,
  dateToDateKey,
  eachDateKey,
  getDateKeyInTimezone,
  getMonthStartDateKey,
  getPreviousDateKey,
  isWeekdayDateKey
} from '../utils/date.js';

const ABSENT_PENALTY = 1;
const LATE_PENALTY = 0.5;
type AttendanceStatusValue = 'PRESENT' | 'LATE' | 'REMOTE' | 'LEAVE' | 'ABSENT';

function getPolicyWindow(startDate: Date) {
  const todayKey = getDateKeyInTimezone();
  const monthStartKey = getMonthStartDateKey(todayKey);
  const startKey = dateToDateKey(startDate) > monthStartKey ? dateToDateKey(startDate) : monthStartKey;
  const yesterdayKey = getPreviousDateKey(todayKey);

  return {
    todayKey,
    monthStartKey,
    startKey,
    yesterdayKey
  };
}

function calculateMonthlyScore(records: Array<{ status: AttendanceStatusValue }>) {
  const penalty = records.reduce((total, record) => {
    if (record.status === 'ABSENT') {
      return total + ABSENT_PENALTY;
    }

    if (record.status === 'LATE') {
      return total + LATE_PENALTY;
    }

    return total;
  }, 0);

  return Math.max(0, Math.min(100, Number((100 - penalty).toFixed(1))));
}

export async function reconcileEmployeePerformance(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, startDate: true }
  });

  if (!employee) {
    return null;
  }

  const { todayKey, monthStartKey, startKey, yesterdayKey } = getPolicyWindow(employee.startDate);
  const canCreateMissedDays = startKey <= yesterdayKey;
  const existingRecords = await prisma.attendanceRecord.findMany({
    where: {
      employeeId,
      date: {
        gte: dateKeyToDate(monthStartKey),
        lte: dateKeyToDate(todayKey)
      }
    },
    select: {
      date: true,
      status: true
    }
  });

  const existingDateKeys = new Set(existingRecords.map((record) => dateToDateKey(record.date)));
  const missedDateKeys = canCreateMissedDays
    ? eachDateKey(startKey, yesterdayKey).filter((dateKey) => isWeekdayDateKey(dateKey) && !existingDateKeys.has(dateKey))
    : [];

  if (missedDateKeys.length) {
    await prisma.attendanceRecord.createMany({
      data: missedDateKeys.map((dateKey) => ({
        employeeId,
        date: dateKeyToDate(dateKey),
        status: 'ABSENT',
        note: 'Auto-marked absent: no QR check-in recorded.'
      })),
      skipDuplicates: true
    });
  }

  const monthlyRecords = missedDateKeys.length
    ? await prisma.attendanceRecord.findMany({
        where: {
          employeeId,
          date: {
            gte: dateKeyToDate(monthStartKey),
            lte: dateKeyToDate(todayKey)
          }
        },
        select: { status: true }
      })
    : existingRecords;
  const performanceScore = calculateMonthlyScore(monthlyRecords as Array<{ status: AttendanceStatusValue }>);

  await prisma.employee.update({
    where: { id: employeeId },
    data: { performanceScore }
  });

  return performanceScore;
}

export async function reconcileEmployeePerformanceForUser(userId: string) {
  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: { id: true }
  });

  if (!employee) {
    return null;
  }

  return reconcileEmployeePerformance(employee.id);
}

export async function reconcileAllEmployeePerformance() {
  const employees = await prisma.employee.findMany({ select: { id: true } });
  await Promise.all(employees.map((employee) => reconcileEmployeePerformance(employee.id)));
}
