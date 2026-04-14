/**
 * License Service
 * Quản lý chứng chỉ / giấy phép hành nghề
 * Swagger: /api/licenses/*
 */

import axiosClient from "@/api/axiosClient";
import { LICENSE_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface License {
    id: string;
    staffId: string;
    staffName?: string;
    licenseNumber: string;
    licenseType?: string;
    issuedBy?: string;
    issuedDate?: string;
    expiryDate?: string;
    status?: "ACTIVE" | "EXPIRING" | "EXPIRED" | "REVOKED";
    fileUrl?: string;
    note?: string;
    createdAt?: string;
}

export interface LicenseListParams {
    page?: number;
    limit?: number;
    staffId?: string;
    status?: string;
    keyword?: string;
}

// Fallback cho các endpoint không có sẵn trong endpoints.ts
const LICENSE_EXTRA = {
    BY_STAFF: (staffId: string) => `/api/licenses/staff/${staffId}`,
    RENEW: (id: string) => `/api/licenses/${id}/renew`,
};

export const licenseService = {
    getList: (params?: LicenseListParams) =>
        axiosClient
            .get(LICENSE_ENDPOINTS.LIST, { params })
            .then((r) => unwrapList<License>(r.data)),

    getDetail: (id: string) =>
        axiosClient
            .get(LICENSE_ENDPOINTS.DETAIL(id))
            .then((r) => unwrap<License>(r.data)),

    create: (data: Partial<License>) =>
        axiosClient
            .post(LICENSE_ENDPOINTS.CREATE, data)
            .then((r) => unwrap<License>(r.data)),

    update: (id: string, data: Partial<License>) =>
        axiosClient
            .put(LICENSE_ENDPOINTS.UPDATE(id), data)
            .then((r) => unwrap<License>(r.data)),

    delete: (id: string) =>
        axiosClient.delete(LICENSE_ENDPOINTS.DELETE(id)).then(() => {}),

    uploadFile: (id: string, file: File) => {
        const fd = new FormData();
        fd.append("file", file);
        return axiosClient
            .post(LICENSE_ENDPOINTS.UPLOAD_FILE(id), fd, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((r) => unwrap<License>(r.data));
    },

    getExpiring: (days?: number) =>
        axiosClient
            .get(LICENSE_ENDPOINTS.EXPIRING, { params: days ? { days } : undefined })
            .then((r) => unwrapList<License>(r.data)),

    getExpired: () =>
        axiosClient
            .get(LICENSE_ENDPOINTS.EXPIRED)
            .then((r) => unwrapList<License>(r.data)),

    getByStaff: (staffId: string) =>
        axiosClient
            .get(LICENSE_EXTRA.BY_STAFF(staffId))
            .then((r) => unwrapList<License>(r.data)),

    renew: (id: string, data: { newExpiryDate: string; [k: string]: any }) =>
        axiosClient
            .patch(LICENSE_EXTRA.RENEW(id), data)
            .then((r) => unwrap<License>(r.data)),
};

export default licenseService;
