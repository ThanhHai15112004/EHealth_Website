import { type PatientProfile } from "@/data/patient-profiles-mock";
import { Patient } from "@/services/patientService";

export const LOCAL_RELATIONS_KEY = 'patient_relationships';

export const getLocalRelations = () => {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(window.localStorage.getItem(LOCAL_RELATIONS_KEY) || '{}');
    } catch { return {}; }
};

export const saveLocalRelation = (patientId: string, relationship: string, label: string) => {
    if (typeof window === 'undefined') return;
    const rels = getLocalRelations();
    rels[patientId] = { relationship, label };
    window.localStorage.setItem(LOCAL_RELATIONS_KEY, JSON.stringify(rels));
};

export const mapToProfile = (p: Patient, userParam?: any): PatientProfile => {
    let isSelf = false;
    let relationshipLabel = "Khác";
    let relationshipVal: PatientProfile["relationship"] = "other";

    if (userParam) {
        const isNameMatch = p.full_name?.toLowerCase().trim() === userParam.fullName?.toLowerCase().trim();
        const isPhoneMatch = p.phone_number && userParam.phone && p.phone_number === userParam.phone;
        const isEmailMatch = p.email && userParam.email && p.email === userParam.email;

        // If the name matches and either phone or email matches, it's definitely the user.
        // If there's no phone/email info attached to the patient yet, but perfectly matching name, also assume self.
        if (isNameMatch || isPhoneMatch || isEmailMatch) {
            isSelf = true;
        }
    } else {
        // Fallback to appended fields from backend query if userParam not provided
        if (p.account_phone && p.phone_number === p.account_phone) isSelf = true;
        if (p.account_email && p.email === p.account_email) isSelf = true;
    }

    // Attempt to load from localStorage polyfill first
    const localRels = getLocalRelations();
    if (localRels[p.id]) {
        relationshipVal = localRels[p.id].relationship;
        relationshipLabel = localRels[p.id].label;
        if (relationshipVal === 'self') isSelf = true;
    } else if (isSelf) {
        // If nothing in local storage but we detected self, mark it automatically
        relationshipVal = "self";
        relationshipLabel = "Bản thân";
    }

    return {
        id: p.id,
        userId: "", // Will be overridden
        fullName: p.full_name,
        dob: p.date_of_birth ? p.date_of_birth.split("T")[0] : "",
        gender: p.gender?.toLowerCase() as PatientProfile["gender"] || "other",
        phone: p.phone_number || "",
        idNumber: p.id_card_number || "",
        insuranceNumber: "",
        address: p.address || "",
        relationship: relationshipVal,
        relationshipLabel: relationshipLabel,
        allergies: [],
        medicalHistory: "",
        isActive: p.status !== "INACTIVE",
        isPrimary: isSelf,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
    };
};
