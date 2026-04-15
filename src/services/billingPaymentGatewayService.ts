import axiosClient from "@/api/axiosClient";
import { BILLING_PAYMENT_GATEWAY_ENDPOINTS } from "@/api/endpoints";
import { unwrap, unwrapList } from "@/api/response";

// ============================================================
// Billing Payment Gateway Service (9.3 - SePay)
// Tạo QR, theo dõi trạng thái & cấu hình gateway
// ============================================================

export interface PaymentQR {
    orderId?: string;
    qrCode?: string;
    qrUrl?: string;
    amount?: number;
    expiresAt?: string;
    [key: string]: any;
}

export interface PaymentOrder {
    id: string;
    invoiceId?: string;
    amount?: number;
    status?: "pending" | "paid" | "cancelled" | "expired" | "failed";
    createdAt?: string;
    [key: string]: any;
}

export interface GatewayConfig {
    provider?: string;
    merchantId?: string;
    webhookUrl?: string;
    [key: string]: any;
}

export const billingPaymentGatewayService = {
    /** Tạo QR SePay cho hóa đơn */
    generateQR: async (invoiceId: string, amount: number) => {
        const res = await axiosClient.post(BILLING_PAYMENT_GATEWAY_ENDPOINTS.GENERATE_QR, {
            invoiceId,
            amount,
        });
        return unwrap<PaymentQR>(res);
    },

    /** Kiểm tra trạng thái QR/order (polling) */
    getQRStatus: async (orderId: string) => {
        const res = await axiosClient.get(BILLING_PAYMENT_GATEWAY_ENDPOINTS.ORDER_STATUS(orderId));
        return unwrap<PaymentOrder>(res);
    },

    /** Danh sách order */
    getOrders: async (params?: Record<string, any>) => {
        const res = await axiosClient.get(
            BILLING_PAYMENT_GATEWAY_ENDPOINTS.ONLINE_HISTORY,
            { params }
        );
        return unwrapList<PaymentOrder>(res);
    },

    /** Chi tiết 1 order */
    getOrderDetail: async (id: string) => {
        const res = await axiosClient.get(BILLING_PAYMENT_GATEWAY_ENDPOINTS.ORDER_DETAIL(id));
        return unwrap<PaymentOrder>(res);
    },

    /** Huỷ order */
    cancelOrder: async (id: string) => {
        const res = await axiosClient.post(BILLING_PAYMENT_GATEWAY_ENDPOINTS.CANCEL_ORDER(id));
        return unwrap<PaymentOrder>(res);
    },

    /** Lấy cấu hình gateway (admin) */
    getGatewayConfig: async () => {
        const res = await axiosClient.get(BILLING_PAYMENT_GATEWAY_ENDPOINTS.GATEWAY_CONFIG);
        return unwrap<GatewayConfig>(res);
    },

    /** Cập nhật cấu hình gateway (admin) */
    updateGatewayConfig: async (data: Record<string, any>) => {
        const res = await axiosClient.put(BILLING_PAYMENT_GATEWAY_ENDPOINTS.GATEWAY_CONFIG, data);
        return unwrap<GatewayConfig>(res);
    },

    /**
     * Xử lý webhook (INTERNAL ONLY — không gọi từ UI).
     * Đặt ở đây để typed helper cho dev/test môi trường local.
     */
    handleWebhook: async (data: Record<string, any>) => {
        const res = await axiosClient.post(BILLING_PAYMENT_GATEWAY_ENDPOINTS.WEBHOOK_SEPAY, data);
        return unwrap<{ success: boolean }>(res);
    },
};

export default billingPaymentGatewayService;
