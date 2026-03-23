import { IMG } from "./data";
import { SafeImage } from "./SafeImage";
import { ScrollReveal } from "./ScrollReveal";

export function AboutSection({ scrollTo }: { scrollTo: (id: string) => void }) {
    return (
        <section id="about" className="py-20 px-6 bg-slate-50" aria-label="Giới thiệu bệnh viện">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <ScrollReveal>
                    <div className="relative">
                        <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] relative">
                            <SafeImage src={IMG.about} alt="Bệnh viện EHealth" fill className="object-cover" />
                        </div>
                        <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3C81C6] to-[#1d4ed8] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-[28px]">verified</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-[#121417]">ISO 9001</p>
                                    <p className="text-xs text-[#687582]">Chứng nhận chất lượng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
                <ScrollReveal delay={200}>
                    <p className="text-sm font-bold text-[#3C81C6] uppercase tracking-widest mb-3">Về chúng tôi</p>
                    <h2 className="text-3xl md:text-4xl font-black text-[#121417] mb-6 leading-tight">Hệ thống Y tế<br />hàng đầu Việt Nam</h2>
                    <p className="text-[#687582] leading-relaxed mb-6">
                        Với hơn 15 năm kinh nghiệm, EHealth Hospital tự hào là một trong những bệnh viện đa khoa hàng đầu tại Việt Nam. Chúng tôi không ngừng đầu tư công nghệ hiện đại và phát triển đội ngũ y bác sĩ chuyên môn cao.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {[
                            { icon: "verified_user", label: "Bộ Y tế cấp phép" },
                            { icon: "workspace_premium", label: "JCI quốc tế" },
                            { icon: "groups", label: "120+ bác sĩ" },
                            { icon: "hotel", label: "200+ giường bệnh" },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <span className="material-symbols-outlined text-[#3C81C6] text-[22px]">{item.icon}</span>
                                <span className="text-sm font-semibold text-[#121417]">{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => scrollTo("booking")} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3C81C6] to-[#1d4ed8] text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/20 active:scale-95" aria-label="Đặt lịch khám bệnh">
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>Đặt lịch khám
                    </button>
                </ScrollReveal>
            </div>
        </section>
    );
}
