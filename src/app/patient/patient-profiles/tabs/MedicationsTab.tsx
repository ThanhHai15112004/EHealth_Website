import React, { useEffect, useState } from "react";
import { type PatientProfile } from "@/types/patient-profile";
import axiosClient from "@/api/axiosClient";
import { EHR_ENDPOINTS } from "@/api/endpoints";
import Modal from "@/components/common/Modal";

interface TabProps {
    profile: PatientProfile;
}

export default function MedicationsTab({ profile }: TabProps) {
    const [medications, setMedications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMedications = async () => {
            try {
                setLoading(true);
                const patientId = profile.id;
                if (!patientId) return;
                const res = await axiosClient.get(EHR_ENDPOINTS.CURRENT_MEDICATIONS(patientId.toString()));
                const data = res.data?.data || res.data;
                setMedications(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching medications:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMedications();
    }, [profile.id]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Đơn thuốc & Điều trị</h3>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-[#3C81C6] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : medications.length > 0 ? (
                <div className="space-y-4">
                    {medications.map((med: any, index: number) => (
                        <div key={index} className="bg-gray-50 dark:bg-[#13191f] rounded-2xl p-5 border border-gray-100 dark:border-[#2d353e]">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                                        {med.brand_name || "Thuốc không xác định"}
                                    </h4>
                                    <span className="text-sm font-medium text-gray-500 mt-1">
                                        Liều lượng: {med.dosage || "Chưa xác định"} | Tần suất: {med.frequency || "Tùy chỉ định"}
                                    </span>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${med.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                    {med.status || "Đang dùng"}
                                </span>
                            </div>
                            {med.usage_instruction && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 border-t border-gray-200 dark:border-[#2d353e] pt-3">
                                    <span className="font-medium">Chỉ dẫn:</span> {med.usage_instruction}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-[#13191f] rounded-2xl p-10 text-center border border-gray-100 dark:border-[#2d353e]">
                    <div className="w-16 h-16 bg-[#3C81C6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "32px" }}>pill</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Chưa có đơn thuốc nào</h4>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">Thông tin về đơn thuốc và hướng dẫn điều trị của bệnh nhân sẽ hiển thị ở đây.</p>
                </div>
            )}
        </div>
    );
}
