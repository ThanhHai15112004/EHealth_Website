"use client";

import { SafeImage } from "./SafeImage";
import { ScrollReveal } from "./ScrollReveal";
import { IMG, DOCTORS } from "./data";

export function HeroSection({ scrollTo }: { scrollTo: (id: string) => void }) {
    return (
        <section className="relative pt-16 min-h-[90vh] flex items-center overflow-hidden" aria-label="Hero">
            <div className="absolute inset-0 z-0">
                <SafeImage src={IMG.heroBg} alt="EHealth Hospital" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/40" />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <ScrollReveal>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#3C81C6] rounded-full text-xs font-bold mb-8 border border-blue-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Hệ thống Y tế hàng đầu Việt Nam
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-[#121417] leading-[1.1] mb-6">
                        Chăm sóc sức khoẻ<br />
                        <span className="bg-gradient-to-r from-[#3C81C6] to-[#1d4ed8] bg-clip-text text-transparent">thông minh</span> &<br />
                        <span className="bg-gradient-to-r from-[#3C81C6] to-[#1d4ed8] bg-clip-text text-transparent">tận tâm</span>
                    </h1>
                    <p className="text-lg text-[#687582] mb-10 max-w-lg leading-relaxed">
                        Đặt lịch khám trực tuyến, theo dõi sức khoẻ 24/7, nhận kết quả xét nghiệm nhanh chóng — tất cả trong một nền tảng duy nhất.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mb-12">
                        <button onClick={() => scrollTo("booking")} className="px-8 py-4 bg-gradient-to-r from-[#3C81C6] to-[#1d4ed8] hover:from-[#2a6da8] hover:to-[#1e40af] text-white rounded-2xl text-base font-bold transition-all hover:-translate-y-1 shadow-xl shadow-blue-500/30 flex items-center gap-2 active:scale-95" aria-label="Đặt lịch khám ngay">
                            <span className="material-symbols-outlined text-[20px]">calendar_month</span>Đặt lịch ngay
                        </button>
                        <button onClick={() => scrollTo("about")} className="px-8 py-4 bg-white border-2 border-gray-200 text-[#121417] rounded-2xl text-base font-bold hover:border-[#3C81C6] hover:text-[#3C81C6] transition-all flex items-center gap-2 shadow-sm active:scale-95">
                            <span className="material-symbols-outlined text-[20px]">info</span>Tìm hiểu thêm
                        </button>
                    </div>
                    <div className="flex items-center gap-8 flex-wrap">
                        <div className="flex -space-x-3">
                            {DOCTORS.map((d, i) => (
                                <div key={i} className="relative w-11 h-11 rounded-full border-3 border-white shadow-md overflow-hidden" style={{ zIndex: 4 - i }}>
                                    <SafeImage src={d.img} alt={d.name} fill className="object-cover" />
                                </div>
                            ))}
                            <div className="w-11 h-11 rounded-full border-3 border-white shadow-md bg-[#3C81C6] flex items-center justify-center text-white text-xs font-bold">+116</div>
                        </div>
                        <div className="border-l-2 border-gray-200 pl-6">
                            <div className="flex items-center gap-1 mb-0.5">
                                {[1,2,3,4,5].map(i => <span key={i} className="material-symbols-outlined text-amber-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                                <span className="text-sm font-bold text-[#121417] ml-1">4.9/5</span>
                            </div>
                            <p className="text-xs text-[#687582]">Từ 12,500+ đánh giá</p>
                        </div>
                    </div>
                </ScrollReveal>
                <ScrollReveal delay={200} className="relative hidden lg:block">
                    <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                        <SafeImage src={IMG.hero} alt="Bác sĩ EHealth" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#3C81C6]/20 to-transparent" />
                    </div>
                    <div className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100 animate-[float_3s_ease-in-out_infinite]">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center"><span className="material-symbols-outlined text-green-600 text-[24px]">check_circle</span></div>
                        <div><p className="text-sm font-bold text-[#121417]">Lịch hẹn đã xác nhận</p><p className="text-xs text-[#687582]">BS. Trần Minh — 09:00 sáng</p></div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100 animate-[float_3.5s_ease-in-out_infinite_0.5s]">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><span className="material-symbols-outlined text-blue-600 text-[24px]">lab_profile</span></div>
                        <div><p className="text-sm font-bold text-[#121417]">Kết quả xét nghiệm</p><p className="text-xs text-green-600 font-medium">Tất cả chỉ số bình thường ✓</p></div>
                    </div>
                    <div className="absolute top-1/2 -right-8 bg-white rounded-2xl shadow-xl p-3 border border-gray-100 animate-[float_4s_ease-in-out_infinite_1s]">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center"><span className="material-symbols-outlined text-violet-600">smart_toy</span></div>
                            <div><p className="text-xs font-bold text-[#121417]">AI Hỗ trợ chẩn đoán</p><p className="text-[10px] text-green-600">Online 24/7</p></div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
