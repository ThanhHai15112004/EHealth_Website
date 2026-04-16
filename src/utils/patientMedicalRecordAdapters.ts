import type {
    PatientClinicalResultVM,
    PatientMedicalRecordDetailVM,
    PatientMedicalRecordListItemVM,
    PatientMedicalRecordStatsVM,
    PatientRecordTimelineItemVM,
} from "@/types/patient-medical-record";

function formatDate(value?: string | null, withTime = true) {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return withTime
        ? date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })
        : date.toLocaleDateString("vi-VN");
}

function toFriendlyStatus(status?: string | null) {
    const key = String(status || "").toUpperCase();
    switch (key) {
        case "COMPLETED":
            return { key: "completed", label: "Hoàn tất khám" };
        case "IN_PROGRESS":
            return { key: "in_progress", label: "Đang xử lý" };
        case "PENDING":
            return { key: "pending", label: "Chờ xử lý" };
        case "CANCELLED":
            return { key: "pending", label: "Đã hủy" };
        default:
            return { key: "pending", label: status || "Chưa cập nhật" };
    }
}

function toTrustState(isFinalized?: boolean, hasSignature?: boolean) {
    if (hasSignature) {
        return { state: "verified" as const, label: "Đã xác nhận" };
    }
    if (isFinalized) {
        return { state: "finalized" as const, label: "Hồ sơ đã hoàn tất" };
    }
    return { state: "draft" as const, label: "Hồ sơ đang xử lý" };
}

function toEncounterTypeLabel(value?: string | null) {
    if (!value) return "Khám bệnh";
    const key = value.toUpperCase();
    const map: Record<string, string> = {
        OUTPATIENT: "Khám ngoại trú",
        INPATIENT: "Điều trị nội trú",
        EMERGENCY: "Cấp cứu",
        TELEMEDICINE: "Khám từ xa",
        FOLLOW_UP: "Tái khám",
        CONSULTATION: "Tư vấn chuyên khoa",
        FIRST_VISIT: "Khám lần đầu",
    };
    return map[key] || value;
}

function mapCompletenessStatus(status?: string | null) {
    const key = String(status || "").toLowerCase();
    switch (key) {
        case "completed":
            return { status: "completed" as const, label: "Đầy đủ" };
        case "partial":
            return { status: "partial" as const, label: "Cần bổ sung" };
        case "not_applicable":
            return { status: "not_applicable" as const, label: "Không áp dụng" };
        default:
            return { status: "missing" as const, label: "Chưa có" };
    }
}

function mapCompletenessItemLabel(item?: string | null) {
    const map: Record<string, string> = {
        clinical_examination: "Khám lâm sàng",
        diagnosis_primary: "Chẩn đoán chính",
        prescription: "Đơn thuốc",
        medical_orders_results: "Kết quả cận lâm sàng",
        doctor_notes: "Ghi chú bác sĩ",
    };
    return map[item || ""] || item || "Thông tin hồ sơ";
}

export function adaptPatientMedicalRecordListItem(raw: any): PatientMedicalRecordListItemVM {
    const friendlyStatus = toFriendlyStatus(raw?.status);
    const trust = toTrustState(raw?.is_finalized, raw?.has_signature);
    const encounterTypeLabel = toEncounterTypeLabel(raw?.encounter_type);

    return {
        encounterId: raw?.encounters_id || raw?.encounter_id || raw?.id || "",
        encounterType: raw?.encounter_type || "",
        encounterTypeLabel,
        startTime: raw?.start_time || null,
        endTime: raw?.end_time || null,
        formattedDate: formatDate(raw?.start_time),
        status: friendlyStatus.key,
        statusLabel: friendlyStatus.label,
        doctorName: raw?.doctor_name || "Chưa cập nhật",
        doctorTitle: raw?.doctor_title || null,
        specialtyName: raw?.specialty_name || encounterTypeLabel,
        primaryDiagnosis: raw?.primary_diagnosis || "Chưa có chẩn đoán chính",
        icd10Code: raw?.icd10_code || null,
        isFinalized: Boolean(raw?.is_finalized),
        hasSignature: Boolean(raw?.has_signature),
        visitNumber: raw?.visit_number ?? null,
        trustState: trust.state,
        trustLabel: trust.label,
    };
}

export function adaptPatientRecordTimelineItem(raw: any): PatientRecordTimelineItemVM {
    const type = String(raw?.event_type || raw?.type || "ENCOUNTER").toUpperCase();
    const map: Record<string, { icon: string; color: string; status: "completed" | "pending" | "in_progress"; statusLabel: string }> = {
        ENCOUNTER: { icon: "stethoscope", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10", status: "completed", statusLabel: "Lần khám" },
        DIAGNOSIS: { icon: "clinical_notes", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10", status: "completed", statusLabel: "Chẩn đoán" },
        PRESCRIPTION: { icon: "medication", color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10", status: "completed", statusLabel: "Đơn thuốc" },
        LAB_ORDER: { icon: "biotech", color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10", status: "pending", statusLabel: "Chỉ định CLS" },
        LAB_RESULT: { icon: "science", color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10", status: "completed", statusLabel: "Kết quả CLS" },
        EMR_FINALIZED: { icon: "verified", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10", status: "completed", statusLabel: "Hồ sơ hoàn tất" },
        EMR_SIGNED: { icon: "task_alt", color: "text-sky-600 bg-sky-50 dark:bg-sky-500/10", status: "completed", statusLabel: "Đã xác nhận" },
        EMR_OFFICIAL_SIGNED: { icon: "workspace_premium", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10", status: "completed", statusLabel: "Đã xác nhận" },
        SIGN_REVOKED: { icon: "gpp_bad", color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10", status: "pending", statusLabel: "Cập nhật hồ sơ" },
    };
    const config = map[type] || map.ENCOUNTER;

    return {
        id: raw?.event_id || raw?.id || raw?.reference_id || Math.random().toString(36),
        encounterId: raw?.reference_id || raw?.encounter_id || null,
        date: formatDate(raw?.event_date || raw?.date),
        rawDate: raw?.event_date || raw?.date || null,
        type,
        title: raw?.title || "Sự kiện hồ sơ y tế",
        description: raw?.summary || raw?.description || "Thông tin sức khỏe đã được cập nhật.",
        icon: config.icon,
        color: config.color,
        status: config.status,
        statusLabel: config.statusLabel,
    };
}

export function adaptPatientMedicalRecordStats(raw: any): PatientMedicalRecordStatsVM {
    const totalEncounters = Number(raw?.total_encounters || 0);
    const totalFinalized = Number(raw?.total_finalized || 0);
    const topDiagnosis = Array.isArray(raw?.top_diagnoses) ? raw.top_diagnoses[0] : null;
    const encounterTypeEntries = raw?.encounters_by_type ? Object.entries(raw.encounters_by_type) : [];
    const [topEncounterType] = encounterTypeEntries.sort((a: any, b: any) => Number(b[1]) - Number(a[1]));

    return {
        totalEncounters,
        totalFinalized,
        completionRate: totalEncounters > 0 ? Math.round((totalFinalized / totalEncounters) * 100) : 0,
        lastEncounterLabel: raw?.last_encounter?.date
            ? `${formatDate(raw.last_encounter.date, false)}${raw?.last_encounter?.doctor_name ? ` • BS. ${raw.last_encounter.doctor_name}` : ""}`
            : "Chưa có lượt khám",
        topDiagnosisLabel: topDiagnosis?.diagnosis_name || "Chưa có dữ liệu nổi bật",
        topDiagnosisCount: Number(topDiagnosis?.count || 0),
        topEncounterTypeLabel: topEncounterType ? toEncounterTypeLabel(String(topEncounterType[0])) : "Khám bệnh",
        vitalSignsTrend: Array.isArray(raw?.vital_signs_trend) ? raw.vital_signs_trend : [],
    };
}

export function adaptPatientClinicalResult(raw: any): PatientClinicalResultVM {
    const summary = String(raw?.result_summary || "");
    const detailsText = JSON.stringify(raw?.result_details || {});
    const isAbnormal = /abnormal|critical|high|low|out[-_\s]?of[-_\s]?range|bat thuong/i.test(summary)
        || /"is_abnormal":\s*true|"flag":"abnormal"|"status":"abnormal"/i.test(detailsText);
    const friendlyStatus = toFriendlyStatus(raw?.status);

    return {
        orderId: raw?.medical_orders_id || raw?.order_id || "",
        encounterId: raw?.encounter_id || "",
        serviceCode: raw?.service_code || "",
        serviceName: raw?.service_name || "Dịch vụ cận lâm sàng",
        orderType: raw?.order_type || "",
        priority: raw?.priority || "",
        status: friendlyStatus.key,
        statusLabel: raw?.result_id ? "Có kết quả" : friendlyStatus.label,
        clinicalIndicator: raw?.clinical_indicator || null,
        notes: raw?.notes || null,
        orderedAt: raw?.ordered_at || null,
        performedAt: raw?.performed_at || null,
        doctorName: raw?.doctor_name || "",
        ordererName: raw?.orderer_name || "",
        performerName: raw?.performer_name || "",
        resultSummary: raw?.result_summary || null,
        resultDetails: raw?.result_details || null,
        attachmentUrls: Array.isArray(raw?.attachment_urls) ? raw.attachment_urls : [],
        isAbnormal,
        abnormalReason: isAbnormal ? "Có dấu hiệu cần lưu ý trong kết quả." : null,
    };
}

export function adaptPatientMedicalRecordDetail(raw: any): PatientMedicalRecordDetailVM {
    const encounter = raw?.encounter || {};
    const signature = raw?.signature || null;
    const snapshot = raw?.snapshot || null;
    const trust = toTrustState(raw?.is_finalized ?? encounter?.is_finalized, Boolean(signature));
    const completenessScore = Number(raw?.completeness?.score || 0);

    return {
        encounter: {
            encounterId: encounter?.encounters_id || encounter?.encounter_id || "",
            encounterType: encounter?.encounter_type || "",
            encounterTypeLabel: toEncounterTypeLabel(encounter?.encounter_type),
            startTime: encounter?.start_time || null,
            endTime: encounter?.end_time || null,
            formattedStartTime: formatDate(encounter?.start_time),
            formattedEndTime: encounter?.end_time ? formatDate(encounter?.end_time) : "--",
            status: toFriendlyStatus(encounter?.status).key,
            statusLabel: toFriendlyStatus(encounter?.status).label,
            doctorName: encounter?.doctor_name || "Chưa cập nhật",
            doctorTitle: encounter?.doctor_title || null,
            specialtyName: encounter?.specialty_name || toEncounterTypeLabel(encounter?.encounter_type),
            roomName: encounter?.room_name || null,
            roomCode: encounter?.room_code || null,
            visitNumber: encounter?.visit_number ?? null,
            notes: encounter?.notes || null,
            patientId: encounter?.patient_id,
        },
        clinicalExam: raw?.clinical_examination ? {
            chiefComplaint: raw.clinical_examination?.chief_complaint || "--",
            medicalHistoryNotes: raw.clinical_examination?.medical_history_notes || "--",
            physicalExamination: raw.clinical_examination?.physical_examination || "--",
            pulse: raw.clinical_examination?.pulse ?? null,
            bloodPressureSystolic: raw.clinical_examination?.blood_pressure_systolic ?? null,
            bloodPressureDiastolic: raw.clinical_examination?.blood_pressure_diastolic ?? null,
            temperature: raw.clinical_examination?.temperature ?? null,
            respiratoryRate: raw.clinical_examination?.respiratory_rate ?? null,
            spo2: raw.clinical_examination?.spo2 ?? null,
            weight: raw.clinical_examination?.weight ?? null,
            height: raw.clinical_examination?.height ?? null,
            bmi: raw.clinical_examination?.bmi ?? null,
        } : null,
        diagnoses: Array.isArray(raw?.diagnoses) ? raw.diagnoses.map((item: any) => ({
            id: item?.encounter_diagnoses_id || item?.id || Math.random().toString(36),
            diagnosisName: item?.diagnosis_name || "Chưa có chẩn đoán",
            diagnosisType: item?.diagnosis_type || "SECONDARY",
            diagnosisTypeLabel: item?.diagnosis_type === "PRIMARY"
                ? "Chẩn đoán chính"
                : item?.diagnosis_type === "FINAL"
                    ? "Chẩn đoán kết luận"
                    : "Chẩn đoán phụ",
            icd10Code: item?.icd10_code || null,
            notes: item?.notes || null,
            diagnosedByName: item?.diagnosed_by_name || null,
        })) : [],
        medicalOrders: Array.isArray(raw?.medical_orders) ? raw.medical_orders.map((item: any) => ({
            id: item?.medical_orders_id || item?.id || Math.random().toString(36),
            serviceCode: item?.service_code || "",
            serviceName: item?.service_name || "Dịch vụ cận lâm sàng",
            priority: item?.priority || "",
            status: toFriendlyStatus(item?.status).key,
            statusLabel: item?.result_summary ? "Có kết quả" : toFriendlyStatus(item?.status).label,
            orderedAt: item?.ordered_at || null,
            resultSummary: item?.result_summary || null,
            attachmentUrls: Array.isArray(item?.attachment_urls) ? item.attachment_urls : [],
        })) : [],
        prescription: raw?.prescription ? {
            prescriptionCode: raw.prescription?.prescription_code || "--",
            status: toFriendlyStatus(raw.prescription?.status).key,
            statusLabel: toFriendlyStatus(raw.prescription?.status).label,
            clinicalDiagnosis: raw.prescription?.clinical_diagnosis || "--",
            doctorNotes: raw.prescription?.doctor_notes || "--",
            prescribedAt: formatDate(raw.prescription?.prescribed_at),
            details: Array.isArray(raw.prescription?.details) ? raw.prescription.details.map((item: any) => ({
                drugCode: item?.drug_code || "",
                brandName: item?.brand_name || "Thuốc",
                activeIngredients: item?.active_ingredients || "--",
                quantity: item?.quantity ?? null,
                dosage: item?.dosage || "--",
                frequency: item?.frequency || "--",
                durationDays: item?.duration_days ?? null,
                usageInstruction: item?.usage_instruction || "--",
                routeOfAdministration: item?.route_of_administration || "--",
                dispensingUnit: item?.dispensing_unit || "--",
            })) : [],
        } : null,
        trustState: trust.state,
        trustLabel: trust.label,
        isFinalized: Boolean(raw?.is_finalized ?? encounter?.is_finalized),
        hasSignature: Boolean(signature),
        completeness: {
            score: completenessScore,
            totalItems: Number(raw?.completeness?.total_items || 0),
            completedItems: Number(raw?.completeness?.completed_items || 0),
            statusLabel: completenessScore >= 90
                ? "Hồ sơ đầy đủ"
                : completenessScore >= 70
                    ? "Hồ sơ khá đầy đủ"
                    : "Hồ sơ còn thiếu một số mục",
            patientChecklist: Array.isArray(raw?.completeness?.details) ? raw.completeness.details.map((item: any) => {
                const mapped = mapCompletenessStatus(item?.status);
                return {
                    id: item?.item || Math.random().toString(36),
                    label: mapCompletenessItemLabel(item?.item),
                    status: mapped.status,
                    statusLabel: mapped.label,
                    note: item?.note,
                };
            }) : [],
        },
        snapshot: snapshot ? {
            finalizedAt: formatDate(snapshot?.finalized_at),
            finalizerName: snapshot?.finalizer_name || null,
            notes: snapshot?.notes || null,
        } : null,
        signature: signature ? {
            signerName: signature?.signer_name || null,
            signedAt: formatDate(signature?.signed_at),
        } : null,
    };
}
