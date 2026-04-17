/**
 * QC types dùng chung cho 3 stages
 */

export type Severity = 'critical' | 'error' | 'warning' | 'info';

export interface QcIssue {
    stage: 'static' | 'api' | 'ui';
    severity: Severity;
    title: string;
    detail?: string;
    file?: string;
    line?: number;
    url?: string;
    httpStatus?: number;
}

export interface QcStageResult {
    stage: 'static' | 'api' | 'ui';
    startedAt: string;
    finishedAt: string;
    durationMs: number;
    totalChecked: number;
    passed: number;
    failed: number;
    issues: QcIssue[];
}

export interface QcFullReport {
    startedAt: string;
    finishedAt: string;
    durationMs: number;
    stages: QcStageResult[];
    summary: {
        totalIssues: number;
        critical: number;
        errors: number;
        warnings: number;
    };
}

export interface TestAccount {
    role: 'admin' | 'doctor' | 'nurse' | 'pharmacist' | 'staff' | 'patient';
    email: string;
    password: string;
}

export const TEST_ACCOUNTS: TestAccount[] = [
    { role: 'admin', email: 'admin@ehealth.vn', password: 'Admin@123' },
    { role: 'doctor', email: 'doctor@ehealth.vn', password: 'Admin@123' },
    { role: 'nurse', email: 'nurse@ehealth.vn', password: 'Admin@123' },
    { role: 'pharmacist', email: 'pharmacist@ehealth.vn', password: 'Admin@123' },
    { role: 'staff', email: 'staff@ehealth.vn', password: 'Admin@123' },
    { role: 'patient', email: 'patient@ehealth.vn', password: 'Admin@123' },
];

export const QC_CONFIG = {
    beUrl: process.env.QC_BE_URL || 'http://localhost:3000',
    feUrl: process.env.QC_FE_URL || 'http://localhost:3001',
    apiTimeoutMs: 15000,
    uiTimeoutMs: 20000,
    reportDir: 'qc-reports',
};
