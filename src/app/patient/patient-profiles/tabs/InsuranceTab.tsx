import React, { useState, useEffect } from "react";
import { type PatientProfile } from "@/types/patient-profile";
import Modal from "@/components/common/Modal";
import axiosClient from "@/api/axiosClient";
import { PATIENT_INSURANCE_ENDPOINTS } from "@/api/endpoints";

interface TabProps {
    profile: PatientProfile;
}

export default function InsuranceTab({ profile }: TabProps) {
    const [insurances, setInsurances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // For creating new insurance
    const [insuranceNum, setInsuranceNum] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [expiry, setExpiry] = useState("");
    const [provider, setProvider] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchInsurances = async () => {
        try {
            setLoading(true);
            const patientId = profile.id;
            if (!patientId) return;
            const res = await axiosClient.get(PATIENT_INSURANCE_ENDPOINTS.LIST, {
                params: { patient_id: patientId }
            });
            const data = res.data?.data || res.data;
            setInsurances(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching insurances:", error);
            // Don't throw unhandled if patient not found
            setInsurances([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsurances();
    }, [profile.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const patientId = profile.id;
            if (!patientId) return;

            await axiosClient.post(PATIENT_INSURANCE_ENDPOINTS.LIST, {
                patient_id: patientId,
                insurance_number: insuranceNum,
                provider_id: provider || "INS_BHYT",
                start_date: startDate,
                end_date: expiry,
            });

            alert("Cập nhật bảo hiểm thành công!");
            setIsModalOpen(false);
            
            // Reset form and refetch
            setInsuranceNum("");
            setStartDate(new Date().toISOString().split('T')[0]);
            setExpiry("");
            setProvider("");
            await fetchInsurances();
        } catch (error) {
            console.error("Lỗi cập nhật bảo hiểm:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại sau.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Bảo hiểm Y tế</h3>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3C81C6] text-white rounded-xl hover:bg-[#2b6cb0] transition-colors text-sm font-medium"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                        add
                    </span>
                    Thêm bảo hiểm
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-[#3C81C6] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : insurances.length > 0 ? (
                insurances.map((ins, idx) => (
                    <div key={ins.id || idx} className="relative overflow-hidden bg-gradient-to-br from-[#3C81C6] to-[#2563eb] rounded-2xl p-6 text-white shadow-md mb-4">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined" style={{ fontSize: "120px" }}>health_and_safety</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="font-bold tracking-wider opacity-90 text-sm">{ins.provider || "THẺ BẢO HIỂM Y TẾ"}</div>
                                <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>verified_user</span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs opacity-70 mb-1">Họ và tên</div>
                                    <div className="text-lg font-medium">{profile.fullName}</div>
                                </div>
                                <div>
                                    <div className="text-xs opacity-70 mb-1">Mã số thẻ</div>
                                    <div className="text-xl tracking-widest font-mono font-bold bg-white/10 inline-block px-4 py-1.5 rounded-lg">
                                        {ins.insurance_number ? ins.insurance_number.replace(/(.{4})/g, "$1 ").trim() : "Chưa cập nhật"}
                                    </div>
                                </div>
                                {ins.expiration_date && (
                                    <div>
                                        <div className="text-xs opacity-70 mb-1">Giá trị sử dụng đến</div>
                                        <div className="font-medium">{new Date(ins.expiration_date).toLocaleDateString("vi-VN")}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-gray-50 dark:bg-[#13191f] rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-[#2d353e]">
                    <div className="w-20 h-20 bg-[#3C81C6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "40px" }}>health_and_safety</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Chưa cập nhật</h4>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">Chưa có thông tin bảo hiểm y tế cho hồ sơ này.</p>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Thông tin Bảo hiểm y tế"
                size="sm"
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="provider" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Loại bảo hiểm / Nhà cung cấp
                        </label>
                        <select
                            id="provider"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        >
                            <option value="">-- Chọn nơi cấp --</option>
                            <option value="INS_BHYT">Bảo hiểm Y tế Việt Nam (BHYT)</option>
                            <option value="INS_BHXH_HCM">Bảo hiểm Xã hội TP. Hồ Chí Minh</option>
                            <option value="INS_BAOVIET">Tổng Công ty Bảo hiểm Bảo Việt</option>
                            <option value="INS_PRUDENTIAL">Prudential Việt Nam</option>
                            <option value="INS_MANULIFE">Manulife Việt Nam</option>
                            <option value="INS_AIA">AIA Việt Nam</option>
                            <option value="INS_DAIICHI">Dai-ichi Life Việt Nam</option>
                            <option value="INS_PVI">Bảo hiểm PVI (PVI Insurance)</option>
                            <option value="INS_MICS">Bảo hiểm Quân đội (MIC)</option>
                            <option value="INS_LIBERTY">Liberty Insurance Việt Nam</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="insuranceNum" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mã số thẻ BHYT
                        </label>
                        <input
                            id="insuranceNum"
                            value={insuranceNum}
                            onChange={(e) => setInsuranceNum(e.target.value)}
                            placeholder="Ví dụ: DN401..."
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Ngày có hiệu lực
                        </label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="expiry" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Giá trị sử dụng đến
                        </label>
                        <input
                            id="expiry"
                            type="date"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            disabled={submitting}
                            className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="px-4 py-2 bg-[#3C81C6] text-white rounded-xl text-sm font-medium hover:bg-[#2b6cb0] flex items-center gap-2"
                        >
                            {submitting ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Lưu...</>
                            ) : "Xác nhận"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
