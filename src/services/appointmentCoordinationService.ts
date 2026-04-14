/**
 * Appointment Coordination Service — Điều phối lịch khám
 * Swagger: /api/appointment-coordination/*
 */

import axiosClient from "@/api/axiosClient";
import { APPOINTMENT_COORDINATION_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// Endpoint bổ sung (fallback — chưa có trong endpoints.ts)
const LOCAL_ENDPOINTS = {
    BALANCE_LOAD: "/api/appointment-coordination/balance-load",
    WORKLOAD_STATS: "/api/appointment-coordination/workload-stats",
};

export interface DoctorLoadParams {
    doctorId?: string;
    date?: string;
    facilityId?: string;
    departmentId?: string;
}

export interface SuggestSlotsParams {
    specialtyId?: string;
    doctorId?: string;
    serviceId?: string;
    date?: string;
    facilityId?: string;
}

export const appointmentCoordinationService = {
    /** GET phân tích tải bác sĩ */
    getDoctorLoad: (params?: DoctorLoadParams) =>
        axiosClient
            .get(APPOINTMENT_COORDINATION_ENDPOINTS.DOCTOR_LOAD, { params })
            .then((r) => unwrap(r)),

    /** GET gợi ý slot tốt nhất */
    suggestSlots: (params?: SuggestSlotsParams) =>
        axiosClient
            .get(APPOINTMENT_COORDINATION_ENDPOINTS.SUGGEST_SLOTS, { params })
            .then((r) => unwrapList(r)),

    /** POST cân bằng tải */
    balanceLoad: (data: any) =>
        axiosClient.post(LOCAL_ENDPOINTS.BALANCE_LOAD, data).then((r) => unwrap(r)),

    /** POST tự động phân công */
    autoAssign: (data: any) =>
        axiosClient
            .post(APPOINTMENT_COORDINATION_ENDPOINTS.AUTO_ASSIGN, data)
            .then((r) => unwrap(r)),

    /** GET độ ưu tiên của appointment */
    getPriority: (params: { appointmentId: string }) =>
        axiosClient
            .get(APPOINTMENT_COORDINATION_ENDPOINTS.PRIORITY(params.appointmentId))
            .then((r) => unwrap(r)),

    /** PATCH phân công lại bác sĩ */
    reassign: (appointmentId: string, data: any) =>
        axiosClient
            .patch(
                APPOINTMENT_COORDINATION_ENDPOINTS.REASSIGN_DOCTOR(appointmentId),
                data
            )
            .then((r) => unwrap(r)),

    /** GET thống kê workload */
    getWorkloadStats: (params?: Record<string, any>) =>
        axiosClient
            .get(LOCAL_ENDPOINTS.WORKLOAD_STATS, { params })
            .then((r) => unwrap(r)),
};

export default appointmentCoordinationService;
