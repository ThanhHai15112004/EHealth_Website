import axiosClient from "@/api/axiosClient";
import { BILLING_RECONCILIATION_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============================================================
// Billing Reconciliation Service (9.6)
// Quản lý phiên đối soát, quyết toán & báo cáo chênh lệch
// ============================================================

export interface ReconciliationSession {
    id: string;
    code?: string;
    status?: "open" | "reviewing" | "approved" | "rejected" | "closed";
    shiftId?: string;
    openedAt?: string;
    closedAt?: string;
    totalAmount?: number;
    discrepancyAmount?: number;
    [key: string]: any;
}

export interface ReconciliationSettlement {
    id: string;
    sessionId?: string;
    status?: string;
    amount?: number;
    [key: string]: any;
}

export interface DiscrepancyReport {
    sessionId?: string;
    items?: Array<Record<string, any>>;
    totalDiscrepancy?: number;
    [key: string]: any;
}

export const billingReconciliationService = {
    /** Danh sách phiên đối soát */
    getSessions: async (params?: Record<string, any>) => {
        const res = await axiosClient.get(BILLING_RECONCILIATION_ENDPOINTS.SESSIONS, { params });
        return unwrapList<ReconciliationSession>(res);
    },

    /** Chi tiết phiên đối soát */
    getSessionDetail: async (id: string) => {
        const res = await axiosClient.get(BILLING_RECONCILIATION_ENDPOINTS.SESSION_DETAIL(id));
        return unwrap<ReconciliationSession>(res);
    },

    /** Mở phiên đối soát (chạy online hoặc theo shift) */
    createSession: async (data: Record<string, any>) => {
        const url = data?.shiftId
            ? BILLING_RECONCILIATION_ENDPOINTS.RUN_SHIFT(data.shiftId)
            : BILLING_RECONCILIATION_ENDPOINTS.RUN_ONLINE;
        const res = await axiosClient.post(url, data);
        return unwrap<ReconciliationSession>(res);
    },

    /** Đóng / review phiên đối soát */
    closeSession: async (id: string, payload?: Record<string, any>) => {
        const res = await axiosClient.patch(
            BILLING_RECONCILIATION_ENDPOINTS.REVIEW_SESSION(id),
            payload ?? {}
        );
        return unwrap<ReconciliationSession>(res);
    },

    /** Danh sách quyết toán thuộc 1 phiên */
    getSettlements: async (sessionId: string) => {
        const res = await axiosClient.get(BILLING_RECONCILIATION_ENDPOINTS.SETTLEMENTS, {
            params: { sessionId },
        });
        return unwrapList<ReconciliationSettlement>(res);
    },

    /** Tạo quyết toán mới */
    createSettlement: async (data: Record<string, any>) => {
        const res = await axiosClient.post(
            BILLING_RECONCILIATION_ENDPOINTS.CREATE_SETTLEMENT,
            data
        );
        return unwrap<ReconciliationSettlement>(res);
    },

    /** Duyệt quyết toán (admin) */
    approveSettlement: async (id: string, payload?: Record<string, any>) => {
        const res = await axiosClient.patch(
            BILLING_RECONCILIATION_ENDPOINTS.APPROVE_SETTLEMENT(id),
            payload ?? {}
        );
        return unwrap<ReconciliationSettlement>(res);
    },

    /** Báo cáo chênh lệch */
    getDiscrepancyReport: async (sessionId: string) => {
        const res = await axiosClient.get(
            BILLING_RECONCILIATION_ENDPOINTS.DISCREPANCY_REPORT,
            { params: { sessionId } }
        );
        return unwrap<DiscrepancyReport>(res);
    },

    /** Export PDF/Excel */
    exportReport: async (sessionId: string, format: "pdf" | "excel" = "pdf") => {
        const res = await axiosClient.get(
            BILLING_RECONCILIATION_ENDPOINTS.EXPORT_SETTLEMENT(sessionId),
            { params: { format }, responseType: "blob" }
        );
        return res.data as Blob;
    },
};

export default billingReconciliationService;
