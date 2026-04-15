/**
 * Appointment Service
 * Xử lý các chức năng liên quan đến lịch hẹn khám
 * 
 * @description
 * - CRUD lịch hẹn
 * - Xác nhận / Hủy lịch hẹn
 * - Lấy lịch hẹn theo bác sĩ / bệnh nhân
 */

import axiosClient from '@/api/axiosClient';
import { APPOINTMENT_ENDPOINTS } from '@/api/endpoints';

// ============================================
// Types
// ============================================

export interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    departmentId: string;
    departmentName: string;
    date: string;
    time: string;
    type: 'first_visit' | 're_examination' | 'consultation';
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    reason?: string;
    notes?: string;
    rating?: number;
    feedback?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAppointmentData {
    patientId: string;
    doctorId?: string;
    facilityId?: string;
    branchId?: string;
    specialtyId?: string;
    serviceId?: string;
    slot_id?: string;
    date: string;
    time: string;
    type: Appointment['type'];
    reason?: string;
}

export interface AppointmentListResponse {
    success: boolean;
    data: Appointment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ============================================
// Lấy danh sách lịch hẹn
// ============================================
export const getAppointments = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    date?: string;
    doctorId?: string;
    patientId?: string;
}): Promise<AppointmentListResponse> => {
    try {
        const queryParams: any = { ...params };
        if (params?.patientId) {
            queryParams.patient_id = params.patientId;
            delete queryParams.patientId;
        }
        if (params?.doctorId) {
            queryParams.doctor_id = params.doctorId;
            delete queryParams.doctorId;
        }

        const response = await axiosClient.get(APPOINTMENT_ENDPOINTS.LIST, { params: queryParams });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách lịch hẹn thất bại');
    }
};

// ============================================
// Lấy chi tiết lịch hẹn
// ============================================
export const getAppointmentById = async (id: string): Promise<Appointment> => {
    try {
        const response = await axiosClient.get(APPOINTMENT_ENDPOINTS.DETAIL(id));
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lấy thông tin lịch hẹn thất bại');
    }
};

// ============================================
// Tạo lịch hẹn mới
// ============================================
export const createAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
    try {
        const response = await axiosClient.post(APPOINTMENT_ENDPOINTS.CREATE, {
            patient_id: data.patientId,
            doctor_id: data.doctorId,
            branch_id: data.branchId || data.facilityId,
            appointment_date: data.date,
            slot_id: data.slot_id,
            booking_channel: "WEB",
            reason_for_visit: data.reason,
            facility_service_id: data.serviceId,
            specialty_id: data.specialtyId,
        });
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Tạo lịch hẹn thất bại');
    }
};

// ============================================
// Cập nhật lịch hẹn
// ============================================
export const updateAppointment = async (
    id: string,
    data: Partial<CreateAppointmentData>
): Promise<Appointment> => {
    try {
        const response = await axiosClient.put(APPOINTMENT_ENDPOINTS.UPDATE(id), {
            patient_id: data.patientId,
            doctor_id: data.doctorId,
            date: data.date,
            time: data.time,
            type: data.type,
            reason: data.reason,
        });
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Cập nhật lịch hẹn thất bại');
    }
};

// ============================================
// Xác nhận lịch hẹn
// ============================================
export const confirmAppointment = async (id: string): Promise<Appointment> => {
    try {
        const response = await axiosClient.patch(APPOINTMENT_ENDPOINTS.CONFIRM(id));
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Xác nhận lịch hẹn thất bại');
    }
};

// ============================================
// Tạo mã QR cho lịch hẹn đã xác nhận
// ============================================
export const generateAppointmentQr = async (id: string): Promise<{ qr_token: string; expires_at: string }> => {
    try {
        const response = await axiosClient.post(APPOINTMENT_ENDPOINTS.GENERATE_QR(id));
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Tạo mã QR thất bại');
    }
};

// ============================================
// Hủy lịch hẹn
// ============================================
export const cancelAppointment = async (id: string, reason?: string): Promise<void> => {
    try {
        await axiosClient.delete(APPOINTMENT_ENDPOINTS.CANCEL(id), { 
            data: { cancellation_reason: reason || 'Bệnh nhân huỷ lịch' } 
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Hủy lịch hẹn thất bại');
    }
};

// ============================================
// Lấy lịch hẹn theo bác sĩ
// ============================================
export const getAppointmentsByDoctor = async (
    doctorId: string,
    params?: { date?: string; status?: string }
): Promise<Appointment[]> => {
    try {
        const response = await axiosClient.get(APPOINTMENT_ENDPOINTS.BY_DOCTOR(doctorId), { params });
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lấy lịch hẹn theo bác sĩ thất bại');
    }
};

// ============================================
// Lấy lịch hẹn theo bệnh nhân
// ============================================
export const getAppointmentsByPatient = async (
    patientId: string,
    params?: { status?: string }
): Promise<Appointment[]> => {
    try {
        const response = await axiosClient.get(APPOINTMENT_ENDPOINTS.BY_PATIENT(patientId), { params });
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lấy lịch hẹn theo bệnh nhân thất bại');
    }
};

// ============================================
// Lấy lịch hẹn của tôi (theo token đăng nhập)
// BE tự xác định patient_id từ JWT Access Token
// ============================================
export interface MyAppointmentsResponse {
    success: boolean;
    message: string;
    patient_id: string;
    patient_ids: string[];
    data: Appointment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const getMyAppointments = async (
    params?: { status?: string; patient_id?: string; fromDate?: string; toDate?: string; page?: number; limit?: number }
): Promise<MyAppointmentsResponse> => {
    try {
        const response = await axiosClient.get(APPOINTMENT_ENDPOINTS.MY_APPOINTMENTS, { params });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lấy lịch hẹn của tôi thất bại');
    }
};
// ============================================
// L?y danh s�ch slot kh�m (cho b�c si ho?c service)
// ============================================
export const getAvailableSlots = async (params: { date?: string; doctor_id?: string; service_id?: string; branch_id?: string }) => {
    try {
        const response = await axiosClient.get('/api/appointments/available-slots', { params });
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'L?y danh s�ch slot th?t b?i');
    }
};

// ============================================
// L?y danh s�ch slot kh�m theo khoa
// ============================================
export const getAvailableSlotsByDepartment = async (params: { department_id: string; facility_id: string; branch_id?: string; start_date?: string; days?: number; }) => {
    try {
        const response = await axiosClient.get('/api/appointments/available-slots-by-department', { params });
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'L?y danh s�ch slot theo khoa th?t b?i');
    }
};

// ============================================
// Đánh giá lịch khám
// ============================================
export const submitAppointmentReview = async (id: string, rating: number, feedback: string): Promise<Appointment> => {
    try {
        const response = await axiosClient.post(`/api/appointments/${id}/review`, { rating, feedback });
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gửi đánh giá thất bại');
    }
};
