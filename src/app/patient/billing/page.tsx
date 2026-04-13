"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPatientsByAccountId, type Patient } from "@/services/patientService";
import { billingService } from "@/services/billingService";
import { medicalServiceApi, type MedicalService } from "@/services/medicalService";
import {
    type Invoice, type Transaction
} from "@/data/patient-portal-mock";

const TABS = [
    { id: "pending", label: "Chờ thanh toán", icon: "pending_actions" },
    { id: "history", label: "Lịch sử", icon: "receipt_long" },
    { id: "prices", label: "Bảng giá", icon: "payments" },
];

const formatVND = (n: number | string) => {
    const val = Number(n);
    return (isNaN(val) ? 0 : val).toLocaleString("vi-VN") + "đ";
};

export default function BillingPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [priceCategory, setPriceCategory] = useState("all");
    const [profiles, setProfiles] = useState<Patient[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState("");
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [servicePrices, setServicePrices] = useState<MedicalService[]>([]);
    const [loading, setLoading] = useState(false);

    const [paymentQR, setPaymentQR] = useState<{ qr_code_url: string, payment_orders_id: string, amount: string, order_code: string, remaining_seconds?: number } | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<'VietQR' | 'VNPay' | 'MoMo'>('VietQR');
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [qrError, setQrError] = useState("");

    const handleGenerateQR = async (invoice: Invoice, method: 'VietQR' | 'VNPay' | 'MoMo') => {
        setCheckingStatus(true);
        setSelectedMethod(method);
        setQrError("");
        try {
            const res = await billingService.generateQR({
                invoice_id: invoice.id,
                description: `HDBN ${invoice.code}`
            });
            if (res.data?.success && res.data.data) {
                setPaymentQR(res.data.data);
                setTimeLeft(res.data.data.remaining_seconds || 0);
            } else {
                setQrError(res.data?.message || "Không thể tạo mã QR lúc này.");
            }
        } catch (error: any) {
            console.error("Lỗi tạo QR:", error);
            setQrError(error.response?.data?.message || "Đã có lỗi xảy ra khi tạo mã QR.");
        } finally {
            setCheckingStatus(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (paymentQR?.payment_orders_id) {
            interval = setInterval(async () => {
                try {
                    const res = await billingService.getOrderStatus(paymentQR.payment_orders_id);
                    if (res.data?.data?.status === 'PAID') {
                        clearInterval(interval);
                        alert("Thanh toán hóa đơn thành công!");
                        setShowPayModal(false);
                        setPaymentQR(null);
                        if (selectedInvoice) {
                            setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'paid' } : inv));
                        }
                        if (res.data?.data?.remaining_seconds !== undefined) {
                            // Only update if difference is noticeable to avoid UI jitter
                            setTimeLeft(prev => Math.abs(prev - res.data.data.remaining_seconds) > 5 ? res.data.data.remaining_seconds : prev);
                        }
                    } else if (res.data?.data?.status === 'CANCELLED' || res.data?.data?.status === 'EXPIRED') {
                        clearInterval(interval);
                        alert("Lệnh thanh toán đã bị hủy hoặc hết hạn.");
                        setPaymentQR(null);
                    }
                } catch (error) {
                    // Ignore transient errors
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [paymentQR, selectedInvoice]);

    // Local 1-second countdown timer
    useEffect(() => {
        if (!paymentQR || timeLeft <= 0) return;
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timerId);
    }, [paymentQR, timeLeft]);

    useEffect(() => {
        if (!user?.id) return;
        const loadProfiles = async () => {
            try {
                const res = await getPatientsByAccountId(user.id);
                if (res.success && res.data && res.data.length > 0) {
                    setProfiles(res.data);
                    const cachedId = sessionStorage.getItem("patientPortal_selectedProfileId");
                    const exists = res.data.some(p => p.id === cachedId);
                    setSelectedProfileId(exists ? cachedId! : res.data[0].id);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to load profiles", error);
                setLoading(false);
            }
        };
        loadProfiles();
    }, [user?.id]);

    useEffect(() => {
        if (!selectedProfileId) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch invoices
                const resInvoices = await billingService.getInvoicesByPatient(selectedProfileId).catch(() => ({ data: { data: [] } }));
                const backendInvoices = resInvoices.data?.data || [];
                
                if (backendInvoices.length > 0) {
                     const mappedInvoices: Invoice[] = backendInvoices.map((inv: any) => ({
                        id: inv.invoices_id,
                        code: inv.invoice_code || `INV-${inv.invoices_id.substring(0, 6)}`,
                        patientId: selectedProfileId,
                        date: new Date(inv.created_at).toLocaleDateString('vi-VN'),
                        doctorName: inv.created_by_name || "Bác sĩ",
                        department: inv.facility_name || "Khoa Khám bệnh",
                        total: parseFloat(inv.total_amount || 0),
                        status: inv.status === 'PAID' ? "paid" : inv.status === 'CANCELLED' ? "refunded" : "pending",
                        subtotal: parseFloat(inv.total_amount || 0) + parseFloat(inv.discount_amount || 0),
                        discount: parseFloat(inv.discount_amount || 0),
                        insuranceCovered: parseFloat(inv.insurance_amount || 0),
                        paidAt: inv.status === 'PAID' ? new Date(inv.updated_at).toLocaleDateString('vi-VN') : undefined,
                        paymentMethod: "Payment Gateway", // Fallback, could be fetched from payments
                        items: inv.items?.map((item: any) => ({
                            name: item.item_name,
                            quantity: item.quantity,
                            unitPrice: parseFloat(item.unit_price),
                            total: parseFloat(item.subtotal)
                        })) || []
                    }));
                    setInvoices(mappedInvoices);
                } else {
                     setInvoices([]);
                }
                
                // Fetch transactions
                const resTrans = await billingService.getTransactions({ patientId: selectedProfileId }).catch(() => ({ data: { data: [] } }));
                const backendTrans = resTrans.data?.data || [];
                if (backendTrans.length > 0) {
                    const mappedTrans: Transaction[] = backendTrans.map((tx: any) => ({
                        id: tx.payment_transactions_id,
                        invoiceCode: tx.invoice_code || "Unknown",
                        amount: parseFloat(tx.amount || 0),
                        type: tx.transaction_type === 'REFUND' ? "refund" : "payment",
                        date: new Date(tx.created_at).toLocaleDateString('vi-VN'),
                        method: tx.payment_method === 'CASH' ? "Tiền mặt" : tx.payment_method === 'CREDIT_CARD' ? "Thẻ tín dụng" : "Chuyển khoản",
                        status: tx.status === 'SUCCESS' ? "success" : "failed",
                        description: `Thanh toán hóa đơn ${tx.invoice_code || ''}`
                    }));
                    setTransactions(mappedTrans);
                } else {
                     setTransactions([]);
                }

                // Fetch medical services
                let resServices: any = await medicalServiceApi.getFacilityActiveServices("1").catch(() => null);
                if (!resServices?.data?.length) {
                    resServices = await medicalServiceApi.getMasterList({ limit: 100, status: 'active' }).catch(() => ({ data: [] }));
                }
                setServicePrices(resServices?.data || []);
            } catch (error) {
                console.error("Failed to fetch billing data", error);
                setInvoices([]);
                setTransactions([]);
                setServicePrices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedProfileId]);

    const pending = invoices.filter(i => i.status === "pending" || i.status === "overdue");
    const paid = invoices.filter(i => i.status === "paid" || i.status === "refunded");
    
    const getCategoryName = (s: any) => {
        const group = s.service_group || s.category_name || s.category;
        if (group === 'KHAM') return 'Khám bệnh';
        if (group === 'XN') return 'Xét nghiệm';
        if (group === 'CDHA') return 'Chẩn đoán hình ảnh';
        if (group === 'THUTHUAT') return 'Thủ thuật';
        return group || "Dịch vụ y tế";
    };

    const categories = ["all", ...Array.from(new Set(servicePrices.map(getCategoryName)))];

    const totalPending = pending.reduce((s, i) => s + i.total, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#121417] dark:text-white">Thanh toán & Hóa đơn</h1>
                    <p className="text-sm text-[#687582] mt-0.5">Quản lý hóa đơn, thanh toán và tra cứu bảng giá</p>
                </div>
                {totalPending > 0 && (
                    <div className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Chờ thanh toán</p>
                        <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{formatVND(totalPending)}</p>
                    </div>
                )}
            </div>

            {/* Profile Selector */}
            {profiles.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar">
                    {profiles.map(p => (
                        <div
                            key={p.id}
                            onClick={() => {
                                setSelectedProfileId(p.id)
                                sessionStorage.setItem("patientPortal_selectedProfileId", p.id);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-2xl border min-w-[240px] cursor-pointer transition-all snap-start ${selectedProfileId === p.id ? 'border-[#3C81C6] bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e242b] hover:border-blue-300 dark:hover:border-blue-800'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3C81C6] to-[#60a5fa] flex items-center justify-center text-white text-sm font-bold shadow-md shadow-[#3C81C6]/20 shrink-0">
                                {p.full_name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${selectedProfileId === p.id ? 'text-[#3C81C6]' : 'text-gray-900 dark:text-white'}`}>{p.full_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{(p as any).phone_number || (p as any).contact?.phone_number || "Chưa có SĐT"}</p>
                            </div>
                            {selectedProfileId === p.id && (
                                <span className="material-symbols-outlined text-[#3C81C6] shrink-0" style={{ fontSize: "20px" }}>check_circle</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Chờ thanh toán", value: pending.length, icon: "pending_actions", color: "from-amber-500 to-orange-500", amount: formatVND(totalPending) },
                    { label: "Đã thanh toán", value: paid.length, icon: "check_circle", color: "from-green-500 to-emerald-600", amount: formatVND(paid.reduce((s, i) => s + i.total, 0)) },
                    { label: "BHYT đã chi trả", value: "", icon: "health_and_safety", color: "from-blue-500 to-indigo-600", amount: formatVND(invoices.reduce((s, i) => s + i.insuranceCovered, 0)) },
                    { label: "Tổng chi phí", value: "", icon: "account_balance", color: "from-violet-500 to-purple-600", amount: formatVND(invoices.reduce((s, i) => s + i.subtotal, 0)) },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-white" style={{ fontSize: "16px" }}>{s.icon}</span>
                            </div>
                            <span className="text-xs font-semibold text-[#687582]">{s.label}</span>
                        </div>
                        <p className="text-lg font-bold text-[#121417] dark:text-white">{s.amount}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#f1f2f4] dark:bg-[#13191f] p-1 rounded-xl">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${activeTab === tab.id ? "bg-white dark:bg-[#1e242b] text-[#3C81C6] shadow-sm" : "text-[#687582] hover:text-[#121417] dark:hover:text-white"}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.id === "pending" && pending.length > 0 && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">{pending.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === "pending" && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <span className="material-symbols-outlined animate-spin text-[#3C81C6]" style={{ fontSize: "32px" }}>progress_activity</span>
                        </div>
                    ) : profiles.length === 0 ? (
                        <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] py-16 text-center">
                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 mb-4" style={{ fontSize: "64px" }}>person_add</span>
                            <h3 className="text-lg font-semibold text-[#121417] dark:text-white mb-1">Chưa có hồ sơ bệnh nhân</h3>
                            <p className="text-sm text-[#687582] mb-6">Vui lòng thêm hồ sơ bệnh nhân để xem viện phí</p>
                            <a href="/patient/medical-records" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                                Thêm hồ sơ
                            </a>
                        </div>
                    ) : pending.length === 0 ? (
                        <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] py-16 text-center">
                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 mb-3" style={{ fontSize: "56px" }}>payments</span>
                            <h3 className="text-lg font-semibold text-[#121417] dark:text-white mb-1">Không có hóa đơn chờ thanh toán</h3>
                            <p className="text-sm text-[#687582]">Tất cả hóa đơn đã được thanh toán</p>
                        </div>
                    ) : (
                        pending.map(inv => (
                            <InvoiceCard key={inv.id} invoice={inv} onView={() => setSelectedInvoice(inv)} onPay={() => { setSelectedInvoice(inv); setShowPayModal(true); }} />
                        ))
                    )}
                </div>
            )}

            {activeTab === "history" && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <span className="material-symbols-outlined animate-spin text-[#3C81C6]" style={{ fontSize: "32px" }}>progress_activity</span>
                        </div>
                    ) : paid.length === 0 && transactions.length === 0 ? (
                         <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] py-16 text-center">
                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 mb-3" style={{ fontSize: "56px" }}>history</span>
                            <h3 className="text-lg font-semibold text-[#121417] dark:text-white mb-1">Chưa có lịch sử giao dịch</h3>
                        </div>
                    ) : (
                        <>
                            {paid.map(inv => (
                                <InvoiceCard key={inv.id} invoice={inv} onView={() => setSelectedInvoice(inv)} />
                            ))}
                            {transactions.length > 0 && (
                                <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5">
                                    <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2 mb-4">
                                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "18px" }}>swap_vert</span>Lịch sử giao dịch
                                    </h3>
                                    <div className="space-y-2">
                                        {transactions.map(tx => (
                                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f6f7f8] dark:bg-[#13191f]">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === "payment" ? "bg-green-50 dark:bg-green-500/10 text-green-600" : "bg-red-50 dark:bg-red-500/10 text-red-600"}`}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{tx.type === "payment" ? "arrow_upward" : "arrow_downward"}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#121417] dark:text-white">{tx.description}</p>
                                                        <p className="text-xs text-[#687582]">{tx.date} • {tx.method} • {tx.invoiceCode}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-bold ${tx.type === "payment" ? "text-green-600" : "text-red-600"}`}>{tx.type === "payment" ? "-" : "+"}{formatVND(tx.amount)}</p>
                                                    <span className="text-[10px] font-medium text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">Thành công</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === "prices" && (
                <div className="space-y-4">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setPriceCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                                ${priceCategory === cat ? "bg-[#3C81C6] text-white" : "bg-white dark:bg-[#1e242b] text-[#687582] border border-[#e5e7eb] dark:border-[#2d353e] hover:bg-gray-50 dark:hover:bg-[#252d36]"}`}>
                                {cat === "all" ? "Tất cả" : cat}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="text-xs font-semibold text-[#687582] uppercase border-b border-[#e5e7eb] dark:border-[#2d353e] bg-[#f6f7f8] dark:bg-[#13191f]">
                                <th className="text-left py-3 px-5">Dịch vụ</th><th className="text-center py-3 px-3">Danh mục</th><th className="text-right py-3 px-3">Giá</th><th className="text-center py-3 px-5">BHYT (%)</th>
                            </tr></thead>
                            <tbody>{servicePrices.filter(s => {
                                const cat = getCategoryName(s);
                                return priceCategory === "all" || cat === priceCategory;
                            }).map((s) => {
                                const cat = getCategoryName(s);
                                const price = (s as any).base_price || s.price;
                                const insPrice = (s as any).insurance_price;
                                const insurancePercentage = insPrice && price ? Math.round((insPrice / price) * 100) : ((s as any).insuranceRate || 0);
                                return (
                                <tr key={s.id} className="border-b border-[#e5e7eb]/50 dark:border-[#2d353e]/50 hover:bg-[#f6f7f8] dark:hover:bg-[#13191f]">
                                    <td className="py-3 px-5"><p className="font-medium text-[#121417] dark:text-white">{(s as any).service_name || s.name}</p><p className="text-xs text-[#687582]">{s.description || s.code || (s as any).service_code}</p></td>
                                    <td className="py-3 px-3 text-center"><span className="px-2 py-0.5 text-xs bg-[#f6f7f8] dark:bg-[#13191f] text-[#687582] rounded-md">{cat}</span></td>
                                    <td className="py-3 px-3 text-right font-bold text-[#121417] dark:text-white">{price ? formatVND(price) : "Liên hệ"}</td>
                                    <td className="py-3 px-5 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${insurancePercentage > 0 ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600" : "bg-gray-100 dark:bg-gray-700 text-[#687582]"}`}>{insurancePercentage > 0 ? `${insurancePercentage}%` : "—"}</span></td>
                                </tr>
                            )})}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Invoice Detail Modal */}
            {selectedInvoice && !showPayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedInvoice(null)}>
                    <div className="bg-white dark:bg-[#1e242b] rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2d353e]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-[#121417] dark:text-white">Chi tiết hóa đơn</h3>
                                <button onClick={() => setSelectedInvoice(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><span className="material-symbols-outlined text-[#687582]">close</span></button>
                            </div>
                            <p className="text-sm text-[#687582] mt-1">Mã: {selectedInvoice.code} • {selectedInvoice.date}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {selectedInvoice.doctorName && <p className="text-sm text-[#687582]">👨‍⚕️ {selectedInvoice.doctorName} — {selectedInvoice.department}</p>}
                            <div className="space-y-2">
                                {selectedInvoice.items.map((item, i) => (
                                    <div key={i} className="flex justify-between p-3 bg-[#f6f7f8] dark:bg-[#13191f] rounded-xl">
                                        <div><p className="text-sm font-medium text-[#121417] dark:text-white">{item.name}</p><p className="text-xs text-[#687582]">SL: {item.quantity}</p></div>
                                        <span className="text-sm font-semibold text-[#121417] dark:text-white">{formatVND(item.total)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-[#e5e7eb] dark:border-[#2d353e] pt-3 space-y-1.5 text-sm">
                                <div className="flex justify-between"><span className="text-[#687582]">Tạm tính</span><span className="text-[#121417] dark:text-white">{formatVND(selectedInvoice.subtotal)}</span></div>
                                <div className="flex justify-between text-blue-600"><span>BHYT chi trả</span><span>-{formatVND(selectedInvoice.insuranceCovered)}</span></div>
                                {selectedInvoice.discount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{formatVND(selectedInvoice.discount)}</span></div>}
                                <div className="flex justify-between pt-2 border-t border-[#e5e7eb] dark:border-[#2d353e] text-base font-bold"><span className="text-[#121417] dark:text-white">Tổng thanh toán</span><span className="text-[#3C81C6]">{formatVND(selectedInvoice.total)}</span></div>
                            </div>
                            {selectedInvoice.status === "paid" && <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-500/10 rounded-xl"><span className="material-symbols-outlined text-green-600" style={{ fontSize: "18px" }}>verified</span><div><p className="text-sm font-semibold text-green-800 dark:text-green-400">Đã thanh toán</p><p className="text-xs text-green-600">{selectedInvoice.paidAt} • {selectedInvoice.paymentMethod}</p></div></div>}
                        </div>
                    </div>
                </div>
            )}

            {/* Pay Modal */}
            {showPayModal && selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => { setShowPayModal(false); setSelectedInvoice(null); setPaymentQR(null); setQrError(""); }}>
                    <div className={`bg-white dark:bg-[#1e242b] rounded-2xl shadow-2xl w-full ${paymentQR ? 'max-w-4xl' : 'max-w-md'} overflow-hidden transition-all duration-300 relative`} onClick={e => e.stopPropagation()}>
                        {paymentQR ? (
                            <div className="flex flex-col md:flex-row">
                                {/* LEFT COLUMN */}
                                <div className="w-full md:w-[45%] p-6 md:p-8 bg-gray-50 dark:bg-[#13191f] flex flex-col items-center justify-center border-r border-[#e5e7eb] dark:border-[#2d353e]">
                                    <div className="w-full space-y-4">
                                        <p className="font-semibold text-[#121417] dark:text-white">Bước 1: Mở ứng dụng ngân hàng hoặc Ví điện tử</p>
                                        <p className="font-semibold text-[#121417] dark:text-white flex items-center gap-1">Bước 2: Chọn <span className="material-symbols-outlined text-lg">qr_code_scanner</span> quét mã</p>
                                    </div>
                                    
                                    <div className="mt-8 bg-white p-4 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] border border-gray-100 flex flex-col items-center">
                                        <div className="text-xs text-center text-gray-500 font-medium mb-2 border-b w-full pb-2">
                                            Mã đơn: {paymentQR.order_code}
                                        </div>
                                        <img src={paymentQR.qr_code_url} alt={`${selectedMethod} QR`} className={`w-[250px] md:w-[280px] object-contain ${timeLeft === 0 ? "opacity-20 grayscale" : ""}`} />
                                        <div className="mt-2 w-full border-t border-gray-100 pt-3 flex justify-evenly px-2 opacity-80 items-center">
                                            {selectedMethod === 'VietQR' && (
                                                <>
                                                    <span className="font-extrabold text-blue-800 text-xl tracking-tighter">napas</span>
                                                    <span className="font-extrabold text-green-600 text-lg italic">VietQR</span>
                                                </>
                                            )}
                                            {selectedMethod === 'VNPay' && (
                                                <span className="font-extrabold text-[#005baa] text-xl tracking-tighter">VNPAY<span className="text-[#ed1c24]">QR</span></span>
                                            )}
                                            {selectedMethod === 'MoMo' && (
                                                <span className="font-extrabold text-[#a50064] text-xl tracking-tighter">MoMo</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <a href={paymentQR.qr_code_url} download="QRCode.png" target="_blank" className="mt-8 flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-[#1e242b] border border-[#e5e7eb] dark:border-[#2d353e] rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#252d36] transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300" style={{ fontSize: "18px" }}>download</span>
                                        Tải xuống Qrcode
                                    </a>
                                    
                                    {timeLeft === 0 && (
                                        <div className="absolute inset-0 m-auto w-[250px] h-[250px] flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-xl z-10 top-0 mt-32">
                                            <div className="text-center p-4">
                                                <span className="material-symbols-outlined text-red-500 text-4xl mb-2">error</span>
                                                <p className="font-bold text-red-600 dark:text-red-400">Mã QR đã hết hạn</p>
                                                <p className="text-xs text-gray-500 mt-1">Vui lòng đóng và tạo lại</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* RIGHT COLUMN */}
                                <div className="w-full md:w-[55%] p-6 md:p-8 relative">
                                    {/* Close button inside Right Column */}
                                    <button onClick={() => { setShowPayModal(false); setSelectedInvoice(null); setPaymentQR(null); }} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>

                                    <div className="text-center mt-2 mb-8">
                                        <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">
                                            Hỗ trợ Ví điện tử MoMo/ZaloPay<br/>
                                            Hoặc ứng dụng ngân hàng để chuyển khoản nhanh 24/7
                                        </p>
                                    </div>
                                    
                                    <h4 className="text-[#e2394d] font-bold text-[17px] mb-6 uppercase tracking-wide">Thông tin chuyển khoản</h4>
                                    
                                    <div className="space-y-4 text-[15px] dark:text-gray-200">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                                            <span className="w-32 text-gray-500 dark:text-gray-400">Số tiền:</span> 
                                            <span className="text-[#e2394d] font-bold text-xl">{formatVND(Number(paymentQR.amount))}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                                            <span className="w-32 text-gray-500 dark:text-gray-400">Nội dung:</span>
                                            <span className="font-bold text-[#e2394d] border border-[#e2394d] rounded-md px-3 py-1 bg-red-50 dark:bg-red-950/20 font-mono tracking-wider w-max sm:ml-0 m-0">
                                                {paymentQR.order_code}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-8 bg-[#f5f5f5] dark:bg-[#1a2027] p-4 rounded-xl text-[13px] text-gray-700 dark:text-gray-400 leading-relaxed">
                                        <span className="font-bold text-gray-800 dark:text-gray-200 uppercase">Chú ý: </span> Chuyển khoản nội dung quét QR tự động sinh để hệ thống xử lý tự động ghi nhận ngay lập tức! (Không cố gắng sửa đổi nội dung hay số tiền).
                                    </div>

                                    <div className="mt-8 flex flex-col items-center justify-center gap-2 text-[#3C81C6] pb-4">
                                        {timeLeft > 0 ? (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '28px' }}>progress_activity</span>
                                                    <p className="font-medium">Đang chờ xác nhận giao dịch...</p>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Mã hết hạn sau: <span className="font-mono font-bold text-[#e2394d] ml-1">{Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}</span></p>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-red-500">
                                                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>timer_off</span>
                                                <p className="font-bold">Đã hết thời gian thanh toán</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Invoice items summary */}
                                    <div className="mt-4 border-t border-[#e5e7eb] dark:border-[#2d353e] pt-6 pb-2">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-[#121417] dark:text-white font-bold text-[15px] uppercase tracking-wide">Chi tiết hóa đơn</h4>
                                            <span className="text-[13px] font-mono font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">{selectedInvoice.code}</span>
                                        </div>
                                        <div className="space-y-3 text-[14px]">
                                            <div className="max-h-[140px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                                {selectedInvoice.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-start gap-4">
                                                        <span className="text-gray-600 dark:text-gray-400 flex-1 leading-snug">{item.name}</span>
                                                        <div className="text-right whitespace-nowrap">
                                                            <span className="text-xs text-gray-400 mr-2">x{item.quantity}</span>
                                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{formatVND(item.total)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="pt-3 mt-3 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-2">
                                                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-[13px]">
                                                    <span>Tạm tính:</span>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{formatVND(selectedInvoice.subtotal)}</span>
                                                </div>
                                                {selectedInvoice.insuranceCovered > 0 && (
                                                    <div className="flex justify-between text-blue-600 text-[13px]">
                                                        <span>BHYT chi trả:</span>
                                                        <span>-{formatVND(selectedInvoice.insuranceCovered)}</span>
                                                    </div>
                                                )}
                                                {selectedInvoice.discount > 0 && (
                                                    <div className="flex justify-between text-green-600 text-[13px]">
                                                        <span>Giảm giá:</span>
                                                        <span>-{formatVND(selectedInvoice.discount)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2d353e]">
                                    <h3 className="text-lg font-bold text-[#121417] dark:text-white">Thanh toán online</h3>
                                    <p className="text-sm text-[#687582] mt-1">{selectedInvoice.code} — {formatVND(selectedInvoice.total)}</p>
                                </div>
                                <div className="p-6 space-y-3">
                                    {qrError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-2">{qrError}</div>
                                    )}
                                    <button disabled={checkingStatus} onClick={() => handleGenerateQR(selectedInvoice, 'VietQR')} className="w-full flex items-center gap-3 p-4 border border-[#e5e7eb] dark:border-[#2d353e] rounded-xl hover:border-[#3C81C6] hover:bg-[#3C81C6]/[0.04] transition-all text-left">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981]/10 to-[#34D399]/10 flex items-center justify-center"><span className="material-symbols-outlined text-[#10B981]" style={{ fontSize: "20px" }}>qr_code_scanner</span></div>
                                        <div><p className="text-sm font-semibold text-[#121417] dark:text-white">Chuyển khoản (VietQR)</p><p className="text-xs text-[#687582]">Quét mã QR mọi ngân hàng</p></div>
                                        <span className="material-symbols-outlined text-[#687582] ml-auto" style={{ fontSize: "18px" }}>chevron_right</span>
                                    </button>
                                    <button disabled={checkingStatus} onClick={() => handleGenerateQR(selectedInvoice, 'VNPay')} className="w-full flex items-center gap-3 p-4 border border-[#e5e7eb] dark:border-[#2d353e] rounded-xl hover:border-[#005baa] hover:bg-[#005baa]/[0.04] transition-all text-left">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#005baa]/10 to-[#005baa]/20 flex items-center justify-center"><span className="font-bold text-[#005baa] text-[10px]">VN<span className="text-[#ed1c24]">PAY</span></span></div>
                                        <div><p className="text-sm font-semibold text-[#121417] dark:text-white">VNPay</p><p className="text-xs text-[#687582]">Thanh toán qua ví VNPay</p></div>
                                        <span className="material-symbols-outlined text-[#687582] ml-auto" style={{ fontSize: "18px" }}>chevron_right</span>
                                    </button>
                                    <button disabled={checkingStatus} onClick={() => handleGenerateQR(selectedInvoice, 'MoMo')} className="w-full flex items-center gap-3 p-4 border border-[#e5e7eb] dark:border-[#2d353e] rounded-xl hover:border-[#a50064] hover:bg-[#a50064]/[0.04] transition-all text-left">
                                        <div className="w-10 h-10 rounded-xl bg-[#a50064]/10 flex items-center justify-center"><span className="font-bold text-[#a50064] text-[11px]">MoMo</span></div>
                                        <div><p className="text-sm font-semibold text-[#121417] dark:text-white">MoMo</p><p className="text-xs text-[#687582]">Thanh toán qua ví MoMo</p></div>
                                        <span className="material-symbols-outlined text-[#687582] ml-auto" style={{ fontSize: "18px" }}>chevron_right</span>
                                    </button>
                                </div>
                                <div className="p-6 border-t border-[#e5e7eb] dark:border-[#2d353e]">
                                    <button onClick={() => { setShowPayModal(false); setSelectedInvoice(null); setPaymentQR(null); }} className="w-full py-2.5 text-sm font-medium text-[#687582] border border-[#e5e7eb] dark:border-[#2d353e] rounded-xl hover:bg-gray-50 dark:hover:bg-[#252d36]">Đóng</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function InvoiceCard({ invoice, onView, onPay }: { invoice: Invoice; onView: () => void; onPay?: () => void }) {
    const statusCfg: Record<string, { label: string; cls: string }> = {
        pending: { label: "Chờ thanh toán", cls: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" },
        paid: { label: "Đã thanh toán", cls: "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" },
        overdue: { label: "Quá hạn", cls: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400" },
        refunded: { label: "Đã hoàn", cls: "bg-gray-100 dark:bg-gray-700 text-gray-600" },
    };
    const st = statusCfg[invoice.status] || statusCfg.pending;

    return (
        <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] hover:shadow-md hover:border-[#3C81C6]/20 transition-all p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3C81C6]/10 to-[#60a5fa]/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "24px" }}>receipt</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[#121417] dark:text-white">{invoice.code}</h4>
                        <p className="text-xs text-[#687582] mt-0.5">{invoice.doctorName} — {invoice.department}</p>
                        <p className="text-xs text-[#687582]">{invoice.date} • {invoice.items.length} dịch vụ</p>
                    </div>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${st.cls}`}>{st.label}</span>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e5e7eb]/50 dark:border-[#2d353e]/50">
                <div className="text-sm"><span className="text-[#687582]">Tổng: </span><span className="font-bold text-[#3C81C6]">{formatVND(invoice.total)}</span>
                    {invoice.insuranceCovered > 0 && <span className="text-xs text-blue-500 ml-2">(BHYT: {formatVND(invoice.insuranceCovered)})</span>}
                </div>
                <div className="flex gap-2">
                    <button onClick={onView} className="px-3 py-1.5 text-xs font-medium text-[#687582] border border-[#e5e7eb] dark:border-[#2d353e] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252d36]">Chi tiết</button>
                    {onPay && <button onClick={onPay} className="px-3 py-1.5 text-xs font-semibold text-white bg-[#3C81C6] rounded-lg hover:bg-[#2a6da8]">Thanh toán</button>}
                </div>
            </div>
        </div>
    );
}
