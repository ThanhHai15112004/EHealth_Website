import axiosClient from "@/api/axiosClient";
import { EHR_ENDPOINTS } from "@/api/endpoints";

export interface EhrSummary {
    patientId: string;
    bloodType: string;
    weight: number;
    height: number;
    bmi: number;
    lastVisit: string;
    chronicConditions: string[];
}

export interface VitalSign {
    id: string;
    patientId: string;
    pulse: number;
    bloodPressure: string;
    temperature: number;
    respiratoryRate: number;
    spO2: number;
    measuredAt: string;
    notes: string;
}

export interface TimelineEvent {
    id: string;
    patientId: string;
    date: string;
    type: "appointment" | "treatment" | "lab_test" | "prescription";
    title: string;
    description: string;
    department: string;
    doctorName?: string;
}

export interface MedicalHistory {
    id: string;
    patientId: string;
    condition: string;
    diagnosedDate: string;
    status: "active" | "resolved" | "monitoring";
    severity: "low" | "medium" | "high";
    notes: string;
}

export interface Allergy {
    id: string;
    patientId: string;
    allergen: string;
    reaction: string;
    severity: "mild" | "moderate" | "severe";
    identifiedDate: string;
}

export const ehrService = {
    // Lấy tóm tắt sức khỏe
    getSummary: (patientId: string) =>
        axiosClient.get<{ data: EhrSummary }>(EHR_ENDPOINTS.SUMMARY(patientId)),

    // Chỉ số sinh hiệu cơ bản
    getLatestVitals: (patientId: string) =>
        axiosClient.get<{ data: VitalSign }>(EHR_ENDPOINTS.VITALS_LATEST(patientId)),

    getVitalHistory: (patientId: string, params?: Record<string, any>) =>
        axiosClient.get<{ data: VitalSign[] }>(EHR_ENDPOINTS.VITAL_HISTORY(patientId), { params }),

    // Dòng thời gian điều trị
    getTimeline: (patientId: string, params?: Record<string, any>) =>
        axiosClient.get<{ data: TimelineEvent[] }>(EHR_ENDPOINTS.TIMELINE(patientId), { params }),

    // Lịch sử bệnh lý
    getMedicalHistory: (patientId: string) =>
        axiosClient.get<{ data: MedicalHistory[] }>(EHR_ENDPOINTS.MEDICAL_HISTORY(patientId)),

    // Tiền sử dị ứng
    getAllergies: (patientId: string) =>
        axiosClient.get<{ data: Allergy[] }>(EHR_ENDPOINTS.ALLERGIES(patientId)),

    // Lịch sử điều trị
    getTreatmentHistory: (patientId: string, params?: Record<string, any>) =>
        axiosClient.get<{ data: any[] }>(EHR_ENDPOINTS.TREATMENT_HISTORY(patientId), { params }),

    // Quản lý ghi chú (bệnh nhân note tình trạng của mình)
    getNotes: (patientId: string) =>
        axiosClient.get<{ data: any[] }>(EHR_ENDPOINTS.NOTES(patientId)),

    createNote: (patientId: string, data: any) =>
        axiosClient.post<{ data: any }>(EHR_ENDPOINTS.NOTES(patientId), data),
};
