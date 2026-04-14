import axiosClient from "@/api/axiosClient";
import { MED_INSTRUCTION_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============ Types ============
export interface MedInstructionTemplate {
  id: string;
  name: string;
  content?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  notes?: string;
  [key: string]: any;
}

export interface MedInstructionTemplateListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export interface DrugDefaultInstruction {
  drugId: string;
  templateId?: string;
  template?: MedInstructionTemplate;
  [key: string]: any;
}

// ============ Service ============
export const medInstructionService = {
  async getTemplates(params: MedInstructionTemplateListParams = {}) {
    const res = await axiosClient.get(MED_INSTRUCTION_ENDPOINTS.TEMPLATES, { params });
    return unwrapList<MedInstructionTemplate>(res);
  },

  async getTemplate(id: string) {
    const res = await axiosClient.get(`${MED_INSTRUCTION_ENDPOINTS.TEMPLATES}/${id}`);
    return unwrap<MedInstructionTemplate>(res);
  },

  async createTemplate(data: Partial<MedInstructionTemplate>) {
    const res = await axiosClient.post(MED_INSTRUCTION_ENDPOINTS.CREATE_TEMPLATE, data);
    return unwrap<MedInstructionTemplate>(res);
  },

  async updateTemplate(id: string, data: Partial<MedInstructionTemplate>) {
    const res = await axiosClient.patch(
      MED_INSTRUCTION_ENDPOINTS.UPDATE_TEMPLATE(id),
      data
    );
    return unwrap<MedInstructionTemplate>(res);
  },

  async deleteTemplate(id: string) {
    const res = await axiosClient.delete(MED_INSTRUCTION_ENDPOINTS.DELETE_TEMPLATE(id));
    return unwrap<{ success: boolean }>(res);
  },

  async getDefaults(drugId: string) {
    const res = await axiosClient.get(MED_INSTRUCTION_ENDPOINTS.DRUG_DEFAULT(drugId));
    return unwrap<DrugDefaultInstruction>(res);
  },

  async setDefault(drugId: string, templateId: string) {
    const res = await axiosClient.put(
      MED_INSTRUCTION_ENDPOINTS.UPSERT_DRUG_DEFAULT(drugId),
      { templateId }
    );
    return unwrap<DrugDefaultInstruction>(res);
  },
};

export default medInstructionService;
