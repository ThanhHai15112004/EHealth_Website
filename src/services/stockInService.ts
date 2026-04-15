import axiosClient from "@/api/axiosClient";
import {
  STOCK_IN_ENDPOINTS,
  STOCK_IN_MANAGEMENT_ENDPOINTS,
} from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============ Types ============
export interface StockInItem {
  id?: string;
  drugId?: string;
  quantity?: number;
  unitPrice?: number;
  batchNo?: string;
  expiryDate?: string;
  [key: string]: any;
}

export interface StockInOrder {
  id: string;
  code?: string;
  supplierId?: string;
  warehouseId?: string;
  status?: string;
  totalAmount?: number;
  items?: StockInItem[];
  createdAt?: string;
  [key: string]: any;
}

export interface StockInListParams {
  page?: number;
  limit?: number;
  status?: string;
  supplierId?: string;
  warehouseId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  [key: string]: any;
}

export interface StockInStatsParams {
  fromDate?: string;
  toDate?: string;
  warehouseId?: string;
  [key: string]: any;
}

// Local fallback: stats endpoint nếu BE có
const STATS_URL = "/api/stock-in/stats";

// ============ Service ============
export const stockInService = {
  async getList(params: StockInListParams = {}) {
    const res = await axiosClient.get(STOCK_IN_MANAGEMENT_ENDPOINTS.LIST, { params });
    return unwrapList<StockInOrder>(res);
  },

  async getDetail(id: string) {
    const res = await axiosClient.get(STOCK_IN_MANAGEMENT_ENDPOINTS.DETAIL(id));
    return unwrap<StockInOrder>(res);
  },

  async create(data: Partial<StockInOrder>) {
    const res = await axiosClient.post(STOCK_IN_MANAGEMENT_ENDPOINTS.CREATE, data);
    return unwrap<StockInOrder>(res);
  },

  async confirm(id: string) {
    const res = await axiosClient.patch(STOCK_IN_MANAGEMENT_ENDPOINTS.CONFIRM(id));
    return unwrap<StockInOrder>(res);
  },

  async receive(id: string, data: any = {}) {
    const res = await axiosClient.patch(STOCK_IN_MANAGEMENT_ENDPOINTS.RECEIVE(id), data);
    return unwrap<StockInOrder>(res);
  },

  async cancel(id: string, reason?: string) {
    const res = await axiosClient.patch(STOCK_IN_MANAGEMENT_ENDPOINTS.CANCEL(id), { reason });
    return unwrap<StockInOrder>(res);
  },

  async addItem(id: string, item: StockInItem) {
    const res = await axiosClient.post(STOCK_IN_MANAGEMENT_ENDPOINTS.ADD_ITEM(id), item);
    return unwrap<StockInItem>(res);
  },

  async removeItem(id: string, itemId: string) {
    const res = await axiosClient.delete(`${STOCK_IN_ENDPOINTS.ITEMS(id)}/${itemId}`);
    return unwrap<{ success: boolean }>(res);
  },

  async updateItem(id: string, itemId: string, data: Partial<StockInItem>) {
    const res = await axiosClient.patch(`${STOCK_IN_ENDPOINTS.ITEMS(id)}/${itemId}`, data);
    return unwrap<StockInItem>(res);
  },

  async getItems(id: string) {
    const res = await axiosClient.get(STOCK_IN_ENDPOINTS.ITEMS(id));
    return unwrapList<StockInItem>(res);
  },

  async getStats(params: StockInStatsParams = {}) {
    const res = await axiosClient.get(STATS_URL, { params });
    return unwrap<any>(res);
  },
};

export default stockInService;
