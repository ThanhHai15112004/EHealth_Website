import React, { useEffect, useState } from "react";
import { type PatientProfile } from "@/types/patient-profile";
import axiosClient from "@/api/axiosClient";
import { PATIENT_ENDPOINTS } from "@/api/endpoints";

interface TabProps {
    profile: PatientProfile;
}

export default function TimelineTab({ profile }: TabProps) {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "recent">("all");

    // Lọc sự kiện "gần đây" (ví dụ: 30 ngày)
    const filteredEvents = React.useMemo(() => {
        if (filter === "all") return events;
        // recent: last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return events.filter(e => {
            const d = new Date(e.date || e.createdAt || e.created_at || new Date());
            return d >= thirtyDaysAgo;
        });
    }, [events, filter]);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                setLoading(true);
                const patientId = profile.id;
                if (!patientId) return;
                const res = await axiosClient.get(PATIENT_ENDPOINTS.AUDIT_LOGS(patientId.toString())).catch(() => null);
                if (res?.data?.data) {
                    setEvents(Array.isArray(res.data.data) ? res.data.data : []);
                }
            } catch (error) {
                console.error("Error fetching timeline:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
    }, [profile.id]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Dòng thời gian y tế</h3>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-auto h-10">
                    <button 
                        onClick={() => setFilter("all")}
                        className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-lg transition-all h-full ${
                            filter === "all" 
                            ? "bg-white dark:bg-[#13191f] text-gray-900 dark:text-white shadow-sm" 
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        Tất cả
                    </button>
                    <button 
                        onClick={() => setFilter("recent")}
                        className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-lg transition-all h-full ${
                            filter === "recent" 
                            ? "bg-white dark:bg-[#13191f] text-gray-900 dark:text-white shadow-sm" 
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        Gần đây
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-[#3C81C6] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="relative pl-6 border-l border-gray-200 dark:border-[#2d353e] space-y-8 py-2">
                    {(() => {
                        const mixedEvents = [...filteredEvents];

                        if (filter === "all") {
                            mixedEvents.push({
                                isCreationEvent: true,
                                log_id: "creation",
                                created_at: profile.createdAt || profile.updatedAt || new Date()
                            });
                        }

                        // Sort newest first
                        mixedEvents.sort((a, b) => {
                            const dateA = new Date(a.date || a.createdAt || a.created_at || new Date()).getTime();
                            const dateB = new Date(b.date || b.createdAt || b.created_at || new Date()).getTime();
                            return dateB - dateA;
                        });

                        return mixedEvents.map((event: any, index: number) => {
                            if (event.isCreationEvent) {
                                return (
                                    <div key="creation-event" className="relative">
                                        <div className="absolute -left-[32px] top-1 w-4 h-4 bg-white dark:bg-[#0d1117] border-2 border-[#3C81C6] rounded-full"></div>
                                        <div className="mb-1">
                                            <span className="text-xs font-bold text-[#3C81C6] uppercase tracking-wider bg-[#3C81C6]/10 px-2 py-0.5 rounded-md">Hồ sơ được tạo</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-base">Khởi tạo hồ sơ trên hệ thống</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Vào lúc {new Date(event.created_at).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                );
                            }

                            const eventDate = event.date || event.createdAt || event.created_at;
                            let eventType = event.action_type || event.eventType || event.type || "SỰ KIỆN";
                            
                            // Map action types for better UX
                            let eventTitle = event.title || event.name || "Cập nhật hồ sơ";
                            if (eventType === "CREATE") eventTitle = "Tạo mới dữ liệu";
                            if (eventType === "UPDATE") eventTitle = "Cập nhật dữ liệu";
                            if (eventType === "DELETE") eventTitle = "Xóa dữ liệu";
                            if (eventType === "BOOK_APPOINTMENT") eventTitle = "Đặt lịch khám";
                            if (eventType === "CANCEL_APPOINTMENT") eventTitle = "Hủy lịch khám";
                            if (eventType === "COMPLETE_EXAM") eventTitle = "Hoàn tất khám";
                            if (eventType.startsWith("UPDATE_STATUS")) eventTitle = "Cập nhật trạng thái lịch hẹn";

                            const eventDesc = event.description || event.notes || event.action_desc || `Module: ${event.module_name || 'Khác'}`;
                            
                            const getBadgeProps = (type: string) => {
                                switch (type) {
                                    case "CREATE": return { text: "THÊM MỚI", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" };
                                    case "UPDATE": return { text: "CẬP NHẬT", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" };
                                    case "DELETE": return { text: "XÓA", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" };
                                    case "UPDATE_STATUS_PENDING": return { text: "LỊCH CHỜ", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30", dot: "border-yellow-500" };
                                    case "UPDATE_STATUS_CONFIRMED": return { text: "ĐÃ DUYỆT LỊCH", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", dot: "border-blue-500" };
                                    case "UPDATE_STATUS_CHECKED_IN": return { text: "ĐÃ ĐẾN PHÒNG KHÁM", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", dot: "border-purple-500" };
                                    case "UPDATE_STATUS_IN_PROGRESS": return { text: "ĐANG KHÁM BỆNH", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30", dot: "border-indigo-500" };
                                    case "UPDATE_STATUS_COMPLETED": return { text: "LỊCH ĐÃ HOÀN TẤT", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", dot: "border-green-500" };
                                    case "UPDATE_STATUS_CANCELLED": return { text: "ĐÃ HUỶ LỊCH", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", dot: "border-red-500" };
                                    case "UPDATE_STATUS_NO_SHOW": return { text: "KHÁCH KHÔNG ĐẾN", color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-200 dark:bg-gray-800", dot: "border-gray-500" };
                                    default: return { text: type, color: "text-[#3C81C6]", bg: "bg-[#3C81C6]/10", dot: "border-[#3C81C6]" };
                                }
                            };

                            const badge = getBadgeProps(eventType);

                            return (
                                <div key={event.log_id || event.id || index} className="relative">
                                    <div className={`absolute -left-[32px] top-1 w-4 h-4 bg-white dark:bg-[#0d1117] border-2 ${badge.dot || 'border-[#3C81C6]'} rounded-full`}></div>
                                    <div className="mb-1">
                                        <span className={`text-xs font-bold ${badge.color} uppercase tracking-wider ${badge.bg} px-2 py-0.5 rounded-md inline-block`}>
                                            {badge.text}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-base">{eventTitle}</h4>
                                    {eventDesc && eventDesc !== eventTitle && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{eventDesc}</p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-1">
                                        Vào lúc {eventDate ? new Date(eventDate).toLocaleString("vi-VN") : "Chưa rõ"}
                                    </p>
                                </div>
                            );
                        });
                    })()}

                    {/* Blank state details if no additional events */}
                    {filteredEvents.length === 0 && filter !== "all" && (
                        <div className="relative">
                            <div className="absolute -left-[32px] top-1 w-4 h-4 bg-white dark:bg-[#0d1117] border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                            <p className="text-sm text-gray-500 italic mt-1">
                                Không có dữ liệu trong khoảng thời gian 30 ngày qua.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
