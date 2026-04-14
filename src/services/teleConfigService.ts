import axiosClient from "@/api/axiosClient";
import { TELE_CONFIG_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============================================================
// Tele Config Service (8.9)
// Cấu hình hệ thống tele, pricing, SLA, provider
// ============================================================

export interface TeleConfig {
    key?: string;
    value?: any;
    facilityId?: string;
    [key: string]: any;
}

export interface TelePricing {
    id?: string;
    typeId?: string;
    amount?: number;
    currency?: string;
    [key: string]: any;
}

export interface TeleSLA {
    id?: string;
    metric?: string;
    target?: number;
    [key: string]: any;
}

export interface TeleProvider {
    key?: string;
    name?: string;
    active?: boolean;
    [key: string]: any;
}

// Local fallback
const LOCAL = {
    PROVIDERS: "/api/teleconsultation/admin/providers",
    SET_PROVIDER: "/api/teleconsultation/admin/providers",
    SLAS: "/api/teleconsultation/admin/sla",
};

export const teleConfigService = {
    /** Lấy cấu hình (theo cơ sở nếu có) */
    getConfig: async (facilityId?: string) => {
        const res = await axiosClient.get(TELE_CONFIG_ENDPOINTS.ALL_CONFIGS, {
            params: facilityId ? { facilityId } : undefined,
        });
        return unwrapList<TeleConfig>(res);
    },

    /** Cập nhật cấu hình (admin) — batch update */
    updateConfig: async (data: Record<string, any>) => {
        const res = await axiosClient.put(TELE_CONFIG_ENDPOINTS.BATCH_UPDATE, data);
        return unwrap<TeleConfig[]>(res);
    },

    /** Giá theo loại tư vấn */
    getPricing: async () => {
        const res = await axiosClient.get(TELE_CONFIG_ENDPOINTS.PRICING);
        return unwrapList<TelePricing>(res);
    },

    /** Cập nhật giá (admin) */
    updatePricing: async (data: Record<string, any> & { id?: string }) => {
        if (data.id) {
            const res = await axiosClient.put(
                TELE_CONFIG_ENDPOINTS.UPDATE_PRICING(data.id),
                data
            );
            return unwrap<TelePricing>(res);
        }
        const res = await axiosClient.post(TELE_CONFIG_ENDPOINTS.PRICING, data);
        return unwrap<TelePricing>(res);
    },

    /** Danh sách SLA */
    getSLAs: async () => {
        const res = await axiosClient.get(LOCAL.SLAS);
        return unwrapList<TeleSLA>(res);
    },

    /** Cập nhật SLA (admin) */
    updateSLA: async (data: Record<string, any>) => {
        const res = await axiosClient.put(LOCAL.SLAS, data);
        return unwrap<TeleSLA>(res);
    },

    /** Danh sách provider (Jitsi, Daily,...) */
    getProviders: async () => {
        const res = await axiosClient.get(LOCAL.PROVIDERS);
        return unwrapList<TeleProvider>(res);
    },

    /** Setup provider (admin) */
    setProvider: async (data: Record<string, any>) => {
        const res = await axiosClient.post(LOCAL.SET_PROVIDER, data);
        return unwrap<TeleProvider>(res);
    },
};

export default teleConfigService;
