"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { RELATIONSHIP_OPTIONS, type PatientProfile } from "@/types/patient-profile";
import { validateName, validatePhone, validateDob, validateIdNumber, validateBHYT } from "@/utils/validation";
import { getPatientsByAccountId, createPatient, updatePatient, linkAccount, updatePatientStatus, updateContact } from "@/services/patientService";
import { mapToProfile, saveLocalRelation } from "@/utils/patientMapper";

// ============================================
// Tách logic fetch & map profile từ backend
// ============================================

export default function PatientProfilesPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Load từ localStorage, fallback sang mock data
    const [profiles, setProfiles] = useState<PatientProfile[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [view, setView] = useState<"list" | "form">("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<PatientProfile>>({});
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch Data from API
    const loadData = useCallback(async () => {
        if (!user?.id) return;
        setLoaded(false);
        try {
            const res = await getPatientsByAccountId(user.id);
            if (res.success && res.data) {
                // Map Backend patients to Frontend struct
                const mapped = res.data.map(p => {
                    const prof = mapToProfile(p, user);
                    prof.userId = user.id;
                    return prof;
                });
                setProfiles(mapped);
            } else {
                setProfiles([]);
            }
        } catch (error) {
            showToast("Kh?ng th? t?i danh s?ch h? s?", "error");
        } finally {
            setLoaded(true);
        }
    }, [user?.id, showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle auto-edit from URL params (e.g. from detail page)
    useEffect(() => {
        if (loaded && profiles.length > 0) {
            const action = searchParams?.get('action');
            const targetId = searchParams?.get('id');
            if (action === 'edit' && targetId) {
                const targetProfile = profiles.find(p => p.id === targetId);
                if (targetProfile) {
                    openEdit(targetProfile);
                }
            }
        }
    }, [loaded, searchParams, profiles]);

    const openCreate = () => {
        setFormData({ relationship: "other", relationshipLabel: "Khác", gender: "male", isActive: true, isPrimary: false });
        setEditingId(null);
        setErrors({});
        setView("form");
    };

    const openEdit = (profile: PatientProfile) => {
        setFormData({ ...profile });
        setEditingId(profile.id);
        setErrors({});
        setView("form");
    };

    // ============================================
    // Validation — kiểm tra chuẩn logic
    // ============================================
    const validateForm = (): boolean => {
        const errs: Record<string, string> = {};

        // Tên: bắt buộc, 2-100 ký tự, không chứa số
        const nameRes = validateName(formData.fullName || "", "Họ tên");
        if (!nameRes.valid) errs.fullName = nameRes.message;

        // SĐT: bắt buộc, đúng format VN (10 số, 03x/05x/07x/08x/09x)
        const phoneRes = validatePhone(formData.phone || "");
        if (!phoneRes.valid) errs.phone = phoneRes.message;

        // Ngày sinh: không ở tương lai, tuổi 0-150
        if (formData.dob) {
            const dobRes = validateDob(formData.dob);
            if (!dobRes.valid) errs.dob = dobRes.message;
        }

        // CCCD: 9 hoặc 12 chữ số (optional)
        if (formData.idNumber) {
            const idRes = validateIdNumber(formData.idNumber);
            if (!idRes.valid) errs.idNumber = idRes.message;
        }

        // BHYT: 15 ký tự — 2 chữ cái + 13 số (optional)
        if (formData.insuranceNumber) {
            const bhytRes = validateBHYT(formData.insuranceNumber);
            if (!bhytRes.valid) errs.insuranceNumber = bhytRes.message;
        }

        // Giới tính: bắt buộc
        if (!formData.gender) errs.gender = "Vui lòng chọn giới tính";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ============================================
    // Save
    // ============================================
    // ============================================
    // Save
    // ============================================
    const handleSave = async () => {
        if (!validateForm()) {
            showToast("Vui lòng kiểm tra lại thông tin", "error");
            return;
        }

        if (editingId) {
            // API call to update patient
            try {
                const res = await updatePatient(editingId, {
                    full_name: formData.fullName?.trim() || "",
                    date_of_birth: formData.dob || "",
                    gender: (formData.gender?.toUpperCase() || "MALE") as any,
                    identity_number: formData.idNumber?.replace(/\s/g, "") || undefined,
                });
                
                // Cập nhật sđt và địa chỉ thông qua updateContact nếu cần
                if (res.success) {
                    await updateContact(editingId, {
                        phone_number: formData.phone?.replace(/[\s\-\.]/g, "") || "",
                        street_address: formData.address?.trim() || undefined
                    });
                }
                if (res.success) {
                    saveLocalRelation(editingId, formData.relationship || 'other', formData.relationshipLabel || 'Khác');
                    showToast("Cập nhật hồ sơ thành công!", "success");
                    loadData();
                } else {
                    showToast(res.message || "Lỗi cập nhật", "error");
                }
            } catch (err) {
                showToast("Lỗi hệ thống", "error");
            }
            
        } else {
            // API call to create patient
            try {
                const phoneNumber = formData.phone?.replace(/[\s\-\.]/g, "") || undefined; 
                const createRes = await createPatient({
                    full_name: formData.fullName?.trim() || "",
                    date_of_birth: formData.dob || "1990-01-01",
                    gender: (formData.gender?.toUpperCase() || "MALE") as any,
                    identity_number: formData.idNumber?.replace(/\s/g, "") || undefined,
                    contact: {
                        phone_number: phoneNumber || "",
                        street_address: formData.address?.trim() || undefined
                    }
                });

                const createdPatientId = createRes.data?.id || createRes.data?.patient_id;
                if (createRes.success && createdPatientId) {
                    // Link to account regardless of relationship so it appears in the user's patient list
                    if (user?.id) {
                        await linkAccount(createdPatientId, user.id);
                    }
                    saveLocalRelation(createdPatientId, formData.relationship || 'other', formData.relationshipLabel || 'Khác');
                    showToast("Tạo hồ sơ mới thành công!", "success");
                    loadData();
                } else {
                    showToast(createRes.message || "Tạo hồ sơ thất bại", "error");
                }
            } catch (err) {
                showToast("Lỗi hệ thống", "error");
            }
        }
        setView("list");
        setEditingId(null);
    };

    const handleDeactivate = async (id: string) => {
        const res = await updatePatientStatus(id, "INACTIVE");
        if (res.success) {
            showToast("Đã ngừng sử dụng hồ sơ", "info");
            loadData();
        } else {
            showToast("Ngừng sử dụng thất bại", "error");
        }
        setDeleteConfirm(null);
    };

    const handleReactivate = async (id: string) => {
        const res = await updatePatientStatus(id, "ACTIVE");
        if (res.success) {
            showToast("Đã kích hoạt lại hồ sơ", "success");
            loadData();
        } else {
            showToast("Kích hoạt lại thất bại", "error");
        }
    };

    const activeProfiles = useMemo(() => profiles.filter(p => p.isActive), [profiles]);
    const inactiveProfiles = useMemo(() => profiles.filter(p => !p.isActive), [profiles]);

    const getRelIcon = (rel: string) => RELATIONSHIP_OPTIONS.find(r => r.value === rel)?.icon || "person";
    const getRelColor = (rel: string) => {
        const colors: Record<string, string> = { self: "from-[#3C81C6] to-[#2563eb]", parent: "from-violet-500 to-purple-600", child: "from-cyan-500 to-teal-600", sibling: "from-emerald-500 to-green-600", spouse: "from-rose-500 to-pink-600", other: "from-gray-500 to-gray-600" };
        return colors[rel] || colors.other;
    };

    const getInsuranceBadge = (profile: PatientProfile) => {
        if (!profile.hasInsurance && !profile.insuranceNumber) return { label: "Chưa có BH", className: "bg-amber-50 text-amber-700" };
        if (profile.insuranceStatus === "expired") return { label: "BH hết hạn", className: "bg-rose-50 text-rose-700" };
        if (profile.insuranceStatus === "expiring") return { label: "BH sắp hết hạn", className: "bg-amber-50 text-amber-700" };
        return { label: "BH còn hiệu lực", className: "bg-emerald-50 text-emerald-700" };
    };

    if (!loaded) return <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-[#3C81C6]" style={{ fontSize: "32px" }}>progress_activity</span></div>;

    return (
        <div className="space-y-6">
            {/* ===== LIST VIEW ===== */}
            {view === "list" && (<>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#121417] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "28px" }}>family_restroom</span>
                        Hồ sơ bệnh nhân
                    </h1>
                    <p className="text-sm text-[#687582] mt-1">Quản lý hồ sơ bệnh nhân cho bản thân và người thân trong gia đình</p>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white text-sm font-bold rounded-xl shadow-md shadow-[#3C81C6]/20 hover:shadow-lg transition-all active:scale-[0.97]">
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                    Thêm hồ sơ
                </button>
            </div>

            {/* Info banner */}
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-[#3C81C6] mt-0.5" style={{ fontSize: "20px" }}>info</span>
                <div>
                    <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">Một tài khoản có thể quản lý nhiều hồ sơ bệnh nhân</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">Thêm hồ sơ cho cha mẹ, con cái, vợ/chồng để đặt lịch nhanh hơn mà không cần nhập lại thông tin.</p>
                </div>
            </div>

            {/* Active profiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProfiles.map(profile => (
                    <div key={profile.id}
                        className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5 hover:shadow-lg hover:border-[#3C81C6]/20 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRelColor(profile.relationship)} flex items-center justify-center text-white shadow-lg`}>
                                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>{getRelIcon(profile.relationship)}</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-[#121417] dark:text-white">{profile.fullName}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${profile.isPrimary ? "bg-[#3C81C6]/10 text-[#3C81C6]" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                                            {profile.relationshipLabel}
                                        </span>
                                        {profile.isPrimary && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 rounded-full">Chính</span>
                                        )}
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getInsuranceBadge(profile).className}`}>
                                            {getInsuranceBadge(profile).label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{profile.patientCode || profile.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(profile)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-[#3C81C6] transition-colors" title="Chỉnh sửa">
                                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                                </button>
                                {!profile.isPrimary && (
                                    <button onClick={() => setDeleteConfirm(profile.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors" title="Ngưng sử dụng">
                                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person_off</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <InfoRow icon="cake" label="Ngày sinh" value={profile.dob ? new Date(profile.dob + "T00:00:00").toLocaleDateString("vi-VN") : "—"} />
                            <InfoRow icon="wc" label="Giới tính" value={profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : "Khác"} />
                            <InfoRow icon="call" label="SĐT" value={profile.phone} />
                            <InfoRow icon="badge" label="CCCD" value={profile.idNumber || "—"} />
                            <InfoRow icon="health_and_safety" label="BHYT" value={profile.insuranceNumber || "—"} />
                            <InfoRow icon="location_on" label="Địa chỉ" value={profile.address || "—"} />
                        </div>

                        {(profile.allergies && profile.allergies.length > 0) && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2d353e]">
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>warning</span> Dị ứng
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {profile.allergies.map(a => (
                                        <span key={a} className="px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-600 text-[10px] font-bold rounded-full">{a}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick actions */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2d353e] flex items-center gap-2">
                            <Link href={`/patient/patient-profiles/${profile.id}`}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#3C81C6]/10 text-[#3C81C6] text-xs font-bold rounded-lg hover:bg-[#3C81C6]/20 transition-all">
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>visibility</span>
                                Xem chi tiết
                            </Link>
                            <Link href={`/booking?profileId=${profile.id}`}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.97]">
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>calendar_month</span>
                                Đặt lịch
                            </Link>
                            <Link href="/patient/medication-reminders"
                                className="flex items-center justify-center gap-1 py-2 px-3 border border-gray-200 dark:border-[#2d353e] text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>medication</span>
                                Nhắc thuốc
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Add new card */}
                <button onClick={openCreate}
                    className="bg-white dark:bg-[#1e242b] rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#2d353e] p-8 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-[#3C81C6] hover:text-[#3C81C6] transition-all group cursor-pointer min-h-[250px]">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-[#3C81C6]/10 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>person_add</span>
                    </div>
                    <p className="text-sm font-semibold">Thêm hồ sơ mới</p>
                    <p className="text-xs text-center max-w-[200px]">Thêm hồ sơ cho người thân để đặt lịch nhanh hơn</p>
                </button>
            </div>

            {/* Inactive profiles */}
            {inactiveProfiles.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Hồ sơ đã ngưng</h3>
                    <div className="space-y-2">
                        {inactiveProfiles.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#13191f] rounded-xl opacity-60">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-gray-400" style={{ fontSize: "16px" }}>person_off</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{p.fullName}</p>
                                        <p className="text-[10px] text-gray-400">{p.relationshipLabel}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleReactivate(p.id)}
                                    className="text-xs text-[#3C81C6] font-medium hover:underline">Kích hoạt lại</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            </>)}

            {/* ===== Form tạo/chỉnh sửa (Inline) ===== */}
            {view === "form" && (
                <div className="bg-white dark:bg-[#0d1117] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e]">
                    <div className="max-w-lg mx-auto py-6 px-4">
                        <div className="pb-4 mb-4 border-b border-gray-100 dark:border-[#2d353e] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={() => {
                                    setView("list");
                                    // if there was an action parameter, remove it by routing to base
                                    if (searchParams?.get('action')) {
                                        router.replace('/patient/patient-profiles');
                                    }
                                }} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <span className="material-symbols-outlined text-gray-500" style={{ fontSize: "20px" }}>arrow_back</span>
                                </button>
                                <h2 className="text-lg font-bold text-[#121417] dark:text-white">
                                    {editingId ? "Chỉnh sửa hồ sơ" : "Thêm hồ sơ mới"}
                                </h2>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {/* Relationship */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Quan hệ</label>
                                <div className="flex flex-wrap gap-2">
                                    {RELATIONSHIP_OPTIONS.map(opt => (
                                        <button key={opt.value} onClick={() => setFormData(prev => ({ ...prev, relationship: opt.value as PatientProfile["relationship"], relationshipLabel: opt.label }))}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all
                                            ${formData.relationship === opt.value ? "border-[#3C81C6] bg-[#3C81C6]/10 text-[#3C81C6]" : "border-gray-100 text-gray-600 hover:border-gray-200"}`}>
                                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <ModalField label="Họ và tên *" value={formData.fullName || ""} onChange={v => { setFormData(p => ({ ...p, fullName: v })); setErrors(e => ({ ...e, fullName: "" })); }} error={errors.fullName} />
                            <div className="grid grid-cols-2 gap-4">
                                <ModalField label="Số điện thoại *" value={formData.phone || ""} onChange={v => { setFormData(p => ({ ...p, phone: v })); setErrors(e => ({ ...e, phone: "" })); }} type="tel" error={errors.phone} placeholder="VD: 0901234567" />
                                <ModalField label="Ngày sinh" value={formData.dob || ""} onChange={v => { setFormData(p => ({ ...p, dob: v })); setErrors(e => ({ ...e, dob: "" })); }} type="date" error={errors.dob} />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Giới tính *</label>
                                <div className="flex gap-2">
                                    {[{ v: "male", l: "Nam" }, { v: "female", l: "Nữ" }, { v: "other", l: "Khác" }].map(g => (
                                        <button key={g.v} onClick={() => { setFormData(p => ({ ...p, gender: g.v as PatientProfile["gender"] })); setErrors(e => ({ ...e, gender: "" })); }}
                                            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all
                                            ${formData.gender === g.v ? "border-[#3C81C6] bg-[#3C81C6]/[0.06] text-[#3C81C6]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                                            {g.l}
                                        </button>
                                    ))}
                                </div>
                                {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <ModalField label="CCCD" value={formData.idNumber || ""} onChange={v => { setFormData(p => ({ ...p, idNumber: v })); setErrors(e => ({ ...e, idNumber: "" })); }} error={errors.idNumber} placeholder="9 hoặc 12 chữ số" />
                                <ModalField label="Số BHYT" value={formData.insuranceNumber || ""} onChange={v => { setFormData(p => ({ ...p, insuranceNumber: v })); setErrors(e => ({ ...e, insuranceNumber: "" })); }} error={errors.insuranceNumber} placeholder="15 ký tự" />
                            </div>
                            <ModalField label="Địa chỉ" value={formData.address || ""} onChange={v => setFormData(p => ({ ...p, address: v }))} />
                        </div>
                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[#2d353e] flex items-center justify-end gap-3">
                            <button onClick={() => setView("list")}
                                className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                Hủy
                            </button>
                            <button onClick={handleSave}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#3C81C6] to-[#2563eb] rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.97]">
                                {editingId ? "Lưu thay đổi" : "Tạo hồ sơ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Delete Confirm ===== */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white dark:bg-[#1e242b] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-red-500" style={{ fontSize: "28px" }}>person_off</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#121417] dark:text-white mb-2">Ngưng sử dụng hồ sơ?</h3>
                        <p className="text-sm text-gray-500 mb-6">Hồ sơ này sẽ không hiển thị khi đặt lịch nhưng có thể kích hoạt lại.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                Hủy
                            </button>
                            <button onClick={() => handleDeactivate(deleteConfirm)}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors active:scale-[0.97]">
                                Ngưng sử dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-gray-400" style={{ fontSize: "14px" }}>{icon}</span>
            <span className="text-xs text-gray-400">{label}:</span>
            <span className="text-xs font-medium text-[#121417] dark:text-white truncate">{value}</span>
        </div>
    );
}

function ModalField({ label, value, onChange, type = "text", error, placeholder }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; error?: string; placeholder?: string;
}) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-[#13191f] focus:outline-none focus:ring-2 focus:ring-[#3C81C6]/30 placeholder-gray-400 transition-colors
                ${error ? "border-red-300 dark:border-red-500/40 focus:ring-red-300/30" : "border-gray-200 dark:border-[#2d353e]"}`} />
            {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "12px" }}>error</span>{error}</p>}
        </div>
    );
}
