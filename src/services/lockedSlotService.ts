/**
 * Locked Slot Service — Quản lý slot bị khóa
 * Swagger: /api/locked-slots/*
 */

import axiosClient from "@/api/axiosClient";
import { LOCKED_SLOT_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// Endpoint bổ sung (fallback — chưa có trong endpoints.ts)
const LOCAL_ENDPOINTS = {
    LIST: "/api/locked-slots",
    DETAIL: (id: string) => `/api/locked-slots/${id}`,
    BY_SHIFT: (shiftId: string) => `/api/locked-slots/by-shift/${shiftId}`,
};

export interface LockSlotData {
    doctorId?: string;
    shiftId?: string;
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
}

export interface LockedSlotListParams {
    doctorId?: string;
    facilityId?: string;
    date?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}

export const lockedSlotService = {
    /** POST khóa slot */
    lock: (data: LockSlotData) =>
        axiosClient
            .post(LOCKED_SLOT_ENDPOINTS.LOCK, data)
            .then((r) => unwrap(r)),

    /** DELETE mở khóa */
    unlock: (id: string) =>
        axiosClient
            .delete(LOCKED_SLOT_ENDPOINTS.UNLOCK(id))
            .then((r) => unwrap(r)),

    /** GET danh sách slot đang bị khóa */
    getLocked: (params?: LockedSlotListParams) =>
        axiosClient
            .get(LOCKED_SLOT_ENDPOINTS.LOCKED, { params })
            .then((r) => unwrapList(r)),

    /** GET danh sách tất cả */
    getList: (params?: LockedSlotListParams) =>
        axiosClient
            .get(LOCAL_ENDPOINTS.LIST, { params })
            .then((r) => unwrapList(r)),

    /** GET chi tiết */
    getDetail: (id: string) =>
        axiosClient.get(LOCAL_ENDPOINTS.DETAIL(id)).then((r) => unwrap(r)),

    /** GET theo ca làm việc */
    getByShift: (shiftId: string) =>
        axiosClient
            .get(LOCAL_ENDPOINTS.BY_SHIFT(shiftId))
            .then((r) => unwrapList(r)),
};

export default lockedSlotService;
