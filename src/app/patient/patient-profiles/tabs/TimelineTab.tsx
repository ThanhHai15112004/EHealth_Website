import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "@/api/axiosClient";
import { PATIENT_ENDPOINTS } from "@/api/endpoints";
import { ehrService } from "@/services/ehrService";
import { type PatientProfile } from "@/types/patient-profile";
import { getEncounterTypeLabel, translatePatientFacingText } from "@/utils/patientProfileHelpers";

interface TabProps {
    profile: PatientProfile;
}

function formatEventTitle(event: any, eventType: string) {
    const rawTitle = event.title || event.name || "";
    const rawEncounterType = event.encounter_type || event.encounterType || event.visit_type;
    const encounterLabel = rawEncounterType ? getEncounterTypeLabel(rawEncounterType) : "";

    if (eventType === "CREATE") return "Tạo mới dữ liệu";
    if (eventType === "UPDATE") return "Cập nhật dữ liệu";
    if (eventType === "DELETE") return "Xóa dữ liệu";
    if (eventType === "BOOK_APPOINTMENT") return "Đặt lịch khám";
    if (eventType === "CANCEL_APPOINTMENT") return "Hủy lịch khám";
    if (eventType === "COMPLETE_EXAM") return "Hoàn tất khám";
    if (eventType.startsWith("UPDATE_STATUS")) return "Cập nhật trạng thái lịch hẹn";
    if (encounterLabel && /bắt đầu khám/i.test(rawTitle || "")) return `Bắt đầu khám - ${encounterLabel}`;

    return translatePatientFacingText(rawTitle) || (encounterLabel ? `Khám bệnh - ${encounterLabel}` : "Cập nhật hồ sơ");
}

function formatEventDescription(event: any, eventTitle: string) {
    const rawDescription =
        event.description ||
        event.notes ||
        event.action_desc ||
        (event.module_name ? `Module: ${event.module_name}` : "Module: Khác");

    const translated = translatePatientFacingText(rawDescription)
        .replace(/\bModule:\s*Khác\b/gi, "Phân hệ: Khác")
        .replace(/\bModule:\s*/gi, "Phân hệ: ");

    return translated === eventTitle ? "" : translated;
}

export default function TimelineTab({ profile }: TabProps) {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "recent">("all");

    const filteredEvents = useMemo(() => {
        if (filter === "all") return events;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return events.filter((event) => {
            const date = new Date(event.date || event.createdAt || event.created_at || new Date());
            return date >= thirtyDaysAgo;
        });
    }, [events, filter]);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                setLoading(true);
                const patientId = profile.id;
                if (!patientId) return;

                const [timelineRes, auditRes] = await Promise.allSettled([
                    ehrService.getHealthTimeline(patientId, { limit: 50 }),
                    axiosClient.get(PATIENT_ENDPOINTS.AUDIT_LOGS(patientId.toString())).catch(() => null),
                ]);

                if (timelineRes.status === "fulfilled" && Array.isArray(timelineRes.value.data) && timelineRes.value.data.length > 0) {
                    setEvents(timelineRes.value.data);
                } else if (auditRes.status === "fulfilled" && auditRes.value?.data?.data) {
                    setEvents(Array.isArray(auditRes.value.data.data) ? auditRes.value.data.data : []);
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
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dòng thời gian y tế</h3>
                <div className="flex h-10 w-full items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 sm:w-auto">
                    <button
                        onClick={() => setFilter("all")}
                        className={`h-full flex-1 rounded-lg px-4 py-1.5 text-xs font-medium transition-all sm:flex-none ${
                            filter === "all"
                                ? "bg-white text-gray-900 shadow-sm dark:bg-[#13191f] dark:text-white"
                                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setFilter("recent")}
                        className={`h-full flex-1 rounded-lg px-4 py-1.5 text-xs font-medium transition-all sm:flex-none ${
                            filter === "recent"
                                ? "bg-white text-gray-900 shadow-sm dark:bg-[#13191f] dark:text-white"
                                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        }`}
                    >
                        Gần đây
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3C81C6] border-t-transparent"></div>
                </div>
            ) : (
                <div className="relative space-y-8 border-l border-gray-200 py-2 pl-6 dark:border-[#2d353e]">
                    {(() => {
                        const mixedEvents = [...filteredEvents];

                        if (filter === "all") {
                            mixedEvents.push({
                                isCreationEvent: true,
                                log_id: "creation",
                                created_at: profile.createdAt || profile.updatedAt || new Date(),
                            });
                        }

                        mixedEvents.sort((a, b) => {
                            const dateA = new Date(a.date || a.createdAt || a.created_at || new Date()).getTime();
                            const dateB = new Date(b.date || b.createdAt || b.created_at || new Date()).getTime();
                            return dateB - dateA;
                        });

                        return mixedEvents.map((event: any, index: number) => {
                            if (event.isCreationEvent) {
                                return (
                                    <div key="creation-event" className="relative">
                                        <div className="absolute -left-[32px] top-1 h-4 w-4 rounded-full border-2 border-[#3C81C6] bg-white dark:bg-[#0d1117]"></div>
                                        <div className="mb-1">
                                            <span className="rounded-md bg-[#3C81C6]/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#3C81C6]">
                                                Hồ sơ được tạo
                                            </span>
                                        </div>
                                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">Khởi tạo hồ sơ trên hệ thống</h4>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Vào lúc {new Date(event.created_at).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                );
                            }

                            const eventDate = event.date || event.createdAt || event.created_at;
                            const eventType = event.action_type || event.eventType || event.type || "SỰ KIỆN";
                            const eventTitle = formatEventTitle(event, eventType);
                            const eventDesc = formatEventDescription(event, eventTitle);

                            const getBadgeProps = (type: string) => {
                                switch (type) {
                                    case "CREATE":
                                        return { text: "THÊM MỚI", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" };
                                    case "UPDATE":
                                        return { text: "CẬP NHẬT", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" };
                                    case "DELETE":
                                        return { text: "XÓA", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" };
                                    case "UPDATE_STATUS_PENDING":
                                        return { text: "LỊCH CHỜ", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30", dot: "border-yellow-500" };
                                    case "UPDATE_STATUS_CONFIRMED":
                                        return { text: "ĐÃ DUYỆT LỊCH", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", dot: "border-blue-500" };
                                    case "UPDATE_STATUS_CHECKED_IN":
                                        return { text: "ĐÃ ĐẾN PHÒNG KHÁM", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", dot: "border-purple-500" };
                                    case "UPDATE_STATUS_IN_PROGRESS":
                                        return { text: "ĐANG KHÁM BỆNH", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30", dot: "border-indigo-500" };
                                    case "UPDATE_STATUS_COMPLETED":
                                        return { text: "LỊCH ĐÃ HOÀN TẤT", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", dot: "border-green-500" };
                                    case "UPDATE_STATUS_CANCELLED":
                                        return { text: "ĐÃ HỦY LỊCH", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", dot: "border-red-500" };
                                    case "UPDATE_STATUS_NO_SHOW":
                                        return { text: "KHÁCH KHÔNG ĐẾN", color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-200 dark:bg-gray-800", dot: "border-gray-500" };
                                    default:
                                        return {
                                            text: translatePatientFacingText(type) || "SỰ KIỆN",
                                            color: "text-[#3C81C6]",
                                            bg: "bg-[#3C81C6]/10",
                                            dot: "border-[#3C81C6]",
                                        };
                                }
                            };

                            const badge = getBadgeProps(eventType);

                            return (
                                <div key={event.log_id || event.id || index} className="relative">
                                    <div className={`absolute -left-[32px] top-1 h-4 w-4 rounded-full border-2 ${badge.dot || "border-[#3C81C6]"} bg-white dark:bg-[#0d1117]`}></div>
                                    <div className="mb-1">
                                        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${badge.color} ${badge.bg}`}>
                                            {badge.text}
                                        </span>
                                    </div>
                                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">{eventTitle}</h4>
                                    {eventDesc && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{eventDesc}</p>}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Vào lúc {eventDate ? new Date(eventDate).toLocaleString("vi-VN") : "Chưa rõ"}
                                    </p>
                                </div>
                            );
                        });
                    })()}

                    {filteredEvents.length === 0 && filter !== "all" && (
                        <div className="relative">
                            <div className="absolute -left-[32px] top-1 h-4 w-4 rounded-full border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-[#0d1117]"></div>
                            <p className="mt-1 text-sm italic text-gray-500">
                                Không có dữ liệu trong khoảng thời gian 30 ngày qua.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
