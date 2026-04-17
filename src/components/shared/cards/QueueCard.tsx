"use client";

/**
 * QueueCard — dùng cho receptionist queue, doctor queue.
 * Hiển thị số thứ tự, bệnh nhân, ưu tiên, thời gian chờ, trạng thái.
 */

import { getInitials } from "@/utils/helpers";

export type QueuePriority = "urgent" | "normal" | "vip";
export type QueueStatus = "waiting" | "examining" | "done" | "called";

const PRIORITY_STYLE: Record<QueuePriority, { bar: string; badge: string; label: string }> = {
    urgent: { bar: "bg-red-500", badge: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300", label: "Khẩn cấp" },
    normal: { bar: "bg-blue-400", badge: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", label: "Thường" },
    vip: { bar: "bg-violet-500", badge: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300", label: "VIP" },
};

const STATUS_STYLE: Record<QueueStatus, { badge: string; label: string; icon: string }> = {
    waiting: { badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", label: "Chờ khám", icon: "schedule" },
    called: { badge: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", label: "Đã gọi", icon: "campaign" },
    examining: { badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", label: "Đang khám", icon: "stethoscope" },
    done: { badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", label: "Hoàn tất", icon: "check_circle" },
};

export interface QueueCardProps {
    queueNumber: string | number;
    patientName: string;
    patientAge?: number | string;
    patientGender?: "male" | "female" | "other" | string;
    priority?: QueuePriority;
    status?: QueueStatus;
    waitMinutes?: number;
    department?: string;
    note?: string;
    onCall?: () => void;
    onDetail?: () => void;
    onSkip?: () => void;
}

export function QueueCard({
    queueNumber,
    patientName,
    patientAge,
    patientGender,
    priority = "normal",
    status = "waiting",
    waitMinutes,
    department,
    note,
    onCall,
    onDetail,
    onSkip,
}: QueueCardProps) {
    const p = PRIORITY_STYLE[priority];
    const s = STATUS_STYLE[status];
    const genderLabel = patientGender === "male" ? "Nam" : patientGender === "female" ? "Nữ" : patientGender === "other" ? "Khác" : "";

    return (
        <div className="relative bg-white dark:bg-[#1e242b] rounded-2xl border border-[#dde0e4] dark:border-[#2d353e] shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.bar}`} />

            <div className="p-4 pl-5">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#3C81C6] to-[#1d4ed8] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {String(queueNumber).padStart(2, "0")}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-[#121417] dark:text-white truncate">{patientName}</h3>
                            {priority !== "normal" && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badge}`}>{p.label}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-[#687582] dark:text-gray-400">
                            {genderLabel && <span>{genderLabel}</span>}
                            {patientAge !== undefined && patientAge !== "" && <span>• {patientAge} tuổi</span>}
                            {department && <span>• {department}</span>}
                        </div>
                    </div>

                    <div className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg ${s.badge}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{s.icon}</span>
                        {s.label}
                    </div>
                </div>

                {note && (
                    <p className="text-xs text-[#687582] dark:text-gray-400 mt-2 line-clamp-2 pl-[60px]">
                        <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: "12px" }}>notes</span>
                        {note}
                    </p>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-1 text-xs text-[#687582] dark:text-gray-400">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
                        {waitMinutes !== undefined ? `Chờ ${waitMinutes} phút` : "—"}
                    </div>
                    <div className="flex items-center gap-1">
                        {onCall && status === "waiting" && (
                            <button onClick={onCall}
                                className="px-3 py-1 text-xs font-medium text-white bg-[#3C81C6] hover:bg-[#2b6cb0] rounded-lg transition-colors inline-flex items-center gap-1">
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>campaign</span>
                                Gọi
                            </button>
                        )}
                        {onSkip && status === "waiting" && (
                            <button onClick={onSkip}
                                className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                Bỏ qua
                            </button>
                        )}
                        {onDetail && (
                            <button onClick={onDetail}
                                className="px-2.5 py-1 text-xs font-medium text-[#3C81C6] hover:bg-[#3C81C6]/[0.08] rounded-lg transition-colors">
                                Chi tiết
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QueueCard;
