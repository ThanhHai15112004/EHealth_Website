import axiosClient from '@/api/axiosClient';
import {
    CLINICAL_RESULTS_ENDPOINTS,
    EHR_ENDPOINTS,
    HEALTH_PROFILE_ENDPOINTS,
    HEALTH_TIMELINE_ENDPOINTS,
    MEDICAL_HISTORY_EHR_ENDPOINTS,
    MEDICATION_TREATMENT_ENDPOINTS,
    VITAL_SIGNS_ENDPOINTS,
} from '@/api/endpoints';
import { unwrap, unwrapList } from '@/api/response';

export const ehrService = {
    // ── Legacy (giữ nguyên) ────────────────────────────────────────────
    getSummary: (patientId: string) =>
        axiosClient.get(EHR_ENDPOINTS.SUMMARY(patientId)),

    getVitalHistory: (patientId: string, params?: Record<string, any>) =>
        axiosClient.get(EHR_ENDPOINTS.VITAL_HISTORY(patientId), { params }),

    getTreatmentHistory: (patientId: string, params?: Record<string, any>) =>
        axiosClient.get(EHR_ENDPOINTS.TREATMENT_HISTORY(patientId), { params }),

    getTimeline: (patientId: string, params?: Record<string, any>) =>
        axiosClient.get(EHR_ENDPOINTS.TIMELINE(patientId), { params }),

    getMedicalHistory: (patientId: string) =>
        axiosClient.get(EHR_ENDPOINTS.MEDICAL_HISTORY(patientId)),

    // ── Health Profile ─────────────────────────────────────────────────
    /**
     * Lấy hồ sơ sức khoẻ tổng hợp (overview + dị ứng + mô tả sức khỏe)
     * GET /api/ehr/patients/:patientId/profile
     */
    getHealthProfile: async (patientId: string) => {
        const res = await axiosClient.get(EHR_ENDPOINTS.PROFILE(patientId));
        return unwrap<any>(res);
    },

    /**
     * Lấy cảnh báo y tế của hồ sơ
     * GET /api/ehr/patients/:patientId/risk-factors
     */
    getAlerts: async (patientId: string) => {
        const res = await axiosClient.get(HEALTH_PROFILE_ENDPOINTS.ALERTS(patientId));
        return unwrap<any[]>(res);
    },

    getHealthSummary: async (patientId: string) => {
        const res = await axiosClient.get(HEALTH_PROFILE_ENDPOINTS.HEALTH_SUMMARY(patientId));
        return unwrap<any>(res);
    },

    getActiveConditions: async (patientId: string) => {
        const res = await axiosClient.get(HEALTH_PROFILE_ENDPOINTS.ACTIVE_CONDITIONS(patientId));
        return unwrapList<any>(res);
    },

    getDiagnosisHistory: async (patientId: string, params?: Record<string, any>) => {
        const res = await axiosClient.get(HEALTH_PROFILE_ENDPOINTS.DIAGNOSIS_HISTORY(patientId), { params });
        return unwrapList<any>(res);
    },

    getInsuranceStatus: async (patientId: string) => {
        const res = await axiosClient.get(HEALTH_PROFILE_ENDPOINTS.INSURANCE_STATUS(patientId));
        return unwrapList<any>(res);
    },

    // ── Vital Signs ────────────────────────────────────────────────────
    /**
     * Lấy chỉ số sinh hiệu mới nhất
     * GET /api/ehr/patients/:patientId/vitals/latest
     */
    getVitalLatest: async (patientId: string) => {
        const res = await axiosClient.get(EHR_ENDPOINTS.VITALS_LATEST(patientId));
        return unwrap<any>(res);
    },

    /**
     * Lấy lịch sử sinh hiệu (có phân trang/filter)
     * GET /api/ehr/patients/:patientId/vitals
     */
    getVitalHistoryByProfile: async (patientId: string, params?: Record<string, any>) => {
        const res = await axiosClient.get(EHR_ENDPOINTS.VITAL_HISTORY(patientId), { params });
        return unwrapList<any>(res);
    },

    getVitalSummary: async (patientId: string) => {
        const res = await axiosClient.get(VITAL_SIGNS_ENDPOINTS.SUMMARY(patientId));
        return unwrap<any>(res);
    },

    getVitalAbnormal: async (patientId: string) => {
        const res = await axiosClient.get(VITAL_SIGNS_ENDPOINTS.ABNORMAL(patientId));
        return unwrapList<any>(res);
    },

    getHealthMetrics: async (patientId: string, params?: Record<string, any>) => {
        const res = await axiosClient.get(VITAL_SIGNS_ENDPOINTS.HEALTH_METRICS(patientId), { params });
        return unwrapList<any>(res);
    },

    getVitalTrends: async (patientId: string, metricType: string) => {
        const res = await axiosClient.get(VITAL_SIGNS_ENDPOINTS.TRENDS(patientId), { params: { metric_type: metricType } });
        return unwrap<any>(res);
    },

    // ── Medical History ────────────────────────────────────────────────
    /**
     * Lấy tiền sử bệnh
     * GET /api/ehr/patients/:patientId/medical-histories
     */
    getMedicalHistoryByProfile: async (patientId: string) => {
        const res = await axiosClient.get(EHR_ENDPOINTS.MEDICAL_HISTORY(patientId));
        return unwrapList<any>(res);
    },

    getRiskFactors: async (patientId: string) => {
        const res = await axiosClient.get(MEDICAL_HISTORY_EHR_ENDPOINTS.RISK_FACTORS(patientId));
        return unwrapList<any>(res);
    },

    getSpecialConditions: async (patientId: string) => {
        const res = await axiosClient.get(MEDICAL_HISTORY_EHR_ENDPOINTS.SPECIAL_CONDITIONS(patientId));
        return unwrapList<any>(res);
    },

    // ── Clinical Results ───────────────────────────────────────────────
    /**
     * Lấy kết quả xét nghiệm / cận lâm sàng
     * GET /api/ehr/patients/:patientId/clinical-results
     */
    getClinicalResults: async (patientId: string, params?: Record<string, any>) => {
        const res = await axiosClient.get(CLINICAL_RESULTS_ENDPOINTS.LIST(patientId), { params });
        return unwrapList<any>(res);
    },

    // ── Medication / Treatment ─────────────────────────────────────────
    /**
     * Lấy danh sách thuốc / điều trị đang dùng
     * GET /api/ehr/patients/:patientId/current-medications
     */
    getCurrentMedications: async (patientId: string) => {
        const res = await axiosClient.get(EHR_ENDPOINTS.CURRENT_MEDICATIONS(patientId));
        return unwrapList<any>(res);
    },

    /**
     * Lấy lịch sử điều trị đầy đủ
     * GET /api/ehr/patients/:patientId/treatment-records
     */
    getMedicationTreatments: async (patientId: string, params?: Record<string, any>) => {
        const res = await axiosClient.get(EHR_ENDPOINTS.TREATMENT_HISTORY(patientId), { params });
        return unwrapList<any>(res);
    },

    getMedicationInteractionCheck: async (patientId: string) => {
        const res = await axiosClient.get(MEDICATION_TREATMENT_ENDPOINTS.INTERACTION_CHECK(patientId));
        return unwrap<any>(res);
    },

    getMedicationTimeline: async (patientId: string) => {
        const res = await axiosClient.get(MEDICATION_TREATMENT_ENDPOINTS.TIMELINE(patientId));
        return unwrapList<any>(res);
    },

    getMedicationDetail: async (patientId: string, prescriptionId: string) => {
        const res = await axiosClient.get(MEDICATION_TREATMENT_ENDPOINTS.DETAIL(patientId, prescriptionId));
        return unwrap<any>(res);
    },

    // ── Allergies ──────────────────────────────────────────────────────
    /**
     * Lấy danh sách dị ứng
     * GET /api/ehr/patients/:patientId/allergies
     */
    getAllergies: async (patientId: string) => {
        const res = await axiosClient.get(EHR_ENDPOINTS.ALLERGIES(patientId));
        return unwrapList<any>(res);
    },

    // ── Health Timeline ────────────────────────────────────────────────
    /**
     * Lấy dòng thời gian sức khoẻ
     * GET /api/ehr/patients/:patientId/timeline
     */
    getHealthTimeline: async (patientId: string, params?: Record<string, any>) => {
        const res = await axiosClient.get(EHR_ENDPOINTS.TIMELINE(patientId), { params });
        return unwrapList<any>(res);
    },

    getHealthTimelineSummary: async (patientId: string) => {
        const res = await axiosClient.get(HEALTH_TIMELINE_ENDPOINTS.SUMMARY(patientId));
        return unwrap<any>(res);
    },

    getHealthTimelineByEncounter: async (patientId: string, encounterId: string) => {
        const res = await axiosClient.get(HEALTH_TIMELINE_ENDPOINTS.BY_ENCOUNTER(patientId, encounterId));
        return unwrapList<any>(res);
    },

    trackConditionTimeline: async (patientId: string, icd10Code: string, params?: Record<string, any>) => {
        const res = await axiosClient.get(HEALTH_TIMELINE_ENDPOINTS.TRACK_CONDITION(patientId), {
            params: { icd10_code: icd10Code, ...params },
        });
        return unwrap<any>(res);
    },
};
