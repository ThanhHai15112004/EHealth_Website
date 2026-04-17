/**
 * Orchestrator — chạy cả 3 stage, ghi report.
 * Usage:
 *   npm run qc:all            → chạy hết (static + api + ui)
 *   npm run qc:static         → chỉ static
 *   npm run qc:api            → chỉ api contract
 *   npm run qc:ui             → chỉ UI smoke
 *   npm run qc:quick          → static + api (bỏ UI, 1 phút)
 */

import { runStaticChecks } from './stage1-static';
import { runApiContractCheck } from './stage2-api';
import { runUiSmokeTest } from './stage3-ui';
import { writeReport, renderReport } from './reporter';
import { QcFullReport, QcStageResult } from './types';

async function main() {
    const mode = process.argv[2] || 'all';
    const start = Date.now();
    const startedAt = new Date().toISOString();
    const stages: QcStageResult[] = [];

    console.log(`\n═══════════════════════════════════════════════════`);
    console.log(`  🧪 EHealth QC — mode: ${mode}`);
    console.log(`═══════════════════════════════════════════════════\n`);

    const want = new Set<string>();
    if (mode === 'all') { want.add('static'); want.add('api'); want.add('ui'); }
    else if (mode === 'quick') { want.add('static'); want.add('api'); }
    else want.add(mode);

    if (want.has('static')) {
        try {
            stages.push(await runStaticChecks());
        } catch (err: any) {
            console.error('[QC] Stage 1 crashed:', err.message);
        }
    }
    if (want.has('api')) {
        try {
            stages.push(await runApiContractCheck());
        } catch (err: any) {
            console.error('[QC] Stage 2 crashed:', err.message);
        }
    }
    if (want.has('ui')) {
        try {
            stages.push(await runUiSmokeTest());
        } catch (err: any) {
            console.error('[QC] Stage 3 crashed:', err.message);
        }
    }

    const finishedAt = new Date().toISOString();
    const allIssues = stages.flatMap(s => s.issues);
    const report: QcFullReport = {
        startedAt,
        finishedAt,
        durationMs: Date.now() - start,
        stages,
        summary: {
            totalIssues: allIssues.length,
            critical: allIssues.filter(i => i.severity === 'critical').length,
            errors: allIssues.filter(i => i.severity === 'error').length,
            warnings: allIssues.filter(i => i.severity === 'warning').length,
        },
    };

    const path = writeReport(report);
    console.log(`\n═══════════════════════════════════════════════════`);
    console.log(`  📊 TÓM TẮT`);
    console.log(`═══════════════════════════════════════════════════`);
    console.log(`  🔴 Critical: ${report.summary.critical}`);
    console.log(`  🟠 Error:    ${report.summary.errors}`);
    console.log(`  🟡 Warning:  ${report.summary.warnings}`);
    console.log(`  📝 Report:   ${path}`);
    console.log(`  ⏱  Mất:      ${(report.durationMs / 1000).toFixed(1)}s\n`);

    // Exit code: 0 nếu 0 critical + 0 error, else 1
    const hasFail = report.summary.critical > 0 || report.summary.errors > 0;
    process.exit(hasFail ? 1 : 0);
}

main().catch(err => {
    console.error('[QC] Orchestrator crash:', err);
    process.exit(2);
});
