/**
 * Patient Profile Service (Multi-Profile)
 *
 * Module 1 — Multi-Patient Profiles
 * 1 account → nhiều patient profiles (gia đình)
 *
 * Backend: /api/patient/profiles/*
 */

import axiosClient from "@/api/axiosClient";
import { PATIENT_PROFILE_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

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
    relationship?: PatientRelationship;
    is_default?: boolean;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePatientProfileRequest {
    full_name: string;
    date_of_birth: string; // YYYY-MM-DD
    gender: "MALE" | "FEMALE" | "OTHER";
    phone_number?: string;
    email?: string;
    id_card_number?: string;
    address?: string;
    relationship?: PatientRelationship;
    is_default?: boolean;
}

export type UpdatePatientProfileRequest = Partial<CreatePatientProfileRequest>;

const RELATIONSHIP_LABELS: Record<PatientRelationship, string> = {
    SELF: "Bản thân",
    PARENT: "Cha/Mẹ",
    CHILD: "Con",
    SPOUSE: "Vợ/Chồng",
    SIBLING: "Anh/Chị/Em",
    OTHER: "Khác",
};

export const getRelationshipLabel = (rel?: PatientRelationship): string => {
    return rel ? RELATIONSHIP_LABELS[rel] || "Khác" : "Khác";
};

export const patientProfileService = {
    /**
     * Lấy tất cả profiles của tài khoản đang đăng nhập
     */
    getMyProfiles: async (): Promise<PatientProfileBE[]> => {
        const res = await axiosClient.get(PATIENT_PROFILE_ENDPOINTS.LIST);
        const list = unwrapList<PatientProfileBE>(res);
        return list.data;
    },

    /**
     * Lấy profile mặc định
     */
    getDefault: async (): Promise<PatientProfileBE | null> => {
        const res = await axiosClient.get(PATIENT_PROFILE_ENDPOINTS.DEFAULT);
        return unwrap<PatientProfileBE | null>(res);
    },

    /**
     * Lấy chi tiết 1 profile
     */
    getById: async (id: string): Promise<PatientProfileBE> => {
        const res = await axiosClient.get(PATIENT_PROFILE_ENDPOINTS.DETAIL(id));
        return unwrap<PatientProfileBE>(res);
    },

    /**
     * Tạo profile mới (cho bản thân hoặc người thân)
     */
    create: async (data: CreatePatientProfileRequest): Promise<PatientProfileBE> => {
        const res = await axiosClient.post(PATIENT_PROFILE_ENDPOINTS.CREATE, data);
        return unwrap<PatientProfileBE>(res);
    },

    /**
     * Cập nhật profile
     */
    update: async (id: string, data: UpdatePatientProfileRequest): Promise<PatientProfileBE> => {
        const res = await axiosClient.put(PATIENT_PROFILE_ENDPOINTS.UPDATE(id), data);
        return unwrap<PatientProfileBE>(res);
    },

    /**
     * Ngừng sử dụng profile (soft delete)
     */
    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(PATIENT_PROFILE_ENDPOINTS.DELETE(id));
    },

    /**
     * Đặt profile làm default
     */
    setDefault: async (id: string): Promise<PatientProfileBE> => {
        const res = await axiosClient.patch(PATIENT_PROFILE_ENDPOINTS.SET_DEFAULT(id));
        return unwrap<PatientProfileBE>(res);
    },

    /**
     * Cập nhật quan hệ
     */
    updateRelationship: async (id: string, relationship: PatientRelationship): Promise<PatientProfileBE> => {
        const res = await axiosClient.put(PATIENT_PROFILE_ENDPOINTS.UPDATE_RELATIONSHIP(id), { relationship });
        return unwrap<PatientProfileBE>(res);
    },
};

/**
 * Helper: Map từ Backend Patient → Frontend PatientProfile (đồng bộ với src/types/patient-profile.ts)
 * Dùng cho các trang FE đang dùng PatientProfile interface cũ.
 */
export function mapBEToFEProfile(be: PatientProfileBE, userId?: string): import("@/types/patient-profile").PatientProfile {
    const genderMap: Record<string, "male" | "female" | "other"> = {
        MALE: "male",
        FEMALE: "female",
        OTHER: "other",
    };
    return {
        id: be.id,
        userId: be.account_id || userId || "",
        fullName: be.full_name,
        dob: be.date_of_birth ? be.date_of_birth.split("T")[0] : "",
        gender: genderMap[be.gender] || "other",
        phone: be.phone_number || "",
        idNumber: be.id_card_number || "",
        insuranceNumber: "",
        address: be.address || "",
        relationship: (be.relationship?.toLowerCase() || "other") as any,
        relationshipLabel: getRelationshipLabel(be.relationship),
        email: be.email || "",
        bloodType: "",
        allergies: [],
        medicalHistory: "",
        isActive: be.status !== "INACTIVE",
        isPrimary: be.is_default ?? false,
        createdAt: be.created_at,
        updatedAt: be.updated_at,
    };
}
