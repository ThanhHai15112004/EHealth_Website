import axiosClient from "@/api/axiosClient";
import { MEDICAL_ORDER_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface MedicalOrder {
  id: string;
  encounterId?: string;
  patientId?: string;
  serviceId?: string;
  serviceName?: string;
  status?: string;
  result?: any;
  [key: string]: any;
}

export interface MedicalService {
  id: string;
  code?: string;
  name: string;
  [key: string]: any;
}

export const medicalOrderService = {
  getByEncounter: async (encounterId: string, params?: any) => {
    const res = await axiosClient.get(
      MEDICAL_ORDER_ENDPOINTS.BY_ENCOUNTER(encounterId),
      { params }
    );
    return unwrapList<MedicalOrder>(res);
  },

  getByPatient: async (patientId: string, params?: any) => {
    const res = await axiosClient.get(
      MEDICAL_ORDER_ENDPOINTS.BY_PATIENT(patientId),
      { params }
    );
    return unwrapList<MedicalOrder>(res);
  },

  getPending: async (params?: any) => {
    const res = await axiosClient.get(MEDICAL_ORDER_ENDPOINTS.PENDING, {
      params,
    });
    return unwrapList<MedicalOrder>(res);
  },

  getDetail: async (orderId: string) => {
    const res = await axiosClient.get(MEDICAL_ORDER_ENDPOINTS.DETAIL(orderId));
    return unwrap<MedicalOrder>(res);
  },

  getSummary: async (encounterId: string) => {
    const res = await axiosClient.get(
      MEDICAL_ORDER_ENDPOINTS.SUMMARY(encounterId)
    );
    return unwrap<any>(res);
  },

  update: async (orderId: string, data: Partial<MedicalOrder>) => {
    const res = await axiosClient.put(
      MEDICAL_ORDER_ENDPOINTS.UPDATE(orderId),
      data
    );
    return unwrap<MedicalOrder>(res);
  },

  cancel: async (orderId: string, reason: string) => {
    const res = await axiosClient.post(
      MEDICAL_ORDER_ENDPOINTS.CANCEL(orderId),
      { reason }
    );
    return unwrap<MedicalOrder>(res);
  },

  start: async (orderId: string) => {
    const res = await axiosClient.post(
      MEDICAL_ORDER_ENDPOINTS.START(orderId),
      {}
    );
    return unwrap<MedicalOrder>(res);
  },

  saveResult: async (orderId: string, data: any) => {
    const res = await axiosClient.post(
      MEDICAL_ORDER_ENDPOINTS.RESULT(orderId),
      data
    );
    return unwrap<MedicalOrder>(res);
  },

  searchServices: async (query: string) => {
    const res = await axiosClient.get(MEDICAL_ORDER_ENDPOINTS.SEARCH_SERVICES, {
      params: { q: query },
    });
    return unwrapList<MedicalService>(res);
  },

  create: async (encounterId: string, data: Partial<MedicalOrder>) => {
    const res = await axiosClient.post(
      MEDICAL_ORDER_ENDPOINTS.BY_ENCOUNTER(encounterId),
      data
    );
    return unwrap<MedicalOrder>(res);
  },
};

export default medicalOrderService;
