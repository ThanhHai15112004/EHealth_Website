import axiosClient from "@/api/axiosClient";
import {
  STOCK_OUT_ENDPOINTS,
  STOCK_OUT_MANAGEMENT_ENDPOINTS,
} from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============ Types ============
export interface StockOutItem {
  id?: string;
  drugId?: string;
  quantity?: number;
  batchNo?: string;
  [key: string]: any;
}

export interface StockOutOrder {
  id: string;
  code?: string;
  warehouseId?: string;
  reason?: string;
  status?: string;
  items?: StockOutItem[];
  createdAt?: string;
  [key: string]: any;
}

export interface StockOutListParams {
  page?: number;
  limit?: number;
  status?: string;
  warehouseId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  [key: string]: any;
}

export interface StockOutStatsParams {
  fromDate?: string;
  toDate?: string;
  warehouseId?: string;
  [key: string]: any;
}

// Local fallback: stats endpoint
const STATS_URL = "/api/stock-out/stats";

// ============ Service ============
export const stockOutService = {
  async getList(params: StockOutListParams = {}) {
    const res = await axiosClient.get(STOCK_OUT_MANAGEMENT_ENDPOINTS.LIST, { params });
    return unwrapList<StockOutOrder>(res);
  },

  async getDetail(id: string) {
    const res = await axiosClient.get(STOCK_OUT_MANAGEMENT_ENDPOINTS.DETAIL(id));
    return unwrap<StockOutOrder>(res);
  },

  async create(data: Partial<StockOutOrder>) {
    const res = await axiosClient.post(STOCK_OUT_MANAGEMENT_ENDPOINTS.CREATE, data);
    return unwrap<StockOutOrder>(res);
  },

  async confirm(id: string) {
    const res = await axiosClient.patch(STOCK_OUT_MANAGEMENT_ENDPOINTS.CONFIRM(id));
    return unwrap<StockOutOrder>(res);
  },

  async cancel(id: string, reason?: string) {
    const res = await axiosClient.patch(STOCK_OUT_MANAGEMENT_ENDPOINTS.CANCEL(id), { reason });
    return unwrap<StockOutOrder>(res);
  },

  async addItem(id: string, item: StockOutItem) {
    const res = await axiosClient.post(STOCK_OUT_MANAGEMENT_ENDPOINTS.ADD_ITEM(id), item);
    return unwrap<StockOutItem>(res);
  },

  async removeItem(id: string, itemId: string) {
    const res = await axiosClient.delete(
      STOCK_OUT_MANAGEMENT_ENDPOINTS.DELETE_ITEM(id, itemId)
    );
    return unwrap<{ success: boolean }>(res);
  },

  async getItems(id: string) {
    const res = await axiosClient.get(STOCK_OUT_ENDPOINTS.ITEMS(id));
    return unwrapList<StockOutItem>(res);
  },

  async getStats(params: StockOutStatsParams = {}) {
    const res = await axiosClient.get(STATS_URL, { params });
    return unwrap<any>(res);
  },
};

export default stockOutService;
