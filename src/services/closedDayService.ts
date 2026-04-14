/**
 * Closed Day Service — Ngày nghỉ đặc biệt
 * Endpoints: /api/closed-days/*
 */
import axiosClient from "@/api/axiosClient";
import { CLOSED_DAY_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface ClosedDay {
    id: string;
    facilityId?: string;
    branchId?: string;
    date: string; // YYYY-MM-DD
    reason?: string;
    note?: string;
    createdAt?: string;
}

export interface ClosedDayListParams {
    page?: number;
    limit?: number;
    facilityId?: string;
    branchId?: string;
    from?: string;
    to?: string;
}

const DETAIL = (id: string) => `/api/closed-days/${id}`;
const BY_FACILITY = (facilityId: string) => `/api/closed-days/by-facility/${facilityId}`;

export const closedDayService = {
    getList: (params?: ClosedDayListParams) =>
        axiosClient.get(CLOSED_DAY_ENDPOINTS.LIST, { params }).then((r) => unwrapList<ClosedDay>(r)),

    getDetail: (id: string) =>
        axiosClient.get(DETAIL(id)).then((r) => unwrap<ClosedDay>(r)),

    create: (data: Partial<ClosedDay>) =>
        axiosClient.post(CLOSED_DAY_ENDPOINTS.CREATE, data).then((r) => unwrap<ClosedDay>(r)),

    delete: (id: string) =>
        axiosClient.delete(CLOSED_DAY_ENDPOINTS.DELETE(id)).then((r) => unwrap<void>(r)),

    getByFacility: (facilityId: string) =>
        axiosClient.get(BY_FACILITY(facilityId)).then((r) => unwrap<ClosedDay[]>(r)),
};

export default closedDayService;
