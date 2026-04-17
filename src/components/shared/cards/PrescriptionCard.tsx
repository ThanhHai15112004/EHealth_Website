"use client";

/**
 * PrescriptionCard — dùng cho pharmacist pending list, doctor prescriptions, patient view.
 * Hiển thị mã đơn, bệnh nhân, bác sĩ, khoa, số thuốc, thời gian, cờ khẩn.
 */

import { formatRelativeTime } from "@/utils/formatters";

export type PrescriptionStatus = "pending" | "dispensing" | "dispensed" | "cancelled" | "draft";

const STATUS_STYLE: Record<PrescriptionStatus, { badge: string; label: string; icon: string }> = {
    draft: { badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", label: "Nháp", icon: "edit_note" },
    pending: { badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", label: "Chờ cấp", icon: "pending_actions" },
    dispensing: { badge: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", label: "Đang cấp", icon: "local_pharmacy" },
    dispensed: { badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", label: "Đã cấp", icon: "check_circle" },
    cancelled: { badge: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300", label: "Đã huỷ", icon: "cancel" },
};

export interface PrescriptionCardProps {
    code?: string;
    patientName: string;
    doctorName?: string;
    department?: string;
    medicineCount: number;
    createdAt?: string;
    urgent?: boolean;
    status?: PrescriptionStatus;
    totalAmount?: number;
    onDispense?: () => void;
    onDetail?: () => void;
    onCancel?: () => void;
}

export function PrescriptionCard({
    code,
    patientName,
    doctorName,
    department,
    medicineCount,
    createdAt,
    urgent = false,
    status = "pending",
    totalAmount,
    onDispense,
    onDetail,
    onCancel,
}: PrescriptionCardProps) {
    const s = STATUS_STYLE[status];

    return (
        <div className={`bg-white dark:bg-[#1e242b] rounded-2xl border ${urgent ? "border-red-300 dark:border-red-700 ring-1 ring-red-200 dark:ring-red-900/50" : "border-[#dde0e4] dark:border-[#2d353e]"} shadow-sm hover:shadow-md transition-all overflow-hidden group`}>
            {urgent && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 flex items-center gap-2 text-xs font-semibold">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>priority_high</span>
                    Đơn khẩn cấp — ưu tiên cấp phát
                </div>
            )}

            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 flex items-center justify-center text-blue-600">
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>medication</span>
                        </div>
                        <div>
                            {code && <p className="text-[11px] font-mono text-[#687582] dark:text-gray-500">#{code}</p>}
                            <h3 className="font-semibold text-sm text-[#121417] dark:text-white truncate">{patientName}</h3>
                        </div>
                    </div>
                    <div className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg ${s.badge} flex-shrink-0`}>
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{s.icon}</span>
                        {s.label}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#687582] dark:text-gray-400 mb-3">
                    {doctorName && (
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: "14px" }}>stethoscope</span>
                            <span className="truncate">{doctorName}</span>
                        </div>
                    )}
                    {department && (
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: "14px" }}>local_hospital</span>
                            <span className="truncate">{department}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: "14px" }}>pill</span>
                        <span>{medicineCount} thuốc</span>
                    </div>
                    {createdAt && (
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: "14px" }}>schedule</span>
                            <span className="truncate">{formatRelativeTime(createdAt)}</span>
                        </div>
                    )}
                </div>

                {totalAmount !== undefined && (
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-3">
                        <span className="text-xs text-[#687582] dark:text-gray-400">Tổng tiền</span>
                        <span className="text-sm font-bold text-[#121417] dark:text-white">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                        </span>
                    </div>
                )}

                {(onDispense || onDetail || onCancel) && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                        {onDispense && (status === "pending" || status === "dispensing") && (
                            <button onClick={onDispense}
                                className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#3C81C6] hover:bg-[#2b6cb0] rounded-lg transition-colors inline-flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>local_pharmacy</span>
                                Cấp phát
                            </button>
                        )}
                        {onDetail && (
                            <button onClick={onDetail}
                                className="px-3 py-1.5 text-xs font-medium text-[#3C81C6] hover:bg-[#3C81C6]/[0.08] border border-[#3C81C6]/20 rounded-lg transition-colors">
                                Chi tiết
                            </button>
                        )}
                        {onCancel && status === "pending" && (
                            <button onClick={onCancel}
                                className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                Huỷ
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PrescriptionCard;
