import React, { useEffect, useState } from "react";
import { type PatientProfile } from "@/types/patient-profile";
import axiosClient from "@/api/axiosClient";
import { EHR_ENDPOINTS, VITAL_SIGNS_ENDPOINTS } from "@/api/endpoints";
import { extractErrorMessage } from "@/api/response";
import Modal from "@/components/common/Modal";
import { useToast } from "@/contexts/ToastContext";

interface TabProps {
    profile: PatientProfile;
}

const METRICS_OPTIONS = [
    { code: 'BLOOD_PRESSURE', name: 'Huyết áp', defaultUnit: 'mmHg' },
    { code: 'HEART_RATE', name: 'Nhịp tim', defaultUnit: 'bpm' },
    { code: 'TEMPERATURE', name: 'Nhiệt độ', defaultUnit: '°C' },
    { code: 'SPO2', name: 'SpO2', defaultUnit: '%' },
    { code: 'WEIGHT', name: 'Cân nặng', defaultUnit: 'kg' },
    { code: 'HEIGHT', name: 'Chiều cao', defaultUnit: 'cm' },
    { code: 'BLOOD_SUGAR', name: 'Đường huyết', defaultUnit: 'mg/dL' },
];

export default function VitalsTab({ profile }: TabProps) {
    const { showToast } = useToast();
    const [vitals, setVitals] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [metricCode, setMetricCode] = useState('BLOOD_PRESSURE');
    const [metricValue1, setMetricValue1] = useState('');
    const [metricValue2, setMetricValue2] = useState(''); // Only used for BP (diastolic)
    const [unit, setUnit] = useState('mmHg');
    const [measuredAt, setMeasuredAt] = useState(() => {
        // Current local datetime string for input type="datetime-local"
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });
    const [sourceType, setSourceType] = useState('DEVICE');
    const [deviceInfo, setDeviceInfo] = useState('');

    const fetchVitals = async () => {
        try {
            setLoading(true);
            const patientId = profile.id; 
            if (!patientId) return;
            
            const [vitalsRes, metricsRes] = await Promise.all([
                axiosClient.get(EHR_ENDPOINTS.VITALS_LATEST(patientId.toString())).catch(() => ({ data: null })),
                axiosClient.get(VITAL_SIGNS_ENDPOINTS.HEALTH_METRICS(patientId.toString()) + '?limit=50').catch(() => ({ data: null }))
            ]);

            let mergedVitals = { ...(vitalsRes.data?.data || vitalsRes.data || {}) };
            const metricsList = metricsRes.data?.data || [];

            const mostRecent: any = {};
            metricsList.forEach((m: any) => {
                const code = m.metric_code;
                if (!mostRecent[code] || new Date(m.measured_at) > new Date(mostRecent[code].measured_at)) {
                    mostRecent[code] = m;
                }
            });

            const ceDate = mergedVitals.created_at ? new Date(mergedVitals.created_at) : new Date(0);
            const getVal = (m: any) => typeof m.metric_value === 'string' ? JSON.parse(m.metric_value) : m.metric_value;

            if (mostRecent['BLOOD_PRESSURE'] && new Date(mostRecent['BLOOD_PRESSURE'].measured_at) >= ceDate) {
                const val = getVal(mostRecent['BLOOD_PRESSURE']);
                mergedVitals.blood_pressure_systolic = val.systolic;
                mergedVitals.blood_pressure_diastolic = val.diastolic;
            }
            if (mostRecent['HEART_RATE'] && new Date(mostRecent['HEART_RATE'].measured_at) >= ceDate) {
                mergedVitals.pulse = getVal(mostRecent['HEART_RATE']).value || getVal(mostRecent['HEART_RATE']);
            }
            if (mostRecent['TEMPERATURE'] && new Date(mostRecent['TEMPERATURE'].measured_at) >= ceDate) {
                mergedVitals.temperature = getVal(mostRecent['TEMPERATURE']).value || getVal(mostRecent['TEMPERATURE']);
            }
            if (mostRecent['SPO2'] && new Date(mostRecent['SPO2'].measured_at) >= ceDate) {
                mergedVitals.spo2 = getVal(mostRecent['SPO2']).value || getVal(mostRecent['SPO2']);
            }
            if (mostRecent['WEIGHT'] && new Date(mostRecent['WEIGHT'].measured_at) >= ceDate) {
                mergedVitals.weight = getVal(mostRecent['WEIGHT']).value || getVal(mostRecent['WEIGHT']);
            }
            if (mostRecent['HEIGHT'] && new Date(mostRecent['HEIGHT'].measured_at) >= ceDate) {
                mergedVitals.height = getVal(mostRecent['HEIGHT']).value || getVal(mostRecent['HEIGHT']);
            }

            setVitals(mergedVitals);
        } catch (error) {
            console.error("Error fetching vitals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVitals();
    }, [profile.id]);

    const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setMetricCode(code);
        const opt = METRICS_OPTIONS.find(o => o.code === code);
        if (opt) setUnit(opt.defaultUnit);
        setMetricValue1('');
        setMetricValue2('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const opt = METRICS_OPTIONS.find(o => o.code === metricCode);
            
            let metric_value: any = Number(metricValue1);
            if (metricCode === 'BLOOD_PRESSURE') {
                metric_value = {
                    systolic: Number(metricValue1),
                    diastolic: Number(metricValue2),
                };
            }

            const payload = {
                metric_code: metricCode,
                metric_name: opt?.name,
                metric_value,
                unit: unit,
                measured_at: new Date(measuredAt).toISOString(),
                source_type: sourceType,
                device_info: deviceInfo
            };

            await axiosClient.post(EHR_ENDPOINTS.ADD_HEALTH_METRIC(profile.id.toString()), payload);
            
            // Re-fetch latest vitals after success
            await fetchVitals();
            
            setIsAddModalOpen(false);
            
            // reset form
            setMetricValue1('');
            setMetricValue2('');
            setDeviceInfo('');
            
            showToast("Thêm chỉ số sinh tồn thành công!", "success");
        } catch (error) {
            console.error("Failed to add metric:", error);
            showToast(extractErrorMessage(error), "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Chỉ số sinh tồn (Vital Signs)</h3>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3C81C6] text-white rounded-xl hover:bg-[#2b6cb0] transition-colors text-sm font-medium">
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                    Thêm chỉ số mới
                </button>
            </div>
            
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-[#3C81C6] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : vitals && Object.keys(vitals).length > 0 ? (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <VitalCard icon="monitor_weight" title="Cân nặng" value={vitals.weight || "--"} unit="kg" />
                        <VitalCard icon="height" title="Chiều cao" value={vitals.height || "--"} unit="cm" />
                        <VitalCard icon="favorite" title="Nhịp tim" value={vitals.pulse || "--"} unit="bpm" />
                        <VitalCard icon="blood_pressure" title="Huyết áp" value={vitals.blood_pressure_systolic ? `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}` : "--/--"} unit="mmHg" />
                        <VitalCard icon="device_thermostat" title="Nhiệt độ" value={vitals.temperature || "--"} unit="°C" />
                        <VitalCard icon="spo2" title="SpO2" value={vitals.spo2 || "--"} unit="%" />
                    </div>
                    
                    {/* Timeline - Will show integrated history */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-900 dark:text-white text-md">Lịch sử cập nhật</h4>
                        </div>
                        {/* Minimal Timeline structure - a full component could be loaded here */}
                        <p className="text-sm text-gray-500">Xem toàn bộ lịch sử trong tab Hồ sơ bệnh án.</p>
                    </div>
                </>
            ) : (
                <div className="bg-gray-50 dark:bg-[#13191f] rounded-2xl p-10 text-center border border-gray-100 dark:border-[#2d353e]">
                    <div className="w-16 h-16 bg-[#3C81C6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "32px" }}>monitor_heart</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Chưa có dữ liệu sinh tồn</h4>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">Chưa có chỉ số sinh tồn nào được ghi nhận cho bệnh nhân này.</p>
                </div>
            )}
            
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Ghi nhận chỉ số sinh tồn"
                size="md"
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2 max-h-[70vh] overflow-y-auto px-1">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="metricCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">Loại chỉ số <span className="text-red-500">*</span></label>
                        <select 
                            id="metricCode"
                            title="Loại chỉ số"
                            value={metricCode}
                            onChange={handleMetricChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {METRICS_OPTIONS.map(opt => (
                                <option key={opt.code} value={opt.code}>{opt.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <label htmlFor="metricValue1" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Giá trị {metricCode === 'BLOOD_PRESSURE' ? '(Huyết áp tâm thu)' : ''} <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="metricValue1"
                                title="Giá trị đo"
                                type="number" 
                                required
                                value={metricValue1}
                                onChange={e => setMetricValue1(e.target.value)}
                                placeholder="Ví dụ: 120"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        {metricCode === 'BLOOD_PRESSURE' && (
                            <div className="flex-1 flex flex-col gap-1">
                                <label htmlFor="metricValue2" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tâm trương <span className="text-red-500">*</span></label>
                                <input 
                                    id="metricValue2"
                                    title="Tâm trương"
                                    type="number" 
                                    required
                                    value={metricValue2}
                                    onChange={e => setMetricValue2(e.target.value)}
                                    placeholder="Ví dụ: 80"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        )}
                        
                        <div className="w-1/3 flex flex-col gap-1">
                            <label htmlFor="unit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Đơn vị</label>
                            <input 
                                id="unit"
                                title="Đơn vị"
                                type="text" 
                                value={unit}
                                readOnly
                                className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-xl p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <label htmlFor="measuredAt" className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày đo <span className="text-red-500">*</span></label>
                            <input 
                                id="measuredAt"
                                title="Ngày đo"
                                type="datetime-local" 
                                required
                                value={measuredAt}
                                onChange={e => setMeasuredAt(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                            <label htmlFor="sourceType" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nguồn dữ liệu</label>
                            <select 
                                id="sourceType"
                                title="Nguồn dữ liệu"
                                value={sourceType}
                                onChange={e => setSourceType(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="DEVICE">Thiết bị đo</option>
                                <option value="CLINIC">Khám lâm sàng</option>
                                <option value="SELF_REPORTED">Bệnh nhân khai báo</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-2">
                        <label htmlFor="deviceInfo" className="text-sm font-medium text-gray-700 dark:text-gray-300">Thiết bị / Ghi chú</label>
                        <input 
                            id="deviceInfo"
                            title="Thiết bị hoặc Ghi chú"
                            type="text" 
                            value={deviceInfo}
                            onChange={e => setDeviceInfo(e.target.value)}
                            placeholder="Tên máy đo..."
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-[#3C81C6] focus:border-[#3C81C6] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-gray-700 sticky bottom-0 bg-white dark:bg-[#1e242b] py-2">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white">
                            Hủy
                        </button>
                        <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#3C81C6] text-white rounded-xl text-sm font-medium hover:bg-[#2b6cb0] disabled:opacity-50">
                            {submitting ? 'Đang lưu...' : 'Lưu chỉ số'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

const VitalCard = ({ icon, title, value, unit }: any) => {
    return (
        <div className="bg-gray-50 dark:bg-[#13191f] rounded-2xl p-5 border border-gray-100 dark:border-[#2d353e]">
            <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#3C81C6]">{icon}</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
            </div>
            <div className="flex items-end gap-1 flex-wrap">
                <span className="text-2xl 2xl:text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
                <span className="text-xs 2xl:text-sm font-medium text-gray-500 mb-1">{unit}</span>
            </div>
        </div>
    );
}
