"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "./ScrollReveal";

export function LandingFooter() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 3000);
    };

    const year = new Date().getFullYear();

    return (
        <footer id="contact" className="bg-[#0f1117] text-white pt-20 pb-8 px-6" aria-label="Footer">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                {/* Brand */}
                <ScrollReveal>
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3C81C6] to-[#1d4ed8] flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[20px]">local_hospital</span>
                        </div>
                        <span className="text-xl font-black">E<span className="text-[#3C81C6]">Health</span></span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">Hệ thống Y tế Thông minh — Nền tảng quản lý bệnh viện toàn diện, chăm sóc sức khoẻ thế hệ mới.</p>
                    {/* Social icons */}
                    <div className="flex gap-3">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#1877F2] flex items-center justify-center text-gray-400 hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#FF0000] flex items-center justify-center text-gray-400 hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                        <a href="#" aria-label="Zalo" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#0068FF] flex items-center justify-center text-gray-400 hover:text-white transition-all font-bold text-sm">
                            Zalo
                        </a>
                    </div>
                </ScrollReveal>

                {/* Services */}
                <ScrollReveal delay={100}>
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-5">Dịch vụ</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        {["Khám tổng quát", "Đặt lịch hẹn", "Xét nghiệm", "Tư vấn từ xa", "Hồ sơ sức khoẻ", "Nhà thuốc online"].map(s => (
                            <li key={s}><a href="#services" className="hover:text-white hover:pl-1 transition-all">{s}</a></li>
                        ))}
                    </ul>
                </ScrollReveal>

                {/* Support */}
                <ScrollReveal delay={200}>
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-5">Hỗ trợ</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        {[
                            { label: "Về chúng tôi", href: "#about" },
                            { label: "Câu hỏi thường gặp", href: "#faq" },
                            { label: "Chính sách bảo mật", href: "#" },
                            { label: "Điều khoản sử dụng", href: "#" },
                            { label: "Tuyển dụng", href: "#" },
                            { label: "Liên hệ hợp tác", href: "#contact" },
                        ].map(s => (
                            <li key={s.label}><a href={s.href} className="hover:text-white hover:pl-1 transition-all">{s.label}</a></li>
                        ))}
                    </ul>
                </ScrollReveal>

                {/* Contact */}
                <ScrollReveal delay={300}>
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-5">Liên hệ</h4>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-[18px] text-[#3C81C6] mt-0.5">location_on</span>
                            <span>123 Nguyễn Chí Thanh, Quận 5,<br/>TP. Hồ Chí Minh</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-[#3C81C6]">call</span>
                            <a href="tel:02812345678" className="hover:text-white transition-colors">(028) 1234 5678</a>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-[#3C81C6]">emergency</span>
                            <a href="tel:1900xxxx" className="hover:text-white transition-colors">Cấp cứu: 1900 xxxx</a>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-[#3C81C6]">mail</span>
                            <a href="mailto:info@ehealth.vn" className="hover:text-white transition-colors">info@ehealth.vn</a>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-[#3C81C6]">schedule</span>
                            <span>T2-T7: 7:00 — 20:00</span>
                        </li>
                    </ul>

                    {/* Newsletter */}
                    <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3">Đăng ký nhận tin</p>
                        <form onSubmit={handleSubscribe} className="flex gap-2">
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email của bạn" aria-label="Email đăng ký nhận tin"
                                className="flex-1 px-3 py-2.5 bg-white/5 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-[#3C81C6] transition-colors" />
                            <button type="submit" className="px-4 py-2.5 bg-[#3C81C6] hover:bg-[#2a6da8] text-white rounded-lg text-sm font-semibold transition-colors active:scale-95" aria-label="Đăng ký">
                                {subscribed ? "✓" : "→"}
                            </button>
                        </form>
                        {subscribed && <p className="text-xs text-green-400 mt-2">Đăng ký thành công!</p>}
                    </div>
                </ScrollReveal>
            </div>

            {/* Google Maps */}
            <ScrollReveal>
                <div className="max-w-7xl mx-auto mb-12 rounded-2xl overflow-hidden shadow-lg border border-gray-800">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5!2d106.6597!3d10.7626!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ1JzQ1LjQiTiAxMDbCsDM5JzM0LjkiRQ!5e0!3m2!1svi!2svn!4v1!"
                        width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                        title="Vị trí EHealth Hospital trên Google Maps" />
                </div>
            </ScrollReveal>

            {/* Copyright */}
            <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-500">© {year} EHealth Hospital. All rights reserved.</p>
                <p className="text-xs text-gray-500">Giấy phép hoạt động số: xxx/BYT-GPHĐ</p>
            </div>
        </footer>
    );
}
