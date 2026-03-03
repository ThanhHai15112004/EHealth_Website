"use client";

import {
    MOCK_DASHBOARD_STATS,
    MOCK_PATIENT_GROWTH,
    MOCK_REVENUE_DATA,
    MOCK_DOCTOR_DISTRIBUTION,
    MOCK_UPCOMING_APPOINTMENTS,
    MOCK_PATIENT_QUEUE,
    MOCK_MEDICINE_ALERTS_LIST,
} from "@/lib/mock-data/admin";

import {
    PageHeader,
    StatsCards,
    PatientGrowthChart,
    DepartmentStatus,
    PatientQueue,
    UpcomingAppointments,
    MedicineAlerts,
    RevenueChart,
} from "@/components/admin/dashboard";

export default function AdminDashboard() {
    const stats = MOCK_DASHBOARD_STATS;
    const patientGrowth = MOCK_PATIENT_GROWTH;
    const revenueData = MOCK_REVENUE_DATA;
    const doctorDistribution = MOCK_DOCTOR_DISTRIBUTION;
    const appointments = MOCK_UPCOMING_APPOINTMENTS;
    const patientQueue = MOCK_PATIENT_QUEUE;
    const medicineAlerts = MOCK_MEDICINE_ALERTS_LIST;

    return (
        <div className="space-y-4">
            {/* Header */}
            <PageHeader />

            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Row 2: Biểu đồ lượt khám (7/12) + Doanh thu (5/12) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7"><PatientGrowthChart data={patientGrowth} /></div>
                <div className="lg:col-span-5"><RevenueChart data={revenueData} /></div>
            </div>

            {/* Row 3: Hàng đợi BN (6/12) + Phân bổ khoa (6/12) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PatientQueue data={patientQueue} />
                <DepartmentStatus departments={doctorDistribution} />
            </div>

            {/* Row 4: Lịch hẹn (6/12) + Thuốc cảnh báo (6/12) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <UpcomingAppointments data={appointments} />
                <MedicineAlerts data={medicineAlerts} />
            </div>
        </div>
    );
}
