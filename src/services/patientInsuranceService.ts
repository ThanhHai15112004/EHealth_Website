import axiosClient from "@/api/axiosClient";
import { PATIENT_INSURANCE_ENDPOINTS, PATIENT_INSURANCE_EXT_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export const patientInsuranceService = {
  getList: async (params?: any) => {
    const res = await axiosClient.get(PATIENT_INSURANCE_ENDPOINTS.LIST, { params });
    return unwrapList(res);
  },

  getActive: async (params?: any) => {
    const res = await axiosClient.get(PATIENT_INSURANCE_ENDPOINTS.ACTIVE, { params });
    return unwrapList(res);
  },

  getDetail: async (id: string) => {
    const res = await axiosClient.get(PATIENT_INSURANCE_ENDPOINTS.DETAIL(id));
    return unwrap(res);
  },

  getHistory: async (id: string, params?: any) => {
    const res = await axiosClient.get(PATIENT_INSURANCE_ENDPOINTS.HISTORY(id), { params });
    return unwrapList(res);
  },

  create: async (payload: any) => {
    const res = await axiosClient.post(PATIENT_INSURANCE_EXT_ENDPOINTS.CREATE, payload);
    return unwrap(res);
  },
};
