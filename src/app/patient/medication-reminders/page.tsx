"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/utils/localStorage";
import { validateRequired, validateDateRange } from "@/utils/validation";
import { getPatientsByAccountId } from "@/services/patientService";
import { prescriptionService } from "@/services/prescriptionService";

// Type definitions (previously from mock data)
interface MedicationReminder {
    id: string;
    profileId: string;
    medicationName: string;
    dosage: string;
    frequency: number;
    timesOfDay: string[];
    instructions: string;
    startDate: string;
    endDate: string;
    prescriptionId?: string;
    isActive: boolean;
    color: string;
    createdAt: string;
}

interface MedicationLog {
    id: string;
    reminderId: string;
    profileId: string;
    date: string;
    scheduledTime: string;
    status: "taken" | "missed" | "skipped";
    actualTime?: string;
    note?: string;
}

type TabKey = "today" | "list" | "stats";

const COLORS = [
    "from-[#3C81C6] to-[#2563eb]",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-green-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-teal-600",
    "from-amber-500 to-orange-600",
];

export default function MedicationRemindersPage() {
    const { user } = useAuth();
    const { showToast } = useToast();

    // Sử dụng user ID từ AuthContext thay vì mock profiles
    const userId = user?.id || "";
    
    // Profiles
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState("");
    
    const [activeTab, setActiveTab] = useState<TabKey>("today");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Persisted data (localStorage only — không có API backend cho medication reminders)
    const [reminders, setReminders] = useState<MedicationReminder[]>([]);
    const [logs, setLogs] = useState<MedicationLog[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        medicationName: "", dosage: "", frequency: 1,
        timesOfDay: ["08:00"], instructions: "",
        startDate: "", endDate: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSyncing, setIsSyncing] = useState(false);

    const syncFromPrescriptions = async (autoSync: boolean = false) => {
        if (!selectedProfileId) {
            if (!autoSync) showToast("Vui lòng chọn hồ sơ bệnh nhân", "error");
            return;
        }
        setIsSyncing(true);
        try {
            const res = await prescriptionService.getByPatient(selectedProfileId, { limit: 5 });
            
            // Handle both pagination format ({data: {data: []}}) and simple array format
            let prescriptionsList = [];
            if (res?.data?.data && Array.isArray(res.data.data)) {
                prescriptionsList = res.data.data;
            } else if (res?.data && Array.isArray(res.data)) {
                prescriptionsList = res.data;
            } else if (Array.isArray(res)) {
                prescriptionsList = res;
            }
            
            const validPrescriptions = prescriptionsList.filter((p: any) => p.status === 'PRESCRIBED' || p.status === 'DISPENSED');
            
            if (validPrescriptions.length === 0) {
                if (!autoSync) showToast("Không tìm thấy đơn thuốc nào gần đây", "info");
                setIsSyncing(false);
                return;
            }

            // Get current local reminders instead of relying on state closure which might be stale
            const storedReminders = loadFromStorage<MedicationReminder[]>(STORAGE_KEYS.MEDICATION_REMINDERS, []);
            let newRems = [...storedReminders];
            let addedCount = 0;

            for (const p of validPrescriptions) {
                const details = await prescriptionService.getDetails(p.prescriptions_id);
                for (const d of details) {
                    const exists = newRems.some(r => r.prescriptionId === p.prescriptions_id && r.medicationName === d.brand_name);
                    if (!exists) {
                        newRems.push({
                            id: `rem-sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            profileId: selectedProfileId,
                            medicationName: d.brand_name,
                            dosage: d.dosage,
                            frequency: d.frequency || 1,
                            timesOfDay: d.frequency === 2 ? ["08:00", "20:00"] : ["08:00"],
                            instructions: d.usage_instruction || "Uống theo chỉ dẫn",
                            startDate: new Date(p.prescribed_at || Date.now()).toISOString().split('T')[0],
                            endDate: new Date(new Date(p.prescribed_at || Date.now()).getTime() + (d.duration_days || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            prescriptionId: p.prescriptions_id,
                            isActive: true,
                            color: COLORS[newRems.length % COLORS.length],
                            createdAt: new Date().toISOString()
                        });
                        addedCount++;
                    }
                }
            }

            if (addedCount > 0) {
                persistReminders(newRems);
                showToast(`Đã đồng bộ ${addedCount} thuốc từ đơn thuốc!`, "success");
            } else {
                if (!autoSync) showToast("Các thuốc trong đơn đã được thêm từ trước", "info");
            }
        } catch (error) {
            console.error("Sync error:", error);
            if (!autoSync) showToast("Lỗi khi đồng bộ đơn thuốc", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    // Fetches profiles from DB
    useEffect(() => {
        if (!userId) return;
        const loadProfiles = async () => {
            try {
                const res = await getPatientsByAccountId(userId);
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
    }, [userId]);

    // Load on mount — chỉ từ localStorage, không gọi API
    useEffect(() => {
        const storedReminders = loadFromStorage<MedicationReminder[]>(STORAGE_KEYS.MEDICATION_REMINDERS, []);
        const storedLogs = loadFromStorage<MedicationLog[]>(STORAGE_KEYS.MEDICATION_LOGS, []);
        // Lọc reminders theo profile hiện tại
        setReminders(selectedProfileId ? storedReminders.filter(r => r.profileId === selectedProfileId) : storedReminders);
        setLogs(storedLogs);
        setLoaded(true);

        if (selectedProfileId) {
            syncFromPrescriptions(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProfileId]);

    // Persist helpers
    const persistReminders = useCallback((newReminders: MedicationReminder[]) => {
        setReminders(newReminders);
        saveToStorage(STORAGE_KEYS.MEDICATION_REMINDERS, newReminders);
    }, []);

    const persistLogs = useCallback((newLogs: MedicationLog[]) => {
        setLogs(newLogs);
        saveToStorage(STORAGE_KEYS.MEDICATION_LOGS, newLogs);
    }, []);

    // Computed data
    const profileReminders = reminders;
    const activeRems = useMemo(() => profileReminders.filter(r => r.isActive), [profileReminders]);

    const todaySchedule = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        const schedule: { reminder: MedicationReminder; time: string; log?: MedicationLog }[] = [];
        activeRems.forEach(rem => {
            rem.timesOfDay.forEach(time => {
                const log = logs.find(l => l.reminderId === rem.id && l.scheduledTime === time && l.date === today);
                schedule.push({ reminder: rem, time, log });
            });
        });
        return schedule.sort((a, b) => a.time.localeCompare(b.time));
    }, [activeRems, logs]);

    const compliance = useMemo(() => {
        const days: { date: string; taken: number; total: number; rate: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const date = d.toISOString().split("T")[0];
            const dayLogs = logs.filter(l => l.date === date && activeRems.some(r => r.id === l.reminderId));
            const total = activeRems.reduce((s, r) => s + r.timesOfDay.length, 0);
            const taken = dayLogs.filter(l => l.status === "taken").length;
            days.push({ date, taken, total, rate: total > 0 ? Math.round((taken / total) * 100) : 0 });
        }
        return days;
    }, [activeRems, logs]);

    const now = new Date();
    const nowHour = now.getHours();
    const nowMin = now.getMinutes();

    const markTaken = (reminderId: string, time: string) => {
        const today = new Date().toISOString().split("T")[0];
        const existing = logs.find(l => l.reminderId === reminderId && l.scheduledTime === time && l.date === today);
        if (existing) return;
        const newLog: MedicationLog = {
            id: `log-${Date.now()}`,
            reminderId,
            profileId: selectedProfileId,
            date: today,
            scheduledTime: time,
            actualTime: `${String(nowHour).padStart(2, "0")}:${String(nowMin).padStart(2, "0")}`,
            status: "taken",
        };
        persistLogs([...logs, newLog]);
        showToast("Đã ghi nhận uống thuốc! 💊", "success");
    };

    const markSkipped = (reminderId: string, time: string) => {
        const today = new Date().toISOString().split("T")[0];
        const existing = logs.find(l => l.reminderId === reminderId && l.scheduledTime === time && l.date === today);
        if (existing) return;
        const newLog: MedicationLog = {
            id: `log-${Date.now()}`,
            reminderId,
            profileId: selectedProfileId,
            date: today,
            scheduledTime: time,
            status: "skipped",
        };
        persistLogs([...logs, newLog]);
        showToast("Đã bỏ qua lần uống thuốc", "info");
    };

    // ============================================
    // Validation + Save medication
    // ============================================
    const validateForm = (): boolean => {
        const errs: Record<string, string> = {};
        const nameRes = validateRequired(formData.medicationName, "Tên thuốc");
        if (!nameRes.valid) errs.medicationName = nameRes.message;
        else if (formData.medicationName.trim().length < 2) errs.medicationName = "Tên thuốc phải có ít nhất 2 ký tự";

        const dosageRes = validateRequired(formData.dosage, "Liều dùng");
        if (!dosageRes.valid) errs.dosage = dosageRes.message;

        if (!formData.startDate) errs.startDate = "Vui lòng chọn ngày bắt đầu";
        if (!formData.endDate) errs.endDate = "Vui lòng chọn ngày kết thúc";

        if (formData.startDate && formData.endDate) {
            const dateRes = validateDateRange(formData.startDate, formData.endDate);
            if (!dateRes.valid) errs.endDate = dateRes.message;
        }

        // Validate giờ uống
        if (formData.timesOfDay.some(t => !t)) errs.timesOfDay = "Vui lòng chọn đầy đủ giờ uống";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSaveMedication = () => {
        if (!validateForm()) {
            showToast("Vui lòng kiểm tra lại thông tin", "error");
            return;
        }

        if (editingId) {
            const updated = reminders.map(r =>
                r.id === editingId
                    ? {
                        ...r,
                        medicationName: formData.medicationName.trim(),
                        dosage: formData.dosage.trim(),
                        frequency: formData.frequency,
                        timesOfDay: formData.timesOfDay,
                        instructions: formData.instructions.trim(),
                        startDate: formData.startDate,
                        endDate: formData.endDate,
                    }
                    : r
            );
            persistReminders(updated);
            showToast("Cập nhật nhắc thuốc thành công!", "success");
        } else {
            const newReminder: MedicationReminder = {
                id: `rem-${Date.now()}`,
                profileId: selectedProfileId,
                medicationName: formData.medicationName.trim(),
                dosage: formData.dosage.trim(),
                frequency: formData.frequency,
                timesOfDay: formData.timesOfDay,
                instructions: formData.instructions.trim() || "Uống theo chỉ dẫn",
                startDate: formData.startDate,
                endDate: formData.endDate,
                isActive: true,
                color: COLORS[reminders.length % COLORS.length],
                createdAt: new Date().toISOString(),
            };
            persistReminders([...reminders, newReminder]);
            showToast("Thêm nhắc thuốc thành công! 💊", "success");
        }

        setShowForm(false);
        setEditingId(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({ medicationName: "", dosage: "", frequency: 1, timesOfDay: ["08:00"], instructions: "", startDate: "", endDate: "" });
        setErrors({});
    };

    const openCreate = () => {
        resetForm();
        setEditingId(null);
        setShowForm(true);
    };

    const openEdit = (rem: MedicationReminder) => {
        setFormData({
            medicationName: rem.medicationName,
            dosage: rem.dosage,
            frequency: rem.frequency,
            timesOfDay: [...rem.timesOfDay],
            instructions: rem.instructions,
            startDate: rem.startDate,
            endDate: rem.endDate,
        });
        setEditingId(rem.id);
        setErrors({});
        setShowForm(true);
    };

    const handleDeactivate = (id: string) => {
        const updated = reminders.map(r => r.id === id ? { ...r, isActive: false } : r);
        persistReminders(updated);
        showToast("Đã ngừng nhắc thuốc", "info");
    };

    const overallCompliance = compliance.length > 0
        ? Math.round(compliance.reduce((sum, d) => sum + d.rate, 0) / compliance.length)
        : 0;

    const TABS: { key: TabKey; label: string; icon: string }[] = [
        { key: "today", label: "Hôm nay", icon: "today" },
        { key: "list", label: "Danh sách thuốc", icon: "medication" },
        { key: "stats", label: "Thống kê", icon: "analytics" },
    ];

    if (!loaded) return <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-[#3C81C6]" style={{ fontSize: "32px" }}>progress_activity</span></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#121417] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "28px" }}>medication</span>
                        Nhắc thuốc
                    </h1>
                    <p className="text-sm text-[#687582] mt-1">Theo dõi và quản lý việc dùng thuốc hàng ngày</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => syncFromPrescriptions()} disabled={isSyncing}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-[#1e242b] border border-gray-200 dark:border-gray-700 text-[#121417] dark:text-white rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-[#2d353e] transition-all disabled:opacity-50">
                        <span className={`material-symbols-outlined text-[#3C81C6] ${isSyncing ? "animate-spin" : ""}`} style={{ fontSize: "18px" }}>sync</span>
                        {isSyncing ? "Đang đồng bộ..." : "Đồng bộ đơn thuốc"}
                    </button>
                    <button onClick={openCreate}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.97]">
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                        Thêm nhắc thuốc
                    </button>
                </div>
            </div>

            {/* Profile Selector */}
            {profiles.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar">
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

            {/* Stats summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon="medication" label="Thuốc đang dùng" value={String(activeRems.length)} color="text-[#3C81C6] bg-[#3C81C6]/10" />
                <StatCard icon="schedule" label="Lần uống hôm nay" value={String(todaySchedule.length)} color="text-violet-600 bg-violet-50 dark:bg-violet-500/10" />
                <StatCard icon="check_circle" label="Đã uống" value={String(todaySchedule.filter(s => s.log?.status === "taken").length)} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" />
                <StatCard icon="trending_up" label="Tuân thủ 7 ngày" value={`${overallCompliance}%`}
                    color={overallCompliance >= 80 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-amber-600 bg-amber-50 dark:bg-amber-500/10"} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-[#13191f] rounded-xl p-1">
                {TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all
                        ${activeTab === tab.key ? "bg-white dark:bg-[#1e242b] text-[#3C81C6] shadow-sm" : "text-[#687582] hover:text-[#121417] dark:hover:text-white"}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ===== TAB: TODAY ===== */}
            {activeTab === "today" && (
                <div className="space-y-3">
                    {todaySchedule.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 mb-2" style={{ fontSize: "48px" }}>medication</span>
                            <p className="text-sm text-[#687582]">Không có thuốc cần uống hôm nay</p>
                            <button onClick={openCreate} className="mt-3 text-sm text-[#3C81C6] font-medium hover:underline">+ Thêm nhắc thuốc</button>
                        </div>
                    ) : (
                        todaySchedule.map((item) => {
                            const [h, m] = item.time.split(":").map(Number);
                            const isPast = h < nowHour || (h === nowHour && m <= nowMin);
                            const isTaken = item.log?.status === "taken";
                            const isMissed = isPast && !isTaken && item.log?.status !== "skipped";
                            const isSkipped = item.log?.status === "skipped";
                            const scheduleKey = `${item.reminder.id}-${item.time}`;

                            return (
                                <div key={scheduleKey}
                                    className={`bg-white dark:bg-[#1e242b] rounded-xl border p-4 flex items-center gap-4 transition-all
                                    ${isTaken ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5" :
                                        isMissed ? "border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5" :
                                        isSkipped ? "border-gray-200 dark:border-[#2d353e] opacity-60" :
                                        "border-[#e5e7eb] dark:border-[#2d353e]"}`}>
                                    <div className={`w-16 text-center flex-shrink-0 ${isTaken ? "text-emerald-600" : isMissed ? "text-red-500" : "text-[#121417] dark:text-white"}`}>
                                        <p className="text-lg font-bold">{item.time}</p>
                                        <p className="text-[10px] text-gray-400">{h < 12 ? "Sáng" : h < 18 ? "Chiều" : "Tối"}</p>
                                    </div>
                                    <div className={`w-0.5 h-12 rounded-full ${isTaken ? "bg-emerald-300" : isMissed ? "bg-red-300" : `bg-gradient-to-b ${item.reminder.color}`}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold ${isTaken ? "text-emerald-700 dark:text-emerald-400 line-through" : "text-[#121417] dark:text-white"}`}>
                                            {item.reminder.medicationName}
                                        </p>
                                        <p className="text-xs text-[#687582] mt-0.5">{item.reminder.dosage} — {item.reminder.instructions}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {isTaken ? (
                                            <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold">
                                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check_circle</span>
                                                Đã uống
                                            </div>
                                        ) : isSkipped ? (
                                            <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg text-xs font-bold">Bỏ qua</div>
                                        ) : isMissed ? (
                                            <div className="flex gap-1">
                                                <button onClick={() => markTaken(item.reminder.id, item.time)}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors active:scale-95">
                                                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>check</span>
                                                    Đã uống
                                                </button>
                                                <div className="flex items-center gap-1 px-2 py-1.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold">
                                                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>error</span>
                                                    Bỏ lỡ
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <button onClick={() => markTaken(item.reminder.id, item.time)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors active:scale-95">
                                                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span>
                                                    Đã uống
                                                </button>
                                                <button onClick={() => markSkipped(item.reminder.id, item.time)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors" title="Bỏ qua">
                                                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>skip_next</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ===== TAB: LIST ===== */}
            {activeTab === "list" && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Đang sử dụng ({activeRems.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeRems.map(rem => (
                            <MedicationCard key={rem.id} reminder={rem} onEdit={() => openEdit(rem)} onDeactivate={() => handleDeactivate(rem.id)} />
                        ))}
                    </div>
                    {activeRems.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-sm text-[#687582]">Chưa có thuốc nào cho hồ sơ này</p>
                            <button onClick={openCreate} className="mt-2 text-sm text-[#3C81C6] font-medium hover:underline">+ Thêm nhắc thuốc</button>
                        </div>
                    )}
                    {profileReminders.filter(r => !r.isActive).length > 0 && (
                        <>
                            <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 mt-6">
                                <span className="w-2 h-2 bg-gray-300 rounded-full" /> Đã hoàn thành
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60">
                                {profileReminders.filter(r => !r.isActive).map(rem => (
                                    <MedicationCard key={rem.id} reminder={rem} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ===== TAB: STATS ===== */}
            {activeTab === "stats" && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5">
                        <h3 className="text-sm font-bold text-[#121417] dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "20px" }}>bar_chart</span>
                            Tuân thủ 7 ngày gần nhất
                        </h3>
                        <div className="flex items-end gap-2 h-40">
                            {compliance.map(day => {
                                const dayName = new Date(day.date + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "short" });
                                const isToday = day.date === new Date().toISOString().split("T")[0];
                                return (
                                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-[10px] font-bold text-[#121417] dark:text-white">{day.rate}%</span>
                                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ height: "100px" }}>
                                            <div
                                                className={`w-full rounded-lg transition-all duration-500 ${day.rate >= 80 ? "bg-gradient-to-t from-emerald-500 to-emerald-400" : day.rate >= 50 ? "bg-gradient-to-t from-amber-500 to-amber-400" : "bg-gradient-to-t from-red-500 to-red-400"}`}
                                                style={{ height: `${day.rate}%`, marginTop: `${100 - day.rate}%` }}
                                            />
                                        </div>
                                        <span className={`text-[10px] font-medium ${isToday ? "text-[#3C81C6] font-bold" : "text-gray-400"}`}>
                                            {isToday ? "Nay" : dayName}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#e5e7eb] dark:border-[#2d353e] p-4 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${overallCompliance >= 80 ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-amber-50 dark:bg-amber-500/10"}`}>
                                <span className={`text-2xl font-black ${overallCompliance >= 80 ? "text-emerald-600" : "text-amber-600"}`}>{overallCompliance}%</span>
                            </div>
                            <p className="text-sm font-bold text-[#121417] dark:text-white">Tỷ lệ tuân thủ</p>
                            <p className="text-xs text-[#687582]">7 ngày gần nhất</p>
                        </div>
                        <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#e5e7eb] dark:border-[#2d353e] p-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-[#3C81C6]/10 flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-black text-[#3C81C6]">{compliance.reduce((s, d) => s + d.taken, 0)}</span>
                            </div>
                            <p className="text-sm font-bold text-[#121417] dark:text-white">Lần uống đúng giờ</p>
                            <p className="text-xs text-[#687582]">trong 7 ngày</p>
                        </div>
                        <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#e5e7eb] dark:border-[#2d353e] p-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-black text-red-500">{compliance.reduce((s, d) => s + (d.total - d.taken), 0)}</span>
                            </div>
                            <p className="text-sm font-bold text-[#121417] dark:text-white">Lần bỏ lỡ</p>
                            <p className="text-xs text-[#687582]">trong 7 ngày</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Modal: Add/Edit Medication ===== */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => { setShowForm(false); resetForm(); }}>
                    <div className="bg-white dark:bg-[#1e242b] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 dark:border-[#2d353e] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#121417] dark:text-white">{editingId ? "Chỉnh sửa nhắc thuốc" : "Thêm nhắc thuốc"}</h2>
                            <button onClick={() => { setShowForm(false); resetForm(); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="material-symbols-outlined text-gray-500" style={{ fontSize: "20px" }}>close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <MField label="Tên thuốc *" value={formData.medicationName} onChange={v => { setFormData(p => ({ ...p, medicationName: v })); setErrors(e => ({ ...e, medicationName: "" })); }} placeholder="VD: Amoxicillin 500mg" error={errors.medicationName} />
                            <MField label="Liều dùng *" value={formData.dosage} onChange={v => { setFormData(p => ({ ...p, dosage: v })); setErrors(e => ({ ...e, dosage: "" })); }} placeholder="VD: 1 viên" error={errors.dosage} />

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Số lần uống / ngày</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map(n => (
                                        <button key={n} onClick={() => {
                                            const defaults = [["08:00"], ["07:00", "19:00"], ["07:00", "13:00", "19:00"], ["06:00", "10:00", "14:00", "20:00"]];
                                            setFormData(p => ({ ...p, frequency: n, timesOfDay: defaults[n - 1] }));
                                        }}
                                            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all
                                            ${formData.frequency === n ? "border-[#3C81C6] bg-[#3C81C6]/[0.06] text-[#3C81C6]" : "border-gray-200 text-gray-600"}`}>
                                            {n}x/ngày
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Giờ uống</label>
                                <div className="flex flex-wrap gap-2">
                                    {formData.timesOfDay.map((time, idx) => (
                                        <input key={idx} type="time" value={time}
                                            onChange={e => {
                                                const newTimes = [...formData.timesOfDay];
                                                newTimes[idx] = e.target.value;
                                                setFormData(p => ({ ...p, timesOfDay: newTimes }));
                                                setErrors(e2 => ({ ...e2, timesOfDay: "" }));
                                            }}
                                            className="px-3 py-2 border border-gray-200 dark:border-[#2d353e] rounded-xl text-sm bg-gray-50 dark:bg-[#13191f] focus:outline-none focus:ring-2 focus:ring-[#3C81C6]/30" />
                                    ))}
                                </div>
                                {errors.timesOfDay && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "12px" }}>error</span>{errors.timesOfDay}</p>}
                            </div>

                            <MField label="Hướng dẫn / Ghi chú" value={formData.instructions} onChange={v => setFormData(p => ({ ...p, instructions: v }))} placeholder="VD: Uống sau ăn 30 phút" />

                            <div className="grid grid-cols-2 gap-4">
                                <MField label="Ngày bắt đầu *" value={formData.startDate} onChange={v => { setFormData(p => ({ ...p, startDate: v })); setErrors(e => ({ ...e, startDate: "" })); }} type="date" error={errors.startDate} />
                                <MField label="Ngày kết thúc *" value={formData.endDate} onChange={v => { setFormData(p => ({ ...p, endDate: v })); setErrors(e => ({ ...e, endDate: "" })); }} type="date" error={errors.endDate} />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-[#2d353e] flex items-center justify-end gap-3">
                            <button onClick={() => { setShowForm(false); resetForm(); }}
                                className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                Hủy
                            </button>
                            <button onClick={handleSaveMedication}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#3C81C6] to-[#2563eb] rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.97]">
                                {editingId ? "Lưu thay đổi" : "Tạo nhắc thuốc"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
    return (
        <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#e5e7eb] dark:border-[#2d353e] p-3 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>{icon}</span>
            </div>
            <div>
                <p className="text-xs text-[#687582]">{label}</p>
                <p className="text-lg font-bold text-[#121417] dark:text-white">{value}</p>
            </div>
        </div>
    );
}

function MedicationCard({ reminder, onEdit, onDeactivate }: { reminder: MedicationReminder; onEdit?: () => void; onDeactivate?: () => void }) {
    return (
        <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#e5e7eb] dark:border-[#2d353e] p-4">
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${reminder.color} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>medication</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-[#121417] dark:text-white truncate">{reminder.medicationName}</h4>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${reminder.isActive ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                            {reminder.isActive ? "Đang dùng" : "Đã xong"}
                        </span>
                    </div>
                    <p className="text-xs text-[#687582]">{reminder.dosage} • {reminder.frequency}x/ngày</p>
                    <p className="text-xs text-[#687582]">{reminder.instructions}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>schedule</span>
                            {reminder.timesOfDay.join(", ")}
                        </span>
                        <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>date_range</span>
                            {new Date(reminder.startDate + "T00:00:00").toLocaleDateString("vi-VN")} → {new Date(reminder.endDate + "T00:00:00").toLocaleDateString("vi-VN")}
                        </span>
                    </div>
                </div>
                {reminder.isActive && (onEdit || onDeactivate) && (
                    <div className="flex gap-1">
                        {onEdit && (
                            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-[#3C81C6] transition-colors" title="Sửa">
                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                            </button>
                        )}
                        {onDeactivate && (
                            <button onClick={onDeactivate} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors" title="Ngừng">
                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function MField({ label, value, onChange, type = "text", placeholder, error }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string;
}) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-[#13191f] focus:outline-none focus:ring-2 focus:ring-[#3C81C6]/30 placeholder-gray-400 transition-colors
                ${error ? "border-red-300 dark:border-red-500/40 focus:ring-red-300/30" : "border-gray-200 dark:border-[#2d353e]"}`} />
            {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "12px" }}>error</span>{error}</p>}
        </div>
    );
}
