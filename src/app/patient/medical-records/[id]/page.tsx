"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { medicalRecordService } from "@/services/medicalRecordService";

export default function MedicalRecordDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [recordData, setRecordData] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await medicalRecordService.getDetail(id);
                // The backend returns { success: true, data: { ... } }
                const result = res.data?.data || res.data;
                setRecordData(result);
            } catch (error) {
                console.error("Failed to load medical record details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center flex-col items-center h-64 space-y-4">
                <span className="material-symbols-outlined animate-spin text-[#3C81C6]" style={{ fontSize: "40px" }}>progress_activity</span>
                <p className="text-gray-500 font-medium">Đang tải thông tin bệnh án...</p>
            </div>
        );
    }

    if (!recordData || !recordData.encounter) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                <span className="material-symbols-outlined text-gray-300 mb-4" style={{ fontSize: "64px" }}>error_outline</span>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Không tìm thấy bệnh án</h3>
                <p className="text-sm text-gray-400 mb-6">Bệnh án bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền xem.</p>
                <button 
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
                    Quay lại
                </button>
            </div>
        );
    }

    const { encounter, clinical_examination, diagnoses, medical_orders, prescription, completeness } = recordData;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[#1e242b] rounded-full transition-colors text-gray-500"
                >
                    <span className="material-symbols-outlined hidden dark:block">arrow_back</span>
                    <span className="material-symbols-outlined dark:hidden">arrow_back_ios_new</span>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#121417] dark:text-white">Chi tiết bệnh án</h1>
                    <p className="text-sm text-[#687582] mt-0.5">Mã lần khám: {encounter.id}</p>
                </div>
            </div>

            {/* Overview / General Info */}
            <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-6">
                <h3 className="text-lg font-bold text-[#121417] dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">Thông tin chung</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <p className="text-sm text-[#687582] mb-1">Họ tên bác sĩ</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{encounter.doctor_name || "Chưa cập nhật"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-[#687582] mb-1">Chuyên khoa / Phòng</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{encounter.specialty_name || encounter.encounter_type}</p>
                    </div>
                    <div>
                        <p className="text-sm text-[#687582] mb-1">Thời gian bắt đầu</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {encounter.start_time ? new Date(encounter.start_time).toLocaleString('vi-VN') : "--"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-[#687582] mb-1">Trạng thái bệnh án</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${encounter.is_finalized ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10"}`}>
                                {encounter.is_finalized ? "Đã khóa" : "Đang xử lý"}
                            </span>
                        </p>
                    </div>
                </div>
                {encounter.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-[#687582] mb-1">Ghi chú</p>
                        <p className="text-sm text-gray-800 dark:text-gray-300">{encounter.notes}</p>
                    </div>
                )}
            </div>

            {/* Clinical Examination */}
            {clinical_examination && (
                <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-6">
                    <h3 className="text-lg font-bold text-[#121417] dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "22px" }}>stethoscope</span>
                        Khám lâm sàng
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-[#13191f] rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-sm text-[#687582] mb-1 font-medium">Lý do khám bệnh</p>
                                <p className="text-sm font-semibold">{clinical_examination.chief_complaint || "--"}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-[#13191f] rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-sm text-[#687582] mb-1 font-medium">Bệnh sử</p>
                                <p className="text-sm font-semibold">{clinical_examination.present_illness || "--"}</p>
                            </div>
                        </div>

                        {/* Vitals inside Clinical */}
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mt-4 mb-2 tracking-wider">Chỉ số sinh hiệu</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="flex flex-col items-center justify-center p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                <span className="text-xs text-gray-500 mb-1">Huyết áp</span>
                                <span className="font-bold text-lg text-rose-500">
                                    {(clinical_examination.blood_pressure_systolic && clinical_examination.blood_pressure_diastolic) 
                                        ? `${clinical_examination.blood_pressure_systolic}/${clinical_examination.blood_pressure_diastolic}` 
                                        : "--"}
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                <span className="text-xs text-gray-500 mb-1">Nhịp tim</span>
                                <span className="font-bold text-lg text-red-500">
                                    {clinical_examination.pulse ? `${clinical_examination.pulse} bpm` : "--"}
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                <span className="text-xs text-gray-500 mb-1">Nhiệt độ</span>
                                <span className="font-bold text-lg text-orange-500">
                                    {clinical_examination.temperature ? `${clinical_examination.temperature}°C` : "--"}
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                <span className="text-xs text-gray-500 mb-1">Cân nặng</span>
                                <span className="font-bold text-lg text-blue-500">
                                    {clinical_examination.weight ? `${clinical_examination.weight}kg` : "--"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Diagnoses */}
            {diagnoses && diagnoses.length > 0 && (
                <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-6">
                    <h3 className="text-lg font-bold text-[#121417] dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500" style={{ fontSize: "22px" }}>clinical_notes</span>
                        Chẩn đoán
                    </h3>
                    <div className="space-y-3">
                        {diagnoses.map((diag: any, index: number) => (
                            <div key={diag.id || `diag-${index}`} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-green-50 dark:bg-[#13191f] rounded-xl border border-green-100 dark:border-green-900/30">
                                <div className={`px-2 py-1 rounded text-xs font-bold w-max ${diag.diagnosis_type === "PRIMARY" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}>
                                    {diag.diagnosis_type === "PRIMARY" ? "Chẩn đoán chính" : "Chẩn đoán phụ"}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{diag.diagnosis_name}</p>
                                    {diag.icd10_code && <p className="text-xs text-gray-500 mt-0.5">ICD-10: <span className="font-mono bg-white dark:bg-gray-800 px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700">{diag.icd10_code}</span></p>}
                                </div>
                                {diag.notes && <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm italic">"{diag.notes}"</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Medical Orders (Cận lâm sàng) */}
            {medical_orders && medical_orders.length > 0 && (
                <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-6">
                    <h3 className="text-lg font-bold text-[#121417] dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500" style={{ fontSize: "22px" }}>biotech</span>
                        Chỉ định cận lâm sàng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {medical_orders.map((order: any, index: number) => (
                            <div key={order.id || `order-${index}`} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-purple-500" style={{ fontSize: "20px" }}>science</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{order.service_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">Trạng thái: <span className="font-semibold">{order.status || "Hoàn thành"}</span></p>
                                        {order.result_summary && (
                                            <div className="mt-2 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                                                <span className="font-medium">Kết quả:</span> {order.result_summary}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Prescription */}
            {prescription && prescription.details && prescription.details.length > 0 && (
                <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-6">
                    <h3 className="text-lg font-bold text-[#121417] dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500" style={{ fontSize: "22px" }}>medication</span>
                        Đơn thuốc
                    </h3>
                    {prescription.prescription_code && (
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Mã đơn thuốc: <span className="text-gray-900 dark:text-white">{prescription.prescription_code}</span></p>
                    )}
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs font-semibold text-[#687582] uppercase border-b border-[#e5e7eb] dark:border-[#2d353e]">
                                    <th className="text-left py-3">Tên thuốc</th>
                                    <th className="text-center py-3">S.Lượng</th>
                                    <th className="text-left py-3">Cách dùng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescription.details.map((med: any, index: number) => (
                                    <tr key={med.id || `med-${index}`} className="border-b border-[#e5e7eb]/50 dark:border-[#2d353e]/50 hover:bg-[#f6f7f8] dark:hover:bg-[#13191f]">
                                        <td className="py-3 font-bold text-[#121417] dark:text-white">
                                            {med.brand_name || med.medicine_name} <span className="font-normal text-xs text-gray-500 ml-1">({med.dispensing_unit || med.unit})</span>
                                        </td>
                                        <td className="py-3 text-center font-medium text-[#121417] dark:text-white">{med.quantity}</td>
                                        <td className="py-3 text-[#121417] dark:text-white italic">{med.usage_instruction || med.usage_instructions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
