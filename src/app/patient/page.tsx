"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMyAppointments,
  type Appointment,
} from "@/services/appointmentService";
import { AppointmentStatusBadge } from "@/components/patient/AppointmentStatusBadge";
import { billingService } from "@/services/billingService";
import { ehrService, type VitalSign } from "@/services/ehrService";
import { prescriptionService } from "@/services/prescriptionService";
import { getPatientsByAccountId } from "@/services/patientService";
import { telemedicineService, type TelemedicineSession } from "@/services/telemedicineService";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pendingInvoicesList, setPendingInvoicesList] = useState<any[]>([]);
  const [teleSessionsList, setTeleSessionsList] = useState<TelemedicineSession[]>([]);
  const [latestVitalData, setLatestVitalData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch active profiles from patient service
      let activeId = null;
      if (user?.id) {
        try {
            const patientRes = await getPatientsByAccountId(user.id);
            if (patientRes.success && patientRes.data && patientRes.data.length > 0) {
                // assume the first one is the active/primary one or just any for dashboard
                const cachedId = sessionStorage.getItem("patientPortal_selectedProfileId");
                const exists = patientRes.data.some((p: any) => p.id === cachedId);

                const activePatients = patientRes.data.filter((p: any) => p.status === 'ACTIVE' || p.status === undefined);
                activeId = exists ? cachedId : (activePatients.length > 0 ? activePatients[0].id : patientRes.data[0].id);
            }
        } catch (e) {
            console.error("Failed to load patient profiles securely for dashboard", e);
        }
      }

      // Appts — dùng /my-appointments, BE tự tra patient_id từ token
      const aptReq = user?.id
        ? getMyAppointments({ status: "PENDING,CONFIRMED" })
            .then((res) => ({ data: res.data || [] }))
            .catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] });

      // Async independent reqs mapped when valid ID exists
      const invoiceReq = activeId
        ? billingService.getInvoicesByPatient(activeId).catch(() => null)
        : Promise.resolve(null);
      const vitalReq = activeId
        ? ehrService.getLatestVitals(activeId).catch(() => null)
        : Promise.resolve(null);
      const teleReq = telemedicineService.getList({ status: 'scheduled' }).catch(() => null);

      const [aptRes, invRes, vitRes, teleRes] = await Promise.all([
        aptReq,
        invoiceReq,
        vitalReq,
        teleReq,
      ]);

      // Assign standard Appointments
      setUpcomingAppointments(aptRes.data || []);

      // Assign Pending Invoices (no mock fallback)
      const realInvoices = Array.isArray(invRes?.data?.data)
        ? invRes.data.data
        : Array.isArray(invRes?.data)
          ? invRes.data
          : [];
      setPendingInvoicesList(
        realInvoices.filter(
          (i: any) => i.status === "pending" || i.status === "overdue",
        ),
      );

      // Assign Vitals (null if no data)
      setLatestVitalData(vitRes?.data?.data || null);

      // Assign Tele sessions from API
      const teleSessions = Array.isArray(teleRes?.data) ? teleRes.data : [];
      setTeleSessionsList(
        teleSessions.filter((s: TelemedicineSession) => s.status === "scheduled"),
      );
    } catch (error) {
      console.error(error);
      setUpcomingAppointments([]);
      setPendingInvoicesList([]);
      setLatestVitalData(null);
      setTeleSessionsList([]);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Chào buổi sáng";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const pendingInvoices = pendingInvoicesList;
  const upcomingTele = teleSessionsList;
  const latestVital = latestVitalData;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#3C81C6] to-[#2563eb] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="relative">
          <p className="text-blue-100 text-sm font-medium mb-1">{greeting()}</p>
          <h1 className="text-2xl font-bold mb-2">
            {user?.fullName || "Bệnh nhân"} 👋
          </h1>
          <p className="text-blue-100 text-sm max-w-lg">
            Chào mừng bạn đến với cổng bệnh nhân EHealth. Quản lý lịch hẹn, xem
            kết quả khám và cập nhật hồ sơ sức khoẻ tại đây.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: "calendar_month",
            label: "Đặt lịch khám",
            desc: "Đặt lịch mới",
            href: "/booking",
            color: "from-[#3C81C6] to-[#2563eb]",
          },
          {
            icon: "event_note",
            label: "Lịch hẹn",
            desc: `${upcomingAppointments.length} sắp tới`,
            href: "/patient/appointments",
            color: "from-emerald-500 to-emerald-600",
          },
          {
            icon: "medication",
            label: "Nhắc thuốc",
            desc: "Quản lý thuốc",
            href: "/patient/medication-reminders",
            color: "from-violet-500 to-violet-600",
          },
          {
            icon: "smart_toy",
            label: "AI tư vấn",
            desc: "Hỏi triệu chứng",
            href: "/patient/ai-consult",
            color: "from-cyan-500 to-teal-600",
          },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5 hover:shadow-lg hover:border-[#3C81C6]/20 transition-all group"
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-3`}
            >
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: "22px" }}
              >
                {item.icon}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#121417] dark:text-white group-hover:text-[#3C81C6] transition-colors">
              {item.label}
            </h3>
            <p className="text-xs text-[#687582] mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Health Stats Quick View */}
      {latestVital ? (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Huyết áp",
            value: latestVital.bloodPressureSystolic != null ? `${latestVital.bloodPressureSystolic}/${latestVital.bloodPressureDiastolic}` : "--",
            unit: "mmHg",
            icon: "bloodtype",
            status: latestVital.bloodPressureSystolic != null ? (latestVital.bloodPressureSystolic <= 130 ? "ok" : "warn") : "none",
          },
          {
            label: "Nhịp tim",
            value: latestVital.heartRate != null ? `${latestVital.heartRate}` : "--",
            unit: "bpm",
            icon: "cardiology",
            status: latestVital.heartRate != null ? "ok" : "none",
          },
          {
            label: "BMI",
            value: latestVital.bmi != null && !isNaN(Number(latestVital.bmi)) ? Number(latestVital.bmi).toFixed(1) : "--",
            unit: "",
            icon: "monitor_weight",
            status: latestVital.bmi != null && !isNaN(Number(latestVital.bmi)) ? (Number(latestVital.bmi) <= 25 ? "ok" : "warn") : "none",
          },
          {
            label: "SpO2",
            value: latestVital.spo2 != null ? `${latestVital.spo2}` : "--",
            unit: "%",
            icon: "pulmonology",
            status: latestVital.spo2 != null ? "ok" : "none",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#e5e7eb] dark:border-[#2d353e] p-3 flex items-center gap-3"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.status === "ok" ? "bg-green-50 dark:bg-green-500/10 text-green-600" : s.status === "warn" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600" : "bg-gray-50 dark:bg-gray-500/10 text-gray-400"}`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                {s.icon}
              </span>
            </div>
            <div>
              <p className="text-xs text-[#687582]">{s.label}</p>
              <p className="text-sm font-bold text-[#121417] dark:text-white">
                {s.value}{" "}
                <span className="text-xs font-normal text-[#687582]">
                  {s.unit}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
      ) : (
      <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#e5e7eb] dark:border-[#2d353e] p-4 text-center">
        <p className="text-sm text-[#687582]">Chưa có dữ liệu sinh hiệu</p>
      </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e]">
          <div className="flex items-center justify-between p-5 border-b border-[#e5e7eb] dark:border-[#2d353e]">
            <h2 className="text-lg font-bold text-[#121417] dark:text-white flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[#3C81C6]"
                style={{ fontSize: "22px" }}
              >
                event_upcoming
              </span>
              Lịch hẹn sắp tới
            </h2>
            <Link
              href="/patient/appointments"
              className="text-sm text-[#3C81C6] font-medium hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <span
                  className="material-symbols-outlined text-gray-300 dark:text-gray-600 mb-3"
                  style={{ fontSize: "48px" }}
                >
                  event_upcoming
                </span>
                <p className="text-sm text-[#687582] mb-4">
                  Chưa có lịch hẹn nào sắp tới
                </p>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3C81C6] to-[#2563eb] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    add
                  </span>
                  Đặt lịch khám
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt, index) => {
                  const aptDateStr = (apt as any).appointment_date || apt.date || "";
                  const parsedDate = aptDateStr ? aptDateStr.split("T")[0].split("-") : [];
                  const day = parsedDate[2] || "--";
                  const month = parsedDate[1] || "--";
                  return (
                  <Link
                    key={(apt as any).appointments_id || apt.id}
                    href={`/patient/appointments/${(apt as any).appointments_id || apt.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#f6f7f8] dark:hover:bg-[#13191f] transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3C81C6]/10 to-[#60a5fa]/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-base font-bold text-[#3C81C6] leading-none">
                        {day}
                      </span>
                      <span className="text-[9px] text-[#3C81C6]/70 font-medium">
                        T{month}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#121417] dark:text-white group-hover:text-[#3C81C6] transition-colors truncate">
                        {(apt as any).doctor_name || apt.doctorName || "Bác sĩ"}
                      </h4>
                      <p className="text-xs text-[#687582] truncate">
                        {(apt as any).service_name || (apt as any).department_name || apt.departmentName || "Chuyên khoa"} •{" "}
                        {((apt as any).slot_start_time)?.substring(0, 5) || apt.time || "--:--"}
                      </p>
                    </div>
                    <AppointmentStatusBadge status={apt.status} />
                  </Link>
                )})}
              </div>
            )}
          </div>
        </div>

        {/* Right Column Widgets */}
        <div className="space-y-6">
          {/* Pending Bills */}
          {pendingInvoices.length > 0 && (
            <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-amber-200 dark:border-amber-500/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-amber-500"
                    style={{ fontSize: "20px" }}
                  >
                    receipt_long
                  </span>
                  Hóa đơn chờ thanh toán
                </h3>
                <Link
                  href="/patient/billing"
                  className="text-xs text-[#3C81C6] font-medium hover:underline"
                >
                  Xem tất cả →
                </Link>
              </div>
              {pendingInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 mb-2 last:mb-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#121417] dark:text-white">
                      {inv.code}
                    </p>
                    <p className="text-xs text-[#687582]">
                      {inv.department} • {inv.date}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                    {inv.total.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Tele */}
          {upcomingTele.length > 0 && (
            <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[#3C81C6]"
                    style={{ fontSize: "20px" }}
                  >
                    videocam
                  </span>
                  Lịch khám từ xa
                </h3>
                <Link
                  href="/patient/telemedicine"
                  className="text-xs text-[#3C81C6] font-medium hover:underline"
                >
                  Xem →
                </Link>
              </div>
              {upcomingTele.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f6f7f8] dark:bg-[#13191f] mb-2 last:mb-0"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#3C81C6] to-[#60a5fa] flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-white"
                      style={{ fontSize: "18px" }}
                    >
                      videocam
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#121417] dark:text-white truncate">
                      {s.doctor || "Bác sĩ"}
                    </p>
                    <p className="text-xs text-[#687582]">
                      {s.date} • {s.time} • {s.department || ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Medication Reminder Widget */}
          <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#121417] dark:text-white flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-violet-500"
                  style={{ fontSize: "20px" }}
                >
                  medication
                </span>
                Nhắc thuốc
              </h3>
              <Link
                href="/patient/medication-reminders"
                className="text-xs text-[#3C81C6] font-medium hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>
            <p className="text-xs text-[#687582] text-center py-4">
              Truy cập trang Nhắc thuốc để quản lý lịch uống thuốc
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5">
            <h3 className="text-sm font-bold text-[#121417] dark:text-white mb-3">
              Truy cập nhanh
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  icon: "folder_shared",
                  label: "Kết quả khám",
                  href: "/patient/medical-records",
                  color: "text-violet-500 bg-violet-50 dark:bg-violet-500/10",
                },
                {
                  icon: "family_restroom",
                  label: "Hồ sơ BN",
                  href: "/patient/patient-profiles",
                  color: "text-[#3C81C6] bg-[#3C81C6]/10",
                },
                {
                  icon: "receipt_long",
                  label: "Thanh toán",
                  href: "/patient/billing",
                  color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
                },
                {
                  icon: "videocam",
                  label: "Khám từ xa",
                  href: "/patient/telemedicine",
                  color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10",
                },
                {
                  icon: "manage_accounts",
                  label: "Tài khoản",
                  href: "/patient/profile",
                  color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10",
                },
                {
                  icon: "monitor_heart",
                  label: "Hồ sơ sức khỏe",
                  href: "/patient/health-records",
                  color: "text-green-500 bg-green-50 dark:bg-green-500/10",
                },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="flex items-center gap-2 p-3 rounded-xl hover:bg-[#f6f7f8] dark:hover:bg-[#13191f] transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${l.color} flex items-center justify-center`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      {l.icon}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#121417] dark:text-white">
                    {l.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Health tips */}
      <div className="bg-white dark:bg-[#1e242b] rounded-2xl border border-[#e5e7eb] dark:border-[#2d353e] p-5">
        <h2 className="text-lg font-bold text-[#121417] dark:text-white flex items-center gap-2 mb-4">
          <span
            className="material-symbols-outlined text-emerald-500"
            style={{ fontSize: "22px" }}
          >
            favorite
          </span>
          Lời khuyên sức khoẻ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "water_drop",
              title: "Uống đủ nước",
              desc: "Nên uống 2–3 lít nước mỗi ngày để cơ thể hoạt động tốt nhất",
              color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
            },
            {
              icon: "directions_run",
              title: "Vận động thường xuyên",
              desc: "30 phút vận động mỗi ngày giúp tăng cường sức đề kháng",
              color: "text-green-500 bg-green-50 dark:bg-green-500/10",
            },
            {
              icon: "bedtime",
              title: "Ngủ đủ giấc",
              desc: "7–8 tiếng ngủ mỗi đêm giúp cơ thể phục hồi và tái tạo năng lượng",
              color: "text-violet-500 bg-violet-50 dark:bg-violet-500/10",
            },
          ].map((tip) => (
            <div
              key={tip.title}
              className="flex gap-3 p-3 rounded-xl bg-[#f6f7f8] dark:bg-[#13191f]"
            >
              <div
                className={`w-10 h-10 rounded-xl ${tip.color} flex items-center justify-center flex-shrink-0`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px" }}
                >
                  {tip.icon}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#121417] dark:text-white">
                  {tip.title}
                </h4>
                <p className="text-xs text-[#687582] mt-0.5 leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
