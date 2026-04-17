import axiosClient from '@/api/axiosClient';
import { MEDICAL_RECORD_ENDPOINTS } from '@/api/endpoints';

export const medicalRecordService = {
    getByPatient: (patientId: string, params?: Record<string, any>) =>
        axiosClient.get(MEDICAL_RECORD_ENDPOINTS.BY_PATIENT(patientId), { params }),

    getStats: (patientId: string) =>
        axiosClient.get(MEDICAL_RECORD_ENDPOINTS.STATS(patientId)),

    getDetail: (encounterId: string) =>
        axiosClient.get(MEDICAL_RECORD_ENDPOINTS.DETAIL(encounterId)),

    getTimeline: (patientId: string, params?: Record<string, any>) =>
        axiosClient.get(MEDICAL_RECORD_ENDPOINTS.TIMELINE(patientId), { params }),
};
