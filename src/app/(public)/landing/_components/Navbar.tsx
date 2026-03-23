"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "./data";

export function LandingNavbar({ activeSection, scrollTo }: { activeSection: string; scrollTo: (id: string) => void }) {
    const [mobileMenu, setMobileMenu] = useState(false);
    const handleNav = (id: string) => { setMobileMenu(false); scrollTo(id); };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/80 shadow-sm" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5" aria-label="EHealth - Trang chủ">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3C81C6] to-[#1d4ed8] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="material-symbols-outlined text-white text-[20px]">local_hospital</span>
                    </div>
                    <div>
                        <span className="text-xl font-black text-[#121417]">E<span className="text-[#3C81C6]">Health</span></span>
                        <p className="text-[9px] text-[#687582] -mt-0.5 tracking-widest uppercase">Smart Healthcare</p>
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#687582]">
                    {NAV_ITEMS.map(n => (
                        <button key={n.id} onClick={() => handleNav(n.id)}
                            className={`hover:text-[#3C81C6] transition-colors ${activeSection === n.id ? "text-[#3C81C6]" : ""}`}
                            aria-label={`Đi đến ${n.label}`}>{n.label}</button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/login" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#687582] hover:text-[#3C81C6] transition-colors">
                        <span className="material-symbols-outlined text-[18px]">login</span>Đăng nhập
                    </Link>
                    <button onClick={() => handleNav("booking")} className="hidden sm:block px-5 py-2.5 bg-gradient-to-r from-[#3C81C6] to-[#1d4ed8] hover:from-[#2a6da8] hover:to-[#1e40af] text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/25 active:scale-95"
                        aria-label="Đặt lịch khám">
                        Đặt lịch khám
                    </button>
                    <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label={mobileMenu ? "Đóng menu" : "Mở menu"} aria-expanded={mobileMenu}>
                        <span className="material-symbols-outlined text-[24px] text-[#121417]">{mobileMenu ? "close" : "menu"}</span>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden transition-all duration-300 ${mobileMenu ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-6 py-4 space-y-1">
                    {NAV_ITEMS.map(n => (
                        <button key={n.id} onClick={() => handleNav(n.id)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-[#687582] hover:bg-blue-50 hover:text-[#3C81C6] transition-colors">{n.label}</button>
                    ))}
                    <Link href="/login" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-[#687582] hover:bg-blue-50">
                        <span className="material-symbols-outlined text-[18px]">login</span>Đăng nhập
                    </Link>
                    <button onClick={() => handleNav("booking")} className="w-full mt-2 py-3 bg-gradient-to-r from-[#3C81C6] to-[#1d4ed8] text-white rounded-xl text-sm font-bold active:scale-95">Đặt lịch khám</button>
                </div>
            </div>
        </nav>
    );
}
