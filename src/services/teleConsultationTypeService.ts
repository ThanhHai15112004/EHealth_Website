import axiosClient from "@/api/axiosClient";
import { TELE_CONSULTATION_TYPE_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============================================================
// Tele Consultation Type Service (8.1)
// Hình thức tư vấn từ xa (video, audio, chat, async)
// ============================================================

export interface ConsultationType {
    id: string;
    code?: string;
    name?: string;
    mode?: "video" | "audio" | "chat" | "async";
    active?: boolean;
    [key: string]: any;
}

export interface ConsultationTypeConfig {
    id: string;
    typeId?: string;
    key?: string;
    value?: any;
    [key: string]: any;
}

// Local fallback
const LOCAL = {
    TOGGLE_TYPE: (id: string) => `/api/teleconsultation/types/${id}/toggle`,
    CONFIGS_BY_TYPE: (typeId: string) => `/api/teleconsultation/types/${typeId}/configs`,
};

export const teleConsultationTypeService = {
    /** Danh sách loại tư vấn */
    getTypes: async (params?: Record<string, any>) => {
        const res = await axiosClient.get(TELE_CONSULTATION_TYPE_ENDPOINTS.TYPES, { params });
        return unwrapList<ConsultationType>(res);
    },

    /** Chi tiết 1 loại */
    getTypeDetail: async (id: string) => {
        const res = await axiosClient.get(TELE_CONSULTATION_TYPE_ENDPOINTS.TYPE_DETAIL(id));
        return unwrap<ConsultationType>(res);
    },

    /** Tạo loại mới */
    createType: async (data: Record<string, any>) => {
        const res = await axiosClient.post(TELE_CONSULTATION_TYPE_ENDPOINTS.CREATE_TYPE, data);
        return unwrap<ConsultationType>(res);
    },

    /** Cập nhật loại */
    updateType: async (id: string, data: Record<string, any>) => {
        const res = await axiosClient.put(
            TELE_CONSULTATION_TYPE_ENDPOINTS.UPDATE_TYPE(id),
            data
        );
        return unwrap<ConsultationType>(res);
    },

    /** Xoá loại */
    deleteType: async (id: string) => {
        const res = await axiosClient.delete(TELE_CONSULTATION_TYPE_ENDPOINTS.DELETE_TYPE(id));
        return unwrap<{ success: boolean }>(res);
    },

    /** Bật / tắt loại */
    toggleType: async (id: string) => {
        const res = await axiosClient.patch(LOCAL.TOGGLE_TYPE(id));
        return unwrap<ConsultationType>(res);
    },

    /** Cấu hình thuộc 1 loại */
    getConfigs: async (typeId: string) => {
        const res = await axiosClient.get(TELE_CONSULTATION_TYPE_ENDPOINTS.CONFIGS, {
            params: { typeId },
        });
        return unwrapList<ConsultationTypeConfig>(res);
    },
};

export default teleConsultationTypeService;
