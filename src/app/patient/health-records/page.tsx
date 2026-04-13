"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPatientsByAccountId, type Patient } from "@/services/patientService";
import { ehrService } from "@/services/ehrService";
import { medicalRecordService } from "@/services/medicalRecordService";

const TABS = [
    { id: "overview", label: "Tổng quan", icon: "dashboard" },
    { id: "timeline", label: "Dòng thời gian", icon: "timeline" },
    { id: "history", label: "Tiền sử bệnh", icon: "history_edu" },
    { id: "lab", label: "Kết quả CLS", icon: "science" },
    { id: "medications", label: "Thuốc đang dùng", icon: "medication" },
    { id: "vitals", label: "Chỉ số sinh hiệu", icon: "monitor_heart" },
];

export default function HealthRecordsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [profiles, setProfiles] = useState<Patient[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [latestVital, setLatestVital] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [labResults, setLabResults] = useState<any[]>([]);
    const [medications, setMedications] = useState<any[]>([]);
    const [vitals, setVitals] = useState<any[]>([]);

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
                }
            } catch (error) {
                console.error("Failed to load profiles", error);
            }
        };
        loadProfiles();
    }, [user?.id]);
    
    useEffect(() => {
        if (!selectedProfileId) return;
        
        const fetchEhrData = async () => {
            setLoading(true);
            try {
                // Fetch basic EHR data concurrently
                const [
                    encountersRes,
                    vitalsRes,
                    timelineRes,
                    historyRes,
                    allergiesRes
                ] = await Promise.all([
                    medicalRecordService.getByPatient(selectedProfileId).catch(() => ({ data: { data: [] } })),
                    ehrService.getVitalHistory(selectedProfileId).catch(() => ({ data: { data: [] } })),
                    ehrService.getTimeline(selectedProfileId).catch(() => ({ data: { data: [] } })),
                    ehrService.getMedicalHistory(selectedProfileId).catch(() => ({ data: { data: [] } })),
                    ehrService.getAllergies(selectedProfileId).catch(() => ({ data: { data: [] } }))
                ]);
                
                // Set data or fallback immediately ensuring UI state does not break
                const encountersData = encountersRes.data?.data || encountersRes.data || [];
                const timelineData = timelineRes.data?.data || timelineRes.data || [];
                const historyData = historyRes.data?.data || historyRes.data || [];
                const allergiesData = allergiesRes.data?.data || allergiesRes.data || [];
                const vitalsData = vitalsRes.data?.data || vitalsRes.data || [];
                const latestVitalCall = await ehrService.getLatestVitals(selectedProfileId).catch(() => ({ data: { data: null } }));

                const formattedEncounters = Array.isArray(encountersData) ? encountersData.map((enc: any) => {
                    const dateObj = new Date(enc.start_time || enc.created_at || new Date());
                    return {
                        id: enc.encounters_id || enc.id || enc.appointment_id,
                        timestamp: dateObj.getTime(),
                        date: dateObj.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
                        type: "encounter",
                        title: enc.encounter_type === 'FIRST_VISIT' ? 'Khám lần đầu' : enc.encounter_type === 'FOLLOW_UP' ? 'Tái khám' : 'Phiên khám',
                        description: enc.conclusion || enc.notes || (enc.status === "COMPLETED" ? "Khám hoàn tất" : "Đang xử lý"),
                        doctorName: enc.doctor_name || "Bác sĩ",
                        icon: enc.encounter_type === 'FIRST_VISIT' ? "stethoscope" : "monitor_heart",
                        color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    };
                }) : [];

                const processedTimeline = Array.isArray(timelineData) ? timelineData.map((item: any) => ({
                    ...item,
                    timestamp: new Date(item.date || new Date()).getTime()
                })) : [];
                
                const combinedTimeline = [...processedTimeline, ...formattedEncounters].sort((a, b) => b.timestamp - a.timestamp);

                const formattedHistory = [
                    ...(Array.isArray(historyData) ? historyData.map((h: any) => ({
                        ...h,
                        id: h.patient_medical_histories_id || h.id,
                        type: h.history_type === 'PERSONAL' ? 'chronic' : h.history_type === 'FAMILY' ? 'family' : h.type || 'other',
                        name: h.condition_name || h.name,
                        status: (h.status || '').toLowerCase(),
                        details: h.notes || h.details,
                        diagnosedDate: h.diagnosis_date ? new Date(h.diagnosis_date).toLocaleDateString('vi-VN') : h.diagnosedDate
                    })) : []),
                    ...(Array.isArray(allergiesData) ? allergiesData.map((a: any) => ({
                        ...a,
                        id: a.patient_allergies_id || a.allergy_id || a.id,
                        type: 'allergy',
                        name: a.allergen_name || a.name || a.allergen,
                        status: (a.status || 'ACTIVE').toLowerCase(),
                        details: a.reaction || a.notes || a.details,
                        diagnosedDate: a.identified_date || a.created_at ? new Date(a.identified_date || a.created_at).toLocaleDateString('vi-VN') : a.diagnosedDate
                    })) : [])
                ];

                setLatestVital(latestVitalCall.data?.data || latestVitalCall.data || vitalsData[0] || null);
                setTimeline(combinedTimeline);
                setHistory(formattedHistory);
                setVitals(Array.isArray(vitalsData) ? vitalsData : []);
                
                // Meds and Labs are normally inside timeline.
                setMedications([]);
                setLabResults([]);
            } catch (error) {
                console.error("Failed to load EHR data:", error);
                // Fallback hard states during testing
                setLatestVital(null);
                setTimeline([]);
                setHistory([]);
                setVitals([]);
                setMedications([]);
                setLabResults([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchEhrData();
    }, [selectedProfileId]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#121417] dark:text-white">Hồ sơ sức khỏe điện tử</h1>
                <p className="text-sm text-[#687582] mt-0.5">Theo dõi toàn diện sức khỏe của bạn qua thời gian</p>
            </div>

            {/* Profile Selector */}
            {profiles.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar mt-2">
                    {profiles.map(p => (
                        <div
                            key={p.id}
                            onClick={() => {
                                setSelectedProfileId(p.id)
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

            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-full py-20">
                        <span className="material-symbols-outlined animate-spin text-[#3C81C6]" style={{ fontSize: "40px" }}>progress_activity</span>
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
                            Vui lòng thêm hồ sơ bệnh nhân để xem theo dõi hồ sơ y tế
                        </p>
                        <a href="/patient/medical-records"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                            Thêm hồ sơ
                        </a>
                    </div>
                ) : (
                    <>
                        {activeTab === "overview" && <OverviewTab vital={latestVital} history={history} medications={medications} timeline={timeline} />}
                        {activeTab === "timeline" && <TimelineTab items={timeline} />}
                        {activeTab === "history" && <MedicalHistoryTab items={history} />}
                        {activeTab === "lab" && <LabResultsTab results={labResults} />}
                        {activeTab === "medications" && <MedicationsTab medications={medications} />}
                        {activeTab === "vitals" && <VitalsTab vitals={vitals} />}
                    </>
                )}
            </div>
        </div>
    );
}

function OverviewTab({ vital, history, medications, timeline }: { vital: any; history: any[]; medications: any[]; timeline: any[] }) {
    if (!vital) {
        return (
             <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-10 text-center">
                 <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 mb-2" style={{ fontSize: "48px" }}>monitor_heart</span>
                 <p className="text-gray-500 font-medium">Chưa có chỉ số sinh hiệu</p>
             </div>
        );
    }
    const healthCards = [
        { label: "Huyết áp", value: `${vital?.bloodPressureSystolic != null ? vital.bloodPressureSystolic : "--"}/${vital?.bloodPressureDiastolic != null ? vital.bloodPressureDiastolic : "--"}`, unit: "mmHg", icon: "bloodtype", color: "from-red-500 to-rose-600", hasData: vital?.bloodPressureSystolic != null, ok: vital?.bloodPressureSystolic != null ? vital.bloodPressureSystolic <= 130 : null },
        { label: "Nhịp tim", value: vital?.heartRate != null ? `${vital.heartRate}` : "--", unit: "bpm", icon: "cardiology", color: "from-pink-500 to-red-500", hasData: vital?.heartRate != null, ok: vital?.heartRate != null ? (vital.heartRate >= 60 && vital.heartRate <= 100) : null },
        { label: "BMI", value: vital?.bmi != null ? Number(vital.bmi).toFixed(1) : "--", unit: "", icon: "monitor_weight", color: "from-blue-500 to-indigo-600", hasData: vital?.bmi != null, ok: vital?.bmi != null ? (vital.bmi >= 18.5 && vital.bmi <= 25) : null },
        { label: "SpO2", value: vital?.spo2 != null ? `${vital.spo2}` : "--", unit: "%", icon: "pulmonology", color: "from-cyan-500 to-teal-600", hasData: vital?.spo2 != null, ok: vital?.spo2 != null ? vital.spo2 >= 95 : null },
        { label: "Đường huyết", value: vital?.bloodSugar != null ? `${vital.bloodSugar}` : "--", unit: "mg/dL", icon: "water_drop", color: "from-amber-500 to-orange-500", hasData: vital?.bloodSugar != null, ok: vital?.bloodSugar != null ? vital.bloodSugar <= 100 : null },
        { label: "Nhiệt độ", value: vital?.temperature != null ? Number(vital.temperature).toFixed(1) : "--", unit: "°C", icon: "thermostat", color: "from-green-500 to-emerald-600", hasData: vital?.temperature != null, ok: vital?.temperature != null ? (vital.temperature >= 36.1 && vital.temperature <= 37.2) : null },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {healthCards.map(c => (
                    <div key={c.label} className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5 hover:shadow-lg hover:border-[#3C81C6]/20 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-lg`}>
                                <span className="material-symbols-outlined text-white" style={{ fontSize: "20px" }}>{c.icon}</span>
                            </div>
                            <span className="text-xs font-semibold text-[#687582] uppercase tracking-wider">{c.label}</span>
                        </div>
                        <div className="flex items-end gap-1.5">
                            <span className="text-2xl font-bold text-[#121417] dark:text-white">{c.value}</span>
                            {c.unit && <span className="text-sm text-[#687582] mb-0.5">{c.unit}</span>}
                        </div>
                        {c.hasData ? (
                        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.ok ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400" : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>{c.ok ? "check_circle" : "warning"}</span>
                            {c.ok ? "Bình thường" : "Cao nhẹ"}
                        </div>
                        ) : (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>remove_circle_outline</span>
                            Chưa có dữ liệu
                        </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5">
                    <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-red-500" style={{ fontSize: "20px" }}>warning</span>Dị ứng
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {history.filter(h => h.type === "allergy").length > 0 ? history.filter(h => h.type === "allergy").map(a => (
                            <span key={a.id} className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-100 dark:border-red-500/20">{a.name}</span>
                        )) : <p className="text-sm text-gray-500 italic">Không có ghi nhận dị ứng</p>}
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5">
                    <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-green-500" style={{ fontSize: "20px" }}>medication</span>Thuốc đang dùng
                    </h3>
                    <div className="space-y-2">
                        {medications.filter(m => m.status === "active").length > 0 ? medications.filter(m => m.status === "active").map(m => (
                            <div key={m.id} className="flex items-center gap-2 p-2 bg-[#f6f7f8] dark:bg-[#13191f] rounded-lg">
                                <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "16px" }}>pill</span>
                                <div><p className="text-sm font-semibold text-[#121417] dark:text-white">{m.name}</p><p className="text-xs text-[#687582]">{m.frequency}</p></div>
                            </div>
                        )) : <p className="text-sm text-gray-500 italic">Hiện không có thuốc đang dùng</p>}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5">
                <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "20px" }}>timeline</span>Hoạt động gần đây
                </h3>
                <div className="space-y-3">
                    {timeline.length > 0 ? timeline.slice(0, 4).map((item, idx) => (
                        <div key={item.id || idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#f6f7f8] dark:hover:bg-[#13191f] transition-colors">
                            <div className={`w-9 h-9 rounded-lg ${item.color || "bg-blue-100 text-blue-600"} flex items-center justify-center flex-shrink-0`}>
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{item.icon || "receipt_long"}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#121417] dark:text-white truncate">{item.title}</p>
                                <p className="text-xs text-[#687582] truncate">{item.description}</p>
                            </div>
                            <span className="text-xs text-[#687582] whitespace-nowrap">{item.date}</span>
                        </div>
                    )) : <p className="text-sm text-gray-500 italic">Chưa có hoạt động gần đây</p>}
                </div>
            </div>
        </div>
    );
}

function TimelineTab({ items }: { items: any[] }) {
    if (items.length === 0) return (
         <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] py-16 text-center">
            <h3 className="text-lg font-semibold text-[#121417] dark:text-white mb-1">Chưa có dòng thời gian</h3>
            <p className="text-sm text-[#687582]">Bạn chưa có bản ghi sức khỏe nào được ghi nhận</p>
        </div>
    );
    return (
        <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-6">
            <h3 className="text-lg font-bold text-[#121417] dark:text-white mb-6">Dòng thời gian sức khỏe</h3>
            <div className="relative">
                <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-[#e5e7eb] dark:bg-[#2d353e]" />
                <div className="space-y-6">
                    {items.map(item => (
                        <div key={item.id} className="relative flex gap-4">
                            <div className={`relative z-10 w-9 h-9 rounded-full ${item.color} flex items-center justify-center flex-shrink-0 ring-4 ring-white dark:ring-[#1e242b]`}>
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{item.icon}</span>
                            </div>
                            <div className="flex-1 pb-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-[#121417] dark:text-white">{item.title}</h4>
                                        <p className="text-xs text-[#687582] mt-0.5">{item.description}</p>
                                        {item.doctorName && <p className="text-xs text-[#687582] mt-1">👨‍⚕️ {item.doctorName}{item.department && ` • ${item.department}`}</p>}
                                    </div>
                                    <span className="text-xs text-[#687582] whitespace-nowrap bg-[#f6f7f8] dark:bg-[#13191f] px-2 py-1 rounded-md">{item.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MedicalHistoryTab({ items }: { items: any[] }) {
    if (items.length === 0) return (
         <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] py-16 text-center">
            <h3 className="text-lg font-semibold text-[#121417] dark:text-white mb-1">Không ghi nhận tiền sử bệnh</h3>
        </div>
    );
    const cfg: Record<string, { label: string; icon: string; color: string }> = {
        chronic: { label: "Bệnh mãn tính", icon: "medical_information", color: "text-red-500 bg-red-50 dark:bg-red-500/10" },
        allergy: { label: "Dị ứng", icon: "warning", color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
        surgery: { label: "Phẫu thuật", icon: "surgical", color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
        family: { label: "Tiền sử gia đình", icon: "group", color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" },
        risk_factor: { label: "Yếu tố nguy cơ", icon: "report", color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" },
    };
    const grouped = items.reduce((acc, item) => { (acc[item.type] ||= []).push(item); return acc; }, {} as Record<string, any[]>);

    return (
        <div className="space-y-4">
            {Object.entries(grouped).map(([type, groupArray]) => {
                const group = groupArray as any[];
                const c = cfg[type] || { label: type, icon: "info", color: "text-gray-500 bg-gray-50" };
                return (
                    <div key={type} className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5">
                        <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2 mb-4">
                            <div className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center`}>
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{c.icon}</span>
                            </div>
                            {c.label}
                            <span className="ml-auto text-xs bg-[#f6f7f8] dark:bg-[#13191f] text-[#687582] px-2 py-0.5 rounded-full">{group.length}</span>
                        </h3>
                        <div className="space-y-3">
                            {group.map((item: any, idx: number) => (
                                <div key={item.id || idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#f6f7f8] dark:bg-[#13191f]">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-[#121417] dark:text-white">{item.name}</p>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${item.status === "active" ? "bg-red-100 dark:bg-red-500/10 text-red-600" : item.status === "resolved" ? "bg-green-100 dark:bg-green-500/10 text-green-600" : "bg-blue-100 dark:bg-blue-500/10 text-blue-600"}`}>
                                                {item.status === "active" ? "Hoạt động" : item.status === "resolved" ? "Đã xử lý" : "Theo dõi"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#687582] mt-1">{item.details}</p>
                                        {item.diagnosedDate && <p className="text-xs text-[#687582]/70 mt-1">📅 Phát hiện: {item.diagnosedDate}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function LabResultsTab({ results }: { results: any[] }) {
    if (!results || results.length === 0) return (
        <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] py-16 text-center">
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 mb-3" style={{ fontSize: "56px" }}>biotech</span>
            <h3 className="text-lg font-semibold text-[#121417] dark:text-white mb-1">Chưa có kết quả xét nghiệm</h3>
        </div>
    );
    const [expandedId, setExpandedId] = useState<string | null>(null);
    return (
        <div className="space-y-4">
            {results.map(result => (
                <div key={result.id} className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] overflow-hidden">
                    <button onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                        className="w-full flex items-center justify-between p-5 hover:bg-[#f6f7f8] dark:hover:bg-[#13191f] transition-colors text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-500" style={{ fontSize: "22px" }}>science</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-[#121417] dark:text-white">{result.testName}</h4>
                                <div className="flex items-center gap-3 text-xs text-[#687582] mt-0.5">
                                    <span>📅 {result.date}</span><span>👨‍⚕️ {result.doctorName}</span>
                                    <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 rounded-md font-medium">{result.category}</span>
                                </div>
                            </div>
                        </div>
                        <span className={`material-symbols-outlined text-[#687582] transition-transform ${expandedId === result.id ? "rotate-180" : ""}`} style={{ fontSize: "20px" }}>expand_more</span>
                    </button>
                    {expandedId === result.id && (
                        <div className="px-5 pb-5 border-t border-[#e5e7eb] dark:border-[#2d353e]">
                            <table className="w-full mt-4 text-sm">
                                <thead><tr className="text-xs font-semibold text-[#687582] uppercase">
                                    <th className="text-left py-2">Chỉ số</th><th className="text-center py-2">Kết quả</th><th className="text-center py-2">Đ.vị</th><th className="text-center py-2">Tham chiếu</th><th className="text-right py-2">Đánh giá</th>
                                </tr></thead>
                                <tbody>{result.results.map((r: any, i: number) => (
                                    <tr key={i} className="border-t border-[#e5e7eb]/50 dark:border-[#2d353e]/50">
                                        <td className="py-2.5 font-medium text-[#121417] dark:text-white">{r.name}</td>
                                        <td className={`py-2.5 text-center font-bold ${r.status === "normal" ? "text-green-600" : "text-red-600"}`}>{r.value}</td>
                                        <td className="py-2.5 text-xs text-[#687582] text-center">{r.unit}</td>
                                        <td className="py-2.5 text-xs text-[#687582] text-center">{r.reference}</td>
                                        <td className="py-2.5 text-right">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === "normal" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {r.status === "normal" ? "BT" : "Cao"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function MedicationsTab({ medications }: { medications: any[] }) {
    if (!medications || medications.length === 0) return (
        <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] py-16 text-center">
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 mb-3" style={{ fontSize: "56px" }}>medication</span>
            <h3 className="text-lg font-semibold text-[#121417] dark:text-white mb-1">Không có đơn thuốc nào</h3>
        </div>
    );
    const active = medications.filter(m => m.status === "active");
    const done = medications.filter(m => m.status !== "active");
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-green-500" style={{ fontSize: "20px" }}>medication</span>Đang sử dụng ({active.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {active.map(m => (
                        <div key={m.id} className="bg-white dark:bg-[#1e242b] rounded-2xl border-2 border-green-200 dark:border-green-500/20 p-5">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center"><span className="material-symbols-outlined text-green-600" style={{ fontSize: "22px" }}>pill</span></div>
                                <div>
                                    <h4 className="text-sm font-bold text-[#121417] dark:text-white">{m.name}</h4>
                                    <p className="text-xs text-green-700 dark:text-green-400 font-medium mt-0.5">{m.frequency}</p>
                                    <p className="text-xs text-[#687582] mt-1">📅 Từ {m.startDate} • 👨‍⚕️ {m.prescribedBy}</p>
                                    {m.notes && <p className="text-xs text-[#687582] mt-1 italic">{m.notes}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {done.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-[#687582] flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>history</span>Đã hoàn thành ({done.length})
                    </h3>
                    {done.map(m => (
                        <div key={m.id} className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-4 opacity-70 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#687582]" style={{ fontSize: "20px" }}>pill</span>
                            <div className="flex-1"><p className="text-sm font-semibold text-[#121417] dark:text-white">{m.name}</p><p className="text-xs text-[#687582]">{m.startDate} → {m.endDate} • {m.prescribedBy}</p></div>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 dark:bg-gray-700 text-[#687582]">Hoàn thành</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function VitalsTab({ vitals }: { vitals: any[] }) {
    if (!vitals || vitals.length === 0) return (
        <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] py-16 text-center">
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 mb-3" style={{ fontSize: "56px" }}>favorite</span>
            <h3 className="text-lg font-semibold text-[#121417] dark:text-white mb-1">Chưa có chỉ số sinh hiệu</h3>
        </div>
    );
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-6">
                <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2 mb-5">
                    <span className="material-symbols-outlined text-red-500" style={{ fontSize: "20px" }}>bloodtype</span>Biểu đồ huyết áp
                </h3>
                <div className="flex items-end gap-3 h-40">
                    {vitals.slice().reverse().map((v, index) => (
                        <div key={v.id || `vital-${index}`} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="flex gap-1 items-end w-full justify-center" style={{ height: "120px" }}>
                                <div className="w-3 bg-gradient-to-t from-red-500 to-rose-400 rounded-t-md" style={{ height: `${((v.bloodPressureSystolic || 120) / 160) * 100}%` }} />
                                <div className="w-3 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-md" style={{ height: `${((v.bloodPressureDiastolic || 80) / 160) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-[#687582]">{v.date ? v.date.slice(5) : ""}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs text-[#687582]">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gradient-to-r from-red-500 to-rose-400" />Tâm thu</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gradient-to-r from-blue-500 to-cyan-400" />Tâm trương</span>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-6">
                <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "20px" }}>table_chart</span>Lịch sử đo chi tiết
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="text-xs font-semibold text-[#687582] uppercase border-b border-[#e5e7eb] dark:border-[#2d353e]">
                            <th className="text-left py-3">Ngày</th><th className="text-center py-3">HA</th><th className="text-center py-3">Nhịp tim</th><th className="text-center py-3">SpO2</th><th className="text-center py-3">Cân nặng</th><th className="text-center py-3">BMI</th>
                        </tr></thead>
                        <tbody>{vitals.map((v, index) => (
                            <tr key={v.id || `vital-list-${index}`} className="border-b border-[#e5e7eb]/50 dark:border-[#2d353e]/50 hover:bg-[#f6f7f8] dark:hover:bg-[#13191f]">
                                <td className="py-3 font-medium text-[#121417] dark:text-white">{v.date}</td>
                                <td className={`py-3 text-center ${(v.bloodPressureSystolic || 0) > 130 ? "text-red-600 font-bold" : "text-[#121417] dark:text-white"}`}>{v.bloodPressureSystolic || "--"}/{v.bloodPressureDiastolic || "--"}</td>
                                <td className="py-3 text-center text-[#121417] dark:text-white">{v.heartRate || "--"}</td>
                                <td className="py-3 text-center text-[#121417] dark:text-white">{v.spo2 ? `${v.spo2}%` : "--"}</td>
                                <td className="py-3 text-center text-[#121417] dark:text-white">{v.weight ? `${v.weight}kg` : "--"}</td>
                                <td className="py-3 text-center text-[#121417] dark:text-white">{v.bmi ? Number(v.bmi).toFixed(1) : "--"}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
