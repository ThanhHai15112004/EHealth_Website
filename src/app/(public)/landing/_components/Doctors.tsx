import { DOCTORS } from "./data";
import { SafeImage } from "./SafeImage";
import { ScrollReveal } from "./ScrollReveal";

export function DoctorTeam({ scrollTo }: { scrollTo: (id: string) => void }) {
    return (
        <section id="doctors" className="py-20 px-6 bg-white" aria-label="Đội ngũ bác sĩ">
            <div className="max-w-7xl mx-auto">
                <ScrollReveal className="text-center mb-14">
                    <p className="text-sm font-bold text-[#3C81C6] uppercase tracking-widest mb-2">Đội ngũ</p>
                    <h2 className="text-3xl md:text-4xl font-black text-[#121417] mb-3">Bác sĩ chuyên khoa hàng đầu</h2>
                    <p className="text-[#687582] max-w-2xl mx-auto">Đội ngũ giáo sư, tiến sĩ, bác sĩ chuyên khoa II với nhiều năm kinh nghiệm trong và ngoài nước.</p>
                </ScrollReveal>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {DOCTORS.map((d, i) => (
                        <ScrollReveal key={d.name} delay={i * 100}>
                            <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                                <div className="relative h-64 overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100">
                                    <SafeImage src={d.img} alt={d.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-base font-bold text-[#121417]">{d.name}</h3>
                                    <p className="text-sm text-[#3C81C6] font-semibold mt-0.5">{d.title}</p>
                                    <p className="text-xs text-[#687582] mt-1 mb-3">{d.exp}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {d.specialties.map(s => <span key={s} className="px-2 py-0.5 bg-blue-50 text-[#3C81C6] text-[10px] font-semibold rounded-full">{s}</span>)}
                                    </div>
                                    <button onClick={() => scrollTo("booking")} className="w-full mt-auto py-2.5 border-2 border-[#3C81C6] text-[#3C81C6] rounded-xl text-sm font-bold hover:bg-[#3C81C6] hover:text-white transition-all flex items-center justify-center gap-1.5 active:scale-95" aria-label={`Đặt lịch khám với ${d.name}`}>
                                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>Đặt lịch
                                    </button>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
