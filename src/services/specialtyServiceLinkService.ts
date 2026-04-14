/**
 * Specialty Service Link — Gán chuyên khoa với dịch vụ
 * Endpoints: /api/specialty-services/*
 */
import axiosClient from "@/api/axiosClient";
import { SPECIALTY_SERVICE_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface SpecialtyServiceLink {
    id?: string;
    specialtyId: string;
    specialtyName?: string;
    serviceId: string;
    serviceName?: string;
    createdAt?: string;
}

export interface SpecialtyServiceListParams {
    page?: number;
    limit?: number;
    specialtyId?: string;
    serviceId?: string;
}

const LIST = "/api/specialty-services";
const BULK_ASSIGN = "/api/specialty-services/bulk-assign";

export const specialtyServiceLinkService = {
    getList: (params?: SpecialtyServiceListParams) =>
        axiosClient.get(LIST, { params }).then((r) => unwrapList<SpecialtyServiceLink>(r)),

    getBySpecialty: (specialtyId: string) =>
        axiosClient
            .get(SPECIALTY_SERVICE_ENDPOINTS.SERVICES_BY_SPECIALTY(specialtyId))
            .then((r) => unwrap<SpecialtyServiceLink[]>(r)),

    getByService: (serviceId: string) =>
        axiosClient
            .get(SPECIALTY_SERVICE_ENDPOINTS.SPECIALTIES_BY_SERVICE(serviceId))
            .then((r) => unwrap<SpecialtyServiceLink[]>(r)),

    assign: (specialtyId: string, serviceId: string) =>
        axiosClient
            .post(SPECIALTY_SERVICE_ENDPOINTS.ASSIGN_SERVICES(specialtyId), { serviceIds: [serviceId] })
            .then((r) => unwrap<SpecialtyServiceLink>(r)),

    unassign: (specialtyId: string, serviceId: string) =>
        axiosClient
            .delete(SPECIALTY_SERVICE_ENDPOINTS.REMOVE_SERVICE(specialtyId, serviceId))
            .then((r) => unwrap<void>(r)),

    bulkAssign: (data: { specialtyId: string; serviceIds: string[] }) =>
        axiosClient
            .post(SPECIALTY_SERVICE_ENDPOINTS.ASSIGN_SERVICES(data.specialtyId), { serviceIds: data.serviceIds })
            .then((r) => unwrap<SpecialtyServiceLink[]>(r)),

    bulkAssignRaw: (data: any) =>
        axiosClient.post(BULK_ASSIGN, data).then((r) => unwrap<any>(r)),
};

export default specialtyServiceLinkService;
