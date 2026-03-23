/**
 * API Endpoints Configuration
 * Tập trung tất cả các endpoint API — đồng bộ với Swagger docs
 * 
 * Backend: http://160.250.186.97:3000/api-docs
 * @description Dễ dàng quản lý và thay đổi endpoints
 * @lastSync 2026-03-08
 */

// ============================================
// 1.2 Authentication Endpoints
// ✅ Đã khớp Swagger API
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

    // 1.2.2 Session management
    SESSIONS: '/api/auth/sessions',
    SESSION_DELETE: (sessionId: string) => `/api/auth/sessions/${sessionId}`,
    SESSIONS_DELETE_OTHER: '/api/auth/sessions/other',       // DELETE: đăng xuất thiết bị khác

    // 1.3.7 User context — lấy role/menu/quyền sau khi đăng nhập
    ME_ROLES: '/api/auth/me/roles',
    ME_MENUS: '/api/auth/me/menus',
    ME_PERMISSIONS: '/api/auth/me/permissions',
};

// ============================================
// 1.6 Profile Endpoints
// ✅ Đã khớp Swagger: /api/profile/*
// ============================================
export const PROFILE_ENDPOINTS = {
    ME: '/api/profile/me',                    // GET: lấy profile, PUT: cập nhật profile
    CHANGE_PASSWORD: '/api/profile/password',  // PUT: đổi mật khẩu
    SESSIONS: '/api/profile/sessions',         // GET: xem lịch sử/thiết bị đăng nhập
    SESSIONS_LOGOUT_ALL: '/api/profile/sessions',         // DELETE: đăng xuất tất cả thiết bị khác
    SESSION_DELETE: (sessionId: string) => `/api/profile/sessions/${sessionId}`, // DELETE: đăng xuất thiết bị cụ thể
    SETTINGS: '/api/profile/settings',         // PUT: cài đặt cá nhân
};

// ============================================
// 1.1 User Management Endpoints
// ✅ Đã bổ sung đầy đủ theo Swagger
// ============================================
export const USER_ENDPOINTS = {
    // 1.1.1 Quản lý User
    ACCOUNT_STATUS: '/api/users/account-status', // GET: danh sách trạng thái tài khoản
    LIST: '/api/users',                           // GET: danh sách users
    CREATE: '/api/users',                         // POST: tạo user
    SEARCH: '/api/users/search',                  // GET: tìm kiếm user
    DETAIL: (id: string) => `/api/users/${id}`,   // GET: chi tiết user

    // 1.1.2 Khóa / mở khóa tài khoản
    UNLOCK: (id: string) => `/api/users/${id}/unlock`, // PATCH: mở khóa tài khoản

    // 1.1.3 Quản lý trạng thái tài khoản
    STATUS: (id: string) => `/api/users/${id}/status`,               // PATCH: cập nhật trạng thái
    STATUS_HISTORY: (id: string) => `/api/users/${id}/status-history`, // GET: lịch sử trạng thái

    // 1.1.4 Reset mật khẩu người dùng
    RESET_PASSWORD: (id: string) => `/api/users/${id}/reset-password`,   // POST: admin reset pw
    CHANGE_PASSWORD: (id: string) => `/api/users/${id}/change-password`, // POST: admin đổi pw

    // 1.1.5 Gán vai trò cho người dùng
    ROLES: (id: string) => `/api/users/${id}/roles`,                         // GET/POST
    ROLE_DELETE: (userId: string, roleId: string) => `/api/users/${userId}/roles/${roleId}`, // DELETE

    // 1.1.6 Gán người dùng vào cơ sở y tế
    FACILITIES: (id: string) => `/api/users/${id}/facilities`,                                         // GET/POST
    FACILITY_UPDATE: (userId: string, facilityId: string) => `/api/users/${userId}/facilities/${facilityId}`, // PUT
    FACILITY_DELETE: (userId: string, facilityId: string) => `/api/users/${userId}/facilities/${facilityId}`, // DELETE

    // 1.1.7 Import người dùng hàng loạt
    IMPORT: '/api/users/import',                   // POST: import users
    IMPORT_VALIDATE: '/api/users/import/validate', // POST: validate import file
    IMPORT_HISTORY: '/api/users/import/history',   // GET: lịch sử import

    // 1.1.8 Export danh sách người dùng
    EXPORT: '/api/users/export',                   // GET/POST: export users
};

// ============================================
// 1.1.9 Facility Endpoints (dropdown)
// ✅ Đã khớp Swagger
// ============================================
export const FACILITY_ENDPOINTS = {
    LIST: '/api/facilities',                // GET: dropdown danh sách cơ sở y tế
};

// ============================================
// 1.3 Role & Permission Management
// ✅ Bổ sung đầy đủ theo Swagger
// ============================================

// 1.3.1 Role Management
export const ROLE_ENDPOINTS = {
    LIST: '/api/roles',                                           // GET: danh sách roles
    CREATE: '/api/roles',                                         // POST: tạo role
    DETAIL: (roleId: string) => `/api/roles/${roleId}`,           // GET: chi tiết role
    UPDATE: (roleId: string) => `/api/roles/${roleId}`,           // PATCH: cập nhật role
    DELETE: (roleId: string) => `/api/roles/${roleId}`,           // DELETE: xóa role
    STATUS: (roleId: string) => `/api/roles/${roleId}/status`,    // PATCH: bật/tắt role

    // 1.3.3 Gán quyền cho vai trò
    PERMISSIONS: (roleId: string) => `/api/roles/${roleId}/permissions`,     // GET/PUT/POST
    PERMISSION_DELETE: (roleId: string, permId: string) => `/api/roles/${roleId}/permissions/${permId}`, // DELETE

    // 1.3.5 Menu theo vai trò
    MENUS: (roleId: string) => `/api/roles/${roleId}/menus`,                 // GET/POST
    MENU_DELETE: (roleId: string, menuId: string) => `/api/roles/${roleId}/menus/${menuId}`, // DELETE

    // 1.3.6 API theo vai trò
    API_PERMISSIONS: (roleId: string) => `/api/roles/${roleId}/api-permissions`,     // GET/POST
    API_PERMISSION_DELETE: (roleId: string, apiId: string) => `/api/roles/${roleId}/api-permissions/${apiId}`, // DELETE
};

// 1.3.2 Permission Management
export const PERMISSION_ENDPOINTS = {
    LIST: '/api/permissions',                                             // GET: danh sách permissions
    CREATE: '/api/permissions',                                           // POST: tạo permission
    DETAIL: (permId: string) => `/api/permissions/${permId}`,             // GET: chi tiết
    UPDATE: (permId: string) => `/api/permissions/${permId}`,             // PATCH: cập nhật
    DELETE: (permId: string) => `/api/permissions/${permId}`,             // DELETE: xóa
};

// 1.3.4 Module Management
export const MODULE_ENDPOINTS = {
    LIST: '/api/modules',                                                    // GET: danh sách modules
    PERMISSIONS: (moduleName: string) => `/api/modules/${moduleName}/permissions`, // GET: quyền theo module
};

// 1.3.5 Menu Management
export const MENU_ENDPOINTS = {
    LIST: '/api/menus',                                             // GET: danh sách menus
    CREATE: '/api/menus',                                           // POST: tạo menu
    UPDATE: (menuId: string) => `/api/menus/${menuId}`,             // PATCH: cập nhật
    DELETE: (menuId: string) => `/api/menus/${menuId}`,             // DELETE: xóa
};

// 1.3.6 API Permissions
export const API_PERMISSION_ENDPOINTS = {
    LIST: '/api/api-permissions',                                    // GET: danh sách API endpoints
    CREATE: '/api/api-permissions',                                  // POST: tạo API endpoint
    UPDATE: (apiId: string) => `/api/api-permissions/${apiId}`,      // PATCH: cập nhật
    DELETE: (apiId: string) => `/api/api-permissions/${apiId}`,      // DELETE: xóa
};

// ============================================
// 1.4 System Configuration Endpoints
// ✅ Mới — đầy đủ theo Swagger
// ============================================
export const SYSTEM_CONFIG_ENDPOINTS = {
    // 1.4.1 Thông tin cơ sở y tế
    FACILITY_INFO: '/api/system/facility-info',          // GET/PUT
    FACILITY_LOGO: '/api/system/facility-info/logo',     // POST: upload logo

    // 1.4.2 Thời gian làm việc
    WORKING_HOURS: '/api/system/working-hours',               // GET/PUT
    SLOT_CONFIG: '/api/system/working-hours/slot-config',     // GET/PUT

    // 1.4.3 Quy định nghiệp vụ
    BUSINESS_RULES: '/api/system/business-rules',                               // GET: tất cả
    BUSINESS_RULES_BULK: '/api/system/business-rules/bulk',                     // PUT: cập nhật nhiều
    BUSINESS_RULE: (key: string) => `/api/system/business-rules/${key}`,        // GET/PUT

    // 1.4.4 Bảo mật
    SECURITY_SETTINGS: '/api/system/security-settings',       // GET/PUT

    // 1.4.5 Đa ngôn ngữ
    I18N: '/api/system/i18n',                                 // GET/PUT
    I18N_SUPPORTED: '/api/system/i18n/supported',             // GET

    // 1.4.6 Email/SMS
    NOTIFICATION_CONFIG_EMAIL: '/api/system/notification-config/email', // GET/PUT
    NOTIFICATION_CONFIG_SMS: '/api/system/notification-config/sms',     // GET/PUT
    NOTIFICATION_CONFIG_TEST: '/api/system/notification-config/test',   // POST

    // 1.4.7 Tham số hệ thống
    SETTINGS: '/api/system/settings',                                      // GET/POST
    SETTINGS_MODULES: '/api/system/settings/modules',                      // GET: dropdown
    SETTING_BY_KEY: (key: string) => `/api/system/settings/${key}`,        // GET/PUT/DELETE

    // 1.4.8 Phân quyền cấu hình
    CONFIG_PERMISSIONS: '/api/system/config-permissions',   // GET/PUT
};

// ============================================
// 1.5.1 Specialty Endpoints
// ✅ Mới — theo Swagger
// ============================================
export const SPECIALTY_ENDPOINTS = {
    LIST: '/api/specialties',                                    // GET: danh sách chuyên khoa
    CREATE: '/api/specialties',                                  // POST: tạo chuyên khoa
    DETAIL: (id: string) => `/api/specialties/${id}`,            // GET: chi tiết
    UPDATE: (id: string) => `/api/specialties/${id}`,            // PUT: cập nhật
    DELETE: (id: string) => `/api/specialties/${id}`,            // DELETE: xóa mềm
};

// ============================================
// 1.5.2 Master Data Endpoints
// ✅ Đã bổ sung items export/import
// ============================================
export const MASTER_DATA_ENDPOINTS = {
    // Categories
    CATEGORIES_LIST: '/api/master-data/categories',
    CATEGORIES_CREATE: '/api/master-data/categories',
    CATEGORIES_DETAIL: (id: string) => `/api/master-data/categories/${id}`,
    CATEGORIES_UPDATE: (id: string) => `/api/master-data/categories/${id}`,
    CATEGORIES_DELETE: (id: string) => `/api/master-data/categories/${id}`,
    CATEGORIES_EXPORT: '/api/master-data/categories/export',
    CATEGORIES_IMPORT: '/api/master-data/categories/import',

    // Items within a category
    ITEMS_LIST: (categoryCode: string) => `/api/master-data/categories/${categoryCode}/items`,
    ITEMS_CREATE: (categoryCode: string) => `/api/master-data/categories/${categoryCode}/items`,
    ITEMS_EXPORT: (categoryCode: string) => `/api/master-data/categories/${categoryCode}/items/export`,
    ITEMS_IMPORT: (categoryCode: string) => `/api/master-data/categories/${categoryCode}/items/import`,

    // Items direct
    ITEMS_ALL: '/api/master-data/items',                        // GET: tất cả items (Admin)
    ITEMS_UPDATE: (id: string) => `/api/master-data/items/${id}`,
    ITEMS_DELETE: (id: string) => `/api/master-data/items/${id}`,
};

// ============================================
// 1.5.3 Pharmacy Endpoints
// ✅ Đã bổ sung PATCH status
// ============================================
export const PHARMACY_ENDPOINTS = {
    // --- Drug Categories ---
    CATEGORIES_LIST: '/api/pharmacy/categories',
    CATEGORIES_CREATE: '/api/pharmacy/categories',
    CATEGORIES_DETAIL: (id: string) => `/api/pharmacy/categories/${id}`,
    CATEGORIES_UPDATE: (id: string) => `/api/pharmacy/categories/${id}`,
    CATEGORIES_DELETE: (id: string) => `/api/pharmacy/categories/${id}`,
    CATEGORIES_EXPORT: '/api/pharmacy/categories/export',
    CATEGORIES_IMPORT: '/api/pharmacy/categories/import',
    CATEGORIES_STATUS: (id: string) => `/api/pharmacy/categories/${id}/status`, // PATCH: bật/tắt

    // --- Drugs (Danh mục thuốc) ---
    DRUGS_LIST: '/api/pharmacy/drugs',
    DRUGS_CREATE: '/api/pharmacy/drugs',
    DRUGS_DETAIL: (id: string) => `/api/pharmacy/drugs/${id}`,
    DRUGS_UPDATE: (id: string) => `/api/pharmacy/drugs/${id}`,
    DRUGS_DELETE: (id: string) => `/api/pharmacy/drugs/${id}`,
    DRUGS_ACTIVE: '/api/pharmacy/drugs/active',     // GET: danh sách thuốc active (cho dropdown)
    DRUGS_EXPORT: '/api/pharmacy/drugs/export',     // GET: xuất Excel
    DRUGS_IMPORT: '/api/pharmacy/drugs/import',     // POST: nhập từ Excel
    DRUGS_STATUS: (id: string) => `/api/pharmacy/drugs/${id}/status`, // PATCH: bật/tắt
};

// Backward compatibility — giữ tên cũ, map sang mới
export const MEDICINE_ENDPOINTS = {
    LIST: PHARMACY_ENDPOINTS.DRUGS_LIST,
    DETAIL: (id: string) => PHARMACY_ENDPOINTS.DRUGS_DETAIL(id),
    CREATE: PHARMACY_ENDPOINTS.DRUGS_CREATE,
    UPDATE: (id: string) => PHARMACY_ENDPOINTS.DRUGS_UPDATE(id),
    DELETE: (id: string) => PHARMACY_ENDPOINTS.DRUGS_DELETE(id),
    ACTIVE: PHARMACY_ENDPOINTS.DRUGS_ACTIVE,
    EXPORT: PHARMACY_ENDPOINTS.DRUGS_EXPORT,
    IMPORT: PHARMACY_ENDPOINTS.DRUGS_IMPORT,
};

// ============================================
// 1.5.4-1.5.5 Medical Services Endpoints
// ✅ Đã khớp Swagger
// ============================================
export const MEDICAL_SERVICE_ENDPOINTS = {
    // Master services (dịch vụ gốc)
    MASTER_LIST: '/api/medical-services/master',
    MASTER_CREATE: '/api/medical-services/master',
    MASTER_DETAIL: (id: string) => `/api/medical-services/master/${id}`,
    MASTER_UPDATE: (id: string) => `/api/medical-services/master/${id}`,
    MASTER_DELETE: (id: string) => `/api/medical-services/master/${id}`,
    MASTER_STATUS: (id: string) => `/api/medical-services/master/${id}/status`,

    // Facility services (dịch vụ theo cơ sở)
    FACILITY_SERVICES: (facilityId: string) => `/api/medical-services/facilities/${facilityId}/services`,
    FACILITY_ACTIVE_SERVICES: (facilityId: string) => `/api/medical-services/facilities/${facilityId}/active-services`,
};

// ============================================
// 1.7 Notification Endpoints
// ✅ Bổ sung CRUD categories, templates, role-configs
// ============================================
export const NOTIFICATION_ENDPOINTS = {
    // 1.7.1 Categories
    CATEGORIES: '/api/notifications/categories',                                    // GET/POST
    CATEGORY_UPDATE: (id: string) => `/api/notifications/categories/${id}`,          // PUT
    CATEGORY_DELETE: (id: string) => `/api/notifications/categories/${id}`,          // DELETE

    // 1.7.2 Templates
    TEMPLATES: '/api/notifications/templates',                                       // GET/POST
    TEMPLATE_UPDATE: (id: string) => `/api/notifications/templates/${id}`,            // PUT
    TEMPLATE_DELETE: (id: string) => `/api/notifications/templates/${id}`,            // DELETE

    // 1.7.3 Role-based config
    ROLE_CONFIGS: '/api/notifications/role-configs',                                  // GET: ma trận
    ROLE_CONFIG_UPDATE: (roleId: string, categoryId: string) =>
        `/api/notifications/role-configs/${roleId}/${categoryId}`,                     // PUT

    // 1.7.4 Broadcast
    ADMIN_BROADCAST: '/api/notifications/inbox/admin-broadcast',                      // POST

    // 1.7.5 User Inbox
    INBOX: '/api/notifications/inbox',                                                // GET
    MARK_READ: (id: string) => `/api/notifications/inbox/${id}/read`,                 // PUT
    MARK_ALL_READ: '/api/notifications/inbox/read-all',                               // PUT
};

// ============================================
// 1.8 Audit Log Endpoints
// ✅ Đã khớp Swagger
// ============================================
export const AUDIT_LOG_ENDPOINTS = {
    LIST: '/api/system/audit-logs',
    DETAIL: (id: string) => `/api/system/audit-logs/${id}`,
    EXPORT_EXCEL: '/api/system/audit-logs/export-excel',
};

// ============================================
// Các endpoint chưa có trong Swagger — giữ nguyên cho tương lai
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

export const PATIENT_ENDPOINTS = {
    LIST: '/api/patients',
    DETAIL: (id: string) => `/api/patients/${id}`,
    CREATE: '/api/patients',
    UPDATE: (id: string) => `/api/patients/${id}`,
    STATUS: (id: string) => `/api/patients/${id}/status`,
    LINK: '/api/patients/link',
    UPDATE_CONTACT: (patientId: string) => `/api/patients/${patientId}/contact`,
    ADD_CONTACT: (patientId: string) => `/api/patients/${patientId}/contacts`,
    EDIT_CONTACT: (patientId: string, contactId: string) => `/api/patients/${patientId}/contacts/${contactId}`,
    DELETE_CONTACT: (patientId: string, contactId: string) => `/api/patients/${patientId}/contacts/${contactId}`,
    ADD_RELATION: (patientId: string) => `/api/patients/${patientId}/relations`,
    EDIT_RELATION: (patientId: string, relationId: string) => `/api/patients/${patientId}/relations/${relationId}`,
    DELETE_RELATION: (patientId: string, relationId: string) => `/api/patients/${patientId}/relations/${relationId}`,
    MEDICAL_RECORDS: (patientId: string) => `/api/patients/${patientId}/medical-records`,
    PRESCRIPTIONS: (patientId: string) => `/api/patients/${patientId}/prescriptions`,
};

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

export const DEPARTMENT_ENDPOINTS = {
    LIST: '/api/departments',
    DETAIL: (id: string) => `/api/departments/${id}`,
    CREATE: '/api/departments',
    UPDATE: (id: string) => `/api/departments/${id}`,
    DELETE: (id: string) => `/api/departments/${id}`,
};

export const PRESCRIPTION_ENDPOINTS = {
    LIST: '/api/prescriptions',
    DETAIL: (id: string) => `/api/prescriptions/${id}`,
    CREATE: '/api/prescriptions',
    UPDATE: (id: string) => `/api/prescriptions/${id}`,
    DISPENSE: (id: string) => `/api/prescriptions/${id}/dispense`,
};

export const SCHEDULE_ENDPOINTS = {
    LIST: '/api/schedules',
    CREATE: '/api/schedules',
    UPDATE: (id: string) => `/api/schedules/${id}`,
    DELETE: (id: string) => `/api/schedules/${id}`,
    BY_DOCTOR: (doctorId: string) => `/api/schedules/doctor/${doctorId}`,
};

export const REPORT_ENDPOINTS = {
    DASHBOARD: '/api/reports/dashboard',
    REVENUE: '/api/reports/revenue',
    PATIENTS: '/api/reports/patients',
    APPOINTMENTS: '/api/reports/appointments',
    EXPORT_EXCEL: '/api/reports/export/excel',
    EXPORT_PDF: '/api/reports/export/pdf',
};

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

export const DOCUMENT_ENDPOINTS = {
    LIST: (patientId: string) => `/api/patients/${patientId}/documents`,
    UPLOAD: (patientId: string) => `/api/patients/${patientId}/documents`,
    DETAIL: (patientId: string, docId: string) => `/api/patients/${patientId}/documents/${docId}`,
    DELETE: (patientId: string, docId: string) => `/api/patients/${patientId}/documents/${docId}`,
    VERSIONS: (patientId: string, docId: string) => `/api/patients/${patientId}/documents/${docId}/versions`,
};

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

export const AI_ENDPOINTS = {
    CHAT: '/api/ai/chat',
    SYMPTOM_CHECK: '/api/ai/symptom-check',
    SUGGEST_APPOINTMENT: '/api/ai/suggest-appointment',
    SUMMARIZE_RECORD: (recordId: string) => `/api/ai/summarize/${recordId}`,
    ANALYZE: '/api/ai/analyze',
    LOGS: '/api/ai/logs',
};

export const TELEMEDICINE_ENDPOINTS = {
    LIST: '/api/telemedicine/sessions',
    DETAIL: (id: string) => `/api/telemedicine/sessions/${id}`,
    CREATE: '/api/telemedicine/sessions',
    START: (id: string) => `/api/telemedicine/sessions/${id}/start`,
    END: (id: string) => `/api/telemedicine/sessions/${id}/end`,
    CHAT: (sessionId: string) => `/api/telemedicine/sessions/${sessionId}/chat`,
    SHARE_DOCUMENT: (sessionId: string) => `/api/telemedicine/sessions/${sessionId}/documents`,
};

export const EHR_ENDPOINTS = {
    SUMMARY: (patientId: string) => `/api/ehr/${patientId}/summary`,
    VITAL_HISTORY: (patientId: string) => `/api/ehr/${patientId}/vitals`,
    TREATMENT_HISTORY: (patientId: string) => `/api/ehr/${patientId}/treatments`,
    TIMELINE: (patientId: string) => `/api/ehr/${patientId}/timeline`,
    MEDICAL_HISTORY: (patientId: string) => `/api/ehr/${patientId}/history`,
};
