import { type PatientProfile } from "@/types/patient-profile";
import type { Patient } from "@/services/patientService";

export const LOCAL_RELATIONS_KEY = 'patient_relationships';

export const getLocalRelations = (): Record<string, { relationship: string; label: string }> => {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(window.localStorage.getItem(LOCAL_RELATIONS_KEY) || '{}');
    } catch { return {}; }
};

export const saveLocalRelation = (patientId: string, relationship: string, label: string): void => {
    if (typeof window === 'undefined') return;
    const rels = getLocalRelations();
    rels[patientId] = { relationship, label };
    window.localStorage.setItem(LOCAL_RELATIONS_KEY, JSON.stringify(rels));
};

/**
 * Map backend Patient → frontend PatientProfile.
 * - Detect "self" dựa trên so sánh tên/email/phone với user đang đăng nhập
 * - Dùng localStorage polyfill cho relationship (BE chưa persist field này)
 */
export const mapToProfile = (p: Patient, userParam?: any): PatientProfile => {
    let isSelf = false;
    let relationshipLabel = "Khác";
    let relationshipVal: PatientProfile["relationship"] = "other";

    if (userParam) {
        const isNameMatch = p.full_name?.toLowerCase().trim() === userParam.fullName?.toLowerCase().trim();
        const isPhoneMatch = !!(p.phone_number && userParam.phone && p.phone_number === userParam.phone);
        const isEmailMatch = !!(p.email && userParam.email && p.email === userParam.email);
        if (isNameMatch || isPhoneMatch || isEmailMatch) {
            isSelf = true;
        }
    } else {
        if (p.account_phone && p.phone_number === p.account_phone) isSelf = true;
        if (p.account_email && p.email === p.account_email) isSelf = true;
    }

    const patientKey = p.patient_id || p.id;
    const localRels = getLocalRelations();
    if (patientKey && localRels[patientKey]) {
        relationshipVal = localRels[patientKey].relationship as PatientProfile["relationship"];
        relationshipLabel = localRels[patientKey].label;
        if (relationshipVal === 'self') isSelf = true;
    } else if (isSelf) {
        relationshipVal = "self";
        relationshipLabel = "Bản thân";
    }

    return {
        id: p.patient_id || p.id || "",
        userId: userParam?.id || "",
        fullName: p.full_name,
        dob: p.date_of_birth ? p.date_of_birth.split("T")[0] : "",
        gender: (p.gender?.toLowerCase() as PatientProfile["gender"]) || "other",
        phone: p.phone_number || p.contact?.phone_number || "",
        idNumber: p.id_card_number || p.identity_number || "",
        insuranceNumber: p.insurance?.[0]?.insurance_number || "",
        address: p.address || p.contact?.street_address || "",
        relationship: relationshipVal,
        relationshipLabel: relationshipLabel,
        email: p.email || p.contact?.email || "",
        bloodType: p.blood_type || "",
        allergies: typeof p.allergies === "string" ? p.allergies.split(",").map(s => s.trim()).filter(Boolean) : (p.allergies || []),
        medicalHistory: p.chronic_diseases || "",
        isActive: p.status !== "INACTIVE",
        isPrimary: isSelf,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
    };
};
