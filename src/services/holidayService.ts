/**
 * Holiday Service — Ngày lễ
 * Endpoints: /api/holidays/*
 */
import axiosClient from "@/api/axiosClient";
import { HOLIDAY_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface Holiday {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    year?: number;
    isRecurring?: boolean;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface HolidayListParams {
    page?: number;
    limit?: number;
    year?: number;
    search?: string;
}

const BY_YEAR = (year: number) => `/api/holidays/year/${year}`;
const IMPORT_DEFAULT = "/api/holidays/import-default";

export const holidayService = {
    getList: (params?: HolidayListParams) =>
        axiosClient.get(HOLIDAY_ENDPOINTS.LIST, { params }).then((r) => unwrapList<Holiday>(r)),

    getDetail: (id: string) =>
        axiosClient.get(HOLIDAY_ENDPOINTS.DETAIL(id)).then((r) => unwrap<Holiday>(r)),

    create: (data: Partial<Holiday>) =>
        axiosClient.post(HOLIDAY_ENDPOINTS.CREATE, data).then((r) => unwrap<Holiday>(r)),

    update: (id: string, data: Partial<Holiday>) =>
        axiosClient.put(HOLIDAY_ENDPOINTS.UPDATE(id), data).then((r) => unwrap<Holiday>(r)),

    delete: (id: string) =>
        axiosClient.delete(HOLIDAY_ENDPOINTS.DELETE(id)).then((r) => unwrap<void>(r)),

    getYear: (year: number) =>
        axiosClient.get(BY_YEAR(year)).then((r) => unwrap<Holiday[]>(r)),

    importDefault: (year: number) =>
        axiosClient.post(IMPORT_DEFAULT, { year }).then((r) => unwrap<Holiday[]>(r)),
};

export default holidayService;
