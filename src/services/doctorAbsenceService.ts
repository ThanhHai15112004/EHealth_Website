/**
 * Doctor Absence Service — Quản lý lịch vắng của bác sĩ
 * Swagger: /api/doctor-absences/*
 */

import axiosClient from "@/api/axiosClient";
import { DOCTOR_ABSENCE_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// Endpoint bổ sung (fallback — chưa có trong endpoints.ts)
const LOCAL_ENDPOINTS = {
    BY_DOCTOR: (doctorId: string) =>
        `/api/doctor-absences/by-doctor/${doctorId}`,
};

export interface DoctorAbsenceData {
    doctorId: string;
    startDate: string;
    endDate: string;
    reason?: string;
    type?: "SICK" | "LEAVE" | "TRAINING" | "OTHER";
    note?: string;
}

export interface DoctorAbsenceListParams {
    doctorId?: string;
    facilityId?: string;
    from?: string;
    to?: string;
    type?: string;
    page?: number;
    limit?: number;
}

export const doctorAbsenceService = {
    /** GET danh sách */
    getList: (params?: DoctorAbsenceListParams) =>
        axiosClient
            .get(DOCTOR_ABSENCE_ENDPOINTS.LIST, { params })
            .then((r) => unwrapList(r)),

    /** GET chi tiết */
    getDetail: (id: string) =>
        axiosClient
            .get(DOCTOR_ABSENCE_ENDPOINTS.DETAIL(id))
            .then((r) => unwrap(r)),

    /** POST tạo báo vắng */
    create: (data: DoctorAbsenceData) =>
        axiosClient
            .post(DOCTOR_ABSENCE_ENDPOINTS.CREATE, data)
            .then((r) => unwrap(r)),

    /** PUT cập nhật */
    update: (id: string, data: Partial<DoctorAbsenceData>) =>
        axiosClient
            .put(DOCTOR_ABSENCE_ENDPOINTS.DETAIL(id), data)
            .then((r) => unwrap(r)),

    /** DELETE xóa */
    delete: (id: string) =>
        axiosClient
            .delete(DOCTOR_ABSENCE_ENDPOINTS.DETAIL(id))
            .then((r) => unwrap(r)),

    /** GET các appointment bị ảnh hưởng bởi kỳ vắng */
    getAffectedAppointments: (absenceId: string) =>
        axiosClient
            .get(DOCTOR_ABSENCE_ENDPOINTS.AFFECTED_APPOINTMENTS, {
                params: { absenceId },
            })
            .then((r) => unwrapList(r)),

    /** GET danh sách vắng theo bác sĩ */
    getByDoctor: (doctorId: string, params?: DoctorAbsenceListParams) =>
        axiosClient
            .get(LOCAL_ENDPOINTS.BY_DOCTOR(doctorId), { params })
            .then((r) => unwrapList(r)),
};

export default doctorAbsenceService;
