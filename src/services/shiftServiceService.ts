/**
 * Shift Service Service — Gán dịch vụ cho ca làm việc
 * Swagger: /api/shift-services/*
 */

import axiosClient from "@/api/axiosClient";
import { SHIFT_SERVICE_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface ShiftServiceData {
    shiftId: string;
    facilityServiceId: string;
    durationMinutes?: number;
    maxPatients?: number;
    isActive?: boolean;
}

export interface ShiftServiceListParams {
    shiftId?: string;
    facilityServiceId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

export const shiftServiceService = {
    /** GET danh sách */
    getList: (params?: ShiftServiceListParams) =>
        axiosClient
            .get(SHIFT_SERVICE_ENDPOINTS.LIST, { params })
            .then((r) => unwrapList(r)),

    /** GET chi tiết */
    getDetail: (id: string) =>
        axiosClient
            .get(SHIFT_SERVICE_ENDPOINTS.DETAIL(id))
            .then((r) => unwrap(r)),

    /** POST tạo mới */
    create: (data: ShiftServiceData) =>
        axiosClient
            .post(SHIFT_SERVICE_ENDPOINTS.CREATE, data)
            .then((r) => unwrap(r)),

    /** PUT cập nhật */
    update: (id: string, data: Partial<ShiftServiceData>) =>
        axiosClient
            .put(SHIFT_SERVICE_ENDPOINTS.DETAIL(id), data)
            .then((r) => unwrap(r)),

    /** DELETE xóa */
    delete: (id: string) =>
        axiosClient
            .delete(SHIFT_SERVICE_ENDPOINTS.DETAIL(id))
            .then((r) => unwrap(r)),

    /** PATCH toggle bật/tắt */
    toggle: (id: string) =>
        axiosClient
            .patch(SHIFT_SERVICE_ENDPOINTS.TOGGLE(id))
            .then((r) => unwrap(r)),

    /** GET theo ca làm việc */
    getByShift: (shiftId: string) =>
        axiosClient
            .get(SHIFT_SERVICE_ENDPOINTS.BY_SHIFT(shiftId))
            .then((r) => unwrapList(r)),

    /** GET theo dịch vụ */
    getByService: (serviceId: string) =>
        axiosClient
            .get(SHIFT_SERVICE_ENDPOINTS.BY_SERVICE(serviceId))
            .then((r) => unwrapList(r)),
};

export default shiftServiceService;
