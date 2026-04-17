import type { PatientInsuranceRecord } from "@/services/patientInsuranceService";
import type { PatientProfile } from "@/types/patient-profile";

export type PatientRelationshipValue = PatientProfile["relationship"];
export type InsuranceDisplayStatus = NonNullable<PatientProfile["insuranceStatus"]>;

type InsuranceSummary = {
    insuranceCount: number;
    hasInsurance: boolean;
    insuranceStatus: InsuranceDisplayStatus;
    insuranceNumber?: string;
    insuranceProviderName?: string;
    insuranceExpiry?: string;
};

const INSURANCE_EXPIRING_DAYS = 30;

export const RELATIONSHIP_LABELS: Record<PatientRelationshipValue, string> = {
    self: "Bản thân",
    parent: "Cha/Mẹ",
    child: "Con",
    sibling: "Anh/Chị/Em",
    spouse: "Vợ/Chồng",
    other: "Khác",
};

export const RELATIONSHIP_ENUMS: Record<PatientRelationshipValue, string> = {
    self: "SELF",
    parent: "PARENT",
    child: "CHILD",
    sibling: "SIBLING",
    spouse: "SPOUSE",
    other: "OTHER",
};

export function toPatientRelationshipValue(value?: string | null): PatientRelationshipValue {
    const normalized = String(value || "").trim().toUpperCase();
    switch (normalized) {
        case "SELF":
            return "self";
        case "PARENT":
            return "parent";
        case "CHILD":
            return "child";
        case "SIBLING":
            return "sibling";
        case "SPOUSE":
            return "spouse";
        default:
            return "other";
    }
}

export function toPatientRelationshipEnum(value?: PatientRelationshipValue | string | null): string {
    return RELATIONSHIP_ENUMS[toPatientRelationshipValue(value)];
}

export function getPatientRelationshipLabel(value?: string | null): string {
    return RELATIONSHIP_LABELS[toPatientRelationshipValue(value)];
}

export function toPatientGender(value?: string | null): PatientProfile["gender"] {
    const normalized = String(value || "").trim().toUpperCase();
    if (normalized === "MALE") return "male";
    if (normalized === "FEMALE") return "female";
    return "other";
}

export function getIdentityTypeLabel(value?: string | null): string {
    const normalized = String(value || "").trim().toUpperCase();
    switch (normalized) {
        case "CCCD":
            return "CCCD";
        case "PASSPORT":
            return "Hộ chiếu";
        case "OTHER":
            return "Giấy tờ khác";
        default:
            return value || "Chưa cập nhật";
    }
}

export function getEncounterTypeLabel(value?: string | null): string {
    const normalized = String(value || "").trim().toUpperCase();
    switch (normalized) {
        case "OUTPATIENT":
            return "Khám ngoại trú";
        case "INPATIENT":
            return "Điều trị nội trú";
        case "EMERGENCY":
            return "Cấp cứu";
        case "TELEMED":
        case "TELEMEDICINE":
            return "Khám từ xa";
        case "CONSULTATION":
            return "Tư vấn chuyên khoa";
        case "FOLLOW_UP":
        case "FOLLOW-UP":
            return "Tái khám";
        case "FIRST_VISIT":
        case "FIRST-VISIT":
            return "Khám lần đầu";
        default:
            return value || "Khám bệnh";
    }
}

export function getHistoryTypeLabel(value?: string | null): string {
    const normalized = String(value || "").trim().toUpperCase();
    switch (normalized) {
        case "PERSONAL":
            return "Tiền sử cá nhân";
        case "FAMILY":
            return "Tiền sử gia đình";
        case "SURGICAL":
            return "Phẫu thuật";
        default:
            return translatePatientFacingText(value) || "Tiền sử bệnh";
    }
}

export function translatePatientFacingText(value?: string | null): string {
    if (!value) return "";

    return value
        .replace(/\bFIRST_VISIT\b/gi, "Khám lần đầu")
        .replace(/\bFOLLOW_UP\b/gi, "Tái khám")
        .replace(/\bFIRST-VISIT\b/gi, "Khám lần đầu")
        .replace(/\bFOLLOW-UP\b/gi, "Tái khám")
        .replace(/\bPASSPORT\b/gi, "Hộ chiếu")
        .replace(/\bOUTPATIENT\b/gi, "Khám ngoại trú")
        .replace(/\bINPATIENT\b/gi, "Điều trị nội trú")
        .replace(/\bTELEMEDICINE\b/gi, "Khám từ xa")
        .replace(/\bTELEMED\b/gi, "Khám từ xa")
        .replace(/\bCONSULTATION\b/gi, "Tư vấn chuyên khoa")
        .replace(/\bPERSONAL\b/gi, "Tiền sử cá nhân")
        .replace(/\bFAMILY\b/gi, "Tiền sử gia đình")
        .replace(/\bSURGICAL\b/gi, "Phẫu thuật")
        .replace(/\bACTIVE\b/gi, "Đang theo dõi")
        .replace(/\bRESOLVED\b/gi, "Đã ổn định")
        .replace(/\bMONITORING\b/gi, "Theo dõi thêm")
        .replace(/\bCOMPLETED\b/gi, "Hoàn thành")
        .replace(/\bPENDING\b/gi, "Đang chờ");
}

export function getHistoryStatusLabel(value?: string | null): string {
    const normalized = String(value || "").trim().toUpperCase();
    switch (normalized) {
        case "ACTIVE":
            return "Đang theo dõi";
        case "RESOLVED":
            return "Đã ổn định";
        case "MONITORING":
            return "Theo dõi thêm";
        case "INACTIVE":
            return "Tạm ngưng";
        default:
            return translatePatientFacingText(value) || "Đang theo dõi";
    }
}

export function getSeverityLabel(value?: string | null): string {
    const normalized = String(value || "").trim().toUpperCase();
    switch (normalized) {
        case "MILD":
            return "Nhẹ";
        case "MODERATE":
            return "Trung bình";
        case "SEVERE":
            return "Nặng";
        case "CRITICAL":
            return "Nguy kịch";
        default:
            return translatePatientFacingText(value) || "Cần theo dõi";
    }
}

export function getAllergenTypeLabel(value?: string | null): string {
    const normalized = String(value || "").trim().toUpperCase();
    switch (normalized) {
        case "FOOD":
            return "Thực phẩm";
        case "DRUG":
            return "Thuốc";
        case "ENVIRONMENT":
            return "Môi trường";
        default:
            return translatePatientFacingText(value) || "Dị nguyên";
    }
}

export function sortInsuranceRecords(
    records: PatientInsuranceRecord[],
): Array<PatientInsuranceRecord & { effectiveStatus: InsuranceDisplayStatus }> {
    const today = new Date();

    return [...records]
        .map((record) => {
            const endDate = record.end_date ? new Date(record.end_date) : null;
            const diffDays = endDate
                ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                : null;

            const effectiveStatus: InsuranceDisplayStatus =
                diffDays === null ? "active" : diffDays < 0 ? "expired" : diffDays <= INSURANCE_EXPIRING_DAYS ? "expiring" : "active";

            return {
                ...record,
                effectiveStatus,
            };
        })
        .sort((left, right) => {
            const primaryDiff = Number(Boolean(right.is_primary)) - Number(Boolean(left.is_primary));
            if (primaryDiff !== 0) return primaryDiff;

            const leftDate = left.end_date ? new Date(left.end_date).getTime() : 0;
            const rightDate = right.end_date ? new Date(right.end_date).getTime() : 0;
            return rightDate - leftDate;
        });
}

export function summarizeInsuranceRecords(records: PatientInsuranceRecord[]): InsuranceSummary {
    const normalized = sortInsuranceRecords(records);
    const preferred = normalized.find((item) => item.effectiveStatus !== "expired") || normalized[0];

    if (!preferred) {
        return {
            insuranceCount: 0,
            hasInsurance: false,
            insuranceStatus: "none",
        };
    }

    return {
        insuranceCount: normalized.length,
        hasInsurance: normalized.length > 0,
        insuranceStatus: preferred.effectiveStatus,
        insuranceNumber: preferred.insurance_number || undefined,
        insuranceProviderName: preferred.provider_name || undefined,
        insuranceExpiry: preferred.end_date || undefined,
    };
}

export function getInsuranceStatusMeta(status?: InsuranceDisplayStatus) {
    switch (status) {
        case "expired":
            return { label: "BHYT hết hạn", className: "bg-rose-50 text-rose-700" };
        case "expiring":
            return { label: "BHYT sắp hết hạn", className: "bg-amber-50 text-amber-700" };
        case "active":
            return { label: "BHYT còn hiệu lực", className: "bg-emerald-50 text-emerald-700" };
        default:
            return { label: "Chưa có BHYT", className: "bg-slate-100 text-slate-700" };
    }
}

export function enrichPatientProfileInsurance<T extends PatientProfile>(profile: T, records: PatientInsuranceRecord[]): T {
    const summary = summarizeInsuranceRecords(records);

    return {
        ...profile,
        hasInsurance: summary.hasInsurance,
        insuranceStatus: summary.insuranceStatus,
        insuranceNumber: summary.insuranceNumber,
        insuranceExpiry: summary.insuranceExpiry,
        insuranceProviderName: summary.insuranceProviderName,
        summary: {
            ...profile.summary,
            insuranceCount: summary.insuranceCount,
        },
    };
}
