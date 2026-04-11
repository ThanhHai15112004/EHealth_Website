/**
 * Medical Service
 * Quản lý dịch vụ y tế — đồng bộ Swagger API
 * Backend: http://160.250.186.97:3000/api-docs
 * Endpoints: /api/medical-services/*
 */

import axiosClient from '@/api/axiosClient';
import { MEDICAL_SERVICE_ENDPOINTS } from '@/api/endpoints';

export interface MedicalService {
    id: string;
    name: string;
    code: string;
    description?: string;
    price?: number;
    status: 'active' | 'inactive';
    createdAt?: string;
}

export interface MedicalServiceListResponse {
    data: MedicalService[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const medicalServiceApi = {
    getMasterList: (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<MedicalServiceListResponse> =>
        axiosClient.get(MEDICAL_SERVICE_ENDPOINTS.MASTER_LIST, { params }).then(r => {
            const result = r.data;
            if (result && Array.isArray(result.data)) {
                result.data = result.data.map((s: any) => ({ ...s, id: s.services_id || s.id }));
            }
            return result;
        }),
    getFacilityActiveServices: (facilityId: string, params?: { limit?: number; search?: string }): Promise<any> =>
        axiosClient.get(MEDICAL_SERVICE_ENDPOINTS.FACILITY_ACTIVE_SERVICES(facilityId), { params }).then(r => {
            const result = r.data;
            if (result && Array.isArray(result.data)) {
                result.data = result.data.map((s: any) => ({ ...s, id: s.service_id || s.id }));
            }
            return result;
        }),
};
