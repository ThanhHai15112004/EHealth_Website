"use client";

import { useState, useEffect } from "react";
import { TESTIMONIALS } from "./data";
import { SafeImage } from "./SafeImage";
import { ScrollReveal } from "./ScrollReveal";

export function TestimonialsSection() {
    const [active, setActive] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setActive(p => (p + 1) % TESTIMONIALS.length), 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section id="testimonials" className="py-20 px-6 bg-slate-50" aria-label="Đánh giá từ bệnh nhân">
            <div className="max-w-7xl mx-auto">
                <ScrollReveal className="text-center mb-14">
                    <p className="text-sm font-bold text-[#3C81C6] uppercase tracking-widest mb-2">Đánh giá</p>
                    <h2 className="text-3xl md:text-4xl font-black text-[#121417] mb-3">Bệnh nhân nói gì?</h2>
                </ScrollReveal>
                <ScrollReveal>
                    <div className="max-w-3xl mx-auto">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={t.name} className={`transition-all duration-500 ${i === active ? "block" : "hidden"}`} role="tabpanel" aria-label={`Đánh giá từ ${t.name}`}>
                                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 text-center">
                                    <div className="flex justify-center mb-4">
                                        {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined text-amber-400 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                                    </div>
                                    <p className="text-lg text-[#121417] leading-relaxed mb-8 italic">&ldquo;{t.text}&rdquo;</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#3C81C6]/20 relative">
                                            <SafeImage src={t.img} alt={t.name} fill className="object-cover" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-base font-bold text-[#121417]">{t.name}</p>
                                            <p className="text-sm text-[#687582]">{t.age} tuổi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Chọn đánh giá">
                            {TESTIMONIALS.map((_, i) => (
                                <button key={i} onClick={() => setActive(i)} role="tab" aria-selected={i === active} aria-label={`Đánh giá ${i + 1}`}
                                    className={`w-3 h-3 rounded-full transition-all ${i === active ? "bg-[#3C81C6] w-8" : "bg-gray-300 hover:bg-gray-400"}`} />
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
