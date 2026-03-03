"use client";

import { useState } from "react";

// Mock data — Doanh thu chi tiết
const REVENUE_BY_DEPT = [
    { dept: "Nội khoa", revenue: 3200, patients: 450, icon: "cardiology", color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
    { dept: "Ngoại khoa", revenue: 2800, patients: 280, icon: "surgical", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { dept: "Nhi khoa", revenue: 1900, patients: 320, icon: "child_care", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { dept: "Da liễu", revenue: 1500, patients: 200, icon: "dermatology", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { dept: "Tim mạch", revenue: 1800, patients: 150, icon: "monitor_heart", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10" },
    { dept: "Sản khoa", revenue: 1200, patients: 90, icon: "pregnant_woman", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
];

const QUARTERLY = [
    { quarter: "Q1", revenue: 3050, target: 3000 },
    { quarter: "Q2", revenue: 3210, target: 3200 },
    { quarter: "Q3", revenue: 3650, target: 3500 },
    { quarter: "Q4", revenue: 2820, target: 3500 },
];

const TOP_DOCTORS_REVENUE = [
    { rank: 1, name: "BS. Nguyễn Văn A", dept: "Tim mạch", revenue: 850, patients: 120 },
    { rank: 2, name: "BS. Trần Thị B", dept: "Nội khoa", revenue: 780, patients: 145 },
    { rank: 3, name: "BS. Lê Văn C", dept: "Ngoại khoa", revenue: 720, patients: 98 },
    { rank: 4, name: "BS. Phạm Thị D", dept: "Da liễu", revenue: 680, patients: 180 },
    { rank: 5, name: "BS. Hoàng Văn E", dept: "Nhi khoa", revenue: 620, patients: 160 },
    { rank: 6, name: "BS. Vũ Thị F", dept: "Sản khoa", revenue: 580, patients: 75 },
    { rank: 7, name: "BS. Đỗ Văn G", dept: "Tim mạch", revenue: 540, patients: 90 },
    { rank: 8, name: "BS. Ngô Thị H", dept: "Nội khoa", revenue: 510, patients: 130 },
    { rank: 9, name: "BS. Bùi Văn I", dept: "Ngoại khoa", revenue: 480, patients: 85 },
    { rank: 10, name: "BS. Lý Thị K", dept: "Nhi khoa", revenue: 450, patients: 110 },
];

export default function RevenuePage() {
    const [period, setPeriod] = useState<"month" | "quarter" | "year">("quarter");
    const totalRevenue = REVENUE_BY_DEPT.reduce((s, d) => s + d.revenue, 0);
    const maxDeptRevenue = Math.max(...REVENUE_BY_DEPT.map((d) => d.revenue));
    const maxQuarterly = Math.max(...QUARTERLY.map((q) => Math.max(q.revenue, q.target)));

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div>
                <div className="flex items-center gap-1.5 text-xs text-[#687582] dark:text-gray-500 mb-3">
                    <span className="material-symbols-outlined text-[14px]">home</span>
                    <span>Trang chủ</span>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <span>Thống kê</span>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <span className="text-[#121417] dark:text-white font-medium">Báo cáo doanh thu</span>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-[#121417] dark:text-white">Báo cáo doanh thu</h1>
                        <p className="text-[#687582] dark:text-gray-400 mt-0.5 text-sm">Phân tích doanh thu theo khoa, bác sĩ và thời gian</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {[
                            { key: "month" as const, label: "Tháng" },
                            { key: "quarter" as const, label: "Quý" },
                            { key: "year" as const, label: "Năm" },
                        ].map((p) => (
                            <button key={p.key} onClick={() => setPeriod(p.key)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${period === p.key ? "bg-[#3C81C6] text-white" : "bg-gray-100 dark:bg-gray-800 text-[#687582] hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                                {p.label}
                            </button>
                        ))}
                        <button className="flex items-center gap-2 ml-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-[#687582] rounded-xl text-sm font-medium transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                            <span className="material-symbols-outlined text-[16px]">download</span>Xuất PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white dark:bg-[#1e242b] p-5 rounded-2xl border border-[#dde0e4] dark:border-[#2d353e] shadow-sm">
                    <p className="text-xs text-[#687582] dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Tổng doanh thu</p>
                    <p className="text-3xl font-extrabold text-[#121417] dark:text-white">{(totalRevenue / 1000).toFixed(1)} <span className="text-lg text-[#687582]">Tỷ</span></p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>+12% so với kỳ trước
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1e242b] p-5 rounded-2xl border border-[#dde0e4] dark:border-[#2d353e] shadow-sm">
                    <p className="text-xs text-[#687582] dark:text-gray-400 font-medium uppercase tracking-wider mb-1">TB doanh thu / BS</p>
                    <p className="text-3xl font-extrabold text-[#121417] dark:text-white">{Math.round(totalRevenue / 45)} <span className="text-lg text-[#687582]">Tr</span></p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>+5% so với kỳ trước
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1e242b] p-5 rounded-2xl border border-[#dde0e4] dark:border-[#2d353e] shadow-sm">
                    <p className="text-xs text-[#687582] dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Tổng bệnh nhân</p>
                    <p className="text-3xl font-extrabold text-[#121417] dark:text-white">{REVENUE_BY_DEPT.reduce((s, d) => s + d.patients, 0).toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold text-amber-600">
                        <span className="material-symbols-outlined text-[14px]">trending_flat</span>+2% so với kỳ trước
                    </div>
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Doanh thu theo khoa */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1e242b] rounded-2xl border border-[#dde0e4] dark:border-[#2d353e] shadow-sm">
                    <div className="px-5 py-4 border-b border-[#f0f1f3] dark:border-[#2d353e] flex items-center gap-2.5">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <span className="material-symbols-outlined text-blue-600 text-[20px]">analytics</span>
                        </div>
                        <h3 className="text-sm font-bold text-[#121417] dark:text-white">Doanh thu theo chuyên khoa</h3>
                    </div>
                    <div className="p-5 space-y-4">
                        {REVENUE_BY_DEPT.map((d) => (
                            <div key={d.dept} className="flex items-center gap-4">
                                <div className={`w-9 h-9 rounded-lg ${d.bg} flex items-center justify-center flex-shrink-0`}>
                                    <span className={`material-symbols-outlined ${d.color} text-[18px]`}>{d.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-semibold text-[#121417] dark:text-white">{d.dept}</p>
                                        <p className="text-sm font-bold text-[#121417] dark:text-white">{(d.revenue / 1000).toFixed(1)} Tỷ</p>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#3C81C6] to-[#60a5fa] rounded-full transition-all duration-500"
                                            style={{ width: `${(d.revenue / maxDeptRevenue) * 100}%` }} />
                                    </div>
                                    <p className="text-[10px] text-[#687582] dark:text-gray-500 mt-0.5">{d.patients} bệnh nhân</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* So sánh theo quý */}
                <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#dde0e4] dark:border-[#2d353e] shadow-sm">
                    <div className="px-5 py-4 border-b border-[#f0f1f3] dark:border-[#2d353e] flex items-center gap-2.5">
                        <div className="p-1.5 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                            <span className="material-symbols-outlined text-violet-600 text-[20px]">compare</span>
                        </div>
                        <h3 className="text-sm font-bold text-[#121417] dark:text-white">So sánh theo quý</h3>
                    </div>
                    <div className="p-5">
                        <div className="h-52 flex items-end gap-3">
                            {QUARTERLY.map((q) => (
                                <div key={q.quarter} className="flex-1 flex flex-col items-center gap-1 group">
                                    <div className="w-full flex items-end gap-1 justify-center h-40">
                                        <div className="w-5 bg-[#3C81C6]/20 rounded-t-sm relative group" style={{ height: `${(q.target / maxQuarterly) * 100}%` }}>
                                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-[#687582] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{q.target}Tr</div>
                                        </div>
                                        <div className={`w-5 rounded-t-sm ${q.revenue >= q.target ? "bg-gradient-to-t from-emerald-500 to-emerald-400" : "bg-gradient-to-t from-rose-500 to-rose-400"}`}
                                            style={{ height: `${(q.revenue / maxQuarterly) * 100}%` }}>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-[#687582] dark:text-gray-500">{q.quarter}</span>
                                    <span className={`text-[10px] font-bold ${q.revenue >= q.target ? "text-emerald-600" : "text-red-500"}`}>
                                        {q.revenue >= q.target ? "Đạt" : "Chưa đạt"}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#f0f1f3] dark:border-[#2d353e]">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm bg-[#3C81C6]/20" />
                                <span className="text-[11px] text-[#687582]">Mục tiêu</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                                <span className="text-[11px] text-[#687582]">Đạt</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm bg-rose-500" />
                                <span className="text-[11px] text-[#687582]">Chưa đạt</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top BS */}
            <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#dde0e4] dark:border-[#2d353e] shadow-sm">
                <div className="px-5 py-4 border-b border-[#f0f1f3] dark:border-[#2d353e] flex items-center gap-2.5">
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <span className="material-symbols-outlined text-amber-600 text-[20px]">emoji_events</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#121417] dark:text-white">Top 10 Bác sĩ theo doanh thu</h3>
                        <p className="text-xs text-[#687582] dark:text-gray-500">Xếp hạng theo triệu VNĐ</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#f6f7f8] dark:bg-[#13191f]">
                            <tr>
                                <th className="text-center text-xs font-bold text-[#687582] px-5 py-3 uppercase w-16">#</th>
                                <th className="text-left text-xs font-bold text-[#687582] px-5 py-3 uppercase">Bác sĩ</th>
                                <th className="text-left text-xs font-bold text-[#687582] px-5 py-3 uppercase">Chuyên khoa</th>
                                <th className="text-right text-xs font-bold text-[#687582] px-5 py-3 uppercase">Doanh thu</th>
                                <th className="text-right text-xs font-bold text-[#687582] px-5 py-3 uppercase">Bệnh nhân</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f1f3] dark:divide-[#2d353e]">
                            {TOP_DOCTORS_REVENUE.map((doc) => (
                                <tr key={doc.rank} className="hover:bg-[#f6f7f8] dark:hover:bg-[#13191f] transition-colors">
                                    <td className="px-5 py-3 text-center">
                                        {doc.rank <= 3 ? (
                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${doc.rank === 1 ? "bg-amber-500" : doc.rank === 2 ? "bg-gray-400" : "bg-amber-700"}`}>
                                                {doc.rank}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-[#687582]">{doc.rank}</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-sm font-semibold text-[#121417] dark:text-white">{doc.name}</td>
                                    <td className="px-5 py-3 text-sm text-[#687582] dark:text-gray-400">{doc.dept}</td>
                                    <td className="px-5 py-3 text-sm font-bold text-right text-[#121417] dark:text-white">{doc.revenue} Tr</td>
                                    <td className="px-5 py-3 text-sm text-right text-[#687582] dark:text-gray-400">{doc.patients}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
