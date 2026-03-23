import { SERVICES } from "./data";
import { SafeImage } from "./SafeImage";
import { ScrollReveal } from "./ScrollReveal";

export function ServicesGrid() {
    return (
        <section id="services" className="py-20 px-6 bg-white" aria-label="Dịch vụ y tế">
            <div className="max-w-7xl mx-auto">
                <ScrollReveal className="text-center mb-14">
                    <p className="text-sm font-bold text-[#3C81C6] uppercase tracking-widest mb-2">Chuyên khoa</p>
                    <h2 className="text-3xl md:text-4xl font-black text-[#121417] mb-3">Dịch vụ y tế chất lượng cao</h2>
                    <p className="text-[#687582] max-w-2xl mx-auto">Với đội ngũ hơn 120 bác sĩ chuyên khoa, trang thiết bị nhập khẩu từ Đức, Nhật, chúng tôi cam kết mang đến dịch vụ y tế tốt nhất.</p>
                </ScrollReveal>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SERVICES.map((s, i) => (
                        <ScrollReveal key={s.title} delay={i * 80}>
                            <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                                <div className="relative h-48 overflow-hidden">
                                    <SafeImage src={s.img} alt={s.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                    <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                                        <span className="material-symbols-outlined text-white text-[22px]">{s.icon}</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-[#121417] mb-2">{s.title}</h3>
                                    <p className="text-sm text-[#687582] leading-relaxed mb-4">{s.desc}</p>
                                    <div className="flex items-center gap-1 text-[#3C81C6] text-sm font-semibold group-hover:gap-2 transition-all">
                                        Tìm hiểu thêm <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
