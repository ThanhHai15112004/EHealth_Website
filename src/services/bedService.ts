/**
 * Bed Service — Quản lý giường bệnh
 * Endpoints: /api/beds/*
 */
import axiosClient from "@/api/axiosClient";
import { BED_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export type BedStatus = "occupied" | "free" | "maintenance";

export interface Bed {
    id: string;
    code: string;
    name?: string;
    roomId?: string;
    roomName?: string;
    status: BedStatus;
    patientId?: string | null;
    patientName?: string | null;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface BedListParams {
    page?: number;
    limit?: number;
    search?: string;
    roomId?: string;
    status?: BedStatus;
}

export interface BedStats {
    total: number;
    free: number;
    occupied: number;
    maintenance?: number;
}

// Fallback khi endpoint chưa có
const BY_ROOM = (roomId: string) => `/api/beds/by-room/${roomId}`;
const DROPDOWN = "/api/beds/dropdown";
const UNASSIGN = (id: string) => `/api/beds/${id}/unassign`;
const STATS = "/api/beds/stats";

export const bedService = {
    getList: (params?: BedListParams) =>
        axiosClient.get(BED_ENDPOINTS.LIST, { params }).then((r) => unwrapList<Bed>(r)),

    getDetail: (id: string) =>
        axiosClient.get(BED_ENDPOINTS.DETAIL(id)).then((r) => unwrap<Bed>(r)),

    getDropdown: () =>
        axiosClient.get(DROPDOWN).then((r) => unwrap<Bed[]>(r)),

    create: (data: Partial<Bed>) =>
        axiosClient.post(BED_ENDPOINTS.CREATE, data).then((r) => unwrap<Bed>(r)),

    update: (id: string, data: Partial<Bed>) =>
        axiosClient.put(BED_ENDPOINTS.UPDATE(id), data).then((r) => unwrap<Bed>(r)),

    delete: (id: string) =>
        axiosClient.delete(BED_ENDPOINTS.DELETE(id)).then((r) => unwrap<void>(r)),

    assignPatient: (bedId: string, patientId: string) =>
        axiosClient.put(BED_ENDPOINTS.ASSIGN(bedId), { patientId }).then((r) => unwrap<Bed>(r)),

    unassign: (bedId: string) =>
        axiosClient.put(UNASSIGN(bedId)).then((r) => unwrap<Bed>(r)),

    updateStatus: (id: string, status: BedStatus) =>
        axiosClient.put(BED_ENDPOINTS.STATUS(id), { status }).then((r) => unwrap<Bed>(r)),

    getByRoom: (roomId: string) =>
        axiosClient.get(BY_ROOM(roomId)).then((r) => unwrap<Bed[]>(r)),

    getStats: () =>
        axiosClient.get(STATS).then((r) => unwrap<BedStats>(r)),
};

export default bedService;
