"use client";

import { useEffect, useMemo, useState } from "react";
import { appointmentChangesService, getAvailableSlots } from "@/services/appointmentService";
import { useToast } from "@/contexts/ToastContext";

type SlotOption = {
    slot_id?: string;
    id?: string;
    start_time?: string;
    end_time?: string;
    time?: string;
    is_available?: boolean;
    booked_count?: number;
    max_capacity?: number;
};

type Props = {
    isOpen: boolean;
    appointmentId: string;
    doctorId?: string;
    doctorName?: string;
    branchId?: string;
    facilityId?: string;
    currentDate?: string;
    currentSlotId?: string;
    onClose: () => void;
    onSuccess?: () => void | Promise<void>;
};

export function AppointmentRescheduleModal({
    isOpen,
    appointmentId,
    doctorId,
    doctorName,
    branchId,
    facilityId,
    currentDate,
    currentSlotId,
    onClose,
    onSuccess,
}: Props) {
    const { showToast } = useToast();
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlotId, setSelectedSlotId] = useState("");
    const [reason, setReason] = useState("");
    const [slots, setSlots] = useState<SlotOption[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

    useEffect(() => {
        if (!isOpen) return;
        setSelectedDate("");
        setSelectedSlotId("");
        setReason("");
        setSlots([]);
    }, [isOpen, appointmentId]);

    useEffect(() => {
        const loadSlots = async () => {
            if (!isOpen || !selectedDate) return;

            try {
                setLoadingSlots(true);
                const response = await getAvailableSlots({
                    date: selectedDate,
                    ...(doctorId ? { doctor_id: doctorId } : {}),
                    ...(branchId ? { branch_id: branchId } : {}),
                    ...(facilityId ? { facility_id: facilityId } : {}),
                    exclude_appointment_id: appointmentId,
                } as any);

                const nextSlots = (Array.isArray(response) ? response : []).filter((slot: SlotOption) => {
                    const slotId = slot.slot_id || slot.id;
                    const available = slot.is_available !== false;
                    const isSameSlot = selectedDate === currentDate && currentSlotId && slotId === currentSlotId;
                    return Boolean(slotId) && available && !isSameSlot;
                });

                setSlots(nextSlots);
                setSelectedSlotId("");
            } catch (error: any) {
                setSlots([]);
                showToast(error?.message || "Không tải được khung giờ trống", "error");
            } finally {
                setLoadingSlots(false);
            }
        };

        void loadSlots();
    }, [appointmentId, branchId, currentDate, currentSlotId, doctorId, facilityId, isOpen, selectedDate, showToast]);

    const handleSubmit = async () => {
        if (!selectedDate) {
            showToast("Vui lòng chọn ngày mới", "error");
            return;
        }
        if (!selectedSlotId) {
            showToast("Vui lòng chọn khung giờ mới", "error");
            return;
        }

        try {
            setSubmitting(true);
            await appointmentChangesService.request({
                appointmentId,
                newDate: selectedDate,
                newSlotId: selectedSlotId,
                reason: reason.trim() || "Bệnh nhân yêu cầu dời lịch",
            });
            showToast("Đã dời lịch thành công", "success");
            onClose();
            await onSuccess?.();
        } catch (error: any) {
            showToast(error?.message || "Dời lịch thất bại", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                        <span className="material-symbols-outlined text-amber-600" style={{ fontSize: "22px" }}>
                            event_repeat
                        </span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Dời lịch hẹn</h3>
                        <p className="text-xs text-gray-500">{doctorName || "Chọn ngày và khung giờ mới phù hợp"}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Ngày mới *</label>
                        <input
                            type="date"
                            value={selectedDate}
                            min={minDate}
                            onChange={(event) => setSelectedDate(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-medium text-gray-500">Khung giờ mới *</label>
                        {!selectedDate ? (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-400">
                                Chọn ngày trước để tải khung giờ trống
                            </div>
                        ) : loadingSlots ? (
                            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-500">
                                Đang tải khung giờ trống...
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
                                Ngày này hiện không còn khung giờ trống phù hợp
                            </div>
                        ) : (
                            <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-2">
                                {slots.map((slot) => {
                                    const slotId = slot.slot_id || slot.id || "";
                                    const start = (slot.start_time || slot.time || "").toString().slice(0, 5);
                                    const end = (slot.end_time || "").toString().slice(0, 5);
                                    const label = end ? `${start} - ${end}` : start;
                                    const selected = selectedSlotId === slotId;

                                    return (
                                        <button
                                            key={slotId}
                                            type="button"
                                            onClick={() => setSelectedSlotId(slotId)}
                                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                                selected
                                                    ? "border-amber-400 bg-amber-100 text-amber-800"
                                                    : "border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50"
                                            }`}
                                        >
                                            <div>{label || "Khung giờ"}</div>
                                            {typeof slot.booked_count === "number" && typeof slot.max_capacity === "number" && (
                                                <div className="mt-1 text-[11px] text-gray-400">
                                                    {slot.booked_count}/{slot.max_capacity}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Lý do dời lịch</label>
                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Ví dụ: bận đột xuất, cần đổi sang ngày khác..."
                            className="min-h-[88px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
                        />
                    </div>
                </div>

                <div className="mt-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        Quay lại
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !selectedDate || !selectedSlotId}
                        className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Đang xử lý..." : "Gửi yêu cầu"}
                    </button>
                </div>
            </div>
        </div>
    );
}
