import axiosClient from "@/api/axiosClient";
import { TREATMENT_PROGRESS_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

export interface TreatmentPlan {
  id: string;
  patientId: string;
  title?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface TreatmentNote {
  id: string;
  planId: string;
  content: string;
  createdAt?: string;
  [key: string]: any;
}

export interface FollowUp {
  id: string;
  planId: string;
  scheduledAt?: string;
  status?: string;
  [key: string]: any;
}

export const treatmentProgressService = {
  getList: async (params?: any) => {
    const res = await axiosClient.get(TREATMENT_PROGRESS_ENDPOINTS.LIST, {
      params,
    });
    return unwrapList<TreatmentPlan>(res);
  },

  getByPatient: async (patientId: string, params?: any) => {
    const res = await axiosClient.get(
      TREATMENT_PROGRESS_ENDPOINTS.BY_PATIENT(patientId),
      { params }
    );
    return unwrapList<TreatmentPlan>(res);
  },

  getDetail: async (planId: string) => {
    const res = await axiosClient.get(
      TREATMENT_PROGRESS_ENDPOINTS.DETAIL(planId)
    );
    return unwrap<TreatmentPlan>(res);
  },

  createPlan: async (data: Partial<TreatmentPlan>) => {
    const res = await axiosClient.post(
      TREATMENT_PROGRESS_ENDPOINTS.CREATE,
      data
    );
    return unwrap<TreatmentPlan>(res);
  },

  updatePlan: async (planId: string, data: Partial<TreatmentPlan>) => {
    const res = await axiosClient.put(
      TREATMENT_PROGRESS_ENDPOINTS.DETAIL(planId),
      data
    );
    return unwrap<TreatmentPlan>(res);
  },

  deletePlan: async (planId: string) => {
    const res = await axiosClient.delete(
      TREATMENT_PROGRESS_ENDPOINTS.DETAIL(planId)
    );
    return unwrap<{ success: boolean }>(res);
  },

  getNotes: async (planId: string, params?: any) => {
    const res = await axiosClient.get(
      TREATMENT_PROGRESS_ENDPOINTS.NOTES(planId),
      { params }
    );
    return unwrapList<TreatmentNote>(res);
  },

  addNote: async (planId: string, data: Partial<TreatmentNote>) => {
    const res = await axiosClient.post(
      TREATMENT_PROGRESS_ENDPOINTS.NOTES(planId),
      data
    );
    return unwrap<TreatmentNote>(res);
  },

  getFollowUps: async (planId: string, params?: any) => {
    const res = await axiosClient.get(
      TREATMENT_PROGRESS_ENDPOINTS.FOLLOW_UPS(planId),
      { params }
    );
    return unwrapList<FollowUp>(res);
  },

  addFollowUp: async (planId: string, data: Partial<FollowUp>) => {
    const res = await axiosClient.post(
      TREATMENT_PROGRESS_ENDPOINTS.FOLLOW_UPS(planId),
      data
    );
    return unwrap<FollowUp>(res);
  },

  getSummary: async (planId: string) => {
    const res = await axiosClient.get(
      TREATMENT_PROGRESS_ENDPOINTS.SUMMARY(planId)
    );
    return unwrap<any>(res);
  },
};

export default treatmentProgressService;
