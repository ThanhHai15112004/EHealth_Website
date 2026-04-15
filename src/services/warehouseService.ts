import axiosClient from "@/api/axiosClient";
import {
  WAREHOUSE_ENDPOINTS,
  WAREHOUSE_MANAGEMENT_ENDPOINTS,
} from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============ Types ============
export interface Warehouse {
  id: string;
  name: string;
  code?: string;
  address?: string;
  branchId?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface WarehouseListParams {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface WarehouseDropdownItem {
  id: string;
  name: string;
  code?: string;
}

// Local fallback endpoints
const DROPDOWN_URL = "/api/warehouses/dropdown";
const INVENTORY_BY_WAREHOUSE = (id: string) => `/api/warehouses/${id}/inventory`;

// ============ Service ============
export const warehouseService = {
  async getList(params: WarehouseListParams = {}) {
    const res = await axiosClient.get(WAREHOUSE_MANAGEMENT_ENDPOINTS.LIST, { params });
    return unwrapList<Warehouse>(res);
  },

  async getDetail(id: string) {
    const res = await axiosClient.get(WAREHOUSE_MANAGEMENT_ENDPOINTS.DETAIL(id));
    return unwrap<Warehouse>(res);
  },

  async getDropdown() {
    const res = await axiosClient.get(DROPDOWN_URL);
    return unwrapList<WarehouseDropdownItem>(res);
  },

  async create(data: Partial<Warehouse>) {
    const res = await axiosClient.post(WAREHOUSE_MANAGEMENT_ENDPOINTS.CREATE, data);
    return unwrap<Warehouse>(res);
  },

  async update(id: string, data: Partial<Warehouse>) {
    const res = await axiosClient.put(WAREHOUSE_MANAGEMENT_ENDPOINTS.UPDATE(id), data);
    return unwrap<Warehouse>(res);
  },

  async delete(id: string) {
    const res = await axiosClient.delete(WAREHOUSE_ENDPOINTS.DETAIL(id));
    return unwrap<{ success: boolean }>(res);
  },

  async toggle(id: string) {
    const res = await axiosClient.patch(WAREHOUSE_MANAGEMENT_ENDPOINTS.TOGGLE(id));
    return unwrap<Warehouse>(res);
  },

  async getInventoryByWarehouse(warehouseId: string) {
    const res = await axiosClient.get(INVENTORY_BY_WAREHOUSE(warehouseId));
    return unwrapList<any>(res);
  },
};

export default warehouseService;
