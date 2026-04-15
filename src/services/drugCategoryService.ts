import axiosClient from "@/api/axiosClient";
import { DRUG_CATEGORY_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============ Types ============
export interface DrugCategory {
  id: string;
  name: string;
  code?: string;
  description?: string;
  parentId?: string | null;
  isActive?: boolean;
  [key: string]: any;
}

export interface DrugCategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
  [key: string]: any;
}

// Local fallback: toggle endpoint (nếu BE hỗ trợ)
const TOGGLE_URL = (id: string) => `/api/pharmacy/categories/${id}/toggle`;

// ============ Service ============
export const drugCategoryService = {
  async getList(params: DrugCategoryListParams = {}) {
    const res = await axiosClient.get(DRUG_CATEGORY_ENDPOINTS.LIST, { params });
    return unwrapList<DrugCategory>(res);
  },

  async getDetail(id: string) {
    const res = await axiosClient.get(DRUG_CATEGORY_ENDPOINTS.DETAIL(id));
    return unwrap<DrugCategory>(res);
  },

  async create(data: Partial<DrugCategory>) {
    const res = await axiosClient.post(DRUG_CATEGORY_ENDPOINTS.CREATE, data);
    return unwrap<DrugCategory>(res);
  },

  async update(id: string, data: Partial<DrugCategory>) {
    const res = await axiosClient.put(DRUG_CATEGORY_ENDPOINTS.UPDATE(id), data);
    return unwrap<DrugCategory>(res);
  },

  async delete(id: string) {
    const res = await axiosClient.delete(DRUG_CATEGORY_ENDPOINTS.DELETE(id));
    return unwrap<{ success: boolean }>(res);
  },

  async toggle(id: string) {
    const res = await axiosClient.patch(TOGGLE_URL(id));
    return unwrap<DrugCategory>(res);
  },

  async exportExcel() {
    const res = await axiosClient.get(DRUG_CATEGORY_ENDPOINTS.EXPORT, {
      responseType: "blob",
    });
    return res.data as Blob;
  },

  async importExcel(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosClient.post(DRUG_CATEGORY_ENDPOINTS.IMPORT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap<any>(res);
  },
};

export default drugCategoryService;
