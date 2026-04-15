import axiosClient from "@/api/axiosClient";
import { BILLING_CASHIER_AUTH_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============================================================
// Billing Cashier Auth Service (9.9)
// Profile thu ngân, giới hạn, ca làm việc & nhật ký
// ============================================================

export interface CashierProfile {
    id: string;
    userId?: string;
    code?: string;
    fullName?: string;
    roles?: string[];
    active?: boolean;
    [key: string]: any;
}

export interface CashierLimit {
    profileId?: string;
    dailyLimit?: number;
    transactionLimit?: number;
    [key: string]: any;
}

export interface CashierShift {
    id: string;
    profileId?: string;
    status?: "open" | "closed" | "locked";
    openedAt?: string;
    closedAt?: string;
    [key: string]: any;
}

export interface CashierLog {
    id: string;
    action?: string;
    createdAt?: string;
    [key: string]: any;
}

// Local fallback (endpoints.ts chưa có riêng các route này)
const LOCAL = {
    SHIFTS_BY_CASHIER: (cashierId: string) => `/api/billing/cashier-auth/shifts?profileId=${cashierId}`,
    OPEN_SHIFT: "/api/billing/cashier-auth/shifts/open",
    CLOSE_SHIFT: (shiftId: string) => `/api/billing/cashier-auth/shifts/${shiftId}/close`,
};

export const billingCashierAuthService = {
    // ── Profile ───────────────────────────────────────────────
    getProfiles: async (params?: Record<string, any>) => {
        const res = await axiosClient.get(BILLING_CASHIER_AUTH_ENDPOINTS.PROFILES, { params });
        return unwrapList<CashierProfile>(res);
    },
    getProfileDetail: async (id: string) => {
        const res = await axiosClient.get(BILLING_CASHIER_AUTH_ENDPOINTS.PROFILE_DETAIL(id));
        return unwrap<CashierProfile>(res);
    },
    createProfile: async (data: Record<string, any>) => {
        const res = await axiosClient.post(BILLING_CASHIER_AUTH_ENDPOINTS.CREATE_PROFILE, data);
        return unwrap<CashierProfile>(res);
    },
    updateProfile: async (id: string, data: Record<string, any>) => {
        const res = await axiosClient.put(BILLING_CASHIER_AUTH_ENDPOINTS.UPDATE_PROFILE(id), data);
        return unwrap<CashierProfile>(res);
    },

    // ── Limits ────────────────────────────────────────────────
    getLimits: async (cashierId: string) => {
        const res = await axiosClient.get(BILLING_CASHIER_AUTH_ENDPOINTS.LIMIT(cashierId));
        return unwrap<CashierLimit>(res);
    },
    updateLimits: async (cashierId: string, data: Record<string, any>) => {
        const res = await axiosClient.put(BILLING_CASHIER_AUTH_ENDPOINTS.LIMIT(cashierId), data);
        return unwrap<CashierLimit>(res);
    },

    // ── Shifts ────────────────────────────────────────────────
    getShifts: async (cashierId: string) => {
        const res = await axiosClient.get(LOCAL.SHIFTS_BY_CASHIER(cashierId));
        return unwrapList<CashierShift>(res);
    },
    openShift: async (data: Record<string, any>) => {
        const res = await axiosClient.post(LOCAL.OPEN_SHIFT, data);
        return unwrap<CashierShift>(res);
    },
    closeShift: async (shiftId: string, data?: Record<string, any>) => {
        const res = await axiosClient.patch(LOCAL.CLOSE_SHIFT(shiftId), data ?? {});
        return unwrap<CashierShift>(res);
    },
    lockShift: async (shiftId: string) => {
        const res = await axiosClient.patch(BILLING_CASHIER_AUTH_ENDPOINTS.LOCK_SHIFT(shiftId));
        return unwrap<CashierShift>(res);
    },
    unlockShift: async (shiftId: string) => {
        const res = await axiosClient.patch(BILLING_CASHIER_AUTH_ENDPOINTS.UNLOCK_SHIFT(shiftId));
        return unwrap<CashierShift>(res);
    },
    handoverShift: async (fromId: string, toId: string) => {
        const res = await axiosClient.patch(
            BILLING_CASHIER_AUTH_ENDPOINTS.HANDOVER_SHIFT(fromId),
            { toProfileId: toId }
        );
        return unwrap<CashierShift>(res);
    },

    // ── Logs ──────────────────────────────────────────────────
    getLogs: async (cashierId: string, params?: Record<string, any>) => {
        const res = await axiosClient.get(
            BILLING_CASHIER_AUTH_ENDPOINTS.LOGS_BY_PROFILE(cashierId),
            { params }
        );
        return unwrapList<CashierLog>(res);
    },
};

export default billingCashierAuthService;
