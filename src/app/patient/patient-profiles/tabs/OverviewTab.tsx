import React from "react";
import { type PatientProfile } from "@/types/patient-profile";

interface TabProps {
    profile: PatientProfile;
}

export default function OverviewTab({ profile }: TabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "20px" }}>person</span>
                        Thông tin cá nhân
                    </h3>
                    <div className="bg-gray-50 dark:bg-[#13191f] rounded-xl p-4 space-y-4">
                        <InfoRow icon="calendar_today" label="Ngày sinh" value={profile.dob ? new Date(profile.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"} />
                        <InfoRow icon="wc" label="Giới tính" value={profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : "Khác"} />
                        <InfoRow icon="call" label="Số điện thoại" value={profile.phone} />
                        <InfoRow icon="badge" label="CCCD/CMND" value={profile.idNumber || "Chưa cập nhật"} />
                        <InfoRow icon="home" label="Địa chỉ" value={profile.address || "Chưa cập nhật"} />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-green-500" style={{ fontSize: "20px" }}>health_metrics</span>
                        Sức khoẻ cơ bản
                    </h3>
                    <div className="bg-green-50/50 dark:bg-green-500/5 rounded-xl p-4 space-y-4 border border-green-100 dark:border-green-500/10">
                        <InfoRow icon="bloodtype" label="Nhóm máu" value={profile.bloodType || "Chưa xác định"} valueColor="text-red-500 font-bold" />
                        <div>
                            <label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "14px" }}>warning</span> Dị ứng</label>
                            {profile.allergies && profile.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {profile.allergies.map(a => <span key={a} className="px-2.5 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg">{a}</span>)}
                                </div>
                            ) : <p className="text-sm font-medium text-gray-900 dark:text-white">Không có tiền sử dị ứng</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const InfoRow = ({ icon, label, value, valueColor = "text-gray-900 dark:text-white" }: { icon: string, label: string, value: string, valueColor?: string }) => (
    <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-gray-400 mt-0.5" style={{ fontSize: "18px" }}>{icon}</span>
        <div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className={`text-sm font-medium ${valueColor}`}>{value}</p>
        </div>
    </div>
);
