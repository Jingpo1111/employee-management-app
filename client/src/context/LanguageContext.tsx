import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'en' | 'km';

const languageStorageKey = 'employee-management-language';

const translations = {
  en: {
    'nav.overview': 'Overview',
    'nav.employees': 'Employees',
    'nav.attendance': 'Attendance',
    'nav.qrAccess': 'QR Access',
    'nav.analytics': 'Analytics',
    'nav.profile': 'Profile',
    'nav.workspace': 'Workspace',
    'nav.overviewCaption': 'Pulse and priorities',
    'nav.employeesCaption': 'Directory and actions',
    'nav.attendanceCaption': 'Daily records',
    'nav.qrCaption': 'Daily scan control',
    'nav.analyticsCaption': 'Signals and trends',
    'nav.profileCaption': 'Personal details',
    'nav.workspaceCaption': 'Tasks and focus',
    'shell.adminEyebrow': 'Operations command',
    'shell.employeeEyebrow': 'Personal workspace',
    'shell.brand': 'People command',
    'shell.adminFlow': 'Admin flow',
    'shell.employeeFlow': 'Employee flow',
    'shell.quickFind': 'Quick find',
    'shell.systemAdmin': 'System Admin',
    'language.toggle': 'ភាសាខ្មែរ',
    'attendance.title': 'Daily attendance records',
    'attendance.description': 'Select a day to review every employee attendance status, scan time, and performance score.',
    'attendance.date': 'Attendance date',
    'attendance.employee': 'Employee',
    'attendance.department': 'Department',
    'attendance.checkIn': 'Check-in',
    'attendance.status': 'Status',
    'attendance.performance': 'Performance',
    'attendance.note': 'Note',
    'attendance.noCheckIn': 'No check-in',
    'attendance.noNote': 'No note',
    'attendance.loading': 'Loading attendance records...',
    'employee.dashboard': 'My dashboard',
    'employee.welcome': 'Welcome back',
    'employee.dashboardDescription': 'Your personal dashboard shows performance, attendance, active work, and admin messages.',
    'employee.performanceScore': 'Performance score',
    'employee.attendanceRate': 'Attendance rate',
    'employee.completedTasks': 'Completed tasks',
    'employee.unreadMessages': 'Unread messages',
    'employee.attendance': 'Attendance',
    'employee.currentTasks': 'Current tasks',
    'employee.messages': 'Messages from admin',
    'employee.new': 'New',
    'status.PRESENT': 'Present',
    'status.LATE': 'Late',
    'status.REMOTE': 'Remote',
    'status.LEAVE': 'Leave',
    'status.ABSENT': 'Absent',
    'status.NOT_SCANNED': 'Not scanned'
  },
  km: {
    'nav.overview': 'ទិដ្ឋភាពទូទៅ',
    'nav.employees': 'បុគ្គលិក',
    'nav.attendance': 'វត្តមាន',
    'nav.qrAccess': 'QR ចូលវត្តមាន',
    'nav.analytics': 'វិភាគ',
    'nav.profile': 'ប្រវត្តិរូប',
    'nav.workspace': 'ការងារ',
    'nav.overviewCaption': 'ស្ថានភាព និងអាទិភាព',
    'nav.employeesCaption': 'បញ្ជី និងសកម្មភាព',
    'nav.attendanceCaption': 'កំណត់ត្រាប្រចាំថ្ងៃ',
    'nav.qrCaption': 'គ្រប់គ្រងស្កេនប្រចាំថ្ងៃ',
    'nav.analyticsCaption': 'សញ្ញា និងនិន្នាការ',
    'nav.profileCaption': 'ព័ត៌មានផ្ទាល់ខ្លួន',
    'nav.workspaceCaption': 'ភារកិច្ច និងការផ្តោត',
    'shell.adminEyebrow': 'ផ្ទាំងគ្រប់គ្រងប្រតិបត្តិការ',
    'shell.employeeEyebrow': 'កន្លែងធ្វើការផ្ទាល់ខ្លួន',
    'shell.brand': 'គ្រប់គ្រងបុគ្គលិក',
    'shell.adminFlow': 'មុខងារអ្នកគ្រប់គ្រង',
    'shell.employeeFlow': 'មុខងារបុគ្គលិក',
    'shell.quickFind': 'ស្វែងរករហ័ស',
    'shell.systemAdmin': 'អ្នកគ្រប់គ្រងប្រព័ន្ធ',
    'language.toggle': 'English',
    'attendance.title': 'កំណត់ត្រាវត្តមានប្រចាំថ្ងៃ',
    'attendance.description': 'ជ្រើសរើសថ្ងៃ ដើម្បីមើលស្ថានភាពវត្តមាន ម៉ោងស្កេន និងពិន្ទុការងាររបស់បុគ្គលិកទាំងអស់។',
    'attendance.date': 'កាលបរិច្ឆេទវត្តមាន',
    'attendance.employee': 'បុគ្គលិក',
    'attendance.department': 'ផ្នែក',
    'attendance.checkIn': 'ម៉ោងចូល',
    'attendance.status': 'ស្ថានភាព',
    'attendance.performance': 'ពិន្ទុការងារ',
    'attendance.note': 'ចំណាំ',
    'attendance.noCheckIn': 'មិនទាន់ស្កេន',
    'attendance.noNote': 'គ្មានចំណាំ',
    'attendance.loading': 'កំពុងផ្ទុកកំណត់ត្រាវត្តមាន...',
    'employee.dashboard': 'ផ្ទាំងរបស់ខ្ញុំ',
    'employee.welcome': 'សូមស្វាគមន៍',
    'employee.dashboardDescription': 'ផ្ទាំងផ្ទាល់ខ្លួនបង្ហាញពិន្ទុការងារ វត្តមាន ការងារកំពុងធ្វើ និងសារពីអ្នកគ្រប់គ្រង។',
    'employee.performanceScore': 'ពិន្ទុការងារ',
    'employee.attendanceRate': 'អត្រាវត្តមាន',
    'employee.completedTasks': 'ភារកិច្ចបានបញ្ចប់',
    'employee.unreadMessages': 'សារមិនទាន់អាន',
    'employee.attendance': 'វត្តមាន',
    'employee.currentTasks': 'ភារកិច្ចបច្ចុប្បន្ន',
    'employee.messages': 'សារពីអ្នកគ្រប់គ្រង',
    'employee.new': 'ថ្មី',
    'status.PRESENT': 'មកទាន់ម៉ោង',
    'status.LATE': 'យឺត',
    'status.REMOTE': 'ធ្វើការពីចម្ងាយ',
    'status.LEAVE': 'ច្បាប់',
    'status.ABSENT': 'អវត្តមាន',
    'status.NOT_SCANNED': 'មិនទាន់ស្កេន'
  }
} as const;

type TranslationKey = keyof typeof translations.en;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(languageStorageKey);
    return stored === 'km' ? 'km' : 'en';
  });

  useEffect(() => {
    localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language === 'km' ? 'km' : 'en';
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: setLanguageState,
    t: (key) => translations[language][key] || translations.en[key]
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}
