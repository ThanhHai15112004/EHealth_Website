/**
 * Appointment Change Service — Yêu cầu dời/hủy lịch
 * Swagger: /api/appointment-changes/*
 */

import axiosClient from "@/api/axiosClient";
import { APPOINTMENT_CHANGE_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// Endpoint bổ sung (fallback — chưa có trong endpoints.ts)
const LOCAL_ENDPOINTS = {
    BASE: "/api/appointment-changes",
    REQUEST: (appointmentId: string) =>
        `/api/appointment-changes/${appointmentId}/request`,
    APPROVE: (changeId: string) =>
        `/api/appointment-changes/${changeId}/approve`,
    REJECT: (changeId: string) =>
        `/api/appointment-changes/${changeId}/reject`,
    CANCEL: (changeId: string) =>
        `/api/appointment-changes/${changeId}/cancel`,
    DETAIL: (id: string) => `/api/appointment-changes/${id}`,
    BY_APPOINTMENT: (appointmentId: string) =>
        `/api/appointment-changes/by-appointment/${appointmentId}`,
};

export interface AppointmentChangeListParams {
    status?: string;
    type?: "RESCHEDULE" | "CANCEL";
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}

export const appointmentChangeService = {
    /** POST tạo yêu cầu đổi/hủy lịch */
    request: (appointmentId: string, data: any) =>
        axiosClient
            .post(LOCAL_ENDPOINTS.REQUEST(appointmentId), data)
            .then((r) => unwrap(r)),

    /** PATCH duyệt */
    approve: (changeId: string) =>
        axiosClient
            .patch(LOCAL_ENDPOINTS.APPROVE(changeId))
            .then((r) => unwrap(r)),

    /** PATCH từ chối */
    reject: (changeId: string, reason: string) =>
        axiosClient
            .patch(LOCAL_ENDPOINTS.REJECT(changeId), { reason })
            .then((r) => unwrap(r)),

    /** GET danh sách yêu cầu */
    getList: (params?: AppointmentChangeListParams) =>
        axiosClient
            .get(LOCAL_ENDPOINTS.BASE, { params })
            .then((r) => unwrapList(r)),

    /** GET chi tiết */
    getDetail: (id: string) =>
        axiosClient.get(LOCAL_ENDPOINTS.DETAIL(id)).then((r) => unwrap(r)),

    /** GET theo appointment */
    getByAppointment: (appointmentId: string) =>
        axiosClient
            .get(LOCAL_ENDPOINTS.BY_APPOINTMENT(appointmentId))
            .then((r) => unwrapList(r)),

    /** GET thống kê */
    getStats: (params?: Record<string, any>) =>
        axiosClient
            .get(APPOINTMENT_CHANGE_ENDPOINTS.STATS, { params })
            .then((r) => unwrap(r)),

    /** GET thay đổi gần đây */
    getRecent: () =>
        axiosClient
            .get(APPOINTMENT_CHANGE_ENDPOINTS.RECENT)
            .then((r) => unwrapList(r)),

    /** GET lịch sử đổi/hủy của appointment */
    getHistory: (appointmentId: string) =>
        axiosClient
            .get(APPOINTMENT_CHANGE_ENDPOINTS.HISTORY(appointmentId))
            .then((r) => unwrapList(r)),

    /** POST hủy yêu cầu */
    cancel: (changeId: string) =>
        axiosClient
            .post(LOCAL_ENDPOINTS.CANCEL(changeId))
            .then((r) => unwrap(r)),

    /** GET kiểm tra khả năng reschedule */
    canReschedule: (appointmentId: string) =>
        axiosClient
            .get(APPOINTMENT_CHANGE_ENDPOINTS.CAN_RESCHEDULE(appointmentId))
            .then((r) => unwrap(r)),
};

export default appointmentChangeService;
