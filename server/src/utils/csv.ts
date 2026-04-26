import { stringify } from 'csv-stringify/sync';

export function generateEmployeeCsv(rows: Array<Record<string, unknown>>) {
  return stringify(rows, { header: true });
}

export function generateAttendanceSummaryCsv(rows: Array<Record<string, unknown>>) {
  return stringify(rows, { header: true });
}
