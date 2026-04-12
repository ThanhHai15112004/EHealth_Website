import React from "react";
import { type PatientProfile } from "@/data/patient-profiles-mock";

interface PatientDetailProps {
    profile: PatientProfile;
    onBack: () => void;
    onEdit: () => void;
}

export default function PatientDetail({ profile, onBack, onEdit }: PatientDetailProps) {
    return (
        <div className="bg-white dark:bg-[#0d1117] rounded-2xl border border-gray-100 dark:border-[#2d353e] p-6 shadow-sm">
            {/* Header / Back */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-[#2d353e]">
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
                <button onClick={onEdit} className="p-2 text-[#3C81C6] bg-[#3C81C6]/10 hover:bg-[#3C81C6]/20 rounded-xl transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Info Card */}
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

                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-green-500" style={{ fontSize: "20px" }}>health_metrics</span>
                            Thông tin y tế cơ bản
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
                            <div>
                                <label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "14px" }}>history</span> Tiền sử bệnh nền</label>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.medicalHistory || "Không có tiền sử bệnh nền đáng lưu ý"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right col: Insurance & Docs */}
                <div className="space-y-6">
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#3C81C6] to-[#2563eb] rounded-2xl p-5 text-white shadow-md">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined" style={{ fontSize: "100px" }}>health_and_safety</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="font-bold tracking-wider opacity-90">BẢO HIỂM Y TẾ</div>
                                <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>verified_user</span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs opacity-70 mb-0.5">Mã số thẻ</div>
                                    <div className="text-lg tracking-widest font-mono font-bold bg-white/10 inline-block px-3 py-1 rounded-lg">
                                        {profile.insuranceNumber ? profile.insuranceNumber.replace(/(.{4})/g, "$1 ").trim() : "Chưa cập nhật"}
                                    </div>
                                </div>
                                {profile.insuranceExpiry && (
                                    <div>
                                        <div className="text-xs opacity-70 mb-0.5">Giá trị đến</div>
                                        <div className="font-medium">{new Date(profile.insuranceExpiry).toLocaleDateString("vi-VN")}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "20px" }}>description</span>
                            Tài liệu y tế
                        </h3>
                        <div className="bg-gray-50 dark:bg-[#13191f] rounded-xl border border-gray-100 dark:border-[#2d353e] p-8 text-center">
                            <div className="w-16 h-16 bg-[#3C81C6]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "32px" }}>folder_open</span>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white mb-1">Chưa có tài liệu trực tuyến</p>
                            <p className="text-xs text-gray-500 max-w-[250px] mx-auto leading-relaxed">
                                Kết quả khám, xét nghiệm và đơn thuốc sẽ được tự động cập nhật tại đây sau mỗi lần khám.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper component
const InfoRow = ({ icon, label, value, valueColor = "text-gray-900 dark:text-white" }: { icon: string, label: string, value: string, valueColor?: string }) => (
    <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-gray-400 mt-0.5" style={{ fontSize: "18px" }}>{icon}</span>
        <div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className={`text-sm font-medium ${valueColor}`}>{value}</p>
        </div>
    </div>
);
