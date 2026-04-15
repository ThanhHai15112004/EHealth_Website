import axiosClient from "@/api/axiosClient";
import {
  SUPPLIER_ENDPOINTS,
  SUPPLIER_MANAGEMENT_ENDPOINTS,
} from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============ Types ============
export interface Supplier {
  id: string;
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface SupplierListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface SupplierDropdownItem {
  id: string;
  name: string;
  code?: string;
}

// Local fallback endpoints
const DROPDOWN_URL = "/api/suppliers/dropdown";
const TOGGLE_URL = (id: string) => `/api/suppliers/${id}/toggle`;
const STATS_URL = (id: string) => `/api/suppliers/${id}/stats`;

// ============ Service ============
export const supplierService = {
  async getList(params: SupplierListParams = {}) {
    const res = await axiosClient.get(SUPPLIER_MANAGEMENT_ENDPOINTS.LIST, { params });
    return unwrapList<Supplier>(res);
  },

  async getDetail(id: string) {
    const res = await axiosClient.get(SUPPLIER_MANAGEMENT_ENDPOINTS.DETAIL(id));
    return unwrap<Supplier>(res);
  },

  async getDropdown() {
    const res = await axiosClient.get(DROPDOWN_URL);
    return unwrapList<SupplierDropdownItem>(res);
  },

  async create(data: Partial<Supplier>) {
    const res = await axiosClient.post(SUPPLIER_MANAGEMENT_ENDPOINTS.CREATE, data);
    return unwrap<Supplier>(res);
  },

  async update(id: string, data: Partial<Supplier>) {
    const res = await axiosClient.patch(SUPPLIER_MANAGEMENT_ENDPOINTS.UPDATE(id), data);
    return unwrap<Supplier>(res);
  },

  async delete(id: string) {
    const res = await axiosClient.delete(SUPPLIER_ENDPOINTS.DETAIL(id));
    return unwrap<{ success: boolean }>(res);
  },

  async toggle(id: string) {
    const res = await axiosClient.patch(TOGGLE_URL(id));
    return unwrap<Supplier>(res);
  },

  async getStats(id: string) {
    const res = await axiosClient.get(STATS_URL(id));
    return unwrap<any>(res);
  },
};

export default supplierService;
