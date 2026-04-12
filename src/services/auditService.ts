import { ActivityLog } from "@/types";

export const auditService = {
    getLogs: async (params?: { limit?: number }) => {
        // Return mock data that shapes what the UI expects
        return {
            success: true,
            data: {
                items: [],
            }
        };
    }
};
