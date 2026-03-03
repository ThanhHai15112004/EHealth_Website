"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PHARMACIST_MENU_ITEMS } from "@/constants/routes";

export function PharmacistSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white dark:bg-[#1e242b] border-r border-[#e5e7eb] dark:border-[#2d353e] flex flex-col h-full shrink-0 z-20">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3C81C6] to-[#60a5fa] flex items-center justify-center shadow-lg shadow-[#3C81C6]/20">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: "22px" }}>local_hospital</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-[#121417] dark:text-white">EHealth</h1>
                    <p className="text-[10px] font-semibold text-[#3C81C6] uppercase tracking-wider">Dược sĩ</p>
                </div>
            </div>
            <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
                {PHARMACIST_MENU_ITEMS.map((item) => {
                    const active = item.key === "dashboard" ? pathname === item.href : pathname.startsWith(item.href);
                    return (
                        <Link key={item.key} href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${active ? "bg-[#3C81C6]/10 text-[#3C81C6] dark:bg-[#3C81C6]/20" : "text-[#687582] dark:text-gray-400 hover:bg-[#f1f2f4] dark:hover:bg-gray-800 hover:text-[#121417] dark:hover:text-white"}`}>
                            <span className={`material-symbols-outlined ${active ? "fill-1" : "group-hover:text-[#3C81C6]"} transition-colors`} style={{ fontSize: "22px" }}>{item.icon}</span>
                            <span className={`text-sm ${active ? "font-bold" : "font-medium"}`}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-[#e5e7eb] dark:border-[#2d353e]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">DS</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#121417] dark:text-white truncate">Trần Văn Dược</p>
                        <p className="text-xs text-[#687582] dark:text-gray-400">Dược sĩ</p>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-[#687582]" style={{ fontSize: "20px" }}>logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
