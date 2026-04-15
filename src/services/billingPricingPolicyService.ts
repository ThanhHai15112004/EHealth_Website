import axiosClient from "@/api/axiosClient";
import { BILLING_PRICING_POLICY_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============================================================
// Billing Pricing Policy Service (9.8)
// Giảm giá, voucher, bundle & khuyến mãi
// ============================================================

export interface Discount {
    id: string;
    name?: string;
    type?: string;
    value?: number;
    active?: boolean;
    [key: string]: any;
}

export interface Voucher {
    id: string;
    code?: string;
    value?: number;
    expiresAt?: string;
    [key: string]: any;
}

export interface Bundle {
    id: string;
    name?: string;
    items?: any[];
    price?: number;
    [key: string]: any;
}

export interface Promotion {
    id: string;
    name?: string;
    active?: boolean;
    [key: string]: any;
}

// Local fallback cho endpoint applyPolicy / deactivatePromotion (không có sẵn trong endpoints.ts)
const LOCAL = {
    DEACTIVATE_PROMOTION: (id: string) => `/api/billing/pricing-policies/promotions/${id}/deactivate`,
    APPLY_POLICY: (invoiceId: string) => `/api/billing/pricing-policies/apply/${invoiceId}`,
};

export const billingPricingPolicyService = {
    // ── Discounts ─────────────────────────────────────────────
    getDiscounts: async (params?: Record<string, any>) => {
        const res = await axiosClient.get(BILLING_PRICING_POLICY_ENDPOINTS.DISCOUNTS, { params });
        return unwrapList<Discount>(res);
    },
    createDiscount: async (data: Record<string, any>) => {
        const res = await axiosClient.post(BILLING_PRICING_POLICY_ENDPOINTS.CREATE_DISCOUNT, data);
        return unwrap<Discount>(res);
    },
    updateDiscount: async (id: string, data: Record<string, any>) => {
        const res = await axiosClient.put(BILLING_PRICING_POLICY_ENDPOINTS.UPDATE_DISCOUNT(id), data);
        return unwrap<Discount>(res);
    },
    deleteDiscount: async (id: string) => {
        const res = await axiosClient.delete(BILLING_PRICING_POLICY_ENDPOINTS.DELETE_DISCOUNT(id));
        return unwrap<{ success: boolean }>(res);
    },

    // ── Vouchers ──────────────────────────────────────────────
    getVouchers: async (params?: Record<string, any>) => {
        const res = await axiosClient.get(BILLING_PRICING_POLICY_ENDPOINTS.VOUCHERS, { params });
        return unwrapList<Voucher>(res);
    },
    createVoucher: async (data: Record<string, any>) => {
        const res = await axiosClient.post(BILLING_PRICING_POLICY_ENDPOINTS.CREATE_VOUCHER, data);
        return unwrap<Voucher>(res);
    },
    redeemVoucher: async (code: string) => {
        const res = await axiosClient.post(BILLING_PRICING_POLICY_ENDPOINTS.REDEEM_VOUCHER, { code });
        return unwrap<Voucher>(res);
    },

    // ── Bundles ───────────────────────────────────────────────
    getBundles: async (params?: Record<string, any>) => {
        const res = await axiosClient.get(BILLING_PRICING_POLICY_ENDPOINTS.BUNDLES, { params });
        return unwrapList<Bundle>(res);
    },
    createBundle: async (data: Record<string, any>) => {
        const res = await axiosClient.post(BILLING_PRICING_POLICY_ENDPOINTS.CREATE_BUNDLE, data);
        return unwrap<Bundle>(res);
    },

    // ── Promotions ────────────────────────────────────────────
    getPromotions: async (params?: Record<string, any>) => {
        const res = await axiosClient.get(BILLING_PRICING_POLICY_ENDPOINTS.ACTIVE_PROMOTIONS, { params });
        return unwrapList<Promotion>(res);
    },
    createPromotion: async (data: Record<string, any>) => {
        // endpoint CREATE promotion chưa có, dùng discounts tạo theo type=promotion
        const res = await axiosClient.post(BILLING_PRICING_POLICY_ENDPOINTS.CREATE_DISCOUNT, {
            ...data,
            kind: "promotion",
        });
        return unwrap<Promotion>(res);
    },
    deactivatePromotion: async (id: string) => {
        const res = await axiosClient.patch(LOCAL.DEACTIVATE_PROMOTION(id));
        return unwrap<Promotion>(res);
    },

    // ── Apply policy ──────────────────────────────────────────
    applyPolicy: async (invoiceId: string, policyId: string) => {
        const res = await axiosClient.post(LOCAL.APPLY_POLICY(invoiceId), { policyId });
        return unwrap<any>(res);
    },
};

export default billingPricingPolicyService;
