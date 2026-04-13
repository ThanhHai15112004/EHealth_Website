import React, { useEffect, useState } from "react";
import { type PatientProfile } from "@/types/patient-profile";
import axiosClient from "@/api/axiosClient";
import { ENCOUNTER_ENDPOINTS } from "@/api/endpoints";
import Modal from "@/components/common/Modal";

interface TabProps {
    profile: PatientProfile;
}

export default function EncountersTab({ profile }: TabProps) {
    const [encounters, setEncounters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEncounters = async () => {
        try {
            setLoading(true);
            const patientId = profile.id;
            if (!patientId) return;
            const res = await axiosClient.get(ENCOUNTER_ENDPOINTS.BY_PATIENT(patientId.toString()));
            const data = res.data?.data || res.data;
            setEncounters(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching encounters:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEncounters();
    }, [profile.id]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Khám bệnh & Lịch hẹn</h3>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-[#3C81C6] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : encounters.length > 0 ? (
                <div className="space-y-4">
                    {encounters.map((encounter: any, index: number) => (
                        <div key={index} className="bg-gray-50 dark:bg-[#13191f] rounded-2xl p-5 border border-gray-100 dark:border-[#2d353e]">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-500 mb-1">
                                        Ngày khám: {encounter.encounterDate ? new Date(encounter.encounterDate).toLocaleDateString("vi-VN") : "Đang chờ"}
                                    </span>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                                        {encounter.departmentName || "Khám Lâm Sàng"}
                                    </h4>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${encounter.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-[#3C81C6]'}`}>
                                    {encounter.status || "Hoạt động"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 border-t border-gray-200 dark:border-[#2d353e] pt-3">
                                {encounter.reasonForVisit || "Chưa ghi chú"}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-[#13191f] rounded-2xl p-10 text-center border border-gray-100 dark:border-[#2d353e]">
                    <div className="w-16 h-16 bg-[#3C81C6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "32px" }}>stethoscope</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Chưa có lịch sử khám bệnh</h4>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">Các đợt tư vấn, khám lâm sàng và chẩn đoán của bệnh nhân sẽ được lưu trữ và hiển thị tại đây.</p>
                </div>
            )}
        </div>
    );
}
