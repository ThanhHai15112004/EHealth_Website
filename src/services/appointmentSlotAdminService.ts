/**
 * Appointment Slot Admin Service
 * Quản lý slot khám chuyên sâu (khác appointmentService)
 * Swagger: /api/slots/*
 */

import axiosClient from "@/api/axiosClient";
import { APPOINTMENT_SLOT_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface AppointmentSlot {
    id: string;
    doctorId?: string;
    doctorName?: string;
    departmentId?: string;
    roomId?: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity?: number;
    bookedCount?: number;
    status?: "AVAILABLE" | "FULL" | "BLOCKED" | "CANCELLED";
    createdAt?: string;
}

export interface SlotListParams {
    page?: number;
    limit?: number;
    doctorId?: string;
    departmentId?: string;
    from?: string;
    to?: string;
    status?: string;
}

// Fallback endpoints không có trong endpoints.ts
const SLOT_EXTRA = {
    BULK: "/api/slots/bulk",
    BOOKINGS: (id: string) => `/api/slots/${id}/bookings`,
    AVAILABLE: "/api/slots/available",
};

export const appointmentSlotAdminService = {
    getList: (params?: SlotListParams) =>
        axiosClient
            .get(APPOINTMENT_SLOT_ENDPOINTS.LIST, { params })
            .then((r) => unwrapList<AppointmentSlot>(r.data)),

    getDetail: (id: string) =>
        axiosClient
            .get(APPOINTMENT_SLOT_ENDPOINTS.DETAIL(id))
            .then((r) => unwrap<AppointmentSlot>(r.data)),

    create: (data: Partial<AppointmentSlot>) =>
        axiosClient
            .post(APPOINTMENT_SLOT_ENDPOINTS.CREATE, data)
            .then((r) => unwrap<AppointmentSlot>(r.data)),

    update: (id: string, data: Partial<AppointmentSlot>) =>
        axiosClient
            .put(APPOINTMENT_SLOT_ENDPOINTS.UPDATE(id), data)
            .then((r) => unwrap<AppointmentSlot>(r.data)),

    delete: (id: string) =>
        axiosClient
            .delete(APPOINTMENT_SLOT_ENDPOINTS.DELETE(id))
            .then(() => {}),

    bulkCreate: (data: {
        doctorId?: string;
        dates: string[];
        startTime: string;
        endTime: string;
        slotDuration?: number;
        [key: string]: any;
    }) =>
        axiosClient
            .post(SLOT_EXTRA.BULK, data)
            .then((r) => unwrap<AppointmentSlot[]>(r.data)),

    getBookings: (slotId: string) =>
        axiosClient
            .get(SLOT_EXTRA.BOOKINGS(slotId))
            .then((r) => unwrapList<any>(r.data)),

    getAvailable: (params?: SlotListParams) =>
        axiosClient
            .get(SLOT_EXTRA.AVAILABLE, { params })
            .then((r) => unwrapList<AppointmentSlot>(r.data)),
};

export default appointmentSlotAdminService;
