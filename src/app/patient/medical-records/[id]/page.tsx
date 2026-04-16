"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { unwrap } from "@/api/response";
import { clinicalResultsService } from "@/services/clinicalResultsService";
import { medicalRecordService } from "@/services/medicalRecordService";
import type { PatientClinicalResultVM, PatientMedicalRecordDetailVM } from "@/types/patient-medical-record";
import { adaptPatientClinicalResult, adaptPatientMedicalRecordDetail } from "@/utils/patientMedicalRecordAdapters";

const TRUST_STYLES: Record<string, string> = {
    verified: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    finalized: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
    draft: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
};

function isSafeAttachmentUrl(url: string) {
    const normalized = url.trim();
    if (!normalized) return false;

    const lower = normalized.toLowerCase();
    if (lower === "string" || lower === "null" || lower === "undefined") return false;

    return normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("/");
}

function sanitizeAttachmentUrls(urls: string[]) {
    return urls.filter((url) => isSafeAttachmentUrl(url));
}

function SectionCard({
    icon,
    title,
    children,
    accent = "text-[#3C81C6]",
}: {
    icon: string;
    title: string;
    children: React.ReactNode;
    accent?: string;
}) {
    return (
        <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 dark:border-[#2d353e] dark:bg-[#1e242b]">
            <h2 className={`mb-5 flex items-center gap-2 text-lg font-bold ${accent}`}>
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>{icon}</span>
                <span className="text-[#121417] dark:text-white">{title}</span>
            </h2>
            {children}
        </section>
    );
}

function InfoTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-[#e5e7eb] bg-[#f6f7f8] p-4 dark:border-[#2d353e] dark:bg-[#13191f]">
            <p className="mb-1 text-sm text-[#687582]">{label}</p>
            <p className="text-sm font-semibold text-[#121417] dark:text-white">{value}</p>
        </div>
    );
}

function EmptyState({ title, message, icon }: { title: string; message: string; icon: string }) {
    return (
        <div className="py-12 text-center">
            <span className="material-symbols-outlined mb-3 text-gray-300 dark:text-gray-600" style={{ fontSize: "48px" }}>{icon}</span>
            <h3 className="text-base font-semibold text-[#121417] dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-[#687582]">{message}</p>
        </div>
    );
}

function buildClinicalResultsBlock(medicalOrders: PatientMedicalRecordDetailVM["medicalOrders"], clinicalResults: PatientClinicalResultVM[]) {
    const resultMap = new Map(clinicalResults.map((item) => [item.orderId, item]));

    const mergedOrders = medicalOrders.map((order) => {
        const result = resultMap.get(order.id);
        return {
            id: order.id,
            serviceName: order.serviceName,
            priority: order.priority,
            statusLabel: result?.statusLabel || order.statusLabel,
            orderedAt: result?.orderedAt || order.orderedAt,
            performedAt: result?.performedAt || null,
            ordererName: result?.ordererName || "",
            performerName: result?.performerName || "",
            clinicalIndicator: result?.clinicalIndicator || null,
            resultSummary: result?.resultSummary || order.resultSummary,
            attachmentUrls: sanitizeAttachmentUrls(result?.attachmentUrls || order.attachmentUrls),
            isAbnormal: Boolean(result?.isAbnormal),
            abnormalReason: result?.abnormalReason || null,
        };
    });

    const extraResults = clinicalResults
        .filter((item) => !mergedOrders.some((order) => order.id === item.orderId))
        .map((item) => ({
            id: item.orderId,
            serviceName: item.serviceName,
            priority: item.priority,
            statusLabel: item.statusLabel,
            orderedAt: item.orderedAt,
            performedAt: item.performedAt,
            ordererName: item.ordererName,
            performerName: item.performerName,
            clinicalIndicator: item.clinicalIndicator,
            resultSummary: item.resultSummary,
            attachmentUrls: sanitizeAttachmentUrls(item.attachmentUrls),
            isAbnormal: item.isAbnormal,
            abnormalReason: item.abnormalReason || null,
        }));

    return [...mergedOrders, ...extraResults];
}

export default function MedicalRecordDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState<PatientMedicalRecordDetailVM | null>(null);
    const [clinicalResults, setClinicalResults] = useState<PatientClinicalResultVM[]>([]);

    useEffect(() => {
        if (!id) return;

        const loadDetail = async () => {
            setLoading(true);
            try {
                const detailRes = await medicalRecordService.getDetail(id);
                const detailData = adaptPatientMedicalRecordDetail(unwrap<any>(detailRes));
                setRecord(detailData);

                if (detailData.encounter.patientId) {
                    try {
                        const resultsRes = await clinicalResultsService.getByEncounter(id, detailData.encounter.patientId);
                        setClinicalResults(resultsRes.data.map(adaptPatientClinicalResult));
                    } catch (error) {
                        console.error("Failed to load clinical results", error);
                        setClinicalResults([]);
                    }
                }
            } catch (error) {
                console.error("Failed to load medical record details", error);
                setRecord(null);
            } finally {
                setLoading(false);
            }
        };

        loadDetail();
    }, [id]);

    const clinicalBlocks = useMemo(() => {
        if (!record) return [];
        return buildClinicalResultsBlock(record.medicalOrders, clinicalResults);
    }, [record, clinicalResults]);

    const completedClinicalBlocks = useMemo(
        () => clinicalBlocks.filter((item) => Boolean(item.resultSummary || item.performedAt || item.attachmentUrls.length > 0)),
        [clinicalBlocks],
    );

    const pendingClinicalBlocks = useMemo(
        () => clinicalBlocks.filter((item) => !completedClinicalBlocks.some((completed) => completed.id === item.id)),
        [clinicalBlocks, completedClinicalBlocks],
    );

    if (loading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center space-y-4">
                <span className="material-symbols-outlined animate-spin text-[#3C81C6]" style={{ fontSize: "40px" }}>progress_activity</span>
                <p className="font-medium text-[#687582]">Đang tải thông tin bệnh án...</p>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white px-6 py-16 text-center dark:border-[#2d353e] dark:bg-[#1e242b]">
                <span className="material-symbols-outlined mb-4 text-gray-300 dark:text-gray-600" style={{ fontSize: "64px" }}>error_outline</span>
                <h3 className="mb-1 text-lg font-semibold text-[#121417] dark:text-white">Không tìm thấy bệnh án</h3>
                <p className="mb-6 text-sm text-[#687582]">Bệnh án bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền xem.</p>
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3C81C6] to-[#2563eb] px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg">
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-[#1e242b]">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
                </button>
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-[#121417] dark:text-white">Chi tiết bệnh án</h1>
                    <p className="mt-0.5 text-sm text-[#687582]">Mã lần khám: {record.encounter.encounterId}</p>
                </div>
            </div>

            <SectionCard icon="overview" title="Tổng quan lần khám">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
                    <InfoTile label="Bác sĩ điều trị" value={record.encounter.doctorName} />
                    <InfoTile label="Chuyên khoa / phòng" value={`${record.encounter.specialtyName}${record.encounter.roomName ? ` • ${record.encounter.roomName}` : ""}`} />
                    <InfoTile label="Thời gian bắt đầu" value={record.encounter.formattedStartTime} />
                    <InfoTile label="Thời gian kết thúc" value={record.encounter.formattedEndTime} />
                    <InfoTile label="Loại lần khám" value={record.encounter.encounterTypeLabel} />
                    <InfoTile label="Trạng thái khám" value={record.encounter.statusLabel} />
                    <InfoTile label="Lượt khám" value={record.encounter.visitNumber ? `#${record.encounter.visitNumber}` : "--"} />
                    <div className="rounded-xl border border-[#e5e7eb] bg-[#f6f7f8] p-4 dark:border-[#2d353e] dark:bg-[#13191f]">
                        <p className="mb-1 text-sm text-[#687582]">Tình trạng hồ sơ</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${TRUST_STYLES[record.trustState] || TRUST_STYLES.draft}`}>{record.trustLabel}</span>
                            {record.isFinalized ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Hồ sơ đã hoàn tất</span> : null}
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard icon="stethoscope" title="Khám lâm sàng & sinh hiệu">
                {record.clinicalExam ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
                        <InfoTile label="Lý do khám bệnh" value={record.clinicalExam.chiefComplaint} />
                        <InfoTile label="Tiền sử / triệu chứng" value={record.clinicalExam.medicalHistoryNotes} />
                        <InfoTile label="Khám thực thể" value={record.clinicalExam.physicalExamination} />
                        <InfoTile label="Huyết áp" value={record.clinicalExam.bloodPressureSystolic && record.clinicalExam.bloodPressureDiastolic ? `${record.clinicalExam.bloodPressureSystolic}/${record.clinicalExam.bloodPressureDiastolic}` : "--"} />
                        <InfoTile label="Mạch" value={record.clinicalExam.pulse ? `${record.clinicalExam.pulse} bpm` : "--"} />
                        <InfoTile label="Nhiệt độ" value={record.clinicalExam.temperature ? `${record.clinicalExam.temperature}°C` : "--"} />
                        <InfoTile label="Nhịp thở" value={record.clinicalExam.respiratoryRate ? `${record.clinicalExam.respiratoryRate}/phút` : "--"} />
                        <InfoTile label="SpO2" value={record.clinicalExam.spo2 ? `${record.clinicalExam.spo2}%` : "--"} />
                        <InfoTile label="Cân nặng" value={record.clinicalExam.weight ? `${record.clinicalExam.weight} kg` : "--"} />
                        <InfoTile label="Chiều cao" value={record.clinicalExam.height ? `${record.clinicalExam.height} cm` : "--"} />
                        <InfoTile label="BMI" value={record.clinicalExam.bmi ? String(record.clinicalExam.bmi) : "--"} />
                    </div>
                ) : (
                    <EmptyState title="Chưa có dữ liệu khám lâm sàng" message="Thông tin sinh hiệu và nhận định lâm sàng sẽ hiển thị khi hồ sơ được cập nhật." icon="monitor_heart" />
                )}
            </SectionCard>

            <SectionCard icon="clinical_notes" title="Chẩn đoán" accent="text-emerald-600">
                {record.diagnoses.length > 0 ? (
                    <div className="space-y-3">
                        {record.diagnoses.map((diagnosis) => (
                            <div key={diagnosis.id} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">{diagnosis.diagnosisTypeLabel}</span>
                                    {diagnosis.icd10Code ? <span className="text-xs text-[#687582]">ICD-10: {diagnosis.icd10Code}</span> : null}
                                </div>
                                <p className="text-sm font-bold text-[#121417] dark:text-white">{diagnosis.diagnosisName}</p>
                                {diagnosis.notes ? <p className="mt-2 text-sm text-[#687582]">{diagnosis.notes}</p> : null}
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState title="Chưa có chẩn đoán" message="Thông tin chẩn đoán sẽ hiển thị sau khi bác sĩ cập nhật hồ sơ." icon="diagnosis" />
                )}
            </SectionCard>

            <SectionCard icon="science" title="Kết quả cận lâm sàng" accent="text-violet-600">
                {clinicalBlocks.length > 0 ? (
                    <div className="space-y-6">
                        {completedClinicalBlocks.length > 0 ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-[#121417] dark:text-white">Chỉ định đã có kết quả</h3>
                                    <p className="mt-1 text-xs text-[#687582]">Bao gồm các xét nghiệm hoặc cận lâm sàng đã được trả kết quả cho buổi khám này.</p>
                                </div>
                                {completedClinicalBlocks.map((item) => (
                                    <div key={item.id} className={`rounded-2xl border p-4 ${item.isAbnormal ? "border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/5" : "border-[#e5e7eb] bg-[#f6f7f8] dark:border-[#2d353e] dark:bg-[#13191f]"}`}>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-sm font-bold text-[#121417] dark:text-white">{item.serviceName}</h4>
                                                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{item.statusLabel}</span>
                                                {item.priority ? <span className="rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#687582] dark:border-[#2d353e] dark:bg-[#1e242b]">Ưu tiên: {item.priority}</span> : null}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#687582]">
                                                {item.orderedAt ? <span>Chỉ định: {new Date(item.orderedAt).toLocaleString("vi-VN")}</span> : null}
                                                {item.performedAt ? <span>Thực hiện: {new Date(item.performedAt).toLocaleString("vi-VN")}</span> : null}
                                                {item.ordererName ? <span>Người chỉ định: {item.ordererName}</span> : null}
                                                {item.performerName ? <span>Người thực hiện: {item.performerName}</span> : null}
                                            </div>
                                            {item.clinicalIndicator ? <p className="text-sm text-[#687582]"><span className="font-semibold">Chỉ định lâm sàng:</span> {item.clinicalIndicator}</p> : null}
                                            {item.resultSummary ? <p className="text-sm text-[#121417] dark:text-white"><span className="font-semibold">Tóm tắt kết quả:</span> {item.resultSummary}</p> : null}
                                            {item.abnormalReason ? <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{item.abnormalReason}</p> : null}
                                            {item.attachmentUrls.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {item.attachmentUrls.map((url, index) => (
                                                        <a
                                                            key={`${item.id}-${index}`}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-full border border-[#d6e6f7] bg-white px-3 py-1 text-xs font-semibold text-[#3C81C6] hover:border-[#3C81C6] dark:border-[#2d4f73] dark:bg-[#1e242b]"
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>attach_file</span>
                                                            Xem tệp đính kèm
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        {pendingClinicalBlocks.length > 0 ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-[#121417] dark:text-white">Chỉ định đã tạo nhưng chưa có kết quả</h3>
                                    <p className="mt-1 text-xs text-[#687582]">Các chỉ định này đã được ghi nhận trong hồ sơ nhưng hiện chưa có kết quả trả về.</p>
                                </div>
                                {pendingClinicalBlocks.map((item) => (
                                    <div key={item.id} className="rounded-2xl border border-[#e5e7eb] bg-[#f6f7f8] p-4 dark:border-[#2d353e] dark:bg-[#13191f]">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-sm font-bold text-[#121417] dark:text-white">{item.serviceName}</h4>
                                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">Chưa có kết quả</span>
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#687582]">
                                                {item.orderedAt ? <span>Chỉ định: {new Date(item.orderedAt).toLocaleString("vi-VN")}</span> : null}
                                                {item.ordererName ? <span>Người chỉ định: {item.ordererName}</span> : null}
                                            </div>
                                            {item.clinicalIndicator ? <p className="text-sm text-[#687582]"><span className="font-semibold">Chỉ định lâm sàng:</span> {item.clinicalIndicator}</p> : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <EmptyState title="Buổi khám này chưa có chỉ định cận lâm sàng" message="Nếu bác sĩ có chỉ định xét nghiệm hoặc chẩn đoán hình ảnh, thông tin sẽ hiển thị tại đây." icon="biotech" />
                )}
            </SectionCard>

            <SectionCard icon="medication" title="Đơn thuốc" accent="text-cyan-600">
                {record.prescription && record.prescription.details.length > 0 ? (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
                            <InfoTile label="Mã đơn thuốc" value={record.prescription.prescriptionCode} />
                            <InfoTile label="Ngày kê" value={record.prescription.prescribedAt} />
                            <InfoTile label="Tình trạng toa" value={record.prescription.statusLabel} />
                            <InfoTile label="Chẩn đoán lâm sàng" value={record.prescription.clinicalDiagnosis} />
                        </div>
                        <InfoTile label="Ghi chú bác sĩ" value={record.prescription.doctorNotes} />
                        <div className="space-y-3">
                            {record.prescription.details.map((item, index) => (
                                <div key={`${item.brandName}-${index}`} className="rounded-2xl border border-[#e5e7eb] bg-[#f6f7f8] p-4 dark:border-[#2d353e] dark:bg-[#13191f]">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-[#121417] dark:text-white">{item.brandName}</p>
                                            <p className="mt-1 text-xs text-[#687582]">{item.activeIngredients}</p>
                                            {item.drugCode ? <p className="mt-1 text-xs text-[#687582]">Mã thuốc: {item.drugCode}</p> : null}
                                        </div>
                                        <div className="grid min-w-0 grid-cols-2 gap-3 text-sm md:grid-cols-3 xl:min-w-[420px]">
                                            <InfoTile label="Số lượng" value={item.quantity ? `${item.quantity} ${item.dispensingUnit}` : `-- ${item.dispensingUnit}`} />
                                            <InfoTile label="Liều dùng" value={item.dosage} />
                                            <InfoTile label="Tần suất" value={item.frequency} />
                                            <InfoTile label="Số ngày" value={item.durationDays ? `${item.durationDays} ngày` : "--"} />
                                            <InfoTile label="Đường dùng" value={item.routeOfAdministration} />
                                            <InfoTile label="Hướng dẫn" value={item.usageInstruction} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <EmptyState title="Chưa có đơn thuốc" message="Thông tin toa thuốc sẽ hiển thị tại đây nếu buổi khám có chỉ định dùng thuốc." icon="pill" />
                )}
            </SectionCard>

            <SectionCard icon="verified_user" title="Tình trạng hồ sơ" accent="text-indigo-600">
                <div className="space-y-5">
                    <div className="rounded-2xl border border-[#e5e7eb] bg-[#f6f7f8] p-5 dark:border-[#2d353e] dark:bg-[#13191f]">
                        <p className="text-sm text-[#687582]">Độ đầy đủ hồ sơ</p>
                        <p className="mt-1 text-3xl font-bold text-[#121417] dark:text-white">{record.completeness.score}%</p>
                        <p className="mt-1 text-sm text-[#687582]">{record.completeness.statusLabel}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <InfoTile label="Mức độ tin cậy hồ sơ" value={record.trustLabel} />
                        <InfoTile label="Hoàn tất hồ sơ" value={record.snapshot?.finalizedAt || "Chưa hoàn tất"} />
                        <InfoTile label="Xác nhận hồ sơ" value={record.signature?.signedAt || "Chưa xác nhận"} />
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
