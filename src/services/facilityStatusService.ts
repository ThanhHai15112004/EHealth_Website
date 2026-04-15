/**
 * Facility Status Service — Trạng thái hoạt động cơ sở
 * Endpoints: /api/facility-status/*
 */
import axiosClient from "@/api/axiosClient";
import { FACILITY_STATUS_ENDPOINTS } from "@/api/endpoints";
import { unwrap } from "@/api/response";

export type FacilityOpenStatus = "open" | "closed" | "limited";

export interface FacilityStatus {
    facilityId: string;
    status: FacilityOpenStatus;
    date?: string;
    note?: string;
    openTime?: string;
    closeTime?: string;
    updatedAt?: string;
    updatedBy?: string;
}

export interface FacilityStatusHistory {
    id: string;
    facilityId: string;
    status: FacilityOpenStatus;
    changedAt: string;
    changedBy?: string;
    reason?: string;
}

const BY_FACILITY = (facilityId: string) => `/api/facility-status/facility/${facilityId}`;
const HISTORY = (facilityId: string) => `/api/facility-status/facility/${facilityId}/history`;
const UPDATE = (facilityId: string) => `/api/facility-status/facility/${facilityId}`;

export const facilityStatusService = {
    getStatus: (facilityId: string) =>
        axiosClient.get(BY_FACILITY(facilityId)).then((r) => unwrap<FacilityStatus>(r)),

    updateStatus: (facilityId: string, data: Partial<FacilityStatus>) =>
        axiosClient.put(UPDATE(facilityId), data).then((r) => unwrap<FacilityStatus>(r)),

    getHistory: (facilityId: string) =>
        axiosClient.get(HISTORY(facilityId)).then((r) => unwrap<FacilityStatusHistory[]>(r)),

    getToday: () =>
        axiosClient.get(FACILITY_STATUS_ENDPOINTS.TODAY).then((r) => unwrap<FacilityStatus[]>(r)),

    getByDate: (date: string) =>
        axiosClient.get(FACILITY_STATUS_ENDPOINTS.BY_DATE(date)).then((r) => unwrap<FacilityStatus[]>(r)),

    getCalendar: (params?: { from?: string; to?: string; facilityId?: string }) =>
        axiosClient.get(FACILITY_STATUS_ENDPOINTS.CALENDAR, { params }).then((r) => unwrap<any>(r)),
};

export default facilityStatusService;
