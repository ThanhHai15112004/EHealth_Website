"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppointmentStatusBadge } from "@/components/patient/AppointmentStatusBadge";
import { getAppointmentById, cancelAppointment, submitAppointmentReview, type Appointment } from "@/services/appointmentService";
import { encounterService } from "@/services/encounterService";
import { prescriptionService } from "@/services/prescriptionService";
import { useToast } from "@/contexts/ToastContext";
import QRCode from "react-qr-code";

const STATUS_TIMELINE = [
    { status: "pending", label: "Đã đặt lịch", icon: "edit_calendar" },
    { status: "confirmed", label: "Đã xác nhận", icon: "check_circle" },
    { status: "waiting", label: "Đang chờ khám", icon: "groups" },
    { status: "examining", label: "Đang khám", icon: "stethoscope" },
    { status: "completed", label: "Hoàn thành", icon: "task_alt" },
];

export default function AppointmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelConfirmKeyword, setCancelConfirmKeyword] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const toast = useToast();

    const [diagnoses, setDiagnoses] = useState<any[]>([]);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loadingResult, setLoadingResult] = useState(false);

    useEffect(() => {
        if (id) loadAppointment();
    }, [id]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!appointment || appointment.status?.toLowerCase() !== "completed") return;
            try {
                setLoadingResult(true);
                const encounterRes = await encounterService.getByAppointment(id);
                if (encounterRes && encounterRes.encounters_id) {
                    const encId = encounterRes.encounters_id;
                    try {
                        const dRes = await encounterService.getDiagnoses(encId);
                        if (dRes) setDiagnoses(Array.isArray(dRes) ? dRes : [dRes]);
                    } catch (e) {}
                    try {
                        const pRes = await prescriptionService.getByEncounter(encId);
                        if (pRes) setPrescriptions(Array.isArray(pRes) ? pRes : [pRes]);
                    } catch (e) {}
                }
            } catch (err) {
                console.error("Error fetching medical results", err);
            } finally {
                setLoadingResult(false);
            }
        };
        fetchResults();
    }, [appointment, id]);

    const loadAppointment = async () => {
        try {
            setLoading(true);
            const res = await getAppointmentById(id);
            if (res) {
                setAppointment(res);
            } else {
                setAppointment(null);
            }
        } catch (error) {
            console.error(error);
            setAppointment(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            setCancelling(true);
            await cancelAppointment(id, cancelReason);
            setShowCancelModal(false);
            await loadAppointment();
        } catch { /* silent */ } finally {
            setCancelling(false);
        }
    };

    const handleSubmitReview = async () => {
        if (reviewRating < 1 || reviewRating > 5) {
            toast.showToast("Vui lòng chọn số sao để đánh giá!", "warning");
            return;
        }
        try {
            setSubmittingReview(true);
            await submitAppointmentReview(id, reviewRating, reviewText);
            toast.showToast("Cảm ơn bạn đã gửi đánh giá!", "success");
            await loadAppointment();
        } catch (error: any) {
            toast.showToast(error.message || "Gửi đánh giá thất bại", "error");
        } finally {
            setSubmittingReview(false);
        }
    };

    const getTimelineIndex = (status: string | undefined): number => {
        if (!status) return 0;
        const normalized = status.toLowerCase();
        const idx = STATUS_TIMELINE.findIndex(s => s.status === normalized);
        return idx >= 0 ? idx : 0;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                <span className="material-symbols-outlined text-gray-300 mb-4" style={{ fontSize: "64px" }}>event_busy</span>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy lịch hẹn</h3>
                <Link href="/patient/appointments" className="text-[#3C81C6] text-sm font-medium hover:underline">← Quay lại danh sách</Link>
            </div>
        );
    }

    const currentStep = getTimelineIndex(appointment.status);
    const isCancellable = appointment.status?.toLowerCase() === "pending" || appointment.status?.toLowerCase() === "confirmed";
    const isCompleted = appointment.status?.toLowerCase() === "completed";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/patient/appointments"
                        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Chi tiết lịch hẹn</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Mã: {((appointment as any).appointment_code) || `#${((appointment as any).appointments_id || appointment.id || "").slice(0, 8).toUpperCase()}`}</p>
                    </div>
                </div>
                <AppointmentStatusBadge status={appointment.status} size="md" />
            </div>

            {/* Status Timeline */}
            {appointment.status !== "cancelled" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "18px" }}>timeline</span>
                        Trạng thái lịch hẹn
                    </h3>
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 mx-8">
                            <div className="h-full bg-gradient-to-r from-[#3C81C6] to-[#2563eb] transition-all duration-700"
                                style={{ width: `${(currentStep / (STATUS_TIMELINE.length - 1)) * 100}%` }} />
                        </div>
                        {STATUS_TIMELINE.map((step, i) => {
                            const isPast = i <= currentStep;
                            const isCurrent = i === currentStep;
                            return (
                                <div key={step.status} className="relative z-10 flex flex-col items-center" style={{ flex: 1 }}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                                        ${isPast ? "bg-gradient-to-br from-[#3C81C6] to-[#2563eb] text-white shadow-md" : "bg-gray-100 text-gray-400"}
                                        ${isCurrent ? "ring-4 ring-[#3C81C6]/20 scale-110" : ""}`}>
                                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                                            {isPast && !isCurrent ? "check" : step.icon}
                                        </span>
                                    </div>
                                    <span className={`mt-2 text-[10px] font-medium text-center max-w-[70px]
                                        ${isCurrent ? "text-[#3C81C6] font-semibold" : isPast ? "text-gray-700" : "text-gray-400"}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Cancelled banner */}
            {appointment.status?.toLowerCase() === "cancelled" && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 mt-0.5" style={{ fontSize: "20px" }}>cancel</span>
                    <div>
                        <h3 className="text-sm font-bold text-red-800">Lịch hẹn đã bị hủy</h3>
                        <p className="text-xs text-red-600 mt-0.5">Lý do: {(appointment as any).cancellation_reason || appointment.notes || "Không có"}</p>
                    </div>
                </div>
            )}

            {/* Check-in QR / Info Banner */}
            {appointment.status?.toLowerCase() === "confirmed" && (appointment as any).qr_token && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start justify-between gap-3">
                    <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-blue-500 mt-0.5" style={{ fontSize: "20px" }}>qr_code_scanner</span>
                        <div>
                            <h3 className="text-sm font-bold text-blue-800">Sẵn sàng check-in</h3>
                            <p className="text-xs text-blue-600 mt-0.5">Mã check-in của bạn: <span className="font-mono font-bold">{(appointment as any).qr_token.split('-')[0]}***</span></p>
                            <p className="text-xs text-blue-500 mt-1">Vui lòng quét mã tại quầy lễ tân khi đến phòng khám.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowQRModal(true)}
                        className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors">
                        Xem mã QR
                    </button>
                </div>
            )}

            {/* Appointment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Doctor & Specialty */}
                <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-blue-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "18px" }}>person</span>
                        Thông tin Bác sĩ
                    </h3>
                    <div className="space-y-4">
                        <InfoRow icon="person" label="Bác sĩ" value={(appointment as any).doctor_name || appointment.doctorName || "Chưa xếp bác sĩ"} />
                        <InfoRow icon="medical_services" label="Chuyên khoa" value={(appointment as any).department_name || appointment.departmentName || "Khám bệnh"} />
                    </div>
                </div>

                {/* Schedule */}
                <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl border border-purple-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <span className="material-symbols-outlined text-purple-600" style={{ fontSize: "18px" }}>calendar_month</span>
                        Thời gian & Loại khám
                    </h3>
                    <div className="space-y-4">
                        <InfoRow icon="event" label="Ngày khám" value={(appointment as any).appointment_date || appointment.date} />
                        <InfoRow icon="schedule" label="Giờ khám" value={((appointment as any).slot_start_time)?.substring(0, 5) || appointment.time || "--:--"} />
                        <InfoRow icon="category" label="Loại khám" value={
                            appointment.type === "first_visit" ? "Khám lần đầu" : appointment.type === "re_examination" ? "Tái khám" : "Tư vấn"
                        } />
                    </div>
                </div>

                {/* Service box */}
                <div className="md:col-span-2 bg-gradient-to-r from-emerald-50 to-teal-50/30 rounded-2xl border border-emerald-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: "18px" }}>verified_user</span>
                        Dịch vụ khám & Phòng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow icon="location_on" label="Phòng khám cơ sở" value={(appointment as any).branch_name || "EHealth Hospital — 123 Nguyễn Văn Linh, Q.7"} />
                        <InfoRow icon="meeting_room" label="Phòng" value={(appointment as any).room_name || "Chưa phân phòng"} />
                        <InfoRow icon="vaccines" label="Dịch vụ khám" value={(appointment as any).service_name || "Dịch vụ khám tiêu chuẩn"} />
                        <InfoRow icon="payments" label="Chi phí dự kiến" value="Theo biểu giá niêm yết" />
                    </div>
                </div>
            </div>

            {/* Symptoms / Reason */}
            {((appointment as any).reason_for_visit || appointment.reason || appointment.notes || (appointment as any).symptoms_notes) && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-50 pb-3">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "18px" }}>description</span>
                        Triệu chứng & Ghi chú
                    </h3>
                    <div className="space-y-4">
                        {((appointment as any).reason_for_visit || appointment.reason) && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Lý do khám:</p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">{(appointment as any).reason_for_visit || appointment.reason}</p>
                            </div>
                        )}
                        {((appointment as any).symptoms_notes || appointment.notes) && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Ghi chú triệu chứng:</p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">{(appointment as any).symptoms_notes || appointment.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Medical results — only if completed */}
            {isCompleted && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "18px" }}>labs</span>
                        Kết quả khám
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-400 mb-1">Chẩn đoán</p>
                            {loadingResult ? (
                                <p className="text-sm font-medium text-gray-500">Đang tải chẩn đoán...</p>
                            ) : diagnoses.length > 0 ? (
                                <ul className="list-disc pl-4 text-sm font-medium text-gray-800 space-y-1">
                                    {diagnoses.map((d, idx) => (
                                        <li key={idx}>
                                            {d.icd_code ? <span className="font-semibold">{d.icd_code} - </span> : ""}
                                            {d.diagnosis_name || d.notes || "Không rõ"}
                                            {d.diagnosis_type === "PRIMARY" ? " (Chính)" : ""}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm font-medium text-gray-800">Chưa có kết quả chẩn đoán</p>
                            )}
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-400 mb-1">Đơn thuốc</p>
                            {loadingResult ? (
                                <p className="text-sm font-medium text-gray-500">Đang tải đơn thuốc...</p>
                            ) : prescriptions.length > 0 ? (
                                <ul className="list-disc pl-4 text-sm font-semibold text-[#3C81C6] space-y-1">
                                    {prescriptions.map((p, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <span>Mã đơn: {p.prescription_code || p.id || p.prescriptions_id}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] ${p.status === "DISPENSED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                {p.status === "DISPENSED" ? "Đã phát" : "Chưa phát"}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-600">Chưa có đơn thuốc</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Review form — only if completed */}
            {isCompleted && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "18px" }}>rate_review</span>
                        Đánh giá trải nghiệm
                    </h3>
                    {(appointment as any).rating ? (
                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                            <div className="flex items-center gap-1 mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={`material-symbols-outlined ${i < (appointment as any).rating! ? "text-amber-400" : "text-gray-200"}`} style={{ fontSize: "24px" }}>star</span>
                                ))}
                                <span className="text-sm font-semibold text-gray-700 ml-2">Đã đánh giá</span>
                            </div>
                            {(appointment as any).feedback && <p className="text-sm text-gray-600 italic">"{(appointment as any).feedback}"</p>}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-1 mb-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <button key={i} onClick={() => setReviewRating(i + 1)}
                                        className="transition-transform hover:scale-110 active:scale-95">
                                        <span className={`material-symbols-outlined ${i < reviewRating ? "text-amber-400" : "text-gray-200"}`}
                                            style={{ fontSize: "32px" }}>star</span>
                                    </button>
                                ))}
                                {reviewRating > 0 && <span className="text-sm text-gray-500 ml-2">{reviewRating}/5</span>}
                            </div>
                            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm khám bệnh của bạn..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3C81C6]/30 bg-gray-50 min-h-[80px] resize-none mb-3" />
                            <button onClick={handleSubmitReview} disabled={submittingReview || reviewRating === 0} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#3C81C6] to-[#2563eb] rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
                                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
                {isCancellable && (
                    <>
                        <Link href={`/booking?reschedule=${(appointment as any).appointments_id || appointment.id}`}
                            className="px-5 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>event_repeat</span>
                            Dời lịch
                        </Link>
                        <button onClick={() => setShowCancelModal(true)}
                            className="px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>event_busy</span>
                            Hủy lịch
                        </button>
                    </>
                )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowCancelModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-600" style={{ fontSize: "22px" }}>warning</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Xác nhận hủy lịch</h3>
                                <p className="text-xs text-gray-500">Hành động này không thể hoàn tác</p>
                            </div>
                        </div>
                        <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                            placeholder="Lý do hủy lịch (không bắt buộc)..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 bg-gray-50 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-red-200" />
                        
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Vui lòng nhập <span className="text-red-600 font-bold">HỦY LỊCH</span> để xác nhận:</p>
                            <input 
                                type="text"
                                value={cancelConfirmKeyword} 
                                onChange={e => setCancelConfirmKeyword(e.target.value)}
                                placeholder="Nhập HỦY LỊCH"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => { setShowCancelModal(false); setCancelConfirmKeyword(""); }}
                                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                Quay lại
                            </button>
                            <button onClick={handleCancel} disabled={cancelling || cancelConfirmKeyword !== "HỦY LỊCH"}
                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors disabled:cursor-not-allowed">
                                {cancelling ? "Đang xử lý..." : "Xác nhận hủy"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowQRModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Mã QR Check-in</h3>
                            <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="bg-white p-4 inline-block border-2 border-dashed border-gray-200 rounded-2xl mb-4">
                            <QRCode
                                value={(appointment as any).qr_token}
                                size={192}
                                className="mx-auto"
                                style={{ height: "auto", maxWidth: "100%", width: "192px" }}
                            />
                        </div>
                        <p className="font-mono font-bold text-gray-800 tracking-wider bg-gray-50 py-2 rounded-lg">
                            {(appointment as any).qr_token}
                        </p>
                        <p className="text-sm text-gray-500 mt-4">
                            Đưa mã này cho lễ tân tại phòng khám để tiến hành check-in tự động.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-gray-400 mt-0.5" style={{ fontSize: "16px" }}>{icon}</span>
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-800">{value}</p>
            </div>
        </div>
    );
}
