import React, { useEffect, useMemo, useState } from "react";
import { type PatientProfile } from "@/types/patient-profile";
import { ehrService } from "@/services/ehrService";

import OverviewTab from "./tabs/OverviewTab";
import InsuranceTab from "./tabs/InsuranceTab";
import VitalsTab from "./tabs/VitalsTab";
import MedicalHistoryTab from "./tabs/MedicalHistoryTab";
import EncountersTab from "./tabs/EncountersTab";
import MedicationsTab from "./tabs/MedicationsTab";
import DocumentsTab from "./tabs/DocumentsTab";
import TimelineTab from "./tabs/TimelineTab";

interface PatientDetailProps {
    profile: PatientProfile;
    onBack: () => void;
    onEdit: () => void;
}

const TABS = [
    { id: "overview", label: "Tổng quan", icon: "person" },
    { id: "insurance", label: "Bảo hiểm Y tế", icon: "health_and_safety" },
    { id: "vitals", label: "Chỉ số sinh tồn", icon: "favorite" },
    { id: "medical-history", label: "Tiền sử y tế", icon: "history" },
    { id: "encounters", label: "Khám & Lịch hẹn", icon: "stethoscope" },
    { id: "medications", label: "Đơn thuốc", icon: "pill" },
    { id: "documents", label: "Tài liệu", icon: "folder_open" },
    { id: "timeline", label: "Dòng thời gian", icon: "timeline" },
];

export default function PatientDetail({ profile, onBack, onEdit }: PatientDetailProps) {
    const [activeTab, setActiveTab] = useState("overview");
    const [insuranceInfo, setInsuranceInfo] = useState<any | null>(null);
    const [insuranceLoading, setInsuranceLoading] = useState(true);

    const fetchInsuranceStatus = async () => {
        if (!profile.id) return;
        try {
            setInsuranceLoading(true);
            const res = await ehrService.getInsuranceStatus(profile.id);
            const firstItem = Array.isArray(res.data) ? res.data[0] : null;
            setInsuranceInfo(firstItem || null);
        } catch {
            setInsuranceInfo(null);
        } finally {
            setInsuranceLoading(false);
        }
    };

    useEffect(() => {
        fetchInsuranceStatus();
    }, [profile.id]);

    const ageLabel = useMemo(() => {
        if (!profile.dob) return "ChÆ°a cÃ³ ngÃ y sinh";
        const dob = new Date(profile.dob);
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const monthDiff = now.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
        return `${age} tuá»•i`;
    }, [profile.dob]);

    const insuranceBadge = useMemo(() => {
        if (insuranceLoading) return { label: "Äang kiá»ƒm tra BH", className: "bg-gray-100 text-gray-500" };
        if (!insuranceInfo?.insurance_number) return { label: "ChÆ°a liÃªn káº¿t báº£o hiá»ƒm", className: "bg-amber-50 text-amber-700" };

        const endDate = insuranceInfo.end_date ? new Date(insuranceInfo.end_date) : null;
        if (!endDate) return { label: "Báº£o hiá»ƒm Ä‘ang hiá»‡u lá»±c", className: "bg-emerald-50 text-emerald-700" };

        const today = new Date();
        const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return { label: "Báº£o hiá»ƒm Ä‘Ã£ háº¿t háº¡n", className: "bg-rose-50 text-rose-700" };
        if (diffDays <= 30) return { label: "Báº£o hiá»ƒm sáº¯p háº¿t háº¡n", className: "bg-amber-50 text-amber-700" };
        return { label: "Báº£o hiá»ƒm cÃ²n hiá»‡u lá»±c", className: "bg-emerald-50 text-emerald-700" };
    }, [insuranceInfo, insuranceLoading]);

    const renderActiveTab = () => {
        switch (activeTab) {
            case "overview":
                return <OverviewTab profile={profile} insuranceInfo={insuranceInfo} />;
            case "insurance":
                return <InsuranceTab profile={profile} onInsuranceChanged={fetchInsuranceStatus} />;
            case "vitals":
                return <VitalsTab profile={profile} />;
            case "medical-history":
                return <MedicalHistoryTab profile={profile} />;
            case "encounters":
                return <EncountersTab profile={profile} />;
            case "medications":
                return <MedicationsTab profile={profile} />;
            case "documents":
                return <DocumentsTab profile={profile} />;
            case "timeline":
                return <TimelineTab profile={profile} />;
            default:
                return <OverviewTab profile={profile} insuranceInfo={insuranceInfo} />;
        }
    };

    return (
        <div className="bg-white dark:bg-[#0d1117] rounded-3xl border border-gray-100 dark:border-[#2d353e] flex flex-col shadow-sm h-full max-h-[calc(100vh-100px)] overflow-hidden">
            <div className="border-b border-gray-100 dark:border-[#2d353e] shrink-0 bg-[radial-gradient(circle_at_top_left,_rgba(60,129,198,0.14),_transparent_45%),linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,0.98))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(180deg,rgba(19,25,31,0.95),rgba(13,17,23,0.98))]">
                <div className="flex items-start justify-between gap-4 p-6 pb-5">
                    <div className="flex items-start gap-4">
                        <button onClick={onBack} className="mt-1 p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                            <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1" style={{ fontSize: "20px" }}>arrow_back</span>
                        </button>
                        <div className="space-y-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="px-2.5 py-1 rounded-full bg-[#3C81C6]/10 text-[#3C81C6] text-[11px] font-bold tracking-wide">
                                        {profile.relationshipLabel}
                                    </span>
                                    {profile.isPrimary && <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">Há»“ sÆ¡ chÃ­nh</span>}
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${profile.isActive ? "bg-slate-100 text-slate-700" : "bg-gray-100 text-gray-500"}`}>
                                        {profile.isActive ? "Äang hoáº¡t Ä‘á»™ng" : "ÄÃ£ ngÆ°ng"}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${insuranceBadge.className}`}>
                                        {insuranceBadge.label}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.fullName}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {ageLabel} • {profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Ná»¯" : "KhÃ¡c"} • MÃ£ BN: {profile.patientCode || profile.id}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Cáº­p nháº­t láº§n cuá»‘i: {new Date(profile.updatedAt || "").toLocaleDateString("vi-VN")}
                                    {insuranceInfo?.provider_name ? ` • ${insuranceInfo.provider_name}` : ""}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <HeroMetric label="LiÃªn há»‡" value={profile.phone || "ChÆ°a cÃ³ SÄT"} icon="call" />
                                <HeroMetric label="Báº£o hiá»ƒm" value={insuranceInfo?.insurance_number || profile.insuranceNumber || "ChÆ°a liÃªn káº¿t"} icon="health_and_safety" />
                                <HeroMetric label="Háº¡n hiá»‡u lá»±c" value={insuranceInfo?.end_date ? new Date(insuranceInfo.end_date).toLocaleDateString("vi-VN") : "ChÆ°a xÃ¡c Ä‘á»‹nh"} icon="calendar_month" />
                            </div>
                        </div>
                    </div>
                    <button onClick={onEdit} className="p-2.5 text-[#3C81C6] bg-[#3C81C6]/10 hover:bg-[#3C81C6]/20 rounded-xl transition-all" title="Chá»‰nh sá»­a thÃ´ng tin">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-72 border-r border-gray-100 dark:border-[#2d353e] flex flex-col shrink-0 overflow-y-auto bg-gray-50/70 dark:bg-[#13191f]">
                    <div className="p-4 pb-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">Dá»¯ liá»‡u há»“ sÆ¡</p>
                    </div>
                    <div className="flex flex-col px-4 pb-4 gap-1.5">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-medium ${
                                        isActive
                                            ? "bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white shadow-md shadow-blue-500/20"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-white hover:shadow-sm dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <span className={`material-symbols-outlined ${isActive ? "text-white" : "text-gray-400"}`} style={{ fontSize: "20px" }}>
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#0d1117]">
                    {renderActiveTab()}
                </div>
            </div>
        </div>
    );
}

function HeroMetric({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="rounded-2xl border border-white/70 dark:border-[#2d353e] bg-white/70 dark:bg-[#0f141b] px-4 py-3">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-gray-400" style={{ fontSize: "15px" }}>{icon}</span>
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white break-all">{value}</p>
        </div>
    );
}
