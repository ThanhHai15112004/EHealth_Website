/**
 * Stage 2 — API contract check
 *   - Login admin
 *   - Quét mọi endpoint GET trong src/api/endpoints.ts
 *   - Gọi thử với admin token
 *   - Fail: 404 / 5xx / network error
 *   - Warning: 4xx khác (401, 403, 400)
 *   - Pass: 2xx, 3xx
 *
 * Endpoint có path param:
 *   - Nếu có trong `knownIds` (pre-fetch từ /api/...) thì thay thế và test
 *   - Nếu không, skip (log info)
 */

import axios from 'axios';
import { loginAdmin } from './auth-helper';
import { scanEndpoints, substitutePath, EndpointInfo } from './endpoint-scanner';
import { QC_CONFIG, QcIssue, QcStageResult } from './types';
import { join } from 'path';

const SKIP_GROUPS = new Set<string>([
    // Group có side-effect khi GET, tránh gọi
]);
const SKIP_NAMES = new Set<string>([
    'LOGOUT',              // POST, skip
    'LOGOUT_ALL',
    'RESEND', 'RESEND_OTP',
    'UPLOAD', 'UPLOAD_AVATAR',
    'DELETE',
    'DISABLE', 'ENABLE',
    'RESET_PASSWORD',
    'FORGOT_PASSWORD',
    'VERIFY_EMAIL',
    'UNLOCK_ACCOUNT',
    'REFRESH_TOKEN',
    'LOGIN', 'LOGIN_EMAIL', 'LOGIN_PHONE',
    'REGISTER', 'REGISTER_EMAIL', 'REGISTER_PHONE',
]);

function shouldSkip(ep: EndpointInfo): boolean {
    if (SKIP_GROUPS.has(ep.group)) return true;
    if (SKIP_NAMES.has(ep.name)) return true;
    // GET-ish names pass through; unknown verbs skip
    if (/^(CREATE|UPDATE|DELETE|REMOVE|CANCEL|CONFIRM|APPROVE|REJECT|SUBMIT|SEND|DISPATCH|PAY|REFUND|CHECK_IN|CHECK_OUT|SET_DEFAULT|TOGGLE|START|STOP|RESTART|PAUSE)/.test(ep.name)) {
        return true;
    }
    return false;
}

async function fetchKnownIds(token: string): Promise<Record<string, string>> {
    const out: Record<string, string> = {};
    const headers = { Authorization: `Bearer ${token}` };

    // Try to grab first item of common list endpoints
    const tryList = async (url: string, keys: string[]) => {
        try {
            const res = await axios.get(`${QC_CONFIG.beUrl}${url}`, { headers, timeout: QC_CONFIG.apiTimeoutMs });
            const data = res.data?.data ?? res.data;
            const arr = Array.isArray(data) ? data : (data?.items ?? data?.list ?? []);
            const first = Array.isArray(arr) ? arr[0] : null;
            if (!first) return;
            for (const k of keys) {
                if (out[k] === undefined && first[k] !== undefined) out[k] = String(first[k]);
            }
        } catch { /* ignore */ }
    };

    await tryList('/api/users?limit=1', ['id', 'user_id', 'userId']);
    await tryList('/api/staff?limit=1', ['doctor_id', 'doctorId', 'id', 'staff_id']);
    await tryList('/api/patients?limit=1', ['patient_id', 'patientId', 'id']);
    await tryList('/api/facilities?limit=1', ['facility_id', 'facilityId', 'branch_id', 'branchId', 'id']);
    await tryList('/api/specialties?limit=1', ['specialty_id', 'specialtyId', 'id']);
    await tryList('/api/departments?limit=1', ['department_id', 'departmentId', 'id']);
    await tryList('/api/roles?limit=1', ['role_id', 'roleId', 'roles_id', 'id']);
    await tryList('/api/appointments?limit=1', ['appointment_id', 'appointmentId', 'id']);
    await tryList('/api/billing/invoices?limit=1', ['invoice_id', 'invoiceId', 'id']);
    await tryList('/api/notifications?limit=1', ['notification_id', 'notificationId', 'id']);
    return out;
}

export async function runApiContractCheck(): Promise<QcStageResult> {
    const startedAt = new Date().toISOString();
    const start = Date.now();
    const issues: QcIssue[] = [];

    console.log('[QC Stage 2] Login admin...');
    let token = '';
    try {
        const { token: t } = await loginAdmin();
        token = t;
    } catch (err: any) {
        issues.push({
            stage: 'api',
            severity: 'critical',
            title: 'Không login được admin — BE không chạy hoặc DB trống',
            detail: err.message,
        });
        return {
            stage: 'api', startedAt, finishedAt: new Date().toISOString(),
            durationMs: Date.now() - start, totalChecked: 0, passed: 0, failed: 1, issues,
        };
    }

    console.log('[QC Stage 2] Fetching known IDs for path-param endpoints...');
    const knownIds = await fetchKnownIds(token);
    console.log(`[QC Stage 2] Known IDs: ${Object.keys(knownIds).join(', ') || '(none)'}`);

    const all = scanEndpoints(join(process.cwd()));
    const candidates = all.filter(ep => !shouldSkip(ep));

    let totalChecked = 0;
    let passed = 0;
    let failed = 0;

    console.log(`[QC Stage 2] Testing ${candidates.length} endpoints (GET-ish, skipping mutations)...`);

    const BATCH = 8;
    for (let i = 0; i < candidates.length; i += BATCH) {
        const batch = candidates.slice(i, i + BATCH);
        await Promise.all(batch.map(async ep => {
            // Skip if template and any placeholder missing
            if (ep.isTemplate && ep.placeholders.some(p => knownIds[p] === undefined)) return;
            const realPath = ep.isTemplate ? substitutePath(ep, knownIds) : ep.path;
            if (realPath.includes('${')) return;

            totalChecked += 1;
            try {
                const res = await axios.get(`${QC_CONFIG.beUrl}${realPath}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: QC_CONFIG.apiTimeoutMs,
                    validateStatus: () => true,
                });
                const s = res.status;
                if (s >= 200 && s < 400) {
                    passed += 1;
                } else if (s === 404) {
                    failed += 1;
                    issues.push({
                        stage: 'api', severity: 'error',
                        title: `404 — Endpoint không tồn tại: ${ep.group}.${ep.name}`,
                        url: realPath, httpStatus: s,
                        detail: typeof res.data === 'string' ? res.data.slice(0, 300) : (res.data?.message ?? JSON.stringify(res.data).slice(0, 300)),
                    });
                } else if (s >= 500) {
                    failed += 1;
                    issues.push({
                        stage: 'api', severity: 'critical',
                        title: `5xx — Server crash: ${ep.group}.${ep.name}`,
                        url: realPath, httpStatus: s,
                        detail: typeof res.data === 'string' ? res.data.slice(0, 300) : (res.data?.message ?? JSON.stringify(res.data).slice(0, 300)),
                    });
                } else if (s === 401 || s === 403) {
                    // Admin hit 401/403 = permission design issue cho vai trò admin — đáng warn
                    issues.push({
                        stage: 'api', severity: 'warning',
                        title: `${s} — Admin không có quyền: ${ep.group}.${ep.name}`,
                        url: realPath, httpStatus: s,
                    });
                    passed += 1; // vẫn count pass vì BE có endpoint, chỉ RBAC chặn
                } else {
                    issues.push({
                        stage: 'api', severity: 'warning',
                        title: `${s} — ${ep.group}.${ep.name}`,
                        url: realPath, httpStatus: s,
                        detail: typeof res.data === 'string' ? res.data.slice(0, 200) : (res.data?.message ?? ''),
                    });
                    passed += 1;
                }
            } catch (err: any) {
                failed += 1;
                issues.push({
                    stage: 'api', severity: 'critical',
                    title: `Network error: ${ep.group}.${ep.name}`,
                    url: realPath,
                    detail: err.message,
                });
            }
        }));
    }

    const finishedAt = new Date().toISOString();
    return {
        stage: 'api', startedAt, finishedAt,
        durationMs: Date.now() - start,
        totalChecked, passed, failed, issues,
    };
}

if (require.main === module) {
    runApiContractCheck().then(r => {
        console.log(JSON.stringify(r, null, 2));
        process.exit(r.failed > 0 ? 1 : 0);
    });
}
