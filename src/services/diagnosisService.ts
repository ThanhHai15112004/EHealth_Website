import axiosClient from "@/api/axiosClient";
import { DIAGNOSIS_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface Diagnosis {
  id: string;
  encounterId?: string;
  patientId?: string;
  icdCode?: string;
  icdName?: string;
  type?: string;
  conclusion?: string;
  [key: string]: any;
}

export interface ICDCode {
  code: string;
  name: string;
  [key: string]: any;
}

export const diagnosisService = {
  getByEncounter: async (encounterId: string, params?: any) => {
    const res = await axiosClient.get(
      DIAGNOSIS_ENDPOINTS.BY_ENCOUNTER(encounterId),
      { params }
    );
    return unwrapList<Diagnosis>(res);
  },

  getByPatient: async (patientId: string, params?: any) => {
    const res = await axiosClient.get(
      DIAGNOSIS_ENDPOINTS.BY_PATIENT(patientId),
      { params }
    );
    return unwrapList<Diagnosis>(res);
  },

  getDetail: async (diagnosisId: string) => {
    const res = await axiosClient.get(DIAGNOSIS_ENDPOINTS.DETAIL(diagnosisId));
    return unwrap<Diagnosis>(res);
  },

  updateType: async (diagnosisId: string, data: { type: string; [key: string]: any }) => {
    const res = await axiosClient.patch(
      DIAGNOSIS_ENDPOINTS.UPDATE_TYPE(diagnosisId),
      data
    );
    return unwrap<Diagnosis>(res);
  },

  updateConclusion: async (
    encounterId: string,
    data: { conclusion: string; [key: string]: any }
  ) => {
    const res = await axiosClient.patch(
      DIAGNOSIS_ENDPOINTS.CONCLUSION(encounterId),
      data
    );
    return unwrap<Diagnosis>(res);
  },

  searchICD: async (query: string) => {
    const res = await axiosClient.get(DIAGNOSIS_ENDPOINTS.SEARCH_ICD, {
      params: { q: query },
    });
    return unwrapList<ICDCode>(res);
  },

  create: async (encounterId: string, data: Partial<Diagnosis>) => {
    const res = await axiosClient.post(
      DIAGNOSIS_ENDPOINTS.BY_ENCOUNTER(encounterId),
      data
    );
    return unwrap<Diagnosis>(res);
  },
};

export default diagnosisService;
