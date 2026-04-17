import axiosClient from "@/api/axiosClient";
import { PATIENT_PROFILE_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";
import type { AvatarImage, PatientProfile } from "@/types/patient-profile";
import {
    getPatientRelationshipLabel,
    toPatientGender,
    toPatientRelationshipValue,
} from "@/utils/patientProfileHelpers";

export type PatientRelationship = "SELF" | "PARENT" | "CHILD" | "SPOUSE" | "SIBLING" | "OTHER";

export interface PatientProfileBE {
    id: string;
    patient_code: string;
    account_id: string | null;
    full_name: string;
    date_of_birth: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    phone_number: string | null;
    email: string | null;
    id_card_number: string | null;
    address: string | null;
    avatar_url?: AvatarImage[];
    relationship?: PatientRelationship;
    is_default?: boolean;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePatientProfileRequest {
    full_name: string;
    date_of_birth: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    phone_number?: string;
    email?: string;
    id_card_number?: string;
    address?: string;
    relationship?: PatientRelationship;
    is_default?: boolean;
}

export type UpdatePatientProfileRequest = Partial<CreatePatientProfileRequest>;

export const patientProfileService = {
    getMyProfiles: async (): Promise<PatientProfileBE[]> => {
        const response = await axiosClient.get(PATIENT_PROFILE_ENDPOINTS.LIST);
        return unwrapList<PatientProfileBE>(response).data;
    },

    getDefault: async (): Promise<PatientProfileBE | null> => {
        const response = await axiosClient.get(PATIENT_PROFILE_ENDPOINTS.DEFAULT);
        return unwrap<PatientProfileBE | null>(response);
    },

    getById: async (id: string): Promise<PatientProfileBE> => {
        const response = await axiosClient.get(PATIENT_PROFILE_ENDPOINTS.DETAIL(id));
        return unwrap<PatientProfileBE>(response);
    },

    create: async (data: CreatePatientProfileRequest): Promise<PatientProfileBE> => {
        const response = await axiosClient.post(PATIENT_PROFILE_ENDPOINTS.CREATE, data);
        return unwrap<PatientProfileBE>(response);
    },

    update: async (id: string, data: UpdatePatientProfileRequest): Promise<PatientProfileBE> => {
        const response = await axiosClient.put(PATIENT_PROFILE_ENDPOINTS.UPDATE(id), data);
        return unwrap<PatientProfileBE>(response);
    },

    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(PATIENT_PROFILE_ENDPOINTS.DELETE(id));
    },

    setDefault: async (id: string): Promise<PatientProfileBE> => {
        const response = await axiosClient.patch(PATIENT_PROFILE_ENDPOINTS.SET_DEFAULT(id));
        return unwrap<PatientProfileBE>(response);
    },

    updateRelationship: async (id: string, relationship: PatientRelationship): Promise<PatientProfileBE> => {
        const response = await axiosClient.put(PATIENT_PROFILE_ENDPOINTS.UPDATE_RELATIONSHIP(id), { relationship });
        return unwrap<PatientProfileBE>(response);
    },

    uploadAvatar: async (id: string, file: File): Promise<AvatarImage> => {
        const formData = new FormData();
        formData.append("avatar", file);
        const response = await axiosClient.post(PATIENT_PROFILE_ENDPOINTS.AVATAR_UPLOAD(id), formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return unwrap<AvatarImage>(response);
    },

    deleteAvatar: async (id: string, publicId: string): Promise<void> => {
        await axiosClient.delete(PATIENT_PROFILE_ENDPOINTS.AVATAR_DELETE(id), {
            data: { public_id: publicId },
        });
    },
};

export function mapBEToFEProfile(
    profile: PatientProfileBE,
    userId?: string,
    overrides?: Partial<PatientProfile>,
): PatientProfile {
    const avatarImages = Array.isArray(profile.avatar_url) ? profile.avatar_url : [];
    const primaryAvatar = avatarImages[0];

    return {
        id: profile.id,
        userId: profile.account_id || userId || "",
        patientCode: profile.patient_code,
        fullName: profile.full_name,
        dob: profile.date_of_birth ? profile.date_of_birth.split("T")[0] : "",
        gender: toPatientGender(profile.gender),
        phone: profile.phone_number || "",
        idNumber: profile.id_card_number || "",
        address: profile.address || "",
        relationship: toPatientRelationshipValue(profile.relationship),
        relationshipLabel: getPatientRelationshipLabel(profile.relationship),
        email: profile.email || "",
        bloodType: "",
        allergies: [],
        medicalHistory: "",
        isActive: profile.status !== "INACTIVE",
        isPrimary: Boolean(profile.is_default),
        avatar: primaryAvatar?.url || "",
        avatarPublicId: primaryAvatar?.public_id || "",
        avatarImages,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        insuranceStatus: "none",
        hasInsurance: false,
        ...overrides,
        summary: {
            insuranceCount: 0,
            ...(overrides?.summary || {}),
        },
    };
}
