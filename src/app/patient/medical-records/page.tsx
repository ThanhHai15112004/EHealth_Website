"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { medicalRecordService } from "@/services/medicalRecordService";
import { getPatientsByAccountId } from "@/services/patientService";

interface MedicalRecord {
    id: string;
    date: string;
    doctorName: string;
    department: string;
    diagnosis: string;
    status: string;
}

export default function MedicalRecordsPage() {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState("");
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);

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
                console.error("Failed to load profiles", error);
                setLoading(false);
            }
        };
        loadProfiles();
    }, [user?.id]);

    useEffect(() => {
        if (!selectedProfileId) return;
        loadRecords();
    }, [selectedProfileId]);

    const loadRecords = async () => {
        try {
            setLoading(true);
            const res = await medicalRecordService.getByPatient(selectedProfileId);
            const raw = res.data?.data?.data || res.data?.data || res.data || [];
            
            const mappedRecords = (Array.isArray(raw) ? raw : []).map((r: any) => {
                let dateStr = r.date || "";
                if (r.start_time) {
                    const d = new Date(r.start_time);
                    dateStr = d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
                }
                
                return {
                    id: r.encounters_id || r.id,
                    date: dateStr,
                    doctorName: r.doctor_name || r.doctorName || "Chưa phân công",
                    department: r.specialty_name || r.encounter_type || r.department || "Khám bệnh",
                    diagnosis: r.primary_diagnosis || r.diagnosis || "Chưa có chẩn đoán",
                    status: r.status || "Chờ khám",
                };
            });
            
            setRecords(mappedRecords);
        } catch (err: any) {
            // 404 = bệnh nhân chưa có hồ sơ khám — là trạng thái bình thường, không log lỗi
            if (err?.response?.status !== 404) {
                console.error('Lỗi tải kết quả khám:', err);
            }
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kết quả khám bệnh</h1>
                <p className="text-sm text-gray-500 mt-0.5">Xem lại kết quả khám, đơn thuốc và xét nghiệm</p>
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

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                            <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : records.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                    <span className="material-symbols-outlined text-gray-300 mb-4" style={{ fontSize: "64px" }}>folder_open</span>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Chưa có kết quả khám</h3>
                    <p className="text-sm text-gray-400 mb-6">Kết quả sẽ được cập nhật sau mỗi lần khám tại EHealth</p>
                    <Link href="/patient/medical-records/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                        Thêm hồ sơ bệnh nhân
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {records.map(record => (
                        <div key={record.id} className="bg-white rounded-2xl border border-gray-100 hover:border-[#3C81C6]/20 hover:shadow-md transition-all p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3C81C6]/10 to-[#60a5fa]/10 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "24px" }}>description</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{record.department || "Kết quả khám"}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">BS. {record.doctorName}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                            <span className="inline-flex items-center gap-1">
                                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>event</span>
                                                {record.date}
                                            </span>
                                        </div>
                                        {record.diagnosis && (
                                            <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="font-medium text-gray-700">Chẩn đoán:</span> {record.diagnosis}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Link href={`/patient/medical-records/${record.id}`} className="px-3 py-1.5 text-xs font-medium text-[#3C81C6] border border-[#3C81C6]/20 rounded-lg hover:bg-[#3C81C6]/[0.06] transition-colors">
                                    Xem chi tiết
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
