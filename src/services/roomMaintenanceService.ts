/**
 * Room Maintenance Service — Bảo trì phòng
 * Endpoints: /api/room-maintenance/*
 */
import axiosClient from "@/api/axiosClient";
import { ROOM_MAINTENANCE_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface RoomMaintenance {
    id: string;
    roomId: string;
    roomName?: string;
    startDate: string;
    endDate: string;
    reason?: string;
    note?: string;
    status: MaintenanceStatus;
    createdBy?: string;
    createdAt?: string;
    completedAt?: string;
}

export interface RoomMaintenanceListParams {
    page?: number;
    limit?: number;
    roomId?: string;
    status?: MaintenanceStatus;
    from?: string;
    to?: string;
}

export const roomMaintenanceService = {
    getList: (params?: RoomMaintenanceListParams) =>
        axiosClient.get(ROOM_MAINTENANCE_ENDPOINTS.ACTIVE, { params }).then((r) => unwrapList<RoomMaintenance>(r)),

    getDetail: (id: string) =>
        axiosClient.get(ROOM_MAINTENANCE_ENDPOINTS.SCHEDULE_DETAIL(id)).then((r) => unwrap<RoomMaintenance>(r)),

    schedule: (roomId: string, data: Partial<RoomMaintenance>) =>
        axiosClient.post(ROOM_MAINTENANCE_ENDPOINTS.BY_ROOM(roomId), data).then((r) => unwrap<RoomMaintenance>(r)),

    update: (id: string, data: Partial<RoomMaintenance>) =>
        axiosClient.put(ROOM_MAINTENANCE_ENDPOINTS.SCHEDULE_DETAIL(id), data).then((r) => unwrap<RoomMaintenance>(r)),

    cancel: (id: string) =>
        axiosClient.put(ROOM_MAINTENANCE_ENDPOINTS.SCHEDULE_DETAIL(id), { status: "cancelled" }).then((r) => unwrap<RoomMaintenance>(r)),

    complete: (id: string, data?: { note?: string }) =>
        axiosClient.put(ROOM_MAINTENANCE_ENDPOINTS.SCHEDULE_DETAIL(id), { status: "completed", ...(data || {}) }).then((r) => unwrap<RoomMaintenance>(r)),

    getByRoom: (roomId: string) =>
        axiosClient.get(ROOM_MAINTENANCE_ENDPOINTS.BY_ROOM(roomId)).then((r) => unwrap<RoomMaintenance[]>(r)),
};

export default roomMaintenanceService;
