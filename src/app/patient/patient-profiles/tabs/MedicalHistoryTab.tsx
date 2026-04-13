import React, { useEffect, useState } from "react";
import { type PatientProfile } from "@/types/patient-profile";
import axiosClient from "@/api/axiosClient";
import { EHR_ENDPOINTS } from "@/api/endpoints";
import Modal from "@/components/common/Modal";

interface TabProps {
    profile: PatientProfile;
}

export default function MedicalHistoryTab({ profile }: TabProps) {
    const [allergies, setAllergies] = useState<string[]>([]);
    const [medicalHistory, setMedicalHistory] = useState<any>("");
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formType, setFormType] = useState<'allergi' | 'history'>('allergi');
    const [submitting, setSubmitting] = useState(false);

    // Form data cho Dị ứng
    const [allergenName, setAllergenName] = useState("");
    const [reaction, setReaction] = useState("");
    const [severity, setSeverity] = useState("MILD");

    // Form data cho Bệnh nền
    const [conditionName, setConditionName] = useState("");
    const [diagnosisYear, setDiagnosisYear] = useState("");
    const [historyStatus, setHistoryStatus] = useState("ACTIVE");

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const patientId = profile.id; 
            if (!patientId) return;

            const [allergiesRes, historyRes] = await Promise.all([
                axiosClient.get(EHR_ENDPOINTS.ALLERGIES(patientId.toString())).catch(() => null),
                axiosClient.get(EHR_ENDPOINTS.MEDICAL_HISTORY(patientId.toString())).catch(() => null)
            ]);

            if (allergiesRes?.data?.data) {
                const items = Array.isArray(allergiesRes.data.data) ? allergiesRes.data.data : [];
                setAllergies(items.map((item: any) => typeof item === 'string' ? item : (item.allergen_name || item.name || item.allergen || String(item))));
            } else if (profile.allergies) {
                setAllergies(profile.allergies);
            }

            if (historyRes?.data?.data) {
                const data = historyRes.data.data;
                if (Array.isArray(data)) {
                    if (data.length === 0) {
                        setMedicalHistory("");
                    } else {
                        setMedicalHistory(data.map(d => d.condition_name || d.name || JSON.stringify(d)).join("\n"));
                    }
                } else {
                    setMedicalHistory(typeof data === 'string' ? data : JSON.stringify(data));
                }
            } else if (profile.medicalHistory) {
                setMedicalHistory(profile.medicalHistory);
            }
        } catch (error) {
            console.error("Error fetching medical histories:", error);
            setAllergies(profile.allergies || []);
            setMedicalHistory(profile.medicalHistory || "");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [profile.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const patientId = profile.id?.toString();
            if (!patientId) return;

            if (formType === 'allergi') {
                const payload = {
                    allergen_name: allergenName,
                    allergen_type: "OTHER", // default to OTHER as we don't have this field in form yet
                    reaction: reaction,
                    severity: severity
                };
                await axiosClient.post(EHR_ENDPOINTS.ADD_ALLERGY(patientId), payload);
                alert("Thêm dị ứng thành công!");
                setAllergenName("");
                setReaction("");
                setSeverity("MILD");
            } else {
                const payload = {
                    condition_name: conditionName,
                    history_type: "PERSONAL",
                    diagnosis_date: diagnosisYear ? `${diagnosisYear}-01-01` : undefined,
                    status: historyStatus
                };
                await axiosClient.post(EHR_ENDPOINTS.ADD_MEDICAL_HISTORY(patientId), payload);
                alert("Thêm lịch sử bệnh thành công!");
                setConditionName("");
                setDiagnosisYear("");
                setHistoryStatus("ACTIVE");
            }
            
            setIsAddModalOpen(false);
            await fetchHistory();
        } catch (error) {
            console.error("Lỗi khi thêm thông tin:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại sau.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-[#3C81C6] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Tiền sử y tế & Dị ứng</h3>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3C81C6] text-white rounded-xl hover:bg-[#2b6cb0] transition-colors text-sm font-medium">
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                    Thêm tiền sử mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dị ứng */}
                <div className="bg-gray-50 dark:bg-[#13191f] rounded-2xl p-6 border border-gray-100 dark:border-[#2d353e]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">warning</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Dị ứng</h4>
                    </div>
                    {allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {allergies.map((a: string, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg border border-red-200 dark:border-red-500/20">
                                    {a}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Không ghi nhận dị ứng.</p>
                    )}
                </div>

                {/* Bệnh nền */}
                <div className="bg-gray-50 dark:bg-[#13191f] rounded-2xl p-6 border border-gray-100 dark:border-[#2d353e]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">personal_injury</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Bệnh nền & Phẫu thuật</h4>
                    </div>
                    <p className="text-gray-900 dark:text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {medicalHistory || "Chưa có thông tin bệnh nền."}
                    </p>
                </div>
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Cập nhật Tiền sử & Dị ứng"
                size="md"
            >
                <div className="flex gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <button 
                        onClick={() => setFormType('allergi')}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${formType === 'allergi' ? 'bg-[#3C81C6] text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                    >
                        Thêm Dị ứng
                    </button>
                    <button 
                        onClick={() => setFormType('history')}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${formType === 'history' ? 'bg-[#3C81C6] text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                    >
                        Thêm Bệnh nền
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {formType === 'allergi' ? (
                        <>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="allergenName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên dị ứng <span className="text-red-500">*</span></label>
                                <input 
                                    id="allergenName"
                                    title="Tên dị ứng"
                                    value={allergenName}
                                    onChange={e => setAllergenName(e.target.value)}
                                    required
                                    placeholder="Ví dụ: Đậu phộng, Penicillin, v.v..."
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="reaction" className="text-sm font-medium text-gray-700 dark:text-gray-300">Biểu hiện / Phản ứng <span className="text-red-500">*</span></label>
                                <input 
                                    id="reaction"
                                    title="Biểu hiện"
                                    value={reaction}
                                    onChange={e => setReaction(e.target.value)}
                                    required
                                    placeholder="Phát ban, khó thở..."
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="severity" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mức độ <span className="text-red-500">*</span></label>
                                <select 
                                    id="severity"
                                    title="Mức độ"
                                    value={severity}
                                    onChange={e => setSeverity(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="MILD">Nhẹ</option>
                                    <option value="MODERATE">Vừa</option>
                                    <option value="SEVERE">Nặng</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="conditionName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên bệnh / Vấn đề <span className="text-red-500">*</span></label>
                                <input 
                                    id="conditionName"
                                    title="Tên bệnh"
                                    value={conditionName}
                                    onChange={e => setConditionName(e.target.value)}
                                    required
                                    placeholder="Ví dụ: Tăng huyết áp, Đái tháo đường..."
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 flex flex-col gap-1">
                                    <label htmlFor="diagnosisYear" className="text-sm font-medium text-gray-700 dark:text-gray-300">Năm chẩn đoán</label>
                                    <input 
                                        id="diagnosisYear"
                                        title="Năm chẩn đoán"
                                        type="number"
                                        value={diagnosisYear}
                                        onChange={e => setDiagnosisYear(e.target.value)}
                                        placeholder="Ví dụ: 2020"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <label htmlFor="historyStatus" className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái <span className="text-red-500">*</span></label>
                                    <select 
                                        id="historyStatus"
                                        title="Trạng thái"
                                        value={historyStatus}
                                        onChange={e => setHistoryStatus(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="ACTIVE">Đang điều trị</option>
                                        <option value="RESOLVED">Đã khỏi</option>
                                        <option value="INACTIVE">Không rõ</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button 
                            type="button" 
                            onClick={() => setIsAddModalOpen(false)} 
                            disabled={submitting}
                            className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="px-4 py-2 bg-[#3C81C6] text-white rounded-xl text-sm font-medium hover:bg-[#2b6cb0] flex items-center gap-2"
                        >
                            {submitting ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Lưu...</>
                            ) : "Lưu thông tin"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
