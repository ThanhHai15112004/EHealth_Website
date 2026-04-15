/**
 * Shift Swap Service
 * Quản lý yêu cầu đổi ca giữa nhân viên
 * Swagger: /api/shift-swaps/*
 */

import axiosClient from "@/api/axiosClient";
import { SHIFT_SWAP_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export type ShiftSwapStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";

export interface ShiftSwap {
    id: string;
    requesterId: string;
    requesterName?: string;
    targetStaffId: string;
    targetStaffName?: string;
    fromScheduleId?: string;
    toScheduleId?: string;
    fromDate?: string;
    toDate?: string;
    reason?: string;
    status: ShiftSwapStatus;
    rejectReason?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ShiftSwapListParams {
    page?: number;
    limit?: number;
    status?: ShiftSwapStatus;
    requesterId?: string;
    targetStaffId?: string;
    from?: string;
    to?: string;
}

// Fallback local endpoints (backend không expose CANCEL công khai)
const SHIFT_SWAP_EXTRA = {
    CANCEL: (id: string) => `/api/shift-swaps/${id}/cancel`,
};

export const shiftSwapService = {
    getList: (params?: ShiftSwapListParams) =>
        axiosClient
            .get(SHIFT_SWAP_ENDPOINTS.LIST, { params })
            .then((r) => unwrapList<ShiftSwap>(r.data)),

    getDetail: (id: string) =>
        axiosClient
            .get(SHIFT_SWAP_ENDPOINTS.DETAIL(id))
            .then((r) => unwrap<ShiftSwap>(r.data)),

    request: (data: Partial<ShiftSwap>) =>
        axiosClient
            .post(SHIFT_SWAP_ENDPOINTS.CREATE, data)
            .then((r) => unwrap<ShiftSwap>(r.data)),

    approve: (id: string) =>
        axiosClient
            .patch(SHIFT_SWAP_ENDPOINTS.APPROVE(id))
            .then((r) => unwrap<ShiftSwap>(r.data)),

    reject: (id: string, reason?: string) =>
        axiosClient
            .patch(SHIFT_SWAP_ENDPOINTS.REJECT(id), { reason })
            .then((r) => unwrap<ShiftSwap>(r.data)),

    cancel: (id: string) =>
        axiosClient
            .patch(SHIFT_SWAP_EXTRA.CANCEL(id))
            .then((r) => unwrap<ShiftSwap>(r.data)),
};

export default shiftSwapService;
