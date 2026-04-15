/**
 * Work Shift Service
 * Quản lý ca làm việc (shift template) — VD: Ca sáng 7h-11h
 * Swagger: /api/shifts/*
 */

import axiosClient from "@/api/axiosClient";
import { SHIFT_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface WorkShift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    type?: "MORNING" | "AFTERNOON" | "NIGHT" | "FULL_DAY" | string;
    description?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface WorkShiftListParams {
    page?: number;
    limit?: number;
    keyword?: string;
    type?: string;
    isActive?: boolean;
}

export const workShiftService = {
    getList: (params?: WorkShiftListParams) =>
        axiosClient
            .get(SHIFT_ENDPOINTS.LIST, { params })
            .then((r) => unwrapList<WorkShift>(r.data)),

    getDetail: (id: string) =>
        axiosClient
            .get(SHIFT_ENDPOINTS.DETAIL(id))
            .then((r) => unwrap<WorkShift>(r.data)),

    create: (data: Partial<WorkShift>) =>
        axiosClient
            .post(SHIFT_ENDPOINTS.CREATE, data)
            .then((r) => unwrap<WorkShift>(r.data)),

    update: (id: string, data: Partial<WorkShift>) =>
        axiosClient
            .put(SHIFT_ENDPOINTS.UPDATE(id), data)
            .then((r) => unwrap<WorkShift>(r.data)),

    delete: (id: string) =>
        axiosClient.delete(SHIFT_ENDPOINTS.DELETE(id)).then(() => {}),
};

export default workShiftService;
