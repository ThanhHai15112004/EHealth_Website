"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import axiosClient from "@/api/axiosClient";
import { MEDICAL_RECORD_ENDPOINTS, EHR_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";
import { usePageAIContext } from "@/hooks/usePageAIContext";
import { AIResultExplainer } from "@/components/portal/ai";
import type { PatientProfile } from "@/types/patient-profile";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MedicalRecord {
    id: string;
    date: string;
    doctorName: string;
    department: string;
    diagnosis: string;
    status: string;
    encounterId?: string;
    isParaclinical?: boolean;
}

interface TimelineItem {
    id: string;
    date: string;
    type: string;
    title: string;
    description: string;
    doctorName?: string;
    department?: string;
    status: string;
    icon: string;
    color: string;
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

function adaptRecord(r: any): MedicalRecord {
    let dateStr = r.date ?? r.visitDate ?? r.createdAt ?? "";
    if (r.start_time) {
        const d = new Date(r.start_time);
        dateStr = d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
    }

    const departmentRaw = r.specialty_name ?? r.encounter_type ?? r.department ?? r.speciality ?? r.departmentName ?? "Khám bệnh";
    const deptLower = typeof departmentRaw === 'string' ? departmentRaw.toLowerCase() : '';
    const isParaclinical = deptLower.includes("xét nghiệm") || deptLower.includes("chẩn đoán hình ảnh") || deptLower.includes("cận lâm sàng") || deptLower.includes("thăm dò chức năng");

    return {
        id: r.encounters_id ?? r.id ?? r._id ?? r.encounterId ?? String(Math.random()),
        date: dateStr,
        doctorName: r.doctor_name ?? r.doctorName ?? r.doctor?.name ?? r.doctor?.fullName ?? "Chưa phân công",
        department: isParaclinical ? (departmentRaw.toLowerCase().includes("khoa") ? departmentRaw : "Khoa " + departmentRaw) : departmentRaw,
        diagnosis: isParaclinical ? (r.primary_diagnosis ?? r.diagnosis ?? r.mainDiagnosis ?? r.conclusion ?? "Chưa có kết quả nội trú") : (r.primary_diagnosis ?? r.diagnosis ?? r.mainDiagnosis ?? r.conclusion ?? "Chưa có chẩn đoán"),
        status: r.status ?? "completed",
        encounterId: r.encounterId ?? r.encounter_id ?? r.encounters_id ?? r.id,
        isParaclinical
    };
}

function adaptTimeline(t: any): TimelineItem {
    const iconMap: Record<string, string> = {
        examination: "stethoscope", lab_result: "science", prescription: "medication",
        surgery: "surgical", vaccination: "vaccines", vital_check: "monitor_heart",
        lab: "science", visit: "stethoscope", vaccine: "vaccines",
    };
    const colorMap: Record<string, string> = {
        examination: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
        lab_result: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
        prescription: "text-green-500 bg-green-50 dark:bg-green-500/10",
        surgery: "text-orange-500 bg-orange-50 dark:bg-orange-500/10",
        vaccination: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
        vital_check: "text-red-500 bg-red-50 dark:bg-red-500/10",
    };
    const departmentRaw = t.department ?? t.speciality ?? "";
    const deptLower = typeof departmentRaw === 'string' ? departmentRaw.toLowerCase() : '';
    const isParaclinical = deptLower.includes("xét nghiệm") || deptLower.includes("chẩn đoán hình ảnh") || deptLower.includes("cận lâm sàng");

    let type = t.type ?? "examination";
    if (isParaclinical && type === "examination") {
        type = "lab";
    }

    return {
        id: t.id ?? t._id ?? String(Math.random()),
        date: t.date ?? t.createdAt ?? "",
        type,
        title: isParaclinical && !t.title ? "Dịch vụ " + departmentRaw : (t.title ?? t.name ?? "Sự kiện y tế"),
        description: t.description ?? t.summary ?? "",
        doctorName: t.doctorName ?? t.doctor?.name ?? t.doctor?.fullName,
        department: departmentRaw,
        status: t.status ?? "completed",
        icon: t.icon ?? iconMap[type] ?? "health_and_safety",
        color: t.color ?? colorMap[type] ?? "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
    };
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        completed: { label: "Hoàn thành", cls: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30" },
        finalized: { label: "Đã ký duyệt", cls: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30" },
        pending: { label: "Chờ xử lý", cls: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30" },
        in_progress: { label: "Đang khám", cls: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30" },
    };
    const key = (status || "").toLowerCase();
    const cfg = map[key] ?? { label: status, cls: "bg-gray-100 border border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400" };
    return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${cfg.cls}`}>{cfg.label}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ViewMode = "list" | "timeline";

export default function MedicalRecordsPage() {
    usePageAIContext({ pageKey: 'medical-records' });
    const { user } = useAuth();
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [timelineFetched, setTimelineFetched] = useState(false);

    const [profiles, setProfiles] = useState<PatientProfile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState("");

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const { patientProfileService, mapBEToFEProfile } = await import("@/services/patientProfileService");
                const beProfiles = await patientProfileService.getMyProfiles();
                const mapped = beProfiles.map((be) => mapBEToFEProfile(be, user?.id));
                setProfiles(mapped);
                if (mapped.length > 0) {
                    const cachedId = sessionStorage.getItem("patientPortal_selectedProfileId");
                    const exists = mapped.some((p) => p.id === cachedId);
                    setSelectedProfileId(exists ? cachedId! : mapped[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch profiles", error);
            }
        };
        if (user?.id) {
            fetchProfiles();
        }
    }, [user?.id]);

    useEffect(() => {
        if (selectedProfileId) {
            loadRecords();
            if (viewMode === "timeline") {
                loadTimeline();
            }
        }
    }, [selectedProfileId, viewMode]);

    const handleProfileChange = (profileId: string) => {
        setSelectedProfileId(profileId);
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem("patientPortal_selectedProfileId", profileId);
        }
        setTimelineFetched(false);
    };

    const loadRecords = async () => {
        try {
            setLoading(true);
            if (selectedProfileId) {
                const res = await axiosClient.get(MEDICAL_RECORD_ENDPOINTS.BY_PATIENT(selectedProfileId));
                const raw = res.data?.data?.data || res.data?.data || res.data || [];
                const dataArray = Array.isArray(raw) ? raw : [];
                setRecords(dataArray.map(adaptRecord));
            }
        } catch {
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const loadTimeline = async () => {
        if (timelineFetched || !selectedProfileId) return;
        setLoadingTimeline(true);
        try {
            const res = await axiosClient.get(EHR_ENDPOINTS.TIMELINE(selectedProfileId));
            const raw = unwrapList<any>(res);
            if (raw.data?.length) {
                setTimeline(raw.data.map(adaptTimeline));
            }
            setTimelineFetched(true);
        } catch {
            // giữ trống
        } finally {
            setLoadingTimeline(false);
        }
    };

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        if (mode === "timeline") loadTimeline();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#121417] dark:text-white">Kết quả khám bệnh</h1>
                    <p className="text-sm text-[#687582] mt-0.5">Xem lại kết quả khám, đơn thuốc và xét nghiệm</p>
                    {profiles.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar mt-4">
                            {profiles.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => handleProfileChange(p.id)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border min-w-[240px] cursor-pointer transition-all snap-start ${selectedProfileId === p.id ? 'border-[#3C81C6] bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e242b] hover:border-blue-300 dark:hover:border-blue-800'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3C81C6] to-[#60a5fa] flex items-center justify-center text-white text-sm font-bold shadow-md shadow-[#3C81C6]/20 shrink-0">
                                        {p.fullName?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${selectedProfileId === p.id ? 'text-[#3C81C6]' : 'text-gray-900 dark:text-white'}`}>{p.fullName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.phone || "Chưa có SĐT"}</p>
                                    </div>
                                    {selectedProfileId === p.id && (
                                        <span className="material-symbols-outlined text-[#3C81C6] shrink-0" style={{ fontSize: "20px" }}>check_circle</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 p-1 bg-[#f6f7f8] dark:bg-[#13191f] rounded-xl border border-[#e5e7eb] dark:border-[#2d353e]">
                    {(["list", "timeline"] as ViewMode[]).map(mode => (
                        <button key={mode} onClick={() => handleViewModeChange(mode)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === mode ? "bg-white dark:bg-[#1e242b] text-[#121417] dark:text-white shadow-sm" : "text-[#687582] hover:text-[#121417] dark:hover:text-white"}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{mode === "list" ? "list" : "timeline"}</span>
                            {mode === "list" ? "Danh sách" : "Dòng thời gian"}
                        </button>
                    ))}
                </div>
            </div>

            {/* AI Result Explainer */}
            <AIResultExplainer />

            {/* ── List View ── */}
            {viewMode === "list" && (() => {
                const clinicalRecords = records.filter(r => !r.isParaclinical);
                return (
                <>
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5 animate-pulse">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mb-2" />
                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : clinicalRecords.length === 0 ? (
                        <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] py-16 text-center">
                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 mb-4" style={{ fontSize: "64px" }}>folder_open</span>
                            <h3 className="text-lg font-semibold text-[#121417] dark:text-white mb-1">Chưa có kết quả khám</h3>
                            <p className="text-sm text-[#687582] mb-6">Kết quả sẽ được cập nhật sau mỗi lần khám tại EHealth</p>
                            <Link href="/booking"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>calendar_month</span>
                                Đặt lịch khám
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {clinicalRecords.map(record => (
                                <div key={record.id}
                                    className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] hover:border-[#3C81C6]/30 hover:shadow-lg dark:hover:shadow-black/20 transition-all overflow-hidden flex flex-col group">
                                    <div className="p-5 flex-1 space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${
                                                    record.isParaclinical 
                                                        ? "from-purple-500/10 to-pink-500/10 text-purple-600" 
                                                        : "from-[#3C81C6]/10 to-[#60a5fa]/10 text-[#3C81C6]"
                                                }`}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                                                        {record.isParaclinical ? "science" : "clinical_notes"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-[#121417] dark:text-white text-base leading-tight">
                                                        {record.isParaclinical ? `Dịch vụ ${record.department}` : (record.department || "Khám bệnh")}
                                                    </h3>
                                                    {record.date && (
                                                        <p className="text-xs text-[#687582] mt-0.5 flex items-center gap-1">
                                                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>calendar_today</span>
                                                            {record.date}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <StatusBadge status={record.status} />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 mt-0.5" style={{ fontSize: "16px" }}>
                                                    {record.isParaclinical ? "biotech" : "stethoscope"}
                                                </span>
                                                <div className="text-sm">
                                                    <span className="text-[#687582]">
                                                        {record.isParaclinical ? "Người chỉ định/Thực hiện: " : "Bác sĩ đ.trị: "}
                                                    </span>
                                                    <span className="font-medium text-[#121417] dark:text-white">{record.doctorName}</span>
                                                </div>
                                            </div>
                                            
                                            {record.diagnosis && (
                                                <div className="flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 mt-0.5" style={{ fontSize: "16px" }}>
                                                        {record.isParaclinical ? "fact_check" : "vaccines"}
                                                    </span>
                                                    <div className="text-sm line-clamp-2">
                                                        <span className="text-[#687582]">Kết luận: </span>
                                                        <span className="font-medium text-[#121417] dark:text-white">{record.diagnosis}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="px-5 py-3 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                        <Link href={`/patient/medical-records/${record.encounterId}`}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#2d353e] hover:bg-[#3C81C6] hover:text-white text-[#3C81C6] border border-[#3C81C6]/30 hover:border-[#3C81C6] text-sm font-semibold rounded-lg transition-colors shadow-sm">
                                            Xem chi tiết
                                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
                );
            })()}

            {/* ── Timeline View ── */}
            {viewMode === "timeline" && (
                <>
                    {loadingTimeline ? (
                        <div className="space-y-4 animate-pulse">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                                    <div className="flex-1 bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-4 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : timeline.length === 0 ? (
                        <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] py-16 text-center">
                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 mb-3" style={{ fontSize: "56px" }}>timeline</span>
                            <p className="text-sm text-[#687582]">Chưa có dữ liệu dòng thời gian</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-6">
                            <h3 className="text-lg font-bold text-[#121417] dark:text-white mb-6">Lịch sử khám bệnh</h3>
                            <div className="relative">
                                <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-[#e5e7eb] dark:bg-[#2d353e]" />
                                <div className="space-y-6">
                                    {timeline.map(item => (
                                        <div key={item.id} className="relative flex gap-4">
                                            <div className={`relative z-10 w-9 h-9 rounded-full ${item.color} flex items-center justify-center flex-shrink-0 ring-4 ring-white dark:ring-[#1e242b]`}>
                                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{item.icon}</span>
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-[#121417] dark:text-white">{item.title}</h4>
                                                        <p className="text-xs text-[#687582] mt-0.5">{item.description}</p>
                                                        {item.doctorName && (
                                                            <p className="text-xs text-[#687582] mt-1">
                                                                BS. {item.doctorName}{item.department && ` • ${item.department}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-xs text-[#687582] whitespace-nowrap bg-[#f6f7f8] dark:bg-[#13191f] px-2 py-1 rounded-md">{item.date}</span>
                                                        <StatusBadge status={item.status} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
