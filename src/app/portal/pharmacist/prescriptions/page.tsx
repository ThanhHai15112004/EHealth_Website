"use client";

import { useState, useMemo } from "react";

const MOCK_RX = [
    { id: "DT001", patient: "Nguyễn Văn An", doctor: "BS. Trần Minh", dept: "Nội khoa", date: "25/02/2025", medicines: ["Amoxicillin 500mg x 20 viên", "Paracetamol 500mg x 10 viên", "Omeprazole 20mg x 14 viên"], diagnosis: "Viêm họng cấp", status: "pending" },
    { id: "DT002", patient: "Lê Thị Bình", doctor: "BS. Phạm Hoa", dept: "Da liễu", date: "25/02/2025", medicines: ["Cetirizine 10mg x 30 viên", "Hydrocortisone cream x 1 tuýp"], diagnosis: "Viêm da dị ứng", status: "pending" },
    { id: "DT003", patient: "Trần Văn Cường", doctor: "BS. Ngô Đức", dept: "Tim mạch", date: "25/02/2025", medicines: ["Amlodipine 5mg x 30 viên", "Aspirin 81mg x 30 viên", "Atorvastatin 10mg x 30 viên", "Losartan 50mg x 30 viên", "Metformin 500mg x 60 viên"], diagnosis: "Tăng HA, ĐTĐ type 2", status: "dispensed" },
    { id: "DT004", patient: "Phạm Thị Dung", doctor: "BS. Trần Minh", dept: "Nội khoa", date: "25/02/2025", medicines: ["Vitamin B12 x 30 viên", "Acid folic 5mg x 30 viên"], diagnosis: "Thiếu máu", status: "dispensed" },
    { id: "DT005", patient: "Hoàng Văn Em", doctor: "BS. Lý Thanh", dept: "Nhi khoa", date: "25/02/2025", medicines: ["Amoxicillin siro x 1 chai", "Paracetamol siro x 1 chai", "Muối biển xịt mũi x 1", "Vitamin C giọt x 1"], diagnosis: "Viêm đường hô hấp", status: "pending" },
    { id: "DT006", patient: "Vũ Thị Fương", doctor: "BS. Phạm Hoa", dept: "Da liễu", date: "24/02/2025", medicines: ["Tretinoin cream x 1 tuýp", "Sunscreen SPF50 x 1 tuýp"], diagnosis: "Mụn trứng cá", status: "dispensed" },
];

const STATUS_MAP: Record<string, { l: string; c: string }> = {
    pending: { l: "Chờ cấp phát", c: "bg-amber-50 dark:bg-amber-500/10 text-amber-600" },
    dispensed: { l: "Đã cấp phát", c: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" },
    returned: { l: "Hoàn trả", c: "bg-red-50 dark:bg-red-500/10 text-red-500" },
};

export default function PharmacistPrescriptions() {
    const [rxs, setRxs] = useState(MOCK_RX);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [detail, setDetail] = useState<string | null>(null);

    const handleDispense = (id: string) => {
        setRxs((prev) => prev.map((r) => r.id === id ? { ...r, status: "dispensed" } : r));
        setDetail(null);
    };

    const filtered = useMemo(() => rxs.filter((r) => {
        const ms = r.patient.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search);
        return ms && (filter === "all" || r.status === filter);
    }), [rxs, search, filter]);

    const detailRx = rxs.find((r) => r.id === detail);

    return (
        <div className="p-6 md:p-8"><div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#121417] dark:text-white">Quản lý Đơn thuốc</h1>
                <p className="text-sm text-[#687582] mt-1">Xem và cấp phát đơn thuốc từ bác sĩ</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { l: "Tổng đơn", v: rxs.length, i: "pill", c: "text-blue-600" },
                    { l: "Chờ cấp phát", v: rxs.filter((r) => r.status === "pending").length, i: "pending_actions", c: "text-amber-600" },
                    { l: "Đã cấp", v: rxs.filter((r) => r.status === "dispensed").length, i: "check_circle", c: "text-emerald-600" },
                ].map((s) => (
                    <div key={s.l} className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#dde0e4] dark:border-[#2d353e] p-4 flex items-center gap-4">
                        <span className={`material-symbols-outlined ${s.c}`} style={{ fontSize: "28px" }}>{s.i}</span>
                        <div><p className="text-xl font-bold text-[#121417] dark:text-white">{s.v}</p><p className="text-xs text-[#687582]">{s.l}</p></div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#dde0e4] dark:border-[#2d353e]">
                <div className="p-4 border-b border-[#dde0e4] dark:border-[#2d353e] flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full sm:max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#687582]" style={{ fontSize: "20px" }}>search</span>
                        <input type="text" placeholder="Tìm mã đơn, tên BN..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[#f6f7f8] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6]" />
                    </div>
                    <div className="flex gap-2">
                        {["all", "pending", "dispensed"].map((s) => (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-[#3C81C6] text-white" : "bg-[#f6f7f8] dark:bg-[#13191f] text-[#687582]"}`}>
                                {s === "all" ? "Tất cả" : STATUS_MAP[s]?.l}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-[#dde0e4] dark:border-[#2d353e]">
                            {["Mã đơn", "Bệnh nhân", "Bác sĩ", "Chẩn đoán", "Số thuốc", "Trạng thái", "Thao tác"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-[#687582] uppercase">{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r.id} className="border-b border-[#dde0e4] dark:border-[#2d353e] hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3 text-sm font-mono text-[#3C81C6] font-medium">{r.id}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-[#121417] dark:text-white">{r.patient}</td>
                                    <td className="px-4 py-3"><p className="text-sm text-[#121417] dark:text-white">{r.doctor}</p><p className="text-xs text-[#687582]">{r.dept}</p></td>
                                    <td className="px-4 py-3 text-sm text-[#687582]">{r.diagnosis}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-[#121417] dark:text-white">{r.medicines.length}</td>
                                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[r.status]?.c}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{STATUS_MAP[r.status]?.l}</span></td>
                                    <td className="px-4 py-3 flex items-center gap-1">
                                        <button onClick={() => setDetail(r.id)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 transition-colors"><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>visibility</span></button>
                                        {r.status === "pending" && <button onClick={() => handleDispense(r.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 transition-colors" title="Cấp phát"><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>done_all</span></button>}
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-[#687582] transition-colors"><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>print</span></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {detailRx && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
                    <div className="bg-white dark:bg-[#1e242b] rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#dde0e4] dark:border-[#2d353e] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#121417] dark:text-white">Chi tiết đơn thuốc {detailRx.id}</h2>
                            <button onClick={() => setDetail(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><span className="material-symbols-outlined text-[#687582]">close</span></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-[#687582]">Bệnh nhân:</span><p className="font-semibold text-[#121417] dark:text-white">{detailRx.patient}</p></div>
                                <div><span className="text-[#687582]">Bác sĩ:</span><p className="font-semibold text-[#121417] dark:text-white">{detailRx.doctor}</p></div>
                                <div><span className="text-[#687582]">Khoa:</span><p className="font-medium">{detailRx.dept}</p></div>
                                <div><span className="text-[#687582]">Ngày:</span><p className="font-medium">{detailRx.date}</p></div>
                            </div>
                            <div><span className="text-sm text-[#687582]">Chẩn đoán:</span><p className="text-sm font-medium text-[#121417] dark:text-white">{detailRx.diagnosis}</p></div>
                            <div>
                                <p className="text-sm font-semibold text-[#121417] dark:text-white mb-2">Danh sách thuốc:</p>
                                <div className="space-y-2">
                                    {detailRx.medicines.map((m, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#f6f7f8] dark:bg-[#13191f]">
                                            <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "18px" }}>medication</span>
                                            <span className="text-sm text-[#121417] dark:text-white">{m}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[#dde0e4] dark:border-[#2d353e] flex justify-end gap-3">
                            <button className="px-4 py-2 text-sm font-medium text-[#687582] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>print</span>In đơn</button>
                            {detailRx.status === "pending" && <button onClick={() => handleDispense(detailRx.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>done_all</span>Xác nhận cấp phát</button>}
                        </div>
                    </div>
                </div>
            )}
        </div></div>
    );
}
