/**
 * Doctor-Service Link Service
 * Quản lý gán dịch vụ cho bác sĩ
 * Swagger: /api/doctor-services/*
 */

import axiosClient from "@/api/axiosClient";
import { DOCTOR_SERVICE_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface DoctorServiceLink {
    id?: string;
    doctorId: string;
    doctorName?: string;
    facilityServiceId: string;
    serviceName?: string;
    price?: number;
    duration?: number; // phút
    isActive?: boolean;
    note?: string;
    createdAt?: string;
}

export interface DoctorServiceListParams {
    page?: number;
    limit?: number;
    keyword?: string;
    departmentId?: string;
}

// Fallback cho UPDATE (không có sẵn — backend thường PATCH trên assign endpoint)
const DOCTOR_SERVICE_EXTRA = {
    UPDATE: (id: string) => `/api/doctor-services/${id}`,
};

export const doctorServiceLinkService = {
    getList: (params?: DoctorServiceListParams) =>
        axiosClient
            .get(DOCTOR_SERVICE_ENDPOINTS.ACTIVE_DOCTORS, { params })
            .then((r) => unwrapList<DoctorServiceLink>(r.data)),

    getByDoctor: (doctorId: string) =>
        axiosClient
            .get(DOCTOR_SERVICE_ENDPOINTS.SERVICES_BY_DOCTOR(doctorId))
            .then((r) => unwrapList<DoctorServiceLink>(r.data)),

    getByService: (facilityServiceId: string) =>
        axiosClient
            .get(DOCTOR_SERVICE_ENDPOINTS.DOCTORS_BY_SERVICE(facilityServiceId))
            .then((r) => unwrapList<DoctorServiceLink>(r.data)),

    assign: (
        doctorId: string,
        facilityServiceId: string,
        data?: Partial<DoctorServiceLink>
    ) =>
        axiosClient
            .post(DOCTOR_SERVICE_ENDPOINTS.ASSIGN_SERVICES(doctorId), {
                facilityServiceId,
                ...(data || {}),
            })
            .then((r) => unwrap<DoctorServiceLink>(r.data)),

    unassign: (doctorId: string, facilityServiceId: string) =>
        axiosClient
            .delete(
                DOCTOR_SERVICE_ENDPOINTS.REMOVE_SERVICE(
                    doctorId,
                    facilityServiceId
                )
            )
            .then(() => {}),

    update: (id: string, data: Partial<DoctorServiceLink>) =>
        axiosClient
            .patch(DOCTOR_SERVICE_EXTRA.UPDATE(id), data)
            .then((r) => unwrap<DoctorServiceLink>(r.data)),
};

export default doctorServiceLinkService;
