"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MOCK_PATIENT = {
    id: "BN001", name: "Nguyễn Văn An", age: 45, gender: "Nam",
    allergies: "Penicillin", chronic: "Tăng huyết áp, Tiểu đường type 2",
    insurance: "HC4012345678", bloodType: "O+",
};

export default function ExaminationPage() {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [vitalSigns, setVitalSigns] = useState({ bloodPressure: "140/90", heartRate: "78", temperature: "36.8", weight: "72", height: "170", spO2: "98", respiratoryRate: "18" });
    const [symptoms, setSymptoms] = useState("Đau đầu vùng thái dương, chóng mặt khi đứng dậy. Kéo dài 3 ngày.");
    const [diagnosis, setDiagnosis] = useState("I10 - Tăng huyết áp vô căn (nguyên phát)");
    const [treatment, setTreatment] = useState("Tăng liều Amlodipine từ 5mg lên 10mg. Theo dõi huyết áp tại nhà.");
    const [prescriptions, setPrescriptions] = useState([
        { name: "Amlodipine 10mg", dosage: "1 viên/ngày", duration: "30 ngày", note: "Uống sáng" },
        { name: "Metformin 500mg", dosage: "2 viên/ngày", duration: "30 ngày", note: "Uống sau ăn sáng và tối" },
    ]);
    const [newMed, setNewMed] = useState({ name: "", dosage: "", duration: "", note: "" });

    const steps = [
        { label: "Sinh hiệu", icon: "monitor_heart" },
        { label: "Triệu chứng", icon: "symptoms" },
        { label: "Chẩn đoán", icon: "diagnosis" },
        { label: "Đơn thuốc", icon: "medication" },
        { label: "Kết luận", icon: "task_alt" },
    ];

    const addPrescription = () => {
        if (newMed.name) {
            setPrescriptions([...prescriptions, newMed]);
            setNewMed({ name: "", dosage: "", duration: "", note: "" });
        }
    };

    return (
        <div className="p-6 md:p-8"><div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><span className="material-symbols-outlined text-[#687582]">arrow_back</span></button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-[#121417] dark:text-white">Khám bệnh — {MOCK_PATIENT.name}</h1>
                    <p className="text-sm text-[#687582]">{MOCK_PATIENT.id} • {MOCK_PATIENT.gender}, {MOCK_PATIENT.age} tuổi • Nhóm máu: {MOCK_PATIENT.bloodType}</p>
                </div>
                {MOCK_PATIENT.allergies && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <span className="material-symbols-outlined text-red-600" style={{ fontSize: "16px" }}>warning</span>
                        <span className="text-xs font-medium text-red-700 dark:text-red-400">Dị ứng: {MOCK_PATIENT.allergies}</span>
                    </div>
                )}
            </div>

            {/* Steps */}
            <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#dde0e4] dark:border-[#2d353e] p-4">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {steps.map((step, i) => (
                        <button key={step.label} onClick={() => setActiveStep(i)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${i === activeStep ? "bg-[#3C81C6] text-white" : i < activeStep ? "bg-green-50 text-green-600 dark:bg-green-900/20" : "text-[#687582] hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`}>
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{i < activeStep ? "check_circle" : step.icon}</span>
                            {step.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#dde0e4] dark:border-[#2d353e] p-6">
                {/* Step 0: Sinh hiệu */}
                {activeStep === 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#121417] dark:text-white">Chỉ số sinh hiệu</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { key: "bloodPressure", label: "Huyết áp (mmHg)", icon: "bloodtype" },
                                { key: "heartRate", label: "Nhịp tim (bpm)", icon: "monitor_heart" },
                                { key: "temperature", label: "Nhiệt độ (°C)", icon: "thermostat" },
                                { key: "weight", label: "Cân nặng (kg)", icon: "fitness_center" },
                                { key: "height", label: "Chiều cao (cm)", icon: "height" },
                                { key: "spO2", label: "SpO2 (%)", icon: "spo2" },
                                { key: "respiratoryRate", label: "Nhịp thở (/phút)", icon: "pulmonology" },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label className="block text-xs font-medium text-[#687582] mb-1">{field.label}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#687582]" style={{ fontSize: "18px" }}>{field.icon}</span>
                                        <input type="text" value={vitalSigns[field.key as keyof typeof vitalSigns]}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, [field.key]: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2.5 bg-[#f6f7f8] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 1: Triệu chứng */}
                {activeStep === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#121417] dark:text-white">Triệu chứng & Lý do khám</h2>
                        <div>
                            <label className="block text-sm font-medium text-[#121417] dark:text-white mb-1.5">Mô tả triệu chứng</label>
                            <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
                                rows={5} className="w-full px-4 py-3 bg-[#f6f7f8] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6] resize-none" placeholder="Mô tả chi tiết triệu chứng..." />
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300"><strong>Tiền sử:</strong> {MOCK_PATIENT.chronic}</p>
                        </div>
                    </div>
                )}

                {/* Step 2: Chẩn đoán */}
                {activeStep === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#121417] dark:text-white">Chẩn đoán (ICD-10)</h2>
                        <div>
                            <label className="block text-sm font-medium text-[#121417] dark:text-white mb-1.5">Mã chẩn đoán</label>
                            <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                                className="w-full px-4 py-3 bg-[#f6f7f8] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6]"
                                placeholder="Nhập mã ICD-10 hoặc tên bệnh..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#121417] dark:text-white mb-1.5">Phương án điều trị</label>
                            <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)}
                                rows={3} className="w-full px-4 py-3 bg-[#f6f7f8] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6] resize-none"
                                placeholder="Mô tả phương án điều trị..." />
                        </div>
                    </div>
                )}

                {/* Step 3: Đơn thuốc */}
                {activeStep === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#121417] dark:text-white">Kê đơn thuốc</h2>
                        {/* Current prescriptions */}
                        <div className="space-y-2">
                            {prescriptions.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-[#f6f7f8] dark:bg-[#13191f] rounded-lg">
                                    <span className="material-symbols-outlined text-teal-600" style={{ fontSize: "20px" }}>medication</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[#121417] dark:text-white">{p.name}</p>
                                        <p className="text-xs text-[#687582]">{p.dosage} • {p.duration} • {p.note}</p>
                                    </div>
                                    <button onClick={() => setPrescriptions(prescriptions.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-red-50 text-red-400">
                                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* Add new */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border border-dashed border-[#dde0e4] dark:border-[#2d353e] rounded-lg">
                            <input type="text" value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} placeholder="Tên thuốc *"
                                className="px-3 py-2 bg-white dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6]" />
                            <input type="text" value={newMed.dosage} onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} placeholder="Liều dùng"
                                className="px-3 py-2 bg-white dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6]" />
                            <input type="text" value={newMed.duration} onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })} placeholder="Thời gian"
                                className="px-3 py-2 bg-white dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-lg text-sm outline-none focus:border-[#3C81C6]" />
                            <button onClick={addPrescription} className="px-3 py-2 bg-[#3C81C6] text-white rounded-lg text-sm font-medium hover:bg-[#2a6da8] flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>Thêm
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Kết luận */}
                {activeStep === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-[#121417] dark:text-white">Tóm tắt & Kết luận</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-[#687582] uppercase">Sinh hiệu</h3>
                                <div className="p-3 bg-[#f6f7f8] dark:bg-[#13191f] rounded-lg text-sm space-y-1">
                                    <p>HA: {vitalSigns.bloodPressure} mmHg • Nhịp tim: {vitalSigns.heartRate} bpm</p>
                                    <p>Nhiệt độ: {vitalSigns.temperature}°C • SpO2: {vitalSigns.spO2}%</p>
                                    <p>Cân nặng: {vitalSigns.weight}kg • Chiều cao: {vitalSigns.height}cm</p>
                                </div>
                                <h3 className="text-sm font-semibold text-[#687582] uppercase">Triệu chứng</h3>
                                <p className="text-sm p-3 bg-[#f6f7f8] dark:bg-[#13191f] rounded-lg">{symptoms}</p>
                                <h3 className="text-sm font-semibold text-[#687582] uppercase">Chẩn đoán</h3>
                                <p className="text-sm p-3 bg-[#f6f7f8] dark:bg-[#13191f] rounded-lg font-medium">{diagnosis}</p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-[#687582] uppercase">Phương án điều trị</h3>
                                <p className="text-sm p-3 bg-[#f6f7f8] dark:bg-[#13191f] rounded-lg">{treatment}</p>
                                <h3 className="text-sm font-semibold text-[#687582] uppercase">Đơn thuốc ({prescriptions.length} loại)</h3>
                                <div className="space-y-1.5">
                                    {prescriptions.map((p, i) => (
                                        <div key={i} className="text-sm p-2 bg-[#f6f7f8] dark:bg-[#13191f] rounded flex items-center gap-2">
                                            <span className="material-symbols-outlined text-teal-600" style={{ fontSize: "16px" }}>medication</span>
                                            <span className="font-medium">{p.name}</span> — {p.dosage}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}
                    className="flex items-center gap-2 px-5 py-2.5 border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm font-medium text-[#687582] disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_left</span>Quay lại
                </button>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm font-medium text-[#687582] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Lưu nháp
                    </button>
                    {activeStep < steps.length - 1 ? (
                        <button onClick={() => setActiveStep(activeStep + 1)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#3C81C6] hover:bg-[#2a6da8] text-white rounded-xl text-sm font-medium transition-colors">
                            Tiếp theo<span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_right</span>
                        </button>
                    ) : (
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check</span>Hoàn thành & Ký
                        </button>
                    )}
                </div>
            </div>
        </div></div>
    );
}
