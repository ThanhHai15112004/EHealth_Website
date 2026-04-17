export interface MedicationReminder {
    id: string;
    profileId: string;
    medicationName: string;
    dosage: string;
    frequency: number;
    frequencyLabel?: string;
    timesOfDay: string[];
    instructions: string;
    startDate: string;
    endDate: string;
    prescriptionId?: string;
    prescriptionDetailId?: string;
    doctorName?: string;
    daysRemaining?: number | null;
    isActive: boolean;
    color: string;
    createdAt: string;
}

export interface MedicationLog {
    id: string;
    reminderId: string;
    profileId: string;
    date: string;
    scheduledTime: string;
    status: "taken" | "missed" | "skipped";
    actualTime?: string;
    note?: string;
}
