import React, { useState } from "react";
import { type PatientProfile } from "@/types/patient-profile";

// Giả lập import các Tab (sẽ được tách ra các file riêng sau)
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

    const renderActiveTab = () => {
        switch (activeTab) {
            case "overview": return <OverviewTab profile={profile} />;
            case "insurance": return <InsuranceTab profile={profile} />;
            case "vitals": return <VitalsTab profile={profile} />;
            case "medical-history": return <MedicalHistoryTab profile={profile} />;
            case "encounters": return <EncountersTab profile={profile} />;
            case "medications": return <MedicationsTab profile={profile} />;
            case "documents": return <DocumentsTab profile={profile} />;
            case "timeline": return <TimelineTab profile={profile} />;
            default: return <OverviewTab profile={profile} />;
        }
    };

    return (
        <div className="bg-white dark:bg-[#0d1117] rounded-2xl border border-gray-100 dark:border-[#2d353e] flex flex-col shadow-sm h-full max-h-[calc(100vh-100px)] overflow-hidden">
            {/* Header / Back */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-[#2d353e] shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                        <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1" style={{ fontSize: "20px" }}>arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {profile.fullName}
                            {profile.isPrimary && <span className="px-2 py-0.5 bg-[#3C81C6]/10 text-[#3C81C6] text-[10px] font-bold rounded-lg uppercase tracking-wider">Hồ sơ chính</span>}
                            {!profile.isActive && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">Đã ngưng</span>}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">{profile.relationshipLabel} • Cập nhật lần cuối: {new Date(profile.updatedAt || "").toLocaleDateString("vi-VN")}</p>
                    </div>
                </div>
                <button onClick={onEdit} className="p-2 text-[#3C81C6] bg-[#3C81C6]/10 hover:bg-[#3C81C6]/20 rounded-xl transition-all" title="Chỉnh sửa thông tin">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                </button>
            </div>

            {/* Layout Main */}
            <div className="flex flex-1 overflow-hidden">
                {/* Vertical Sidebar Tabs */}
                <div className="w-64 border-r border-gray-100 dark:border-[#2d353e] flex flex-col shrink-0 overflow-y-auto bg-gray-50/50 dark:bg-[#13191f]">
                    <div className="flex flex-col p-4 gap-1">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white shadow-md shadow-blue-500/20' 
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span 
                                        className={`material-symbols-outlined ${isActive ? 'text-white' : 'text-gray-400'}`} 
                                        style={{ fontSize: "20px" }}
                                    >
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#0d1117]">
                    {renderActiveTab()}
                </div>
            </div>
        </div>
    );
}
