import axiosClient from "@/api/axiosClient";
import { MEDICATION_TREATMENT_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface MedicationReminderCurrentMedicationBE {
    prescription_details_id: string;
    drug_code: string;
    brand_name: string;
    active_ingredients: string;
    dosage: string;
    frequency: string;
    duration_days: number | null;
    usage_instruction: string | null;
    dispensing_unit: string;
    prescribed_at: string;
    days_remaining: number | null;
    prescription_code: string;
    doctor_name: string | null;
}

export interface MedicationReminderAdherenceRecordBE {
    adherence_id: string;
    prescription_detail_id: string;
    adherence_date: string;
    taken: boolean;
    skip_reason: string | null;
    recorded_by_name: string | null;
    created_at: string;
    drug_name: string | null;
    dosage: string | null;
}

export interface MedicationReminderAdherenceResponse {
    records: MedicationReminderAdherenceRecordBE[];
    stats: {
        total: number;
        taken: number;
        skipped: number;
        adherence_rate: number;
    };
}

export interface CreateMedicationAdherencePayload {
    prescription_detail_id: string;
    adherence_date: string;
    taken: boolean;
    skip_reason?: string;
}

export const medicationReminderService = {
    getCurrentMedications: async (patientId: string) => {
        const response = await axiosClient.get(MEDICATION_TREATMENT_ENDPOINTS.CURRENT(patientId));
        return unwrapList<MedicationReminderCurrentMedicationBE>(response).data;
    },

    getAdherence: async (patientId: string, params?: Record<string, string>) => {
        const response = await axiosClient.get(MEDICATION_TREATMENT_ENDPOINTS.ADHERENCE(patientId), { params });
        return unwrap<MedicationReminderAdherenceResponse>(response);
    },

    createAdherence: async (patientId: string, payload: CreateMedicationAdherencePayload) => {
        const response = await axiosClient.post(MEDICATION_TREATMENT_ENDPOINTS.ADHERENCE(patientId), payload);
        return unwrap<MedicationReminderAdherenceRecordBE>(response);
    },
};
