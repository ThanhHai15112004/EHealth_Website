import axiosClient from '@/api/axiosClient';
import { BRANCH_ENDPOINTS } from '@/api/endpoints';

export interface Branch {
    id: string;
    facilities_id?: string;
    code?: string;
    name: string;
    address?: string;
    phone?: string;
    status?: 'active' | 'inactive';
}

export interface BranchListResponse {
    data: Branch[];
}

export const branchService = {
    getList: (params?: { page?: number; limit?: number; search?: string; status?: string; facility_id?: string }): Promise<BranchListResponse> =>
        axiosClient.get(BRANCH_ENDPOINTS.LIST, { params }).then(r => {
            const result = r.data;
            if (result && Array.isArray(result.data)) {
                result.data = result.data.map((b: any) => ({ ...b, id: b.branches_id || b.id }));
            }
            return result;
        }),
    getDropdown: (): Promise<BranchListResponse> =>
        axiosClient.get(BRANCH_ENDPOINTS.DROPDOWN).then(r => {
            const result = r.data;
            if (result && Array.isArray(result.data)) {
                result.data = result.data.map((b: any) => ({ ...b, id: b.branches_id || b.id }));
            }
            return result;
        })
};
