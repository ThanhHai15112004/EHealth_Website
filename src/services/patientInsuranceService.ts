import axiosClient from "@/api/axiosClient";
import {
  INSURANCE_PROVIDER_ENDPOINTS,
  PATIENT_ENDPOINTS_EXT,
  PATIENT_INSURANCE_ENDPOINTS,
  PATIENT_INSURANCE_EXT_ENDPOINTS,
} from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface InsuranceProvider {
  insurance_providers_id: string;
  provider_code?: string;
  provider_name: string;
  insurance_type?: string;
  is_active?: boolean;
}

export interface PatientInsuranceRecord {
  patient_insurances_id: string;
  patient_id: string;
  provider_id: string;
  provider_name?: string;
  insurance_number: string;
  start_date: string;
  end_date: string;
  coverage_percent?: number;
  is_primary?: boolean;
  is_active?: boolean;
  insurance_type?: string;
  created_at?: string;
  updated_at?: string;
}

export const patientInsuranceService = {
  getList: async (params?: any) => {
    const res = await axiosClient.get(PATIENT_INSURANCE_ENDPOINTS.LIST, { params });
    return unwrapList<PatientInsuranceRecord>(res);
  },

  getActive: async (params?: any) => {
    const res = await axiosClient.get(PATIENT_INSURANCE_ENDPOINTS.ACTIVE, { params });
    return unwrapList<PatientInsuranceRecord>(res);
  },

  getExpired: async (params?: any) => {
    const res = await axiosClient.get("/api/patient-insurances/expired", { params });
    return unwrapList<PatientInsuranceRecord>(res);
  },

  getDetail: async (id: string) => {
    const res = await axiosClient.get(PATIENT_INSURANCE_ENDPOINTS.DETAIL(id));
    return unwrap<PatientInsuranceRecord>(res);
  },

  getHistory: async (id: string, params?: any) => {
    const res = await axiosClient.get(PATIENT_INSURANCE_ENDPOINTS.HISTORY(id), { params });
    return unwrapList<any>(res);
  },

  create: async (payload: any) => {
    const res = await axiosClient.post(PATIENT_INSURANCE_EXT_ENDPOINTS.CREATE, payload);
    return unwrap<PatientInsuranceRecord>(res);
  },

  createForPatient: async (patientId: string, payload: any) => {
    const res = await axiosClient.post(PATIENT_ENDPOINTS_EXT.ADD_INSURANCE(patientId), payload);
    return unwrap<PatientInsuranceRecord>(res);
  },

  update: async (id: string, payload: any) => {
    const res = await axiosClient.put(PATIENT_INSURANCE_EXT_ENDPOINTS.UPDATE(id), payload);
    return unwrap<PatientInsuranceRecord>(res);
  },

  delete: async (id: string) => {
    const res = await axiosClient.delete(PATIENT_INSURANCE_EXT_ENDPOINTS.DELETE(id));
    return unwrap<{ success?: boolean; message?: string }>(res);
  },

  getByPatient: async (patientId: string) => {
    const res = await axiosClient.get(PATIENT_ENDPOINTS_EXT.INSURANCES(patientId));
    return unwrapList<PatientInsuranceRecord>(res);
  },

  getProviders: async (params?: any) => {
    const res = await axiosClient.get(INSURANCE_PROVIDER_ENDPOINTS.LIST, { params });
    return unwrapList<InsuranceProvider>(res);
  },
};
