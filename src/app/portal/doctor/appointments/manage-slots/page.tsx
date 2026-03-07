"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DaySlot {
    day: string;
    enabled: boolean;
    startTime: string;
    endTime: string;
    maxPatients: string;
}

const DEFAULT_SLOTS: DaySlot[] = [
    { day: "Thứ 2", enabled: true, startTime: "08:00", endTime: "17:00", maxPatients: "20" },
    { day: "Thứ 3", enabled: true, startTime: "08:00", endTime: "17:00", maxPatients: "20" },
    { day: "Thứ 4", enabled: true, startTime: "08:00", endTime: "17:00", maxPatients: "20" },
    { day: "Thứ 5", enabled: true, startTime: "08:00", endTime: "17:00", maxPatients: "20" },
    { day: "Thứ 6", enabled: true, startTime: "08:00", endTime: "17:00", maxPatients: "20" },
    { day: "Thứ 7", enabled: false, startTime: "08:00", endTime: "12:00", maxPatients: "10" },
    { day: "Chủ nhật", enabled: false, startTime: "", endTime: "", maxPatients: "0" },
];

export default function ManageSlotsPage() {
    const router = useRouter();
    const [slots, setSlots] = useState<DaySlot[]>(DEFAULT_SLOTS);
    const [slotDuration, setSlotDuration] = useState("30");

    const updateSlot = (index: number, field: keyof DaySlot, value: string | boolean) => {
        setSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const handleSave = () => {
        alert("Đã lưu khung giờ làm việc thành công!");
        router.push("/portal/doctor/appointments");
    };

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-[#687582] dark:text-gray-500">
                    <Link href="/portal/doctor" className="hover:text-[#3C81C6]">Trang chủ</Link>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <Link href="/portal/doctor/appointments" className="hover:text-[#3C81C6]">Lịch hẹn</Link>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <span className="text-[#121417] dark:text-white font-medium">Quản lý khung giờ</span>
                </div>

                {/* Header */}
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#121417] dark:text-white">
                            Quản lý khung giờ làm việc
                        </h1>
                        <p className="text-sm text-[#687582] dark:text-gray-400 mt-1">
                            Thiết lập lịch làm việc và khung giờ khám bệnh
                        </p>
                    </div>
                </div>

                {/* Slot Duration Setting */}
                <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#e5e7eb] dark:border-[#2d353e] p-6">
                    <h3 className="text-sm font-bold text-[#121417] dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-[#3C81C6]">timer</span>
                        Cài đặt chung
                    </h3>
                    <div className="flex items-center gap-4">
                        <label className="text-sm text-[#687582] dark:text-gray-400">
                            Thời gian mỗi lượt khám:
                        </label>
                        <select
                            value={slotDuration}
                            onChange={(e) => setSlotDuration(e.target.value)}
                            className="px-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C81C6]/20 dark:text-white"
                        >
                            <option value="15">15 phút</option>
                            <option value="20">20 phút</option>
                            <option value="30">30 phút</option>
                            <option value="45">45 phút</option>
                            <option value="60">60 phút</option>
                        </select>
                    </div>
                </div>

                {/* Schedule Grid */}
                <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#e5e7eb] dark:border-[#2d353e]">
                    <div className="p-5 border-b border-[#e5e7eb] dark:border-[#2d353e]">
                        <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-[#3C81C6]">calendar_month</span>
                            Lịch làm việc hàng tuần
                        </h3>
                    </div>
                    <div className="divide-y divide-[#e5e7eb] dark:divide-[#2d353e]">
                        {slots.map((slot, index) => (
                            <div
                                key={slot.day}
                                className={`p-5 flex flex-col md:flex-row md:items-center gap-4 transition-colors ${slot.enabled ? "bg-white dark:bg-[#1e242b]" : "bg-gray-50 dark:bg-gray-900/30 opacity-60"
                                    }`}
                            >
                                {/* Day Name & Toggle */}
                                <div className="flex items-center gap-3 w-32">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={slot.enabled}
                                            onChange={(e) => updateSlot(index, "enabled", e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3C81C6]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#3C81C6]"></div>
                                    </label>
                                    <span className="text-sm font-semibold text-[#121417] dark:text-white">
                                        {slot.day}
                                    </span>
                                </div>

                                {/* Time Inputs */}
                                {slot.enabled && (
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-[#687582]">Từ</label>
                                            <input
                                                type="time"
                                                value={slot.startTime}
                                                onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                                                className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C81C6]/20"
                                            />
                                        </div>
                                        <span className="text-[#687582]">—</span>
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-[#687582]">Đến</label>
                                            <input
                                                type="time"
                                                value={slot.endTime}
                                                onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                                                className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C81C6]/20"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <label className="text-xs text-[#687582]">Tối đa</label>
                                            <input
                                                type="number"
                                                value={slot.maxPatients}
                                                onChange={(e) => updateSlot(index, "maxPatients", e.target.value)}
                                                className="w-16 px-3 py-2 text-sm text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3C81C6]/20"
                                                min="0"
                                            />
                                            <span className="text-xs text-[#687582]">BN</span>
                                        </div>
                                    </div>
                                )}

                                {!slot.enabled && (
                                    <p className="text-sm text-[#687582] dark:text-gray-500 italic">
                                        Nghỉ
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={() => router.push("/portal/doctor/appointments")}
                        className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-[#687582] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-sm font-medium transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-[#3C81C6] hover:bg-[#2a6da8] text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 dark:shadow-none transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
}
