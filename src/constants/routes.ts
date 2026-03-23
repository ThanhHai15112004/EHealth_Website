/**
 * Routes constants - Tất cả route strings được định nghĩa tại đây
 * KHÔNG hard-code route strings trong components
 */

export const ROUTES = {
  // Public routes (không cần đăng nhập)
  PUBLIC: {
    LOGIN: "/login",
    FORGOT_PASSWORD: "/forgot-password",
    OTP: "/otp",
    LANDING: "/landing",
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: "/admin",
    // Quản lý nhân sự
    USERS: "/admin/users",
    USERS_ROLES: "/admin/users/roles",
    DOCTORS: "/admin/doctors",
    // Quản lý bệnh viện
    DEPARTMENTS: "/admin/departments",
    HOSPITALS: "/admin/hospitals",
    TIME_SLOTS: "/admin/hospitals/time-slots",
    SCHEDULES: "/admin/schedules",
    // Kho thuốc
    MEDICINES: "/admin/medicines",
    MEDICINES_IMPORT: "/admin/medicines/import",
    MEDICINES_EXPORT: "/admin/medicines/export",
    MEDICINES_STOCK: "/admin/medicines/stock",
    // Thống kê & Khác
    STATISTICS: "/admin/statistics",
    STATISTICS_REVENUE: "/admin/statistics/revenue",
    ACTIVITY_LOGS: "/admin/activity-logs",
    SETTINGS: "/admin/settings",
  },

  // Portal routes (Doctor, Pharmacist, Receptionist)
  PORTAL: {
    DOCTOR: {
      DASHBOARD: "/portal/doctor",
      APPOINTMENTS: "/portal/doctor/appointments",
      QUEUE: "/portal/doctor/queue",
      EXAMINATION: "/portal/doctor/examination",
      MEDICAL_RECORDS: "/portal/doctor/medical-records",
      PRESCRIPTIONS: "/portal/doctor/prescriptions",
      AI_ASSISTANT: "/portal/doctor/ai-assistant",
      TELEMEDICINE: "/portal/doctor/telemedicine",
      SETTINGS: "/portal/doctor/settings",
    },
    PHARMACIST: {
      DASHBOARD: "/portal/pharmacist",
      PRESCRIPTIONS: "/portal/pharmacist/prescriptions",
      DISPENSING: "/portal/pharmacist/dispensing",
      INVENTORY: "/portal/pharmacist/inventory",
      SETTINGS: "/portal/pharmacist/settings",
    },
    RECEPTIONIST: {
      DASHBOARD: "/portal/receptionist",
      RECEPTION: "/portal/receptionist/reception",
      APPOINTMENTS: "/portal/receptionist/appointments",
      QUEUE: "/portal/receptionist/queue",
      PATIENTS: "/portal/receptionist/patients",
      BILLING: "/portal/receptionist/billing",
      SETTINGS: "/portal/receptionist/settings",
    },
  },
} as const;

// Doctor sidebar menu items
export const DOCTOR_MENU_ITEMS = [
  {
    key: "dashboard",
    href: ROUTES.PORTAL.DOCTOR.DASHBOARD,
    icon: "home",
    label: "Trang chủ",
  },
  {
    key: "appointments",
    href: ROUTES.PORTAL.DOCTOR.APPOINTMENTS,
    icon: "calendar_month",
    label: "Lịch hẹn",
  },
  {
    key: "queue",
    href: ROUTES.PORTAL.DOCTOR.QUEUE,
    icon: "groups",
    label: "Hàng đợi",
  },
  {
    key: "examination",
    href: ROUTES.PORTAL.DOCTOR.EXAMINATION,
    icon: "stethoscope",
    label: "Khám bệnh",
  },
  {
    key: "medical-records",
    href: ROUTES.PORTAL.DOCTOR.MEDICAL_RECORDS,
    icon: "folder_shared",
    label: "Hồ sơ bệnh án",
  },
  {
    key: "prescriptions",
    href: ROUTES.PORTAL.DOCTOR.PRESCRIPTIONS,
    icon: "pill",
    label: "Kê đơn",
  },
  {
    key: "ai-assistant",
    href: ROUTES.PORTAL.DOCTOR.AI_ASSISTANT,
    icon: "smart_toy",
    label: "Trợ lý AI",
  },
  {
    key: "telemedicine",
    href: ROUTES.PORTAL.DOCTOR.TELEMEDICINE,
    icon: "videocam",
    label: "Khám từ xa",
  },
  {
    key: "settings",
    href: ROUTES.PORTAL.DOCTOR.SETTINGS,
    icon: "settings",
    label: "Cài đặt",
  },
] as const;

// Admin sidebar menu items — hỗ trợ nhóm + submenu
export interface AdminMenuItem {
  key: string;
  href?: string;
  icon: string;
  label: string;
  children?: { key: string; href: string; label: string }[];
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    key: "dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: "dashboard",
    label: "Trang chủ",
  },
  {
    key: "users",
    icon: "badge",
    label: "Quản lý nhân sự",
    children: [
      { key: "users-list", href: ROUTES.ADMIN.USERS, label: "Danh sách nhân sự" },
      { key: "doctors-list", href: ROUTES.ADMIN.DOCTORS, label: "Danh sách Bác sĩ" },
      { key: "users-roles", href: ROUTES.ADMIN.USERS_ROLES, label: "Phân quyền & Vai trò" },
    ],
  },
  {
    key: "hospital",
    icon: "local_hospital",
    label: "Quản lý bệnh viện",
    children: [
      { key: "departments", href: ROUTES.ADMIN.DEPARTMENTS, label: "Chuyên khoa" },
      { key: "hospitals", href: ROUTES.ADMIN.HOSPITALS, label: "Cơ sở y tế" },
      { key: "time-slots", href: ROUTES.ADMIN.TIME_SLOTS, label: "Cấu hình khung giờ" },
      { key: "schedules", href: ROUTES.ADMIN.SCHEDULES, label: "Lịch trực" },
    ],
  },
  {
    key: "medicines",
    icon: "medication",
    label: "Kho thuốc",
    children: [
      { key: "medicines-list", href: ROUTES.ADMIN.MEDICINES, label: "Danh mục thuốc" },
      { key: "medicines-import", href: ROUTES.ADMIN.MEDICINES_IMPORT, label: "Nhập kho" },
      { key: "medicines-export", href: ROUTES.ADMIN.MEDICINES_EXPORT, label: "Xuất kho" },
      { key: "medicines-stock", href: ROUTES.ADMIN.MEDICINES_STOCK, label: "Tồn kho" },
    ],
  },
  {
    key: "statistics",
    icon: "bar_chart",
    label: "Thống kê",
    children: [
      { key: "statistics-overview", href: ROUTES.ADMIN.STATISTICS, label: "Tổng quan" },
      { key: "statistics-revenue", href: ROUTES.ADMIN.STATISTICS_REVENUE, label: "Báo cáo doanh thu" },
    ],
  },
  {
    key: "activity-logs",
    href: ROUTES.ADMIN.ACTIVITY_LOGS,
    icon: "history",
    label: "Nhật ký hoạt động",
  },
  {
    key: "settings",
    href: ROUTES.ADMIN.SETTINGS,
    icon: "settings",
    label: "Cài đặt",
  },
];

// Receptionist sidebar menu items
export const RECEPTIONIST_MENU_ITEMS = [
  {
    key: "dashboard",
    href: ROUTES.PORTAL.RECEPTIONIST.DASHBOARD,
    icon: "home",
    label: "Trang chủ",
  },
  {
    key: "reception",
    href: ROUTES.PORTAL.RECEPTIONIST.RECEPTION,
    icon: "how_to_reg",
    label: "Tiếp nhận BN",
  },
  {
    key: "appointments",
    href: ROUTES.PORTAL.RECEPTIONIST.APPOINTMENTS,
    icon: "calendar_month",
    label: "Lịch hẹn",
  },
  {
    key: "queue",
    href: ROUTES.PORTAL.RECEPTIONIST.QUEUE,
    icon: "groups",
    label: "Hàng đợi",
  },
  {
    key: "patients",
    href: ROUTES.PORTAL.RECEPTIONIST.PATIENTS,
    icon: "person_add",
    label: "Bệnh nhân",
  },
  {
    key: "billing",
    href: ROUTES.PORTAL.RECEPTIONIST.BILLING,
    icon: "receipt_long",
    label: "Thanh toán",
  },
  {
    key: "settings",
    href: ROUTES.PORTAL.RECEPTIONIST.SETTINGS,
    icon: "settings",
    label: "Cài đặt",
  },
] as const;

// Pharmacist sidebar menu items
export const PHARMACIST_MENU_ITEMS = [
  {
    key: "dashboard",
    href: ROUTES.PORTAL.PHARMACIST.DASHBOARD,
    icon: "home",
    label: "Trang chủ",
  },
  {
    key: "prescriptions",
    href: ROUTES.PORTAL.PHARMACIST.PRESCRIPTIONS,
    icon: "pill",
    label: "Đơn thuốc",
  },
  {
    key: "dispensing",
    href: ROUTES.PORTAL.PHARMACIST.DISPENSING,
    icon: "local_pharmacy",
    label: "Cấp phát",
  },
  {
    key: "inventory",
    href: ROUTES.PORTAL.PHARMACIST.INVENTORY,
    icon: "inventory_2",
    label: "Kho thuốc",
  },
  {
    key: "settings",
    href: ROUTES.PORTAL.PHARMACIST.SETTINGS,
    icon: "settings",
    label: "Cài đặt",
  },
] as const;
