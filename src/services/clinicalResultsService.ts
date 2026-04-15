import axiosClient from "@/api/axiosClient";
import { CLINICAL_RESULTS_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============================================================
// Clinical Results Service (6.x)
// Kết quả CLS của bệnh nhân: danh sách, xu hướng, bất thường
// ============================================================

export interface ClinicalResult {
    id: string;
    patientId?: string;
    encounterId?: string;
    type?: string;
    name?: string;
    value?: string | number;
    unit?: string;
    referenceRange?: string;
    flag?: "normal" | "low" | "high" | "critical";
    resultedAt?: string;
    [key: string]: any;
}

export interface ClinicalResultTrend {
    type?: string;
    points?: Array<{ date: string; value: number; unit?: string }>;
    [key: string]: any;
}

// Local fallback cho uploadFile (endpoints.ts có ATTACHMENTS list)
const LOCAL = {
    UPLOAD_FILE: (patientId: string, orderId: string) =>
        `/api/ehr/patients/${patientId}/clinical-results/${orderId}/attachments`,
};

export const clinicalResultsService = {
    /** Kết quả CLS của 1 bệnh nhân */
    getByPatient: async (patientId: string, params?: Record<string, any>) => {
        const res = await axiosClient.get(CLINICAL_RESULTS_ENDPOINTS.LIST(patientId), { params });
        return unwrapList<ClinicalResult>(res);
    },

    /**
     * Chi tiết 1 kết quả CLS.
     * Yêu cầu patientId + orderId (kết hợp). Nếu chỉ có id, truyền dạng
     * `${patientId}:${orderId}` hoặc tách tham số qua object.
     */
    getDetail: async (id: string | { patientId: string; orderId: string }) => {
        let patientId: string;
        let orderId: string;
        if (typeof id === "string") {
            const [p, o] = id.split(":");
            patientId = p;
            orderId = o ?? p;
        } else {
            patientId = id.patientId;
            orderId = id.orderId;
        }
        const res = await axiosClient.get(CLINICAL_RESULTS_ENDPOINTS.DETAIL(patientId, orderId));
        return unwrap<ClinicalResult>(res);
    },

    /** Kết quả trong 1 phiên khám */
    getByEncounter: async (encounterId: string, patientId?: string) => {
        const pid = patientId ?? "me";
        const res = await axiosClient.get(
            CLINICAL_RESULTS_ENDPOINTS.BY_ENCOUNTER(pid, encounterId)
        );
        return unwrapList<ClinicalResult>(res);
    },

    /** Xu hướng theo thời gian theo loại xét nghiệm */
    getTrends: async (patientId: string, type: string) => {
        const res = await axiosClient.get(CLINICAL_RESULTS_ENDPOINTS.TRENDS(patientId), {
            params: { type },
        });
        return unwrap<ClinicalResultTrend>(res);
    },

    /** Kết quả bất thường */
    getAbnormal: async (patientId: string) => {
        const res = await axiosClient.get(CLINICAL_RESULTS_ENDPOINTS.ABNORMAL(patientId));
        return unwrapList<ClinicalResult>(res);
    },

    /**
     * Upload file đính kèm cho 1 kết quả.
     * `id` truyền dạng `${patientId}:${orderId}` hoặc object.
     */
    uploadFile: async (
        id: string | { patientId: string; orderId: string },
        file: File
    ) => {
        let patientId: string;
        let orderId: string;
        if (typeof id === "string") {
            const [p, o] = id.split(":");
            patientId = p;
            orderId = o ?? p;
        } else {
            patientId = id.patientId;
            orderId = id.orderId;
        }
        const form = new FormData();
        form.append("file", file);
        const res = await axiosClient.post(LOCAL.UPLOAD_FILE(patientId, orderId), form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return unwrap<{ url: string; id?: string }>(res);
    },
};

export default clinicalResultsService;
