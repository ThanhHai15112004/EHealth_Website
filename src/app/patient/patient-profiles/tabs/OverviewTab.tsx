import React, { useEffect, useState } from "react";
import { type PatientProfile } from "@/types/patient-profile";
import { ehrService } from "@/services/ehrService";
import { getEmergencyContacts, getLegalRepresentative, getPatientSummary } from "@/services/patientService";

interface TabProps {
    profile: PatientProfile;
    insuranceInfo?: any | null;
}

export default function OverviewTab({ profile, insuranceInfo }: TabProps) {
    const [summary, setSummary] = useState<any | null>(profile.summary || null);
    const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
    const [legalRepresentative, setLegalRepresentative] = useState<any | null>(null);
    const [healthSummary, setHealthSummary] = useState<any | null>(null);

    useEffect(() => {
        const loadOverview = async () => {
            if (!profile.id) return;

            const [summaryRes, emergencyRes, legalRes, healthRes] = await Promise.allSettled([
                getPatientSummary(profile.id),
                getEmergencyContacts(profile.id),
                getLegalRepresentative(profile.id),
                ehrService.getHealthSummary(profile.id),
            ]);

            if (summaryRes.status === "fulfilled" && summaryRes.value.success) {
                setSummary(summaryRes.value.data || null);
            }
            if (emergencyRes.status === "fulfilled" && emergencyRes.value.success) {
                setEmergencyContacts(Array.isArray(emergencyRes.value.data) ? emergencyRes.value.data : []);
            }
            if (legalRes.status === "fulfilled" && legalRes.value.success) {
                setLegalRepresentative(legalRes.value.data || null);
            }
            if (healthRes.status === "fulfilled") {
                setHealthSummary(healthRes.value || null);
            }
        };

        loadOverview();
    }, [profile.id]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Thông tin</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Thông tin nền của bệnh nhân và các liên hệ cần thiết để theo dõi hồ sơ.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-[#2d353e] dark:bg-[#13191f]">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "20px" }}>badge</span>
                        Thông tin hành chính
                    </h3>

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <DataBlock label="Ngày sinh" value={profile.dob ? new Date(profile.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"} />
                        <DataBlock label="Giới tính" value={profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : "Khác"} />
                        <DataBlock label="Số điện thoại" value={profile.phone || "Chưa cập nhật"} />
                        <DataBlock label="Email" value={profile.email || "Chưa cập nhật"} />
                        <DataBlock label="CCCD/CMND" value={profile.idNumber || "Chưa cập nhật"} />
                        <DataBlock label="Địa chỉ" value={profile.address || "Chưa cập nhật"} />
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-[#2d353e] dark:bg-[#13191f]">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                        <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: "20px" }}>health_metrics</span>
                        Tình trạng sức khỏe
                    </h3>

                    <div className="mt-5 space-y-4">
                        <HealthRow label="Nhóm máu" value={profile.bloodType || healthSummary?.blood_type || "Chưa xác định"} />
                        <HealthRow label="Nhà bảo hiểm" value={insuranceInfo?.provider_name || profile.insuranceProviderName || "Chưa liên kết"} />
                        <HealthRow label="Hiệu lực bảo hiểm" value={insuranceInfo?.end_date ? new Date(insuranceInfo.end_date).toLocaleDateString("vi-VN") : "Chưa có dữ liệu"} />
                        <HealthRow label="Số thẻ bảo hiểm" value={insuranceInfo?.insurance_number || profile.insuranceNumber || "Chưa liên kết"} />

                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-[#0f141b]">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Dị ứng</p>
                            {profile.allergies && profile.allergies.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {profile.allergies.map((allergy) => (
                                        <span key={allergy} className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 dark:bg-red-500/15 dark:text-red-300">
                                            {allergy}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Không có tiền sử dị ứng.</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-[#2d353e] dark:bg-[#13191f]">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "20px" }}>contacts</span>
                        Liên hệ quan trọng
                    </h3>

                    <div className="mt-5 space-y-4">
                        {legalRepresentative ? (
                            <ContactCard
                                title="Người đại diện pháp lý"
                                name={legalRepresentative.contact_name || legalRepresentative.full_name}
                                meta={legalRepresentative.phone_number || "Chưa có số điện thoại"}
                            />
                        ) : (
                            <EmptyCard text="Chưa có người đại diện pháp lý." />
                        )}

                        {emergencyContacts.length > 0 ? (
                            emergencyContacts.slice(0, 2).map((contact, index) => (
                                <ContactCard
                                    key={contact.patient_contacts_id || index}
                                    title={`Liên hệ khẩn cấp ${index + 1}`}
                                    name={contact.contact_name || contact.full_name}
                                    meta={`${contact.phone_number || "Chưa có SĐT"}${contact.relation_type_name ? ` • ${contact.relation_type_name}` : ""}`}
                                />
                            ))
                        ) : (
                            <EmptyCard text="Chưa thiết lập liên hệ khẩn cấp." />
                        )}
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-[#2d353e] dark:bg-[#13191f]">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                        <span className="material-symbols-outlined text-violet-500" style={{ fontSize: "20px" }}>summarize</span>
                        Ghi chú hồ sơ
                    </h3>

                    <div className="mt-5 space-y-4">
                        <NoteBlock
                            title="Bệnh sử ghi nhận"
                            content={profile.medicalHistory || "Chưa có thông tin bệnh nền."}
                        />
                        <NoteBlock
                            title="Tóm tắt sức khỏe"
                            content={healthSummary?.general_health_note || healthSummary?.health_note || "Chưa có ghi chú tổng hợp."}
                        />
                        <NoteBlock
                            title="Tổng quan hồ sơ"
                            content={`Số thẻ bảo hiểm đang liên kết: ${String(summary?.insurance_count ?? profile.summary?.insuranceCount ?? (profile.hasInsurance ? 1 : 0))}`}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

function DataBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-[#0f141b]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-900 dark:text-white break-words">{value}</p>
        </div>
    );
}

function HealthRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-[#0f141b]">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-right text-sm font-medium text-slate-900 dark:text-white break-words">{value}</p>
        </div>
    );
}

function ContactCard({ title, name, meta }: { title: string; name: string; meta: string }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-[#0f141b]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{name || "Chưa có tên"}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{meta}</p>
        </div>
    );
}

function NoteBlock({ title, content }: { title: string; content: string }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-[#0f141b]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{content}</p>
        </div>
    );
}

function EmptyCard({ text }: { text: string }) {
    return <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-[#0f141b] dark:text-slate-400">{text}</p>;
}
