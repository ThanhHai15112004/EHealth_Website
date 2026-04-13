"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getPatientDetail } from "@/services/patientService";
import PatientDetail from "../PatientDetail";
import { type PatientProfile } from "@/types/patient-profile";

// Map API response → PatientProfile shape
function mapToProfile(data: any, user: any): PatientProfile {
    return {
        id: data.id ?? data.patient_id ?? "",
        userId: user?.id ?? "",
        fullName: data.full_name ?? data.fullName ?? user?.fullName ?? "",
        dob: data.date_of_birth ?? data.dob ?? "",
        gender: (data.gender === "MALE" ? "male" : data.gender === "FEMALE" ? "female" : "other") as "male" | "female" | "other",
        phone: data.contact?.phone_number ?? data.phone ?? "",
        idNumber: data.identity_number ?? data.idNumber ?? "",
        insuranceNumber: data.insurance_number ?? data.insuranceNumber ?? "",
        address: data.contact?.street_address ?? data.address ?? "",
        relationship: "self",
        relationshipLabel: "Bản thân",
        email: data.contact?.email ?? data.email ?? "",
        bloodType: data.blood_type ?? data.bloodType ?? "",
        allergies: data.allergies ?? [],
        medicalHistory: data.medical_history ?? data.medicalHistory ?? "",
        isActive: true,
        isPrimary: true,
        createdAt: data.created_at ?? data.createdAt ?? "",
        updatedAt: data.updated_at ?? data.updatedAt ?? "",
    };
}

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
