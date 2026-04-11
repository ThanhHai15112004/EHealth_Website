/**
 * Doctor Service
 * Quản lý bác sĩ — sử dụng Staff API (BE thực)
 * 
 * Backend: /api/staff?role=DOCTOR
 * Schedule: /api/staff-schedules/staff/{staffId}
 */

import axiosClient from '@/api/axiosClient';
import { STAFF_ENDPOINTS, SCHEDULE_ENDPOINTS, DOCTOR_ENDPOINTS } from '@/api/endpoints';
import { API_CONFIG } from '@/config';

// ============================================
// Types — mapped từ BE response
// ============================================

/** Raw staff item từ BE GET /api/staff?role=DOCTOR */
export interface StaffItem {
    users_id: string;
    email: string;
    phone: string;
    status: string;
    created_at: string;
    updated_at: string;
    roles: string[];
    user_profiles_id: string;
    full_name: string;
    dob: string;
    gender: string;
    avatar_url: any;
    doctors_id: string | null;
    doctor_title: string | null;
    specialty_name: string | null;
    specialty_id: string | null;
    consultation_fee: number | null;
    facility_name: string | null;
}

/** Raw staff detail từ BE GET /api/staff/{id} */
export interface StaffDetail extends StaffItem {
    identity_card_number: string | null;
    address: string | null;
    signature_url: string | null;
    doctors_id: string | null;
    biography: string | null;
    consultation_fee: number | null;
    specialty_id: string | null;
    facilities: Array<{
        user_branch_dept_id: string;
        branch_id: string;
        branch_name: string;
        department_id: string | null;
        department_name: string | null;
        role_title: string;
        facility_id: string;
        facility_name: string;
    }>;
}

/** Normalized Doctor interface cho FE */
export interface Doctor {
    id: string;
    doctorId?: string | null;
    fullName: string;
    email?: string;
    phone?: string;
    gender?: string;
    dob?: string;
    avatar?: string | null;
    status: 'active' | 'inactive' | 'on_leave';
    doctorTitle?: string | null;
    specialtyId?: string | null;
    specialtyName?: string | null;
    biography?: string | null;
    consultationFee?: number | null;
    facilityName?: string | null;
    experience?: number;
    rating: number;
    // Legacy compat
    departmentId?: string;
    departmentName: string;
    specialization: string;
    qualification: string;
    code: string;
    // Detail-only fields
    address?: string | null;
    facilities?: StaffDetail['facilities'];
    branchId?: string | null;
}

export interface DoctorListResponse {
    data: Doctor[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface DoctorSchedule {
    schedule_id: string;
    staff_id: string;
    shift_id: string;
    shift_name?: string;
    work_date?: string; // Tương thích ngược
    working_date?: string; // Từ backend trả về
    start_time: string;
    end_time: string;
    status: string;
    room_name?: string;
    branch_name?: string;
}

// ============================================
// Helpers
// ============================================

/** Xây dựng full URL cho avatar */
export function getFullAvatarUrl(avatarUrl: any): string | null {
    if (!avatarUrl) return null;

    // Xử lý trường hợp backend trả về mảng các object (ví dụ: [{ url: "..." }])
    let finalUrl = avatarUrl;
    if (Array.isArray(avatarUrl) && avatarUrl.length > 0) {
        finalUrl = avatarUrl[0].url;
    }

    if (typeof finalUrl !== 'string' || !finalUrl) return null;

    // Nếu đã là URL đầy đủ (http/https), trả về nguyên
    if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
        return finalUrl;
    }
    // Nếu là relative path, prefix với BASE_URL
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
    return `${baseUrl}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
}

/** Map BE status sang FE status */
function mapStatus(status: string): 'active' | 'inactive' | 'on_leave' {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return 'active';
        case 'ON_LEAVE': return 'on_leave';
        default: return 'inactive';
    }
}

/** Format tiền VNĐ */
export function formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

/** Transform BE staff item → FE Doctor */
function transformStaffToDoctor(staff: StaffItem): Doctor {
    return {
        id: staff.users_id,
        doctorId: staff.doctors_id || null,
        fullName: staff.full_name || 'Chưa cập nhật',
        email: staff.email || '',
        phone: staff.phone || '',
        gender: staff.gender || '',
        dob: staff.dob || '',
        avatar: getFullAvatarUrl(staff.avatar_url),
        status: mapStatus(staff.status),
        doctorTitle: staff.doctor_title,
        specialtyId: staff.specialty_id || null,
        specialtyName: staff.specialty_name,
        biography: null,
        consultationFee: staff.consultation_fee || null,
        facilityName: staff.facility_name,
        rating: 0,
        // Legacy compat
        departmentName: staff.specialty_name || 'Đa khoa',
        specialization: staff.specialty_name || '',
        qualification: staff.doctor_title || '',
        code: staff.users_id.substring(0, 8),
    };
}

/** Transform BE staff detail → FE Doctor (detailed) */
function transformStaffDetailToDoctor(staff: StaffDetail): Doctor {
    const base = transformStaffToDoctor(staff);
    return {
        ...base,
        specialtyId: staff.specialty_id,
        biography: staff.biography,
        consultationFee: staff.consultation_fee,
        address: staff.address,
        facilities: staff.facilities,
        facilityName: staff.facilities?.[0]?.facility_name || staff.facility_name || null,
        qualification: staff.doctor_title || base.qualification,
        branchId: staff.facilities?.[0]?.branch_id || null,
    };
}

// ============================================
// Service Functions
// ============================================

export const doctorService = {
    /**
     * Lấy danh sách bác sĩ từ Staff API
     * GET /api/staff?role=DOCTOR
     */
    getList: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        branch_id?: string;
        facility_id?: string;
        specialty_id?: string;
        service_id?: string;
        gender?: string;
        min_price?: number;
        max_price?: number;
    }): Promise<DoctorListResponse> => {
        const res = await axiosClient.get(STAFF_ENDPOINTS.LIST, {
            params: {
                role: 'DOCTOR',
                page: params?.page || 1,
                limit: params?.limit || 12,
                search: params?.search || undefined,
                status: params?.status || undefined,
                branch_id: params?.branch_id || undefined,
                facility_id: params?.facility_id || undefined,
                specialty_id: params?.specialty_id || undefined,
                service_id: params?.service_id || undefined,
                gender: params?.gender || undefined,
                min_price: params?.min_price !== undefined ? params?.min_price : undefined,
                max_price: params?.max_price !== undefined ? params?.max_price : undefined,
            },
        });

        const beData = res.data?.data || res.data;

        // BE trả về { items: [...], total, page, limit, totalPages }
        if (beData?.items && Array.isArray(beData.items)) {
            return {
                data: beData.items.map(transformStaffToDoctor),
                pagination: {
                    page: beData.page,
                    limit: beData.limit,
                    total: beData.total,
                    totalPages: beData.totalPages,
                },
            };
        }

        // Fallback nếu format khác
        if (Array.isArray(beData)) {
            return { data: beData.map(transformStaffToDoctor) };
        }

        return { data: [] };
    },

    /**
     * Lấy chi tiết bác sĩ
     * GET /api/staff/{id}
     */
    getById: async (id: string): Promise<Doctor | null> => {
        const res = await axiosClient.get(STAFF_ENDPOINTS.DETAIL(id));
        const beData = res.data?.data || res.data;

        if (!beData || !beData.users_id) return null;
        return transformStaffDetailToDoctor(beData as StaffDetail);
    },

    /**
     * Lấy lịch làm việc của bác sĩ
     * GET /api/staff-schedules/staff/{staffId}
     */
    getSchedule: async (doctorId: string): Promise<DoctorSchedule[]> => {
        try {
            const res = await axiosClient.get(SCHEDULE_ENDPOINTS.BY_STAFF(doctorId));
            const beData = res.data?.data || res.data;
            if (Array.isArray(beData)) return beData;
            if (beData?.items && Array.isArray(beData.items)) return beData.items;
            return [];
        } catch {
            return [];
        }
    },

    /**
     * Lấy danh sách dịch vụ của bác sĩ
     * GET /api/doctor-services/{doctorId}/services
     */
    getServices: async (doctorId: string): Promise<any[]> => {
        try {
            const res = await axiosClient.get(DOCTOR_ENDPOINTS.SERVICES(doctorId));
            const beData = res.data?.data || res.data;
            if (Array.isArray(beData)) return beData;
            if (beData?.items && Array.isArray(beData.items)) return beData.items;
            return [];
        } catch {
            return [];
        }
    },
};
