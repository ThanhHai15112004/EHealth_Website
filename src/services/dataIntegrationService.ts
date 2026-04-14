import axiosClient from "@/api/axiosClient";
import { DATA_INTEGRATION_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============================================================
// Data Integration Service (6.8)
// Nguồn dữ liệu ngoài, external records, wearable device sync
// ============================================================

export interface DataSource {
    id: string;
    patientId?: string;
    name?: string;
    type?: string;
    status?: string;
    [key: string]: any;
}

export interface ExternalRecord {
    id: string;
    patientId?: string;
    source?: string;
    data?: Record<string, any>;
    [key: string]: any;
}

export interface WearableDevice {
    id: string;
    patientId?: string;
    name?: string;
    vendor?: string;
    lastSyncAt?: string;
    [key: string]: any;
}

export interface SyncHistoryItem {
    id: string;
    deviceId?: string;
    syncedAt?: string;
    status?: string;
    [key: string]: any;
}

// Local fallback cho một số route thiết bị
const LOCAL = {
    DEVICES: (patientId: string) => `/api/ehr/patients/${patientId}/devices`,
    DEVICE_DETAIL: (patientId: string, deviceId: string) =>
        `/api/ehr/patients/${patientId}/devices/${deviceId}`,
    SYNC_DEVICE: (deviceId: string) => `/api/ehr/devices/${deviceId}/sync`,
    SYNC_HISTORY: (patientId: string) => `/api/ehr/patients/${patientId}/device-sync/history`,
};

export const dataIntegrationService = {
    /** Danh sách nguồn dữ liệu ngoài của BN hiện tại (hoặc theo patientId) */
    getDataSources: async (patientId: string = "me") => {
        const res = await axiosClient.get(DATA_INTEGRATION_ENDPOINTS.DATA_SOURCES(patientId));
        return unwrapList<DataSource>(res);
    },

    /** Thêm nguồn dữ liệu */
    addDataSource: async (data: Record<string, any> & { patientId?: string }) => {
        const patientId = data.patientId ?? "me";
        const res = await axiosClient.post(
            DATA_INTEGRATION_ENDPOINTS.CREATE_DATA_SOURCE(patientId),
            data
        );
        return unwrap<DataSource>(res);
    },

    /** Xoá nguồn dữ liệu */
    removeDataSource: async (id: string, patientId: string = "me") => {
        const res = await axiosClient.delete(
            DATA_INTEGRATION_ENDPOINTS.DATA_SOURCE_DETAIL(patientId, id)
        );
        return unwrap<{ success: boolean }>(res);
    },

    /** Lấy external records của BN theo nguồn */
    getExternalRecords: async (patientId: string, source?: string) => {
        const res = await axiosClient.get(
            DATA_INTEGRATION_ENDPOINTS.EXTERNAL_RECORDS(patientId),
            { params: source ? { source } : undefined }
        );
        return unwrapList<ExternalRecord>(res);
    },

    /** Đồng bộ dữ liệu từ thiết bị wearable */
    syncDevice: async (deviceId: string, patientId: string = "me") => {
        const res = await axiosClient.post(LOCAL.SYNC_DEVICE(deviceId), { patientId });
        return unwrap<{ synced: number; lastSyncAt?: string }>(res);
    },

    /** Danh sách thiết bị wearable của BN */
    getDeviceList: async (patientId: string) => {
        const res = await axiosClient.get(LOCAL.DEVICES(patientId));
        return unwrapList<WearableDevice>(res);
    },

    /** Đăng ký thiết bị mới cho BN */
    registerDevice: async (patientId: string, data: Record<string, any>) => {
        const res = await axiosClient.post(LOCAL.DEVICES(patientId), data);
        return unwrap<WearableDevice>(res);
    },

    /** Bỏ đăng ký thiết bị */
    unregisterDevice: async (patientId: string, deviceId: string) => {
        const res = await axiosClient.delete(LOCAL.DEVICE_DETAIL(patientId, deviceId));
        return unwrap<{ success: boolean }>(res);
    },

    /** Lịch sử đồng bộ của BN */
    getSyncHistory: async (patientId: string) => {
        const res = await axiosClient.get(LOCAL.SYNC_HISTORY(patientId));
        return unwrapList<SyncHistoryItem>(res);
    },
};

export default dataIntegrationService;
