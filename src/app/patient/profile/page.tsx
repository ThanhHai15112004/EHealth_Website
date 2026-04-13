"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import axiosClient from "@/api/axiosClient";
import { PROFILE_ENDPOINTS, PATIENT_ENDPOINTS } from "@/api/endpoints";
import { validateName, validatePhone, validateDob, validateIdNumber, validateBHYT } from "@/utils/validation";
import { getPatientsByAccountId } from "@/services/patientService";

const TABS = [
    { id: "personal", label: "Thông tin cá nhân", icon: "person" },
    { id: "family", label: "Người thân", icon: "group" },
    { id: "history", label: "Lịch sử khám", icon: "history" },
    { id: "insurance", label: "Bảo hiểm", icon: "health_and_safety" },
    { id: "results", label: "Kết quả", icon: "lab_profile" },
    { id: "security", label: "Bảo mật", icon: "lock" },
];

interface ProfileData {
    fullName: string;
    phone: string;
    email: string;
    dob: string;
    gender: string;
    idNumber: string;
    insuranceNumber: string;
    address: string;
    avatar?: string;
}

interface FamilyMember {
    id: string;
    name: string;
    dob: string;
    gender: string;
    relation: string;
    relationTypeId?: string;
    phone: string;
}

interface RelationType {
    relation_types_id: string;
    code: string;
    name: string;
    description?: string;
    is_active: boolean;
}

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData>({
        fullName: user?.fullName || "",
        phone: user?.phone || "",
        email: user?.email || "",
        dob: "",
        gender: "MALE",
        idNumber: "",
        insuranceNumber: "",
        address: "",
    });
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [showAddFamily, setShowAddFamily] = useState(false);
    const [primaryPatientId, setPrimaryPatientId] = useState<string | null>(null);
    const [newFamily, setNewFamily] = useState<Partial<FamilyMember>>({ name: "", dob: "", gender: "male", relation: "", phone: "" });
    const [relationTypes, setRelationTypes] = useState<RelationType[]>([]);
    const [isEditFamily, setIsEditFamily] = useState(false);
    const [editFamilyId, setEditFamilyId] = useState<string | null>(null);

    // Password change
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast("Vui lòng chọn file hình ảnh", "error");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast("Kích thước ảnh không được vượt quá 5MB", "error");
            return;
        }

        try {
            setIsUploadingAvatar(true);
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await axiosClient.post(PROFILE_ENDPOINTS.AVATAR, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = res.data?.data || res.data;
            let avatarUrl = data?.avatarUrl || data?.avatar_url || data?.url || data?.file_path;
            if (Array.isArray(avatarUrl)) {
                 avatarUrl = avatarUrl[0]?.url || avatarUrl[0];
            }

            if ((res.data?.success || res.data?.status === 'success') && avatarUrl) {
                setProfile(prev => ({ ...prev, avatar: avatarUrl }));
                updateUser({ avatar: avatarUrl });
                showToast("Cập nhật ảnh đại diện thành công", "success");
            } else {
                throw new Error("Lỗi khi kết nối hoặc URL rỗng");
            }
        } catch (error: any) {
            console.error("Upload avatar error:", error);
            showToast(error.response?.data?.message || "Lỗi khi tải ảnh lên", "error");
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const validateProfile = (): boolean => {
        const errs: Record<string, string> = {};
        const nameRes = validateName(profile.fullName);
        if (!nameRes.valid) errs.fullName = nameRes.message;
        if (profile.phone) {
            const phoneRes = validatePhone(profile.phone);
            if (!phoneRes.valid) errs.phone = phoneRes.message;
        }
        if (profile.dob) {
            const dobRes = validateDob(profile.dob);
            if (!dobRes.valid) errs.dob = dobRes.message;
        }
        if (profile.idNumber) {
            const idRes = validateIdNumber(profile.idNumber);
            if (!idRes.valid) errs.idNumber = idRes.message;
        }
        if (profile.insuranceNumber) {
            const bhytRes = validateBHYT(profile.insuranceNumber);
            if (!bhytRes.valid) errs.insuranceNumber = bhytRes.message;
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    useEffect(() => {
        loadProfile();
        loadRelationTypes();
    }, []);

    const loadRelationTypes = async () => {
        try {
            const res = await axiosClient.get('/api/relation-types');
            const data = res.data?.data || res.data;
            if (Array.isArray(data)) {
                setRelationTypes(data.filter((rt: RelationType) => rt.is_active));
            }
        } catch (err) {
            console.error('Failed to load relation types', err);
        }
    };

    useEffect(() => {
        if (user?.id) {
            initFamilyMembers();
        }
    }, [user?.id]);

    const initFamilyMembers = async () => {
        if (!user?.id) return;
        try {
            const patientsRes = await getPatientsByAccountId(user.id);
            if (patientsRes.success && patientsRes.data && patientsRes.data.length > 0) {
                const pId = patientsRes.data[0].id; // assuming first is primary
                setPrimaryPatientId(pId);
                await loadFamilyMembers(pId);
            } else {
                setFamilyMembers([]);
            }
        } catch (err: any) {
            console.error("Failed to init family members", err);
        }
    };

    const loadFamilyMembers = async (pId: string = primaryPatientId as string) => {
        if (!pId) return;
        try {
            const res = await axiosClient.get(PATIENT_ENDPOINTS.GET_ALL_RELATIONS(pId));
            const dataObj = res.data?.data || res.data;
            const membersList = Array.isArray(dataObj) ? dataObj : (Array.isArray(dataObj?.data) ? dataObj.data : []);
            
            setFamilyMembers(membersList.map((r: any) => ({
                id: r.patient_contacts_id || r.relation_id || r.id,
                name: r.contact_name || r.full_name || r.name,
                dob: r.dob || "",
                gender: r.gender || "MALE",
                relation: r.relation_type_name || r.relationship || r.relation,
                relationTypeId: r.relation_type_id,
                phone: r.phone_number || r.phone || "",
            })));
        } catch (err: any) {
            console.error("Failed to load family members", err);
        }
    };

    /** Convert ISO/any date string to yyyy-MM-dd for <input type="date"> */
    const toDateInputValue = (raw: string | undefined | null): string => {
        if (!raw) return "";
        // Already yyyy-MM-dd
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
        // ISO string like "2000-04-11T17:00:00.000Z"
        const d = new Date(raw);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().split("T")[0];
    };

    const loadProfile = async () => {
        try {
            const res = await axiosClient.get(PROFILE_ENDPOINTS.ME);
            const data = res.data?.data || res.data;
            if (data) {
                setProfile({
                    fullName: data.full_name || data.fullName || user?.fullName || "",
                    phone: data.phone_number || data.phone || user?.phone || "",
                    email: data.email || user?.email || "",
                    dob: toDateInputValue(data.dob || data.dateOfBirth || data.date_of_birth),
                    gender: data.gender || "MALE",
                    idNumber: data.identity_card_number || data.idNumber || data.citizenId || "",
                    insuranceNumber: data.insuranceNumber || data.healthInsuranceId || "",
                    address: data.address || "",
                    avatar: (Array.isArray(data.avatar_url) && data.avatar_url.length > 0) 
                        ? data.avatar_url[data.avatar_url.length - 1].url 
                        : (data.avatar_url?.url || data.avatar),
                });
            }
        } catch { /* use defaults */ }
    };

    const handleSave = async () => {
        if (!validateProfile()) {
            showToast("Vui lòng kiểm tra lại thông tin", "error");
            return;
        }
        try {
            setSaving(true);
            await axiosClient.put(PROFILE_ENDPOINTS.ME, {
                full_name: profile.fullName,
                phone_number: profile.phone,
                dob: profile.dob || undefined,
                gender: profile.gender,
                identity_card_number: profile.idNumber || undefined,
                address: profile.address || undefined,
            });
            // Update user context so navbar/sidebar reflect changes
            updateUser({ fullName: profile.fullName, phone: profile.phone });
            // Reload from server to stay in sync
            await loadProfile();
            setEditing(false);
            showToast("Cập nhật thông tin thành công!", "success");
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
            showToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) return;
        try {
            setSaving(true);
            await axiosClient.put(PROFILE_ENDPOINTS.CHANGE_PASSWORD, {
                currentPassword: passwords.current,
                newPassword: passwords.new,
            });
            setPasswords({ current: "", new: "", confirm: "" });
            showToast("Đổi mật khẩu thành công!", "success");
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Đổi mật khẩu thất bại.";
            showToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleEditClick = (fm: FamilyMember) => {
        setNewFamily({ 
            name: fm.name, 
            dob: fm.dob, 
            gender: fm.gender, 
            relation: fm.relationTypeId || fm.relation, 
            phone: fm.phone 
        });
        setEditFamilyId(fm.id);
        setIsEditFamily(true);
        setShowAddFamily(true);
    };

    const handleDeleteFamily = async (id: string) => {
        if (!window.confirm("Bạn có chắc muốn xoá người thân này?")) return;
        try {
            if (primaryPatientId) {
                await axiosClient.delete(PATIENT_ENDPOINTS.DELETE_RELATION(primaryPatientId, id));
                await loadFamilyMembers(primaryPatientId);
            } else {
                setFamilyMembers(p => p.filter(fm => fm.id !== id));
            }
            showToast("Đã xoá người thân", "success");
        } catch (err: any) {
            showToast(err?.response?.data?.message || "Xoá người thân thất bại", "error");
        }
    };

    const handleSaveFamily = async () => {
        if (!newFamily.name || !newFamily.relation || !newFamily.phone) {
            showToast("Vui lòng điền đầy đủ họ tên, mối quan hệ và số điện thoại.", "error");
            return;
        }
        try {
            if (primaryPatientId) {
                const payload = {
                    patient_id: primaryPatientId,
                    relation_type_id: newFamily.relation,
                    contact_name: newFamily.name,
                    phone_number: newFamily.phone,
                    is_emergency_contact: false,
                };
                if (isEditFamily && editFamilyId) {
                    await axiosClient.put(PATIENT_ENDPOINTS.EDIT_RELATION(primaryPatientId, editFamilyId), payload);
                } else {
                    await axiosClient.post(PATIENT_ENDPOINTS.ADD_RELATION(primaryPatientId), payload);
                }
                await loadFamilyMembers(primaryPatientId);
            } else {
                if (isEditFamily && editFamilyId) {
                    setFamilyMembers(p => p.map(fm => fm.id === editFamilyId ? { ...fm, ...newFamily, relationTypeId: newFamily.relation } as FamilyMember : fm));
                } else {
                    setFamilyMembers(prev => [...prev, { ...newFamily, id: `fm-${Date.now()}` } as FamilyMember]);
                }
            }
            setShowAddFamily(false);
            setNewFamily({ name: "", dob: "", gender: "male", relation: "", phone: "" });
            setIsEditFamily(false);
            setEditFamilyId(null);
            showToast(isEditFamily ? "Cập nhật thành công!" : "Thêm người thân thành công!", "success");
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Thao tác thất bại.";
            showToast(msg, "error");
        }
    };

    const updateProfile = (key: keyof ProfileData, value: string) => setProfile(prev => ({ ...prev, [key]: value }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hồ sơ bệnh nhân</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Quản lý thông tin cá nhân và sức khoẻ</p>
                </div>
            </div>

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3C81C6] to-[#60a5fa] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#3C81C6]/20 overflow-hidden">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            profile.fullName?.charAt(0)?.toUpperCase() || "U"
                        )}
                        {isUploadingAvatar && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>edit</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
                <div className="text-center sm:text-left">
                    <h2 className="text-xl font-bold text-gray-900">{profile.fullName || "Bệnh nhân"}</h2>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                        {profile.phone && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg">
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>call</span>
                                {profile.phone}
                            </span>
                        )}
                        {profile.insuranceNumber && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>health_and_safety</span>
                                BHYT
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                        ${activeTab === tab.id ? "bg-[#3C81C6] text-white shadow-sm shadow-[#3C81C6]/20" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                {/* ===== Personal Info ===== */}
                {activeTab === "personal" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Thông tin cá nhân</h3>
                            {!editing ? (
                                <button onClick={() => setEditing(true)}
                                    className="px-4 py-2 text-sm font-medium text-[#3C81C6] bg-[#3C81C6]/[0.06] rounded-xl hover:bg-[#3C81C6]/[0.12] transition-colors flex items-center gap-1.5">
                                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">Huỷ</button>
                                    <button onClick={handleSave} disabled={saving} aria-label="Lưu thông tin"
                                        className="px-4 py-2 text-sm font-semibold text-white bg-[#3C81C6] rounded-xl hover:bg-[#2a6da8] disabled:opacity-50 transition-colors">
                                        {saving ? "Đang lưu..." : "Lưu"}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ProfileField label="Họ và tên" icon="person" value={profile.fullName} onChange={v => { updateProfile("fullName", v); setErrors(e => ({ ...e, fullName: "" })); }} disabled={!editing} error={errors.fullName} />
                            <ProfileField label="Số điện thoại" icon="call" value={profile.phone} onChange={v => { updateProfile("phone", v); setErrors(e => ({ ...e, phone: "" })); }} disabled={!editing} error={errors.phone} />
                            <ProfileField label="Email" icon="mail" value={profile.email} onChange={v => updateProfile("email", v)} disabled />
                            <ProfileField label="Ngày sinh" icon="cake" value={profile.dob} onChange={v => { updateProfile("dob", v); setErrors(e => ({ ...e, dob: "" })); }} disabled={!editing} type="date" error={errors.dob} />
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Giới tính</label>
                                <div className="flex gap-2">
                                    {[{ v: "MALE", l: "Nam" }, { v: "FEMALE", l: "Nữ" }].map(g => (
                                        <button key={g.v} onClick={() => editing && updateProfile("gender", g.v)}
                                            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all
                                            ${profile.gender === g.v ? "border-[#3C81C6] bg-[#3C81C6]/[0.06] text-[#3C81C6]" : "border-gray-200 text-gray-500"}
                                            ${!editing ? "opacity-60 cursor-not-allowed" : ""}`}>
                                            {g.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <ProfileField label="CCCD/CMND" icon="badge" value={profile.idNumber} onChange={v => { updateProfile("idNumber", v); setErrors(e => ({ ...e, idNumber: "" })); }} disabled={!editing} error={errors.idNumber} />
                            <ProfileField label="Số thẻ BHYT" icon="health_and_safety" value={profile.insuranceNumber} onChange={v => { updateProfile("insuranceNumber", v); setErrors(e => ({ ...e, insuranceNumber: "" })); }} disabled={!editing} error={errors.insuranceNumber} />
                            <div className="sm:col-span-2">
                                <ProfileField label="Địa chỉ" icon="location_on" value={profile.address} onChange={v => updateProfile("address", v)} disabled={!editing} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== Family Members ===== */}
                {activeTab === "family" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Người thân</h3>
                            <button onClick={() => {
                                setIsEditFamily(false);
                                setEditFamilyId(null);
                                setNewFamily({ name: "", dob: "", gender: "male", relation: "", phone: "" });
                                setShowAddFamily(true);
                            }}
                                className="px-4 py-2 text-sm font-medium text-[#3C81C6] bg-[#3C81C6]/[0.06] rounded-xl hover:bg-[#3C81C6]/[0.12] transition-colors flex items-center gap-1.5">
                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>person_add</span>
                                Thêm người thân
                            </button>
                        </div>

                        {familyMembers.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-gray-300 mb-3" style={{ fontSize: "56px" }}>group_off</span>
                                <p className="text-gray-500 font-medium">Chưa có thông tin người thân</p>
                                <p className="text-gray-400 text-sm mt-1">Thêm người thân để đặt lịch khám hộ</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {familyMembers.map(fm => (
                                    <div key={fm.id} className="flex flex-col p-5 border border-gray-100 rounded-2xl bg-white hover:border-[#3C81C6]/30 hover:shadow-md hover:shadow-[#3C81C6]/5 transition-all group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3C81C6]/10 to-[#3C81C6]/5 text-[#3C81C6] flex items-center justify-center">
                                                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                                                        {fm.gender === "FEMALE" ? "face_3" : "face"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-bold text-gray-900 leading-tight">{fm.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-[#3C81C6]/10 text-[#3C81C6] rounded-md">
                                                            {fm.relation}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {fm.gender === "MALE" ? "Nam" : fm.gender === "FEMALE" ? "Nữ" : "Khác"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditClick(fm)} className="p-2 rounded-lg text-gray-400 hover:text-[#3C81C6] hover:bg-[#3C81C6]/10 transition-colors" title="Sửa">
                                                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                                                </button>
                                                <button onClick={() => handleDeleteFamily(fm.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Xóa">
                                                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-gray-50 mt-auto">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="material-symbols-outlined text-gray-400" style={{ fontSize: "18px" }}>call</span>
                                                {fm.phone || "Chưa cập nhật số điện thoại"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add/Edit family modal */}
                        {showAddFamily && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowAddFamily(false)}>
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">{isEditFamily ? "Sửa thông tin" : "Thêm người thân"}</h3>
                                    <div className="space-y-3">
                                        <ProfileField label="Họ tên" icon="person" value={newFamily.name || ""} onChange={v => setNewFamily(p => ({ ...p, name: v }))} />
                                        <ProfileField label="Số điện thoại" icon="call" value={newFamily.phone || ""} onChange={v => setNewFamily(p => ({ ...p, phone: v }))} />
                                        <ProfileField label="Ngày sinh" icon="cake" value={newFamily.dob || ""} onChange={v => setNewFamily(p => ({ ...p, dob: v }))} type="date" />
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Mối quan hệ</label>
                                            <select value={newFamily.relation || ""} onChange={e => setNewFamily(p => ({ ...p, relation: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3C81C6]/30">
                                                <option value="">— Chọn —</option>
                                                {relationTypes.length > 0 ? (
                                                    relationTypes.map(rt => (
                                                        <option key={rt.relation_types_id} value={rt.relation_types_id}>
                                                            {rt.name}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <>
                                                        <option value="Vợ/Chồng">Vợ/Chồng</option>
                                                        <option value="Con">Con</option>
                                                        <option value="Cha/Mẹ">Cha/Mẹ</option>
                                                        <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                                                        <option value="Khác">Khác</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setShowAddFamily(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Huỷ</button>
                                        <button onClick={handleSaveFamily} className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#3C81C6] rounded-xl hover:bg-[#2a6da8] transition-colors">{isEditFamily ? "Lưu thay đổi" : "Thêm"}</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== Medical History ===== */}
                {activeTab === "history" && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch sử khám bệnh</h3>
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-gray-300 mb-3" style={{ fontSize: "56px" }}>history</span>
                            <p className="text-gray-500 font-medium">Lịch sử khám sẽ được cập nhật tự động</p>
                            <p className="text-gray-400 text-sm mt-1">Sau mỗi lần khám tại EHealth, kết quả sẽ được lưu tại đây</p>
                        </div>
                    </div>
                )}

                {/* ===== Insurance ===== */}
                {activeTab === "insurance" && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin bảo hiểm</h3>
                        <div className="space-y-4">
                            {profile.insuranceNumber ? (
                                <div className="p-5 border border-green-200 bg-green-50 rounded-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="material-symbols-outlined text-green-600" style={{ fontSize: "22px" }}>verified</span>
                                        <div>
                                            <p className="font-semibold text-green-800">Thẻ BHYT đã đăng ký</p>
                                            <p className="text-sm text-green-600">Số thẻ: {profile.insuranceNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined text-gray-300 mb-3" style={{ fontSize: "56px" }}>health_and_safety</span>
                                    <p className="text-gray-500 font-medium">Chưa có thông tin bảo hiểm</p>
                                    <p className="text-gray-400 text-sm mt-1">Thêm số thẻ BHYT tại tab &quot;Thông tin cá nhân&quot;</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== Results ===== */}
                {activeTab === "results" && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Kết quả khám & xét nghiệm</h3>
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-gray-300 mb-3" style={{ fontSize: "56px" }}>lab_profile</span>
                            <p className="text-gray-500 font-medium">Chưa có kết quả xét nghiệm</p>
                            <p className="text-gray-400 text-sm mt-1">Kết quả sẽ được cập nhật sau mỗi lần khám</p>
                        </div>
                    </div>
                )}

                {/* ===== Security ===== */}
                {activeTab === "security" && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Bảo mật tài khoản</h3>
                        <div className="max-w-md space-y-4">
                            <ProfileField label="Mật khẩu hiện tại" icon="lock" value={passwords.current} onChange={v => setPasswords(p => ({ ...p, current: v }))} type="password" />
                            <ProfileField label="Mật khẩu mới" icon="lock" value={passwords.new} onChange={v => setPasswords(p => ({ ...p, new: v }))} type="password" />
                            <ProfileField label="Xác nhận mật khẩu mới" icon="lock" value={passwords.confirm} onChange={v => setPasswords(p => ({ ...p, confirm: v }))} type="password" />
                            {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
                                <p className="text-xs text-red-500">Mật khẩu xác nhận không khớp</p>
                            )}
                            <button onClick={handleChangePassword} disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm || saving}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#3C81C6] rounded-xl hover:bg-[#2a6da8] disabled:opacity-50 transition-colors">
                                {saving ? "Đang xử lý..." : "Đổi mật khẩu"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProfileField({ label, icon, value, onChange, disabled = false, type = "text", error }: {
    label: string; icon: string; value: string; onChange: (v: string) => void; disabled?: boolean; type?: string; error?: string;
}) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400" style={{ fontSize: "18px" }}>{icon}</span>
                <input type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors
                    ${error ? "border-red-300 focus:ring-red-300/30" : "border-gray-200 focus:ring-[#3C81C6]/30"}
                    ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white text-gray-700"}`} />
            </div>
            {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "12px" }}>error</span>{error}</p>}
        </div>
    );
}
