/**
 * Consultation Duration Service — Thời lượng khám theo cơ sở/dịch vụ
 * Swagger: /api/facilities/:facilityId/service-durations
 */

import axiosClient from "@/api/axiosClient";
import { CONSULTATION_DURATION_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// Endpoint bổ sung (fallback — chưa có trong endpoints.ts)
const LOCAL_ENDPOINTS = {
    DEFAULT: "/api/facilities/service-durations/default",
};

export interface ConsultationDurationPayload {
    serviceId: string;
    durationMinutes: number;
    bufferMinutes?: number;
}

export const consultationDurationService = {
    /** GET danh sách thời lượng theo facility */
    getList: (facilityId: string) =>
        axiosClient
            .get(CONSULTATION_DURATION_ENDPOINTS.LIST(facilityId))
            .then((r) => unwrapList(r)),

    /** GET theo facility (alias) */
    getByFacility: (facilityId: string) =>
        axiosClient
            .get(CONSULTATION_DURATION_ENDPOINTS.LIST(facilityId))
            .then((r) => unwrapList(r)),

    /**
     * PUT cập nhật thời lượng
     * data có thể là một config đơn hoặc mảng cấu hình
     */
    update: (
        facilityId: string,
        data: ConsultationDurationPayload | ConsultationDurationPayload[]
    ) => {
        const payload = Array.isArray(data) ? data : [data];
        // Nếu chỉ có 1 item và có serviceId → gọi endpoint UPDATE
        if (!Array.isArray(data) && data.serviceId) {
            return axiosClient
                .put(
                    CONSULTATION_DURATION_ENDPOINTS.UPDATE(facilityId, data.serviceId),
                    data
                )
                .then((r) => unwrap(r));
        }
        // Ngược lại gọi endpoint CREATE (bulk)
        return axiosClient
            .post(CONSULTATION_DURATION_ENDPOINTS.CREATE(facilityId), payload)
            .then((r) => unwrap(r));
    },

    /** GET thời lượng mặc định toàn hệ thống */
    getDefault: () =>
        axiosClient.get(LOCAL_ENDPOINTS.DEFAULT).then((r) => unwrap(r)),
};

export default consultationDurationService;
