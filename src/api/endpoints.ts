/**
 * API Endpoints Configuration
 * Tập trung tất cả các endpoint API
 * 
 * @description Dễ dàng quản lý và thay đổi endpoints
 */

// ============================================
// Authentication Endpoints
// Các API liên quan đến xác thực
// ============================================
export const AUTH_ENDPOINTS = {
    LOGIN_EMAIL: '/api/auth/login/email',
    LOGIN_PHONE: '/api/auth/login/phone',
    REGISTER_EMAIL: '/api/auth/register/email',
    REGISTER_PHONE: '/api/auth/register/phone',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    UNLOCK_ACCOUNT: '/api/auth/unlock-account',
    SESSIONS: '/api/auth/sessions',
    SESSIONS_LOGOUT_ALL: '/api/auth/sessions/logout-all',
    SESSION_DELETE: (sessionId: string) => `/api/auth/sessions/${sessionId}`,
};

// ============================================
// User Endpoints
// Các API liên quan đến người dùng
// ============================================
export const USER_ENDPOINTS = {
    LIST: '/api/users',
    DETAIL: (id: string) => `/api/users/${id}`,
    CREATE: '/api/users',
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
    PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
};

// ============================================
// Doctor Endpoints
// Các API liên quan đến bác sĩ
// ============================================
export const DOCTOR_ENDPOINTS = {
    LIST: '/api/doctors',
    DETAIL: (id: string) => `/api/doctors/${id}`,
    CREATE: '/api/doctors',
    UPDATE: (id: string) => `/api/doctors/${id}`,
    DELETE: (id: string) => `/api/doctors/${id}`,
    BY_DEPARTMENT: (departmentId: string) => `/api/doctors/department/${departmentId}`,
    SCHEDULE: (doctorId: string) => `/api/doctors/${doctorId}/schedule`,
};

// ============================================
// Patient Endpoints
// Các API liên quan đến bệnh nhân
// ============================================
export const PATIENT_ENDPOINTS = {
    LIST: '/api/patients',
    DETAIL: (id: string) => `/api/patients/${id}`,
    CREATE: '/api/patients',
    UPDATE: (id: string) => `/api/patients/${id}`,
    STATUS: (id: string) => `/api/patients/${id}/status`,
    LINK: '/api/patients/link',
    // Contact
    UPDATE_CONTACT: (patientId: string) => `/api/patients/${patientId}/contact`,
    ADD_CONTACT: (patientId: string) => `/api/patients/${patientId}/contacts`,
    EDIT_CONTACT: (patientId: string, contactId: string) => `/api/patients/${patientId}/contacts/${contactId}`,
    DELETE_CONTACT: (patientId: string, contactId: string) => `/api/patients/${patientId}/contacts/${contactId}`,
    // Relations
    ADD_RELATION: (patientId: string) => `/api/patients/${patientId}/relations`,
    EDIT_RELATION: (patientId: string, relationId: string) => `/api/patients/${patientId}/relations/${relationId}`,
    DELETE_RELATION: (patientId: string, relationId: string) => `/api/patients/${patientId}/relations/${relationId}`,
    // Legacy (for other modules still using these)
    MEDICAL_RECORDS: (patientId: string) => `/api/patients/${patientId}/medical-records`,
    PRESCRIPTIONS: (patientId: string) => `/api/patients/${patientId}/prescriptions`,
};

// ============================================
// Appointment Endpoints
// Các API liên quan đến lịch hẹn
// ============================================
export const APPOINTMENT_ENDPOINTS = {
    LIST: '/api/appointments',
    DETAIL: (id: string) => `/api/appointments/${id}`,
    CREATE: '/api/appointments',
    UPDATE: (id: string) => `/api/appointments/${id}`,
    CANCEL: (id: string) => `/api/appointments/${id}/cancel`,
    CONFIRM: (id: string) => `/api/appointments/${id}/confirm`,
    BY_DOCTOR: (doctorId: string) => `/api/appointments/doctor/${doctorId}`,
    BY_PATIENT: (patientId: string) => `/api/appointments/patient/${patientId}`,
};

// ============================================
// Department Endpoints
// Các API liên quan đến khoa/phòng ban
// ============================================
export const DEPARTMENT_ENDPOINTS = {
    LIST: '/api/departments',
    DETAIL: (id: string) => `/api/departments/${id}`,
    CREATE: '/api/departments',
    UPDATE: (id: string) => `/api/departments/${id}`,
    DELETE: (id: string) => `/api/departments/${id}`,
};

// ============================================
// Medicine Endpoints
// Các API liên quan đến thuốc
// ============================================
export const MEDICINE_ENDPOINTS = {
    LIST: '/api/medicines',
    DETAIL: (id: string) => `/api/medicines/${id}`,
    CREATE: '/api/medicines',
    UPDATE: (id: string) => `/api/medicines/${id}`,
    DELETE: (id: string) => `/api/medicines/${id}`,
    SEARCH: '/api/medicines/search',
    LOW_STOCK: '/api/medicines/low-stock',
};

// ============================================
// Prescription Endpoints
// Các API liên quan đến đơn thuốc
// ============================================
export const PRESCRIPTION_ENDPOINTS = {
    LIST: '/api/prescriptions',
    DETAIL: (id: string) => `/api/prescriptions/${id}`,
    CREATE: '/api/prescriptions',
    UPDATE: (id: string) => `/api/prescriptions/${id}`,
    DISPENSE: (id: string) => `/api/prescriptions/${id}/dispense`,
};

// ============================================
// Schedule Endpoints
// Các API liên quan đến lịch làm việc
// ============================================
export const SCHEDULE_ENDPOINTS = {
    LIST: '/api/schedules',
    CREATE: '/api/schedules',
    UPDATE: (id: string) => `/api/schedules/${id}`,
    DELETE: (id: string) => `/api/schedules/${id}`,
    BY_DOCTOR: (doctorId: string) => `/api/schedules/doctor/${doctorId}`,
};

// ============================================
// Report Endpoints
// Các API liên quan đến báo cáo
// ============================================
export const REPORT_ENDPOINTS = {
    DASHBOARD: '/api/reports/dashboard',
    REVENUE: '/api/reports/revenue',
    PATIENTS: '/api/reports/patients',
    APPOINTMENTS: '/api/reports/appointments',
    EXPORT_EXCEL: '/api/reports/export/excel',
    EXPORT_PDF: '/api/reports/export/pdf',
};

// ============================================
// Notification Endpoints
// Các API liên quan đến thông báo
// ============================================
export const NOTIFICATION_ENDPOINTS = {
    LIST: '/api/notifications',
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/read-all',
    DELETE: (id: string) => `/api/notifications/${id}`,
};

// ============================================
// EMR Endpoints
// Các API liên quan đến hồ sơ bệnh án điện tử
// ============================================
export const EMR_ENDPOINTS = {
    LIST: '/api/emr',
    DETAIL: (id: string) => `/api/emr/${id}`,
    CREATE: '/api/emr',
    UPDATE: (id: string) => `/api/emr/${id}`,
    SIGN: (id: string) => `/api/emr/${id}/sign`,
    LOCK: (id: string) => `/api/emr/${id}/lock`,
    SAVE_DRAFT: (id: string) => `/api/emr/${id}/draft`,
    BY_PATIENT: (patientId: string) => `/api/emr/patient/${patientId}`,
    VITAL_SIGNS: (emrId: string) => `/api/emr/${emrId}/vital-signs`,
    DIAGNOSES: (emrId: string) => `/api/emr/${emrId}/diagnoses`,
};

// ============================================
// Document Endpoints
// Các API liên quan đến tài liệu bệnh nhân
// ============================================
export const DOCUMENT_ENDPOINTS = {
    LIST: (patientId: string) => `/api/patients/${patientId}/documents`,
    UPLOAD: (patientId: string) => `/api/patients/${patientId}/documents`,
    DETAIL: (patientId: string, docId: string) => `/api/patients/${patientId}/documents/${docId}`,
    DELETE: (patientId: string, docId: string) => `/api/patients/${patientId}/documents/${docId}`,
    VERSIONS: (patientId: string, docId: string) => `/api/patients/${patientId}/documents/${docId}/versions`,
};

// ============================================
// Billing Endpoints
// Các API liên quan đến thanh toán
// ============================================
export const BILLING_ENDPOINTS = {
    LIST: '/api/billing/invoices',
    DETAIL: (id: string) => `/api/billing/invoices/${id}`,
    CREATE: '/api/billing/invoices',
    PAY: (id: string) => `/api/billing/invoices/${id}/pay`,
    REFUND: (id: string) => `/api/billing/invoices/${id}/refund`,
    SERVICES: '/api/billing/services',
    RECONCILIATION: '/api/billing/reconciliation',
    TRANSACTIONS: '/api/billing/transactions',
};

// ============================================
// AI Endpoints
// Các API liên quan đến AI
// ============================================
export const AI_ENDPOINTS = {
    CHAT: '/api/ai/chat',
    SYMPTOM_CHECK: '/api/ai/symptom-check',
    SUGGEST_APPOINTMENT: '/api/ai/suggest-appointment',
    SUMMARIZE_RECORD: (recordId: string) => `/api/ai/summarize/${recordId}`,
    ANALYZE: '/api/ai/analyze',
    LOGS: '/api/ai/logs',
};

// ============================================
// Telemedicine Endpoints
// Các API liên quan đến khám từ xa
// ============================================
export const TELEMEDICINE_ENDPOINTS = {
    LIST: '/api/telemedicine/sessions',
    DETAIL: (id: string) => `/api/telemedicine/sessions/${id}`,
    CREATE: '/api/telemedicine/sessions',
    START: (id: string) => `/api/telemedicine/sessions/${id}/start`,
    END: (id: string) => `/api/telemedicine/sessions/${id}/end`,
    CHAT: (sessionId: string) => `/api/telemedicine/sessions/${sessionId}/chat`,
    SHARE_DOCUMENT: (sessionId: string) => `/api/telemedicine/sessions/${sessionId}/documents`,
};

// ============================================
// Permission Endpoints
// Các API liên quan đến quyền hạn
// ============================================
export const PERMISSION_ENDPOINTS = {
    ROLES: '/api/roles',
    ROLE_DETAIL: (id: string) => `/api/roles/${id}`,
    PERMISSIONS: '/api/permissions',
    ASSIGN_PERMISSIONS: (roleId: string) => `/api/roles/${roleId}/permissions`,
};

// ============================================
// EHR Endpoints
// Các API liên quan đến hồ sơ sức khỏe điện tử
// ============================================
export const EHR_ENDPOINTS = {
    SUMMARY: (patientId: string) => `/api/ehr/${patientId}/summary`,
    VITAL_HISTORY: (patientId: string) => `/api/ehr/${patientId}/vitals`,
    TREATMENT_HISTORY: (patientId: string) => `/api/ehr/${patientId}/treatments`,
    TIMELINE: (patientId: string) => `/api/ehr/${patientId}/timeline`,
    MEDICAL_HISTORY: (patientId: string) => `/api/ehr/${patientId}/history`,
};

