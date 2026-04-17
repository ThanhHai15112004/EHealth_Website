export interface PatientMedicalRecordListItemVM {
    encounterId: string;
    encounterType: string;
    encounterTypeLabel: string;
    startTime: string | null;
    endTime: string | null;
    formattedDate: string;
    status: string;
    statusLabel: string;
    doctorName: string;
    doctorTitle?: string | null;
    specialtyName: string;
    primaryDiagnosis: string;
    icd10Code?: string | null;
    isFinalized: boolean;
    hasSignature: boolean;
    visitNumber?: number | null;
    trustState: "draft" | "finalized" | "verified";
    trustLabel: string;
}

export interface PatientRecordTimelineItemVM {
    id: string;
    encounterId?: string | null;
    date: string;
    rawDate?: string | null;
    type: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    status: "completed" | "pending" | "in_progress";
    statusLabel: string;
}

export interface PatientMedicalRecordStatsVM {
    totalEncounters: number;
    totalFinalized: number;
    completionRate: number;
    lastEncounterLabel: string;
    topDiagnosisLabel: string;
    topDiagnosisCount: number;
    topEncounterTypeLabel: string;
    vitalSignsTrend: Array<{
        date: string;
        systolic: number | null;
        diastolic: number | null;
        pulse: number | null;
        weight: number | null;
    }>;
}

export interface PatientClinicalResultVM {
    orderId: string;
    encounterId: string;
    serviceCode: string;
    serviceName: string;
    orderType: string;
    priority: string;
    status: string;
    statusLabel: string;
    clinicalIndicator: string | null;
    notes: string | null;
    orderedAt: string | null;
    performedAt: string | null;
    doctorName: string;
    ordererName: string;
    performerName: string;
    resultSummary: string | null;
    resultDetails: Record<string, unknown> | null;
    attachmentUrls: string[];
    isAbnormal: boolean;
    abnormalReason?: string | null;
}

export interface PatientMedicalRecordDetailVM {
    encounter: {
        encounterId: string;
        encounterType: string;
        encounterTypeLabel: string;
        startTime: string | null;
        endTime: string | null;
        formattedStartTime: string;
        formattedEndTime: string;
        status: string;
        statusLabel: string;
        doctorName: string;
        doctorTitle?: string | null;
        specialtyName: string;
        roomName?: string | null;
        roomCode?: string | null;
        visitNumber?: number | null;
        notes?: string | null;
        patientId?: string;
    };
    clinicalExam: {
        chiefComplaint: string;
        medicalHistoryNotes: string;
        physicalExamination: string;
        pulse: number | null;
        bloodPressureSystolic: number | null;
        bloodPressureDiastolic: number | null;
        temperature: number | null;
        respiratoryRate: number | null;
        spo2: number | null;
        weight: number | null;
        height: number | null;
        bmi: number | null;
    } | null;
    diagnoses: Array<{
        id: string;
        diagnosisName: string;
        diagnosisType: string;
        diagnosisTypeLabel: string;
        icd10Code?: string | null;
        notes?: string | null;
        diagnosedByName?: string | null;
    }>;
    medicalOrders: Array<{
        id: string;
        serviceCode: string;
        serviceName: string;
        priority: string;
        status: string;
        statusLabel: string;
        orderedAt: string | null;
        resultSummary: string | null;
        attachmentUrls: string[];
    }>;
    prescription: {
        prescriptionCode: string;
        status: string;
        statusLabel: string;
        clinicalDiagnosis: string;
        doctorNotes: string;
        prescribedAt: string;
        details: Array<{
            drugCode?: string;
            brandName: string;
            activeIngredients: string;
            quantity: number | null;
            dosage: string;
            frequency: string;
            durationDays: number | null;
            usageInstruction: string;
            routeOfAdministration: string;
            dispensingUnit: string;
        }>;
    } | null;
    trustState: "draft" | "finalized" | "verified";
    trustLabel: string;
    isFinalized: boolean;
    hasSignature: boolean;
    completeness: {
        score: number;
        totalItems: number;
        completedItems: number;
        statusLabel: string;
        patientChecklist: Array<{
            id: string;
            label: string;
            status: "completed" | "partial" | "missing" | "not_applicable";
            statusLabel: string;
            note?: string;
        }>;
    };
    snapshot: {
        finalizedAt: string;
        finalizerName?: string | null;
        notes?: string | null;
    } | null;
    signature: {
        signerName?: string | null;
        signedAt: string;
    } | null;
}
