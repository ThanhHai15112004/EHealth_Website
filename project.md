# EHealth — Tài liệu dự án

## Tổng quan

EHealth là hệ thống quản lý y tế số (Digital Healthcare), xây dựng bằng **Next.js 14** (App Router) + **Tailwind CSS**, sử dụng **TypeScript**. Giao diện hoàn toàn bằng **tiếng Việt**.

### Mục tiêu

Hệ thống gồm 3 giao diện chính:

| Giao diện | Đối tượng | Mô tả |
|-----------|-----------|-------|
| **Mobile App** | Bệnh nhân | Đặt lịch, xem hồ sơ, nhắc thuốc, chat AI (Flutter — chưa triển khai) |
| **Web Portal** | Bác sĩ / Dược sĩ / Lễ tân | Tiếp nhận, khám bệnh, kê đơn, xuất thuốc |
| **Web Admin** | Quản trị viên | Cấu hình hệ thống, nhân sự, báo cáo |

> [!IMPORTANT]
> Dự án frontend hiện tại chỉ bao gồm **Web Portal** và **Web Admin**. Mobile App sẽ được phát triển bằng Flutter riêng.

---

## Công nghệ

- **Framework**: Next.js 14 (App Router, `src/app/`)
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS (dark mode via `class`)
- **Icons**: Google Material Symbols Outlined (CDN)
- **Font**: Inter (Google Fonts)
- **Routing**: File-based (Next.js App Router)

---

## Cấu trúc thư mục

```
src/
├── api/                    # Cấu hình API endpoints
│   └── endpoints.ts        # Tập trung tất cả endpoint (AUTH, USER, DOCTOR, PATIENT, ...)
│
├── app/                    # Pages (Next.js App Router)
│   ├── layout.tsx          # Root layout (HTML, font, icon links)
│   ├── globals.css         # CSS variables, theme, scrollbar
│   ├── page.tsx            # Root "/" → redirect /login
│   ├── login/              # Trang đăng nhập
│   │   └── page.tsx        # Form login, chọn vai trò, tài khoản demo
│   │
│   ├── admin/              # Quản trị viên
│   │   ├── layout.tsx      # Layout (AdminSidebar + AdminHeader)
│   │   ├── page.tsx        # Dashboard
│   │   ├── users/          # Quản lý người dùng & phân quyền
│   │   ├── doctors/        # Quản lý bác sĩ
│   │   ├── departments/    # Quản lý chuyên khoa
│   │   ├── medicines/      # Danh mục thuốc
│   │   ├── schedules/      # Lịch trực
│   │   ├── statistics/     # Thống kê
│   │   ├── activity-logs/  # Nhật ký hoạt động
│   │   └── settings/       # Cài đặt
│   │
│   └── portal/             # Portal cho nhân viên y tế
│       ├── doctor/         # Cổng Bác sĩ
│       │   ├── layout.tsx
│       │   ├── page.tsx              # Dashboard
│       │   ├── appointments/         # Lịch hẹn
│       │   ├── queue/                # Hàng đợi bệnh nhân
│       │   ├── examination/          # Khám bệnh
│       │   ├── medical-records/      # Hồ sơ bệnh án
│       │   ├── prescriptions/        # Kê đơn thuốc
│       │   ├── reports/              # Báo cáo
│       │   └── settings/             # Cài đặt
│       │
│       ├── pharmacist/     # Cổng Dược sĩ
│       │   ├── layout.tsx
│       │   ├── page.tsx              # Dashboard
│       │   ├── prescriptions/        # Đơn thuốc (cấp phát)
│       │   ├── inventory/            # Kho thuốc
│       │   ├── reports/              # Báo cáo
│       │   └── settings/             # Cài đặt
│       │
│       └── receptionist/   # Cổng Lễ tân
│           ├── layout.tsx
│           ├── page.tsx              # Dashboard
│           ├── appointments/         # Lịch hẹn
│           ├── queue/                # Hàng đợi
│           ├── patients/             # Đăng ký bệnh nhân
│           ├── billing/              # Thanh toán
│           └── settings/             # Cài đặt
│
├── components/
│   ├── admin/              # Component riêng cho admin
│   ├── common/             # Component dùng chung (buttons, inputs)
│   ├── portal/             # Component riêng cho portal
│   ├── shared/             # Sidebar & Header cho từng vai trò
│   │   ├── admin-sidebar.tsx / admin-header.tsx
│   │   ├── doctor-sidebar.tsx / doctor-header.tsx
│   │   ├── pharmacist-sidebar.tsx / pharmacist-header.tsx
│   │   ├── receptionist-sidebar.tsx / receptionist-header.tsx
│   │   ├── notification-dropdown.tsx
│   │   └── settings-dropdown.tsx
│   └── ui/                 # UI primitives
│
├── constants/
│   ├── routes.ts           # Tất cả route definitions + menu items sidebar
│   ├── api.ts              # API base URL, config
│   ├── roles.ts            # Vai trò (admin, doctor, pharmacist, receptionist)
│   ├── status.ts           # Trạng thái (appointment, prescription, ...)
│   └── ui-text.ts          # Chuỗi UI tiếng Việt
│
├── features/               # Feature-based modules
│   ├── appointments/
│   ├── departments/
│   ├── doctors/
│   ├── emr/                # Hồ sơ bệnh án điện tử
│   ├── medicines/
│   ├── notifications/
│   ├── patients/
│   ├── prescriptions/
│   ├── schedules/
│   └── users/
│
├── services/               # Service layer (API calls)
│   ├── authService.ts
│   ├── userService.ts
│   ├── appointmentService.ts
│   ├── departmentService.ts
│   ├── medicineService.ts
│   └── index.ts
│
├── config/                 # Cấu hình app
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── store/                  # State management
├── types/                  # TypeScript type definitions
└── utils/                  # Helper functions
```

---

## Vai trò & Chức năng

### 1. Quản trị viên (`/admin`)

| Trang | Route | Mô tả |
|-------|-------|-------|
| Dashboard | `/admin` | Tổng quan hệ thống |
| Người dùng | `/admin/users` | CRUD tài khoản, phân quyền |
| Bác sĩ | `/admin/doctors` | Quản lý bác sĩ, chuyên khoa |
| Chuyên khoa | `/admin/departments` | Danh sách khoa/phòng |
| Thuốc | `/admin/medicines` | Danh mục thuốc master |
| Lịch trực | `/admin/schedules` | Phân ca, lịch làm việc |
| Thống kê | `/admin/statistics` | Báo cáo tổng hợp |
| Nhật ký | `/admin/activity-logs` | Audit log |
| Cài đặt | `/admin/settings` | Cấu hình hệ thống |

### 2. Bác sĩ (`/portal/doctor`)

| Trang | Route | Mô tả |
|-------|-------|-------|
| Dashboard | `/portal/doctor` | Lịch khám hôm nay, thống kê |
| Lịch hẹn | `/portal/doctor/appointments` | Xem/quản lý lịch hẹn |
| Hàng đợi | `/portal/doctor/queue` | Danh sách BN chờ khám |
| Khám bệnh | `/portal/doctor/examination` | Ghi nhận triệu chứng, chẩn đoán, ICD-10 |
| Hồ sơ bệnh án | `/portal/doctor/medical-records` | Tra cứu hồ sơ |
| Kê đơn | `/portal/doctor/prescriptions` | Tạo đơn thuốc |
| Báo cáo | `/portal/doctor/reports` | Thống kê cá nhân |
| Cài đặt | `/portal/doctor/settings` | Hồ sơ cá nhân |

### 3. Dược sĩ (`/portal/pharmacist`)

| Trang | Route | Mô tả |
|-------|-------|-------|
| Dashboard | `/portal/pharmacist` | Đơn chờ cấp phát, cảnh báo hết thuốc |
| Đơn thuốc | `/portal/pharmacist/prescriptions` | Duyệt & cấp phát đơn |
| Kho thuốc | `/portal/pharmacist/inventory` | Tồn kho, nhập xuất |
| Báo cáo | `/portal/pharmacist/reports` | Thống kê cấp phát |
| Cài đặt | `/portal/pharmacist/settings` | Hồ sơ cá nhân |

### 4. Lễ tân (`/portal/receptionist`)

| Trang | Route | Mô tả |
|-------|-------|-------|
| Dashboard | `/portal/receptionist` | Lịch hẹn, tiếp nhận, thao tác nhanh |
| Lịch hẹn | `/portal/receptionist/appointments` | Tạo/duyệt/hủy lịch |
| Hàng đợi | `/portal/receptionist/queue` | Quản lý luồng BN, gọi số |
| Bệnh nhân | `/portal/receptionist/patients` | Đăng ký BN mới, tra cứu |
| Thanh toán | `/portal/receptionist/billing` | Hóa đơn, BHYT, thu phí |
| Cài đặt | `/portal/receptionist/settings` | Hồ sơ cá nhân |

---

## Quy ước & Thiết kế

### Màu sắc

| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `--color-primary` | `#3C81C6` | Nút chính, link, accent |
| `--color-primary-hover` | `#2a6da8` | Hover state |
| `--color-secondary` | `#C6E7FF` | Background nhạt |
| `--color-background-light` | `#f6f7f8` | Nền sáng |
| `--color-background-dark` | `#13191f` | Nền tối |
| `--color-surface-dark` | `#1e242b` | Card nền tối |
| `--color-border-light` | `#dde0e4` | Viền sáng |
| `--color-border-dark` | `#2d353e` | Viền tối |
| `--color-gray` | `#687582` | Text phụ |

### Layout Pattern

Mỗi portal/admin dùng cùng layout pattern:

```
┌────────────────────────────────────────┐
│ Sidebar (w-64)  │  Header             │
│                 │  ─────────────────── │
│  Logo           │  Content (scrollable)│
│  Nav items      │                     │
│  User profile   │                     │
└────────────────────────────────────────┘
```

### Routing

- Routes tập trung tại `src/constants/routes.ts`
- Menu items sidebar cũng nằm tại file trên (`ADMIN_MENU_ITEMS`, `DOCTOR_MENU_ITEMS`, `RECEPTIONIST_MENU_ITEMS`, `PHARMACIST_MENU_ITEMS`)
- **KHÔNG hard-code** route string trong component

### Ngôn ngữ

- Toàn bộ UI bằng tiếng Việt
- Code comments có thể bằng tiếng Việt hoặc tiếng Anh
- Biến, hàm, tên file bằng tiếng Anh

### API Endpoints

- Tập trung tại `src/api/endpoints.ts`
- Nhóm theo domain: `AUTH_ENDPOINTS`, `USER_ENDPOINTS`, `DOCTOR_ENDPOINTS`, `PATIENT_ENDPOINTS`, `APPOINTMENT_ENDPOINTS`, `DEPARTMENT_ENDPOINTS`, `MEDICINE_ENDPOINTS`, `PRESCRIPTION_ENDPOINTS`, `SCHEDULE_ENDPOINTS`, `REPORT_ENDPOINTS`, `NOTIFICATION_ENDPOINTS`
- Hiện tại sử dụng **mock data** inline, chưa kết nối backend

---

## Trạng thái hiện tại

### Đã hoàn thành ✅

- Trang đăng nhập (glassmorphism, chọn vai trò, tài khoản demo)
- Admin portal: 8 trang (Dashboard, Users, Doctors, Departments, Medicines, Schedules, Statistics, Activity Logs)
- Doctor portal: 7 trang (Dashboard, Appointments, Queue, Examination, Medical Records, Prescriptions, Reports, Settings)
- Receptionist portal: 6 trang (Dashboard, Appointments, Queue, Patients, Billing, Settings)
- Pharmacist portal: 5 trang (Dashboard, Prescriptions, Inventory, Reports, Settings)

### Chưa triển khai 🔲

- Kết nối API backend thực tế (hiện dùng mock data)
- Xác thực (login/logout/session) thực
- Dark mode toggle
- Hồ sơ bệnh án timeline
- Import/Export Excel
- Hệ thống thông báo real-time
- In ấn (đơn thuốc, hóa đơn, phiếu khám)
- Mobile App (Flutter)

---

## Cách chạy

```bash
# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build
```

Truy cập: `http://localhost:3000` → tự chuyển đến `/login`

---

## Ghi chú cho AI/Dev mới

1. **Đọc `routes.ts`** trước để hiểu cấu trúc trang
2. **Đọc `endpoints.ts`** để hiểu API structure
3. **Mỗi portal** có layout, sidebar, header riêng tại `components/shared/`
4. **Mock data** nằm inline trong page components — sẽ cần thay bằng API call
5. **Tailwind config** mở rộng tại `tailwind.config.js` (colors, fonts, animations)
6. Toàn bộ text hiển thị phải bằng **tiếng Việt**
