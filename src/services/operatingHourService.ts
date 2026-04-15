/**
 * Operating Hour Service — Giờ hoạt động
 * Endpoints: /api/operating-hours/*
 */
import axiosClient from "@/api/axiosClient";
import { OPERATING_HOUR_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface OperatingHour {
    id: string;
    facilityId?: string;
    branchId?: string;
    dayOfWeek: number; // 0-6
    openTime: string;  // HH:mm
    closeTime: string; // HH:mm
    isClosed?: boolean;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface OperatingHourListParams {
    page?: number;
    limit?: number;
    facilityId?: string;
    branchId?: string;
    dayOfWeek?: number;
}

const BY_FACILITY = (facilityId: string) => `/api/operating-hours/by-facility/${facilityId}`;
const BY_BRANCH = (branchId: string) => `/api/operating-hours/by-branch/${branchId}`;

export const operatingHourService = {
    getList: (params?: OperatingHourListParams) =>
        axiosClient.get(OPERATING_HOUR_ENDPOINTS.LIST, { params }).then((r) => unwrapList<OperatingHour>(r)),

    getDetail: (id: string) =>
        axiosClient.get(OPERATING_HOUR_ENDPOINTS.DETAIL(id)).then((r) => unwrap<OperatingHour>(r)),

    create: (data: Partial<OperatingHour>) =>
        axiosClient.post(OPERATING_HOUR_ENDPOINTS.CREATE, data).then((r) => unwrap<OperatingHour>(r)),

    update: (id: string, data: Partial<OperatingHour>) =>
        axiosClient.put(OPERATING_HOUR_ENDPOINTS.UPDATE(id), data).then((r) => unwrap<OperatingHour>(r)),

    delete: (id: string) =>
        axiosClient.delete(OPERATING_HOUR_ENDPOINTS.DELETE(id)).then((r) => unwrap<void>(r)),

    getByFacility: (facilityId: string) =>
        axiosClient.get(BY_FACILITY(facilityId)).then((r) => unwrap<OperatingHour[]>(r)),

    getByBranch: (branchId: string) =>
        axiosClient.get(BY_BRANCH(branchId)).then((r) => unwrap<OperatingHour[]>(r)),
};

export default operatingHourService;
