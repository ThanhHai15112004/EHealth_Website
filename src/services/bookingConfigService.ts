/**
 * Booking Config Service — Cấu hình đặt lịch
 * Endpoints: /api/booking-configs/*
 */
import axiosClient from "@/api/axiosClient";
import { BOOKING_CONFIG_ENDPOINTS } from "@/api/endpoints";
import { unwrap } from "@/api/response";

export interface BookingConfig {
    id?: string;
    facilityId?: string;
    branchId?: string;
    slotDuration?: number;
    maxAdvanceDays?: number;
    minAdvanceHours?: number;
    allowCancel?: boolean;
    cancelDeadlineHours?: number;
    autoConfirm?: boolean;
    [key: string]: any;
}

export interface SlotTemplate {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    duration: number;
    daysOfWeek?: number[];
    note?: string;
}

const SLOT_TEMPLATES = "/api/booking-configs/slot-templates";
const SLOT_TEMPLATE_DETAIL = (id: string) => `/api/booking-configs/slot-templates/${id}`;

export const bookingConfigService = {
    getConfig: (facilityId?: string) => {
        const url = facilityId
            ? BOOKING_CONFIG_ENDPOINTS.BY_BRANCH(facilityId)
            : "/api/booking-configs";
        return axiosClient.get(url).then((r) => unwrap<BookingConfig>(r));
    },

    updateConfig: (data: BookingConfig) => {
        const branchId = data.branchId || data.facilityId;
        const url = branchId
            ? BOOKING_CONFIG_ENDPOINTS.UPDATE_BRANCH(branchId)
            : "/api/booking-configs";
        return axiosClient.put(url, data).then((r) => unwrap<BookingConfig>(r));
    },

    getSlotTemplates: () =>
        axiosClient.get(SLOT_TEMPLATES).then((r) => unwrap<SlotTemplate[]>(r)),

    createTemplate: (data: Partial<SlotTemplate>) =>
        axiosClient.post(SLOT_TEMPLATES, data).then((r) => unwrap<SlotTemplate>(r)),

    deleteTemplate: (id: string) =>
        axiosClient.delete(SLOT_TEMPLATE_DETAIL(id)).then((r) => unwrap<void>(r)),
};

export default bookingConfigService;
