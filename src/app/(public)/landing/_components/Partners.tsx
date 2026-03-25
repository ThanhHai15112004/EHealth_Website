import { PARTNERS } from "./data";
import { SafeImage } from "./SafeImage";

export function PartnersSection() {
    return (
        <section className="py-12 px-6 bg-gray-50/50 border-y border-gray-100" aria-label="Đối tác bảo hiểm">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0 text-center md:text-left">
                        <p className="text-sm font-bold text-[#3C81C6] uppercase tracking-widest mb-1">Đối tác bảo hiểm</p>
                        <p className="text-xs text-[#687582]">Chấp nhận BHYT & bảo hiểm tư nhân</p>
                    </div>
                    <div className="flex-1 w-full overflow-hidden">
                        <div className="flex items-center justify-center md:justify-between gap-8 flex-wrap">
                            {PARTNERS.map((p) => (
                                <div key={p.name} className="relative w-24 h-12 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer">
                                    <SafeImage src={p.img} alt={p.name} fill className="object-contain" />
                                </div>
                            ))}
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                                <span className="material-symbols-outlined text-[#3C81C6] text-[16px]">add_circle</span>
                                <span className="text-xs font-bold text-[#3C81C6]">+20 đối tác</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}