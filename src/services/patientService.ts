/**
 * Patient Service
 * Quản lý bệnh nhân — theo đúng Swagger API Backend
 *
 * Backend: http://160.250.186.97:3000/api-docs
 */

import axiosClient from '@/api/axiosClient';
import { PATIENT_ENDPOINTS } from '@/api/endpoints';

// ============================================
// Types — theo đúng schema backend
// ============================================

export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'DECEASED';
export type IdentityType = 'CCCD' | 'PASSPORT' | 'OTHER';
export type RelationType = 'PARENT' | 'SPOUSE' | 'CHILD' | 'SIBLING' | 'OTHER';

export interface Patient {
    id: string;
    patient_code: string;
    account_id: string | null;
    full_name: string;
    date_of_birth: string;
    gender: string;
    phone_number: string | null;
    email: string | null;
    id_card_number: string | null;
    address: string | null;
    province_id: number | null;
    district_id: number | null;
    ward_id: number | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    status: PatientStatus;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    account_email?: string;
    account_phone?: string;
}

export interface CreatePatientRequest {
    full_name: string;
    date_of_birth: string;
    gender: string;
    phone_number?: string;
    email?: string;
    id_card_number?: string;
    address?: string;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
}

export interface UpdatePatientRequest {
    full_name?: string;
    date_of_birth?: string;
    gender?: string;
    phone_number?: string;
    email?: string;
    id_card_number?: string;
    address?: string;
    province_id?: number;
    district_id?: number;
    ward_id?: number;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
}

export interface PatientContact {
    contact_id: string;
    patient_id: string;
    phone_number: string;
    email?: string;
    street_address?: string;
    ward?: string;
    province?: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}

export interface PatientRelation {
    relation_id: string;
    patient_id: string;
    full_name: string;
    relationship: RelationType;
    phone_number: string;
    is_emergency: boolean;
    has_legal_rights: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaginationInfo {
    total_items: number;
    total_pages: number;
    current_page: number;
    limit: number;
}

export interface PatientListResponse {
    success: boolean;
    message?: string;
    data?: {
        items: Patient[];
        pagination: PaginationInfo;
    };
}

// ============================================
// API Functions
// ============================================

/**
 * Lấy danh sách bệnh nhân (phân trang + tìm kiếm)
 */
export const getPatients = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: PatientStatus;
    gender?: PatientGender;
}): Promise<PatientListResponse> => {
    try {
        const response = await axiosClient.get(PATIENT_ENDPOINTS.LIST, { params });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Lấy danh sách bệnh nhân thất bại',
        };
    }
};

/**
 * Lấy chi tiết một bệnh nhân
 */
export const getPatientDetail = async (patientId: string): Promise<{ success: boolean; data?: Patient; message?: string }> => {
    try {
        const response = await axiosClient.get(PATIENT_ENDPOINTS.DETAIL(patientId));
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Bệnh nhân không tồn tại',
        };
    }
};

/**
 * Lấy danh sách hồ sơ bệnh nhân theo User ID
 */
export const getPatientsByAccountId = async (accountId: string): Promise<{ success: boolean; data?: Patient[]; message?: string }> => {
    try {
        const response = await axiosClient.get(PATIENT_ENDPOINTS.BY_ACCOUNT(accountId));
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Không thể lấy danh sách hồ sơ bệnh nhân',
        };
    }
};

/**
 * Tạo hồ sơ bệnh nhân mới
 */
export const createPatient = async (data: CreatePatientRequest): Promise<{ success: boolean; data?: Patient; message?: string }> => {
    try {
        const response = await axiosClient.post(PATIENT_ENDPOINTS.CREATE, data);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Tạo hồ sơ thất bại',
        };
    }
};

/**
 * Cập nhật thông tin hành chính bệnh nhân
 */
export const updatePatient = async (patientId: string, data: UpdatePatientRequest): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.put(PATIENT_ENDPOINTS.UPDATE(patientId), data);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Cập nhật thất bại',
        };
    }
};

/**
 * Liên kết hồ sơ bệnh nhân với tài khoản hiện tại
 */
export const linkAccount = async (patientId: string, accountId: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.patch(PATIENT_ENDPOINTS.LINK_ACCOUNT(patientId), { account_id: accountId });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Liên kết hồ sơ thất bại',
        };
    }
};

/**
 * Hủy liên kết hồ sơ bệnh nhân khỏi tài khoản hiện tại
 */
export const unlinkAccount = async (patientId: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.patch(PATIENT_ENDPOINTS.UNLINK_ACCOUNT(patientId));
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Hủy liên kết hồ sơ thất bại',
        };
    }
};

/**
 * Cập nhật trạng thái hồ sơ bệnh nhân
 */
export const updatePatientStatus = async (
    patientId: string,
    status: PatientStatus,
    statusReason?: string
): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.patch(PATIENT_ENDPOINTS.STATUS(patientId), {
            status,
            ...(statusReason && { status_reason: statusReason }),
        });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Cập nhật trạng thái thất bại',
        };
    }
};

/**
 * Liên kết hồ sơ bệnh nhân
 */
export const linkPatient = async (patientCode: string, identityNumber: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.post(PATIENT_ENDPOINTS.LINK, {
            patient_code: patientCode,
            identity_number: identityNumber,
        });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Liên kết thất bại',
        };
    }
};

// ============================================
// Contact Management
// ============================================

/**
 * Cập nhật thông tin liên hệ chính
 */
export const updateContact = async (patientId: string, data: {
    phone_number?: string;
    email?: string;
    street_address?: string;
    ward?: string;
    province?: string;
}): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.put(PATIENT_ENDPOINTS.UPDATE_CONTACT(patientId), data);
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Cập nhật liên hệ thất bại' };
    }
};

/**
 * Thêm liên hệ phụ
 */
export const addContact = async (patientId: string, data: {
    phone_number: string;
    email?: string;
    street_address?: string;
    ward?: string;
    province?: string;
}): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.post(PATIENT_ENDPOINTS.ADD_CONTACT(patientId), data);
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Thêm liên hệ thất bại' };
    }
};

/**
 * Xóa liên hệ phụ
 */
export const deleteContact = async (patientId: string, contactId: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.delete(PATIENT_ENDPOINTS.DELETE_CONTACT(patientId, contactId));
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Xóa liên hệ thất bại' };
    }
};

// ============================================
// Relations Management (Người thân)
// ============================================

/**
 * Thêm thông tin người thân
 */
export const addRelation = async (patientId: string, data: {
    full_name: string;
    relationship: RelationType;
    phone_number: string;
    is_emergency?: boolean;
    has_legal_rights?: boolean;
}): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.post(PATIENT_ENDPOINTS.ADD_RELATION(patientId), { ...data, patient_id: patientId });
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Thêm người thân thất bại' };
    }
};

/**
 * Sửa thông tin người thân
 */
export const updateRelation = async (patientId: string, relationId: string, data: {
    full_name?: string;
    relationship?: RelationType;
    phone_number?: string;
    is_emergency?: boolean;
    has_legal_rights?: boolean;
}): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.put(PATIENT_ENDPOINTS.EDIT_RELATION(patientId, relationId), data);
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Cập nhật người thân thất bại' };
    }
};

/**
 * Xóa thông tin người thân
 */
export const deleteRelation = async (patientId: string, relationId: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.delete(PATIENT_ENDPOINTS.DELETE_RELATION(patientId, relationId));
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Xóa người thân thất bại' };
    }
};

/**
 * Lấy danh sách tất cả người thân
 */
export const getRelations = async (patientId: string): Promise<{ success: boolean; data?: PatientRelation[]; message?: string }> => {
    try {
        const response = await axiosClient.get(PATIENT_ENDPOINTS.GET_ALL_RELATIONS(patientId));
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Lấy danh sách người thân thất bại' };
    }
};

/**
 * Lấy danh sách liên hệ khẩn cấp
 */
export const getEmergencyContacts = async (patientId: string): Promise<{ success: boolean; data?: PatientRelation[]; message?: string }> => {
    try {
        const response = await axiosClient.get(PATIENT_ENDPOINTS.GET_EMERGENCY_CONTACTS(patientId));
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Lấy danh sách liên hệ khẩn cấp thất bại' };
    }
};

/**
 * Lấy danh sách người nhà (bình thường)
 */
export const getNormalRelatives = async (patientId: string): Promise<{ success: boolean; data?: PatientRelation[]; message?: string }> => {
    try {
        const response = await axiosClient.get(PATIENT_ENDPOINTS.GET_NORMAL_RELATIVES(patientId));
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Lấy danh sách người nhà thất bại' };
    }
};

/**
 * Thêm liên hệ khẩn cấp/người nhà
 */
export const addPatientContact = async (patientId: string, data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.post(`/api/patients/${patientId}/contacts`, data);
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Thêm liên hệ thất bại' };
    }
};

/**
 * Cập nhật bảo hiểm
 */
export const updatePatientInsurance = async (patientId: string, data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        // Mocked or use real endpoint if available
        const response = await axiosClient.post(`/api/patients/${patientId}/insurances`, data);
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Cập nhật bảo hiểm thất bại' };
    }
};

/**
 * Thêm tài liệu
 */
export const uploadPatientDocument = async (patientId: string, data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.post(`/api/patients/${patientId}/documents`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Thêm tài liệu thất bại' };
    }
};
