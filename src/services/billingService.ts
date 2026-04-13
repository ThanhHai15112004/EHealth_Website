import axiosClient from '@/api/axiosClient';
import { BILLING_ENDPOINTS } from '@/api/endpoints';

export const billingService = {
    getInvoices: (params?: Record<string, any>) =>
        axiosClient.get(BILLING_ENDPOINTS.LIST, { params }),

    getDetail: (id: string) =>
        axiosClient.get(BILLING_ENDPOINTS.DETAIL(id)),

    createInvoice: (data: Record<string, any>) =>
        axiosClient.post(BILLING_ENDPOINTS.CREATE, data),

    pay: (id: string, data: Record<string, any>) =>
        axiosClient.post(BILLING_ENDPOINTS.PAY, { invoiceId: id, ...data }),

    generateQR: (data: { invoice_id: string; amount?: number; description?: string }) =>
        axiosClient.post(BILLING_ENDPOINTS.PAY_QR, data),
        
    getOrderStatus: (orderId: string) => 
        axiosClient.get(BILLING_ENDPOINTS.PAY_ORDER_STATUS(orderId)),

    refund: (id: string, data: Record<string, any>) =>
        axiosClient.post(BILLING_ENDPOINTS.REFUND(id), data),

    getTransactions: (params?: Record<string, any>) =>
        axiosClient.get(BILLING_ENDPOINTS.TRANSACTIONS, { params }),

    reconcile: (params?: Record<string, any>) =>
        axiosClient.get(BILLING_ENDPOINTS.RECONCILIATION, { params }),

    getInvoicesByPatient: (patientId: string, params?: Record<string, any>) =>
        axiosClient.get(BILLING_ENDPOINTS.BY_PATIENT(patientId), { params }),

    getPaymentsByPatient: (patientId: string, params?: Record<string, any>) =>
        axiosClient.get(BILLING_ENDPOINTS.PAYMENTS, { params: { patient_id: patientId, ...params } }),
};
