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

    useEffect(() => {
        if (!user?.id) return;
        const loadProfiles = async () => {
            try {
                const res = await getPatientsByAccountId(user.id);
                if (res.success && res.data && res.data.length > 0) {
                    setProfiles(res.data);
                    setSelectedProfileId(res.data[0].id);
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
                            onClick={() => setSelectedProfileId(p.id)}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => { setShowPayModal(false); setSelectedInvoice(null); }}>
                    <div className="bg-white dark:bg-[#1e242b] rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2d353e]">
                            <h3 className="text-lg font-bold text-[#121417] dark:text-white">Thanh toán online</h3>
                            <p className="text-sm text-[#687582] mt-1">{selectedInvoice.code} — {formatVND(selectedInvoice.total)}</p>
                        </div>
                        <div className="p-6 space-y-3">
                            {["VNPay", "MoMo", "ZaloPay", "Thẻ ngân hàng"].map(m => (
                                <button key={m} className="w-full flex items-center gap-3 p-4 border border-[#e5e7eb] dark:border-[#2d353e] rounded-xl hover:border-[#3C81C6] hover:bg-[#3C81C6]/[0.04] transition-all text-left">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3C81C6]/10 to-[#60a5fa]/10 flex items-center justify-center"><span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "20px" }}>account_balance</span></div>
                                    <div><p className="text-sm font-semibold text-[#121417] dark:text-white">{m}</p><p className="text-xs text-[#687582]">Thanh toán qua {m}</p></div>
                                    <span className="material-symbols-outlined text-[#687582] ml-auto" style={{ fontSize: "18px" }}>chevron_right</span>
                                </button>
                            ))}
                        </div>
                        <div className="p-6 border-t border-[#e5e7eb] dark:border-[#2d353e]">
                            <button onClick={() => { setShowPayModal(false); setSelectedInvoice(null); }} className="w-full py-2.5 text-sm font-medium text-[#687582] border border-[#e5e7eb] dark:border-[#2d353e] rounded-xl hover:bg-gray-50 dark:hover:bg-[#252d36]">Đóng</button>
                        </div>
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
