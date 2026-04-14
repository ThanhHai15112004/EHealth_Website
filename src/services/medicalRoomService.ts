/**
 * Medical Room Service — Quản lý phòng khám
 * Endpoints: /api/medical-rooms/*
 */
import axiosClient from "@/api/axiosClient";
import { MEDICAL_ROOM_MANAGEMENT_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export type MedicalRoomStatus = "active" | "inactive" | "maintenance";

export interface MedicalRoom {
    id: string;
    code: string;
    name: string;
    floor?: string;
    departmentId?: string;
    departmentName?: string;
    branchId?: string;
    facilityId?: string;
    status: MedicalRoomStatus;
    capacity?: number;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface MedicalRoomListParams {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
    branchId?: string;
    facilityId?: string;
    status?: MedicalRoomStatus;
}

export interface MedicalRoomBooking {
    id: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    status?: string;
    patientName?: string;
    serviceName?: string;
}

const BOOKINGS = (roomId: string) => `/api/medical-rooms/${roomId}/bookings`;

export const medicalRoomService = {
    getList: (params?: MedicalRoomListParams) =>
        axiosClient.get(MEDICAL_ROOM_MANAGEMENT_ENDPOINTS.LIST, { params }).then((r) => unwrapList<MedicalRoom>(r)),

    getDetail: (id: string) =>
        axiosClient.get(MEDICAL_ROOM_MANAGEMENT_ENDPOINTS.DETAIL(id)).then((r) => unwrap<MedicalRoom>(r)),

    getDropdown: () =>
        axiosClient.get(MEDICAL_ROOM_MANAGEMENT_ENDPOINTS.DROPDOWN).then((r) => unwrap<MedicalRoom[]>(r)),

    create: (data: Partial<MedicalRoom>) =>
        axiosClient.post(MEDICAL_ROOM_MANAGEMENT_ENDPOINTS.CREATE, data).then((r) => unwrap<MedicalRoom>(r)),

    update: (id: string, data: Partial<MedicalRoom>) =>
        axiosClient.put(MEDICAL_ROOM_MANAGEMENT_ENDPOINTS.UPDATE(id), data).then((r) => unwrap<MedicalRoom>(r)),

    delete: (id: string) =>
        axiosClient.delete(MEDICAL_ROOM_MANAGEMENT_ENDPOINTS.DELETE(id)).then((r) => unwrap<void>(r)),

    updateStatus: (id: string, status: MedicalRoomStatus) =>
        axiosClient.patch(MEDICAL_ROOM_MANAGEMENT_ENDPOINTS.STATUS(id), { status }).then((r) => unwrap<MedicalRoom>(r)),

    getServices: (roomId: string) =>
        axiosClient.get(MEDICAL_ROOM_MANAGEMENT_ENDPOINTS.SERVICES(roomId)).then((r) => unwrap<any[]>(r)),

    getBookings: (roomId: string, date?: string) =>
        axiosClient.get(BOOKINGS(roomId), { params: date ? { date } : undefined }).then((r) => unwrap<MedicalRoomBooking[]>(r)),
};

export default medicalRoomService;
