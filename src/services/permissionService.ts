/**
 * Permission Service
 * Gọi API quản lý quyền hạn và vai trò
 */

import axiosClient from '@/api/axiosClient';

// ============================================
// Types
// ============================================

export interface RoleData {
    id: string;
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
    userCount: number;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PermissionData {
    id: string;
    code: string;
    name: string;
    group: string;
    description: string;
}

export interface PermissionGroup {
    group: string;
    groupLabel: string;
    permissions: PermissionData[];
}

// ============================================
// API Endpoints
// ============================================

const PERMISSION_ENDPOINTS = {
    ROLES: '/api/roles',
    ROLE_DETAIL: (id: string) => `/api/roles/${id}`,
    PERMISSIONS: '/api/permissions',
    ASSIGN_PERMISSIONS: (roleId: string) => `/api/roles/${roleId}/permissions`,
};

// ============================================
// Service Functions
// ============================================

/**
 * Lấy danh sách vai trò
 */
export const getRoles = async (): Promise<RoleData[]> => {
    try {
        const response = await axiosClient.get(PERMISSION_ENDPOINTS.ROLES);
        return response.data.data || [];
    } catch (error) {
        console.error('Lỗi lấy danh sách vai trò:', error);
        return [];
    }
};

/**
 * Lấy chi tiết vai trò
 */
export const getRoleDetail = async (id: string): Promise<RoleData | null> => {
    try {
        const response = await axiosClient.get(PERMISSION_ENDPOINTS.ROLE_DETAIL(id));
        return response.data.data || null;
    } catch (error) {
        console.error('Lỗi lấy chi tiết vai trò:', error);
        return null;
    }
};

/**
 * Tạo vai trò mới
 */
export const createRole = async (data: Partial<RoleData>): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axiosClient.post(PERMISSION_ENDPOINTS.ROLES, data);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Tạo vai trò thất bại',
        };
    }
};

/**
 * Cập nhật vai trò
 */
export const updateRole = async (id: string, data: Partial<RoleData>): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axiosClient.put(PERMISSION_ENDPOINTS.ROLE_DETAIL(id), data);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Cập nhật vai trò thất bại',
        };
    }
};

/**
 * Xóa vai trò
 */
export const deleteRole = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axiosClient.delete(PERMISSION_ENDPOINTS.ROLE_DETAIL(id));
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Xóa vai trò thất bại',
        };
    }
};

/**
 * Lấy danh sách tất cả quyền (grouped)
 */
export const getPermissions = async (): Promise<PermissionGroup[]> => {
    try {
        const response = await axiosClient.get(PERMISSION_ENDPOINTS.PERMISSIONS);
        return response.data.data || [];
    } catch (error) {
        console.error('Lỗi lấy danh sách quyền:', error);
        return [];
    }
};

/**
 * Gán quyền cho vai trò
 */
export const assignPermissions = async (
    roleId: string,
    permissionIds: string[]
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axiosClient.put(
            PERMISSION_ENDPOINTS.ASSIGN_PERMISSIONS(roleId),
            { permissions: permissionIds }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gán quyền thất bại',
        };
    }
};

export default {
    getRoles,
    getRoleDetail,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    assignPermissions,
};
