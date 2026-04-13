"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppointmentStatusBadge } from "@/components/patient/AppointmentStatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { getAppointments, type Appointment } from "@/services/appointmentService";
import { getPatientsByAccountId, type Patient } from "@/services/patientService";

const TABS = [
    { id: "upcoming", label: "Sắp tới", icon: "event_upcoming" },
    { id: "completed", label: "Đã khám", icon: "task_alt" },
    { id: "cancelled", label: "Đã hủy", icon: "event_busy" },
];

export default function AppointmentsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("upcoming");
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<Patient[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState("");

    // Load profiles first
    useEffect(() => {
        if (!user?.id) return;
        const loadProfiles = async () => {
            try {
                const res = await getPatientsByAccountId(user.id);
                if (res.success && res.data && res.data.length > 0) {
                    setProfiles(res.data);
                    const cachedId = sessionStorage.getItem("patientPortal_selectedProfileId");
                    const exists = res.data.some(p => p.id === cachedId);
                    setSelectedProfileId(exists ? cachedId! : res.data[0].id);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                setLoading(false);
            }
        };
        loadProfiles();
    }, [user?.id]);

    useEffect(() => {
        if (!selectedProfileId) return;
        loadAppointments();
    }, [activeTab, selectedProfileId]);

    const loadAppointments = async () => {
        const statusMap: Record<string, string> = {
            upcoming: "PENDING,CONFIRMED",
            completed: "COMPLETED",
            cancelled: "CANCELLED",
        };
        try {
            setLoading(true);
            const res = await getAppointments({
                patientId: selectedProfileId,
                status: statusMap[activeTab],
                limit: 20,
            });
            if (res.data && res.data.length > 0) {
                setAppointments(res.data);
            } else {
                setAppointments([]);
            }
        } catch {
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#121417] dark:text-white">Lịch hẹn của tôi</h1>
                    <p className="text-sm text-[#687582] mt-0.5">Quản lý tất cả lịch hẹn khám bệnh</p>
                </div>
                <Link href="/booking"
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#3C81C6]/20 hover:shadow-lg transition-all active:scale-[0.97]">
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                    Đặt lịch mới
                </Link>
            </div>

            {/* Profile Selector */}
            {profiles.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar mt-2">
                    {profiles.map(p => (
                        <div
                            key={p.id}
                            onClick={() => {
                                setSelectedProfileId(p.id);
                                sessionStorage.setItem("patientPortal_selectedProfileId", p.id);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-2xl border min-w-[240px] cursor-pointer transition-all snap-start ${selectedProfileId === p.id ? 'border-[#3C81C6] bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e242b] hover:border-blue-300 dark:hover:border-blue-800'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3C81C6] to-[#60a5fa] flex items-center justify-center text-white text-sm font-bold shadow-md shadow-[#3C81C6]/20 shrink-0">
                                {p.full_name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${selectedProfileId === p.id ? 'text-[#3C81C6]' : 'text-gray-900 dark:text-white'}`}>{p.full_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{(p as any).phone_number || (p as any).contact?.phone_number || "Chưa có SĐT"}</p>
                            </div>
                            {selectedProfileId === p.id && (
                                <span className="material-symbols-outlined text-[#3C81C6] shrink-0" style={{ fontSize: "20px" }}>check_circle</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                        ${activeTab === tab.id ? "bg-[#3C81C6] text-white shadow-sm shadow-[#3C81C6]/20" : "bg-white dark:bg-[#1e242b] text-[#687582] hover:bg-gray-50 dark:hover:bg-[#252d36] border border-[#e5e7eb] dark:border-[#2d353e]"}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : profiles.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                    <span className="material-symbols-outlined text-gray-300 mb-4" style={{ fontSize: "64px" }}>
                        person_add
                    </span>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                        Chưa có hồ sơ bệnh nhân
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Vui lòng thêm hồ sơ bệnh nhân để có thể xem và đặt lịch khám
                    </p>
                    <Link href="/patient/medical-records"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                        Thêm hồ sơ ngay
                    </Link>
                </div>
            ) : appointments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                    <span className="material-symbols-outlined text-gray-300 mb-4" style={{ fontSize: "64px" }}>
                        {activeTab === "upcoming" ? "event_upcoming" : activeTab === "completed" ? "task_alt" : "event_busy"}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                        {activeTab === "upcoming" ? "Chưa có lịch hẹn sắp tới" : activeTab === "completed" ? "Chưa có lịch khám hoàn thành" : "Không có lịch hẹn đã hủy"}
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                        {activeTab === "upcoming" ? "Đặt lịch khám ngay để bắt đầu chăm sóc sức khoẻ" : ""}
                    </p>
                    {activeTab === "upcoming" && (
                        <Link href="/booking"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>calendar_month</span>
                            Đặt lịch ngay
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt, index) => (
                        <div key={(apt as any).appointments_id || apt.id || index} className="bg-white rounded-2xl border border-gray-100 hover:border-[#3C81C6]/20 hover:shadow-md transition-all p-5 group">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                {/* Date badge */}
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3C81C6]/10 to-[#60a5fa]/10 flex flex-col items-center justify-center flex-shrink-0">
                                    <span className="text-lg font-bold text-[#3C81C6] leading-none">{(apt as any).appointment_date?.split("-")[2] || apt.date?.split("-")[2] || "--"}</span>
                                    <span className="text-[10px] text-[#3C81C6]/70 font-medium">T{(apt as any).appointment_date?.split("-")[1] || apt.date?.split("-")[1] || "--"}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-[#3C81C6] transition-colors flex items-center gap-2">
                                                {(apt as any).doctor_name || apt.doctorName || "Chưa xếp bác sĩ"}
                                                {apt.status === "completed" && <span className="material-symbols-outlined text-green-500 text-xs" title="Đã hoàn thành khám">verified</span>}
                                            </h3>
                                            <p className="text-sm font-medium text-[#3C81C6] mt-0.5">{(apt as any).service_name || (apt as any).department_name || apt.departmentName || "Khám bệnh"}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <AppointmentStatusBadge status={apt.status} />
                                            {((apt as any).appointment_code) && (
                                                <span className="text-[10px] text-gray-400 font-mono">{(apt as any).appointment_code}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                                            <span className="material-symbols-outlined text-gray-400" style={{ fontSize: "14px" }}>schedule</span>
                                            {((apt as any).slot_start_time)?.substring(0, 5) || apt.time || "--:--"}
                                            {((apt as any).slot_end_time) ? ` - ${((apt as any).slot_end_time).substring(0, 5)}` : ""}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <span className="material-symbols-outlined text-gray-400" style={{ fontSize: "14px" }}>location_on</span>
                                            <span className="truncate max-w-[200px]" title={(apt as any).branch_name || "EHealth Hospital"}>
                                                {(apt as any).branch_name || "EHealth Hospital"}
                                            </span>
                                        </span>
                                        {((apt as any).room_name) && (
                                            <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>meeting_room</span>
                                                {(apt as any).room_name}
                                            </span>
                                        )}
                                    </div>

                                    {((apt as any).reason_for_visit || apt.reason || apt.notes) && (
                                        <div className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg p-2.5 line-clamp-2">
                                            <span className="font-medium text-gray-700 mr-1">Lý do khám:</span>
                                            {(apt as any).reason_for_visit || apt.reason || apt.notes}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                                <Link href={`/patient/appointments/${(apt as any).appointments_id || apt.id}`}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    Xem chi tiết
                                </Link>
                                {(apt.status === "pending" || apt.status === "confirmed") && (
                                    <>
                                        <button className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                                            Dời lịch
                                        </button>
                                        <button className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                                            Hủy lịch
                                        </button>
                                    </>
                                )}
                                {apt.status === "completed" && (
                                    <button className="px-3 py-1.5 text-xs font-medium text-[#3C81C6] bg-[#3C81C6]/[0.06] border border-[#3C81C6]/20 rounded-lg hover:bg-[#3C81C6]/[0.12] transition-colors">
                                        Đánh giá
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
