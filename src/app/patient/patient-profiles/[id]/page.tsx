"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getPatientDetail } from "@/services/patientService";
import PatientDetail from "../PatientDetail";
import { type PatientProfile } from "@/types/patient-profile";
import { mapToProfile } from "@/utils/patientMapper";

export default function PatientProfileDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await getPatientDetail(id);
            if (res.success && res.data) {
                const mapped = mapToProfile(res.data, user);
                if (user?.id) {
                    mapped.userId = user.id;
                }
                setProfile(mapped);
            } else {
                showToast("Không tìm thấy hồ sơ bệnh nhân.", "error");
                router.push('/patient/patient-profiles');
            }
        } catch (error) {
            showToast("Lỗi khi tải dữ liệu", "error");
        } finally {
            setLoading(false);
        }
    }, [id, user, showToast, router]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0d1117]">
                <div className="w-10 h-10 border-4 border-[#3C81C6] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="h-full w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <PatientDetail 
                profile={profile} 
                onBack={() => router.push('/patient/patient-profiles')} 
                onEdit={() => router.push(`/patient/patient-profiles?action=edit&id=${profile.id}`)} 
            />
        </div>
    );
}
