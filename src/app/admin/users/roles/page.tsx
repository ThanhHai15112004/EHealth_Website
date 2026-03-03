"use client";

import { useState } from "react";

// Mock data — Vai trò & Quyền hạn
const ROLES = [
    {
        id: "ROLE_ADMIN", name: "Quản trị viên", code: "ADMIN",
        description: "Toàn quyền quản lý hệ thống",
        users: 3, status: "active",
        permissions: ["user.read", "user.write", "user.delete", "doctor.read", "doctor.write", "doctor.delete", "medicine.read", "medicine.write", "medicine.delete", "report.read", "report.export", "settings.write"],
    },
    {
        id: "ROLE_DOCTOR", name: "Bác sĩ", code: "DOCTOR",
        description: "Khám bệnh, kê đơn, quản lý bệnh nhân",
        users: 45, status: "active",
        permissions: ["patient.read", "patient.write", "prescription.read", "prescription.write", "examination.read", "examination.write", "report.read"],
    },
    {
        id: "ROLE_PHARMACIST", name: "Dược sĩ", code: "PHARMACIST",
        description: "Quản lý thuốc, cấp phát đơn thuốc",
        users: 12, status: "active",
        permissions: ["medicine.read", "medicine.write", "prescription.read", "dispensing.write", "inventory.read", "inventory.write"],
    },
    {
        id: "ROLE_RECEPTIONIST", name: "Lễ tân", code: "RECEPTIONIST",
        description: "Tiếp nhận bệnh nhân, đặt lịch hẹn",
        users: 8, status: "active",
        permissions: ["patient.read", "patient.write", "appointment.read", "appointment.write", "billing.read", "billing.write"],
    },
    {
        id: "ROLE_NURSE", name: "Y tá / Điều dưỡng", code: "NURSE",
        description: "Hỗ trợ bác sĩ, theo dõi bệnh nhân",
        users: 20, status: "active",
        permissions: ["patient.read", "vital_signs.write", "examination.read", "report.read"],
    },
    {
        id: "ROLE_ACCOUNTANT", name: "Kế toán", code: "ACCOUNTANT",
        description: "Quản lý tài chính, báo cáo doanh thu",
        users: 4, status: "inactive",
        permissions: ["report.read", "report.export", "billing.read", "billing.write", "revenue.read"],
    },
];

const PERMISSION_GROUPS = [
    { group: "Người dùng", permissions: [{ key: "user.read", label: "Xem" }, { key: "user.write", label: "Sửa" }, { key: "user.delete", label: "Xóa" }] },
    { group: "Bác sĩ", permissions: [{ key: "doctor.read", label: "Xem" }, { key: "doctor.write", label: "Sửa" }, { key: "doctor.delete", label: "Xóa" }] },
    { group: "Bệnh nhân", permissions: [{ key: "patient.read", label: "Xem" }, { key: "patient.write", label: "Sửa" }] },
    { group: "Thuốc", permissions: [{ key: "medicine.read", label: "Xem" }, { key: "medicine.write", label: "Sửa" }, { key: "medicine.delete", label: "Xóa" }] },
    { group: "Đơn thuốc", permissions: [{ key: "prescription.read", label: "Xem" }, { key: "prescription.write", label: "Kê đơn" }] },
    { group: "Khám bệnh", permissions: [{ key: "examination.read", label: "Xem" }, { key: "examination.write", label: "Thực hiện" }] },
    { group: "Lịch hẹn", permissions: [{ key: "appointment.read", label: "Xem" }, { key: "appointment.write", label: "Đặt lịch" }] },
    { group: "Thanh toán", permissions: [{ key: "billing.read", label: "Xem" }, { key: "billing.write", label: "Xử lý" }] },
    { group: "Kho thuốc", permissions: [{ key: "inventory.read", label: "Xem" }, { key: "inventory.write", label: "Nhập/Xuất" }] },
    { group: "Cấp phát", permissions: [{ key: "dispensing.write", label: "Cấp phát" }] },
    { group: "Sinh hiệu", permissions: [{ key: "vital_signs.write", label: "Ghi nhận" }] },
    { group: "Báo cáo", permissions: [{ key: "report.read", label: "Xem" }, { key: "report.export", label: "Xuất" }] },
    { group: "Doanh thu", permissions: [{ key: "revenue.read", label: "Xem" }] },
    { group: "Cài đặt", permissions: [{ key: "settings.write", label: "Thay đổi" }] },
];

export default function RolesPage() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const selected = ROLES.find((r) => r.id === selectedRole);
    const filteredRoles = ROLES.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div>
                <div className="flex items-center gap-1.5 text-xs text-[#687582] dark:text-gray-500 mb-3">
                    <span className="material-symbols-outlined text-[14px]">home</span>
                    <span>Trang chủ</span>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <span>Người dùng & Phân quyền</span>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <span className="text-[#121417] dark:text-white font-medium">Phân quyền & Vai trò</span>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-[#121417] dark:text-white">Phân quyền & Vai trò</h1>
                        <p className="text-[#687582] dark:text-gray-400 mt-0.5 text-sm">Quản lý vai trò và quyền hạn của từng nhóm người dùng</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3C81C6] hover:bg-[#2a6da8] text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-[#3C81C6]/20">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Thêm vai trò
                    </button>
                </div>
            </div>

            {/* Main layout — 2 cột */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái — Danh sách vai trò */}
                <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#dde0e4] dark:border-[#2d353e] shadow-sm">
                    <div className="px-5 py-4 border-b border-[#f0f1f3] dark:border-[#2d353e]">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687582]">search</span>
                            <input type="text" placeholder="Tìm kiếm vai trò..." value={search} onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#f6f7f8] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] text-sm placeholder-[#687582] focus:border-[#3C81C6] focus:ring-1 focus:ring-[#3C81C6]/20 outline-none transition-colors text-[#121417] dark:text-white" />
                        </div>
                    </div>
                    <div className="divide-y divide-[#f0f1f3] dark:divide-[#2d353e]">
                        {filteredRoles.map((role) => (
                            <button key={role.id} onClick={() => setSelectedRole(role.id)}
                                className={`w-full px-5 py-4 text-left hover:bg-[#f6f7f8] dark:hover:bg-[#13191f] transition-colors ${selectedRole === role.id ? "bg-[#3C81C6]/5 dark:bg-[#3C81C6]/10 border-l-3 border-[#3C81C6]" : ""}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-bold text-[#121417] dark:text-white">{role.name}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role.status === "active" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                                        {role.status === "active" ? "Đang Hoạt Động" : "Ngưng Hoạt Động"}
                                    </span>
                                </div>
                                <p className="text-xs text-[#687582] dark:text-gray-500 mb-1.5">{role.description}</p>
                                <div className="flex items-center gap-3 text-[11px] text-[#687582] dark:text-gray-500">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">badge</span> {role.code}</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">group</span> {role.users} người</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">key</span> {role.permissions.length} quyền</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cột phải — Ma trận quyền */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1e242b] rounded-2xl border border-[#dde0e4] dark:border-[#2d353e] shadow-sm">
                    {selected ? (
                        <>
                            <div className="px-5 py-4 border-b border-[#f0f1f3] dark:border-[#2d353e] flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-[#121417] dark:text-white">Quyền hạn: {selected.name}</h3>
                                    <p className="text-xs text-[#687582] dark:text-gray-500">{selected.permissions.length} quyền đang bật</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-[#687582] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium">
                                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">content_copy</span>Sao chép
                                    </button>
                                    <button className="text-xs px-3 py-1.5 bg-[#3C81C6] text-white rounded-lg hover:bg-[#2a6da8] transition-colors font-medium">
                                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">save</span>Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-auto max-h-[600px]">
                                <table className="w-full">
                                    <thead className="sticky top-0 bg-[#f6f7f8] dark:bg-[#13191f] z-10">
                                        <tr>
                                            <th className="text-left text-xs font-bold text-[#687582] dark:text-gray-400 px-5 py-3 uppercase tracking-wider">Nhóm chức năng</th>
                                            <th className="text-left text-xs font-bold text-[#687582] dark:text-gray-400 px-3 py-3 uppercase tracking-wider">Quyền</th>
                                            <th className="text-center text-xs font-bold text-[#687582] dark:text-gray-400 px-3 py-3 uppercase tracking-wider w-20">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f0f1f3] dark:divide-[#2d353e]">
                                        {PERMISSION_GROUPS.map((g) =>
                                            g.permissions.map((p, pi) => (
                                                <tr key={p.key} className="hover:bg-[#f6f7f8] dark:hover:bg-[#13191f] transition-colors">
                                                    {pi === 0 && (
                                                        <td rowSpan={g.permissions.length} className="px-5 py-3 text-sm font-semibold text-[#121417] dark:text-white border-r border-[#f0f1f3] dark:border-[#2d353e] align-top">
                                                            {g.group}
                                                        </td>
                                                    )}
                                                    <td className="px-3 py-3 text-sm text-[#687582] dark:text-gray-400">{p.label}</td>
                                                    <td className="px-3 py-3 text-center">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input type="checkbox" className="sr-only peer" defaultChecked={selected.permissions.includes(p.key)} />
                                                            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-[#3C81C6] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                                                        </label>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 text-[#687582] dark:text-gray-500">
                            <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">admin_panel_settings</span>
                            <p className="text-sm">Chọn một vai trò ở cây bên trái để xem quyền hạn</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
