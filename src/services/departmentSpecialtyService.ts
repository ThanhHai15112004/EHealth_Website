/**
 * Department Specialty Service — Gán chuyên khoa với phòng ban
 * Endpoints: /api/department-specialties/*
 */
import axiosClient from "@/api/axiosClient";
import { DEPARTMENT_SPECIALTY_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface DepartmentSpecialtyLink {
    id?: string;
    departmentId: string;
    departmentName?: string;
    specialtyId: string;
    specialtyName?: string;
    branchId?: string;
    facilityId?: string;
    createdAt?: string;
}

export interface DepartmentSpecialtyListParams {
    page?: number;
    limit?: number;
    departmentId?: string;
    branchId?: string;
    facilityId?: string;
    specialtyId?: string;
}

const LIST = "/api/department-specialties";

export const departmentSpecialtyService = {
    getList: (params?: DepartmentSpecialtyListParams) =>
        axiosClient.get(LIST, { params }).then((r) => unwrapList<DepartmentSpecialtyLink>(r)),

    getByDepartment: (departmentId: string) =>
        axiosClient
            .get(DEPARTMENT_SPECIALTY_ENDPOINTS.BY_DEPARTMENT(departmentId))
            .then((r) => unwrap<DepartmentSpecialtyLink[]>(r)),

    getByBranch: (branchId: string) =>
        axiosClient
            .get(DEPARTMENT_SPECIALTY_ENDPOINTS.BY_BRANCH(branchId))
            .then((r) => unwrap<DepartmentSpecialtyLink[]>(r)),

    getByFacility: (facilityId: string) =>
        axiosClient
            .get(DEPARTMENT_SPECIALTY_ENDPOINTS.BY_FACILITY(facilityId))
            .then((r) => unwrap<DepartmentSpecialtyLink[]>(r)),

    assign: (departmentId: string, specialtyId: string) =>
        axiosClient
            .post(DEPARTMENT_SPECIALTY_ENDPOINTS.ASSIGN(departmentId), { specialtyIds: [specialtyId] })
            .then((r) => unwrap<DepartmentSpecialtyLink>(r)),

    unassign: (departmentId: string, specialtyId: string) =>
        axiosClient
            .delete(DEPARTMENT_SPECIALTY_ENDPOINTS.REMOVE(departmentId, specialtyId))
            .then((r) => unwrap<void>(r)),
};

export default departmentSpecialtyService;
