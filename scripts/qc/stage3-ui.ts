/**
 * Stage 3 — UI smoke test (Playwright)
 *
 * Mỗi role → login, mở từng page thuộc role đó → capture:
 *   - Console error
 *   - Uncaught page error (React crash)
 *   - Failed network requests (4xx/5xx)
 *
 * Dynamic routes [id] bị skip (không có ID để fill).
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { scanRoutes, RouteInfo } from './route-scanner';
import { QC_CONFIG, QcIssue, QcStageResult, TEST_ACCOUNTS } from './types';

interface PageProbe {
    path: string;
    file: string;
    consoleErrors: string[];
    pageErrors: string[];
    failedRequests: Array<{ url: string; status: number | null; method: string }>;
    loadedMs: number;
    ok: boolean;
}

async function loginOnBrowser(context: BrowserContext, role: string) {
    const acc = TEST_ACCOUNTS.find(a => a.role === role);
    if (!acc) throw new Error(`No test account for role ${role}`);
    const page = await context.newPage();
    try {
        await page.goto(`${QC_CONFIG.feUrl}/login`, { waitUntil: 'domcontentloaded', timeout: QC_CONFIG.uiTimeoutMs });
        await page.fill('input[type="email"],input[name="email"]', acc.email);
        await page.fill('input[type="password"],input[name="password"]', acc.password);
        const submit = page.locator('button[type="submit"]').first();
        await submit.click();
        // Chờ điều hướng khỏi /login hoặc xuất hiện token trong localStorage
        await page.waitForFunction(
            () => !location.pathname.includes('/login') || !!localStorage.getItem('access_token') || !!localStorage.getItem('accessToken'),
            null,
            { timeout: QC_CONFIG.uiTimeoutMs },
        ).catch(() => { /* đã auto redirect */ });
    } finally {
        await page.close();
    }
}

async function probePage(context: BrowserContext, route: RouteInfo): Promise<PageProbe> {
    const probe: PageProbe = {
        path: route.path,
        file: route.file,
        consoleErrors: [],
        pageErrors: [],
        failedRequests: [],
        loadedMs: 0,
        ok: true,
    };
    const page = await context.newPage();
    page.on('console', msg => {
        if (msg.type() === 'error') probe.consoleErrors.push(msg.text().slice(0, 500));
    });
    page.on('pageerror', err => probe.pageErrors.push(`${err.name}: ${err.message}`.slice(0, 500)));
    page.on('response', res => {
        const s = res.status();
        const url = res.url();
        if (s >= 400 && !url.includes('/_next/') && !url.endsWith('.map') && !url.includes('favicon')) {
            probe.failedRequests.push({ url, status: s, method: res.request().method() });
        }
    });

    const t0 = Date.now();
    try {
        await page.goto(`${QC_CONFIG.feUrl}${route.path}`, {
            waitUntil: 'networkidle',
            timeout: QC_CONFIG.uiTimeoutMs,
        });
        // Đợi thêm 800ms cho useEffect fire
        await page.waitForTimeout(800);
        probe.loadedMs = Date.now() - t0;
    } catch (err: any) {
        probe.ok = false;
        probe.pageErrors.push(`Navigation: ${err.message}`.slice(0, 300));
    } finally {
        await page.close();
    }

    if (probe.pageErrors.length > 0 || probe.consoleErrors.some(e => /Cannot read|undefined|null|TypeError/.test(e))) {
        probe.ok = false;
    }
    return probe;
}

function probeToIssues(probe: PageProbe): QcIssue[] {
    const issues: QcIssue[] = [];
    for (const e of probe.pageErrors) {
        issues.push({
            stage: 'ui', severity: 'critical',
            title: `Page crash tại ${probe.path}`,
            detail: e,
            url: probe.path, file: probe.file,
        });
    }
    for (const e of probe.consoleErrors) {
        const isCritical = /Cannot read|TypeError|undefined|null/.test(e);
        issues.push({
            stage: 'ui', severity: isCritical ? 'error' : 'warning',
            title: `Console error tại ${probe.path}`,
            detail: e,
            url: probe.path, file: probe.file,
        });
    }
    for (const r of probe.failedRequests) {
        const isCritical = r.status !== null && r.status >= 500;
        issues.push({
            stage: 'ui', severity: isCritical ? 'critical' : 'warning',
            title: `${r.method} ${r.status} tại ${probe.path}`,
            url: r.url,
            httpStatus: r.status ?? undefined,
            detail: `Trang ${probe.path} gọi ${r.url} → ${r.status}`,
        });
    }
    return issues;
}

export async function runUiSmokeTest(opts: { onlyRoles?: string[]; maxPerRole?: number } = {}): Promise<QcStageResult> {
    const startedAt = new Date().toISOString();
    const start = Date.now();
    const issues: QcIssue[] = [];
    let totalChecked = 0;
    let passed = 0;
    let failed = 0;

    const allRoutes = scanRoutes(process.cwd())
        .filter(r => !r.hasDynamicParam)
        .filter(r => !r.path.startsWith('/api')); // safety

    const byRole: Record<string, RouteInfo[]> = {};
    for (const r of allRoutes) (byRole[r.roleHint] ||= []).push(r);

    // Luôn kiểm tra trang public trước (không cần login)
    const publicRoutes = byRole.public || [];

    console.log('[QC Stage 3] Launching chromium...');
    const browser: Browser = await chromium.launch({ headless: true });

    try {
        // Public pages
        const publicCtx = await browser.newContext({ ignoreHTTPSErrors: true });
        console.log(`[QC Stage 3] Testing ${publicRoutes.length} public pages...`);
        for (const route of publicRoutes) {
            totalChecked += 1;
            const probe = await probePage(publicCtx, route);
            const pageIssues = probeToIssues(probe);
            issues.push(...pageIssues);
            if (probe.ok && pageIssues.filter(i => i.severity === 'critical' || i.severity === 'error').length === 0) passed += 1;
            else failed += 1;
        }
        await publicCtx.close();

        // Protected pages per role
        const rolesToTest = opts.onlyRoles ?? ['admin', 'doctor', 'pharmacist', 'staff', 'patient'];
        for (const role of rolesToTest) {
            const routes = byRole[role] || [];
            if (routes.length === 0) continue;
            const limited = opts.maxPerRole ? routes.slice(0, opts.maxPerRole) : routes;
            console.log(`[QC Stage 3] [${role}] ${limited.length} pages...`);
            const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
            try {
                await loginOnBrowser(ctx, role);
            } catch (err: any) {
                issues.push({
                    stage: 'ui', severity: 'critical',
                    title: `Không login được role ${role} trên browser`,
                    detail: err.message,
                });
                await ctx.close();
                continue;
            }

            for (const route of limited) {
                totalChecked += 1;
                const probe = await probePage(ctx, route);
                const pageIssues = probeToIssues(probe);
                issues.push(...pageIssues);
                if (probe.ok && pageIssues.filter(i => i.severity === 'critical' || i.severity === 'error').length === 0) passed += 1;
                else failed += 1;
            }

            await ctx.close();
        }
    } finally {
        await browser.close();
    }

    const finishedAt = new Date().toISOString();
    return {
        stage: 'ui', startedAt, finishedAt,
        durationMs: Date.now() - start,
        totalChecked, passed, failed, issues,
    };
}

if (require.main === module) {
    runUiSmokeTest().then(r => {
        console.log(JSON.stringify(r.issues.slice(0, 20), null, 2));
        console.log(`TOTAL: ${r.totalChecked}, PASS: ${r.passed}, FAIL: ${r.failed}`);
        process.exit(r.failed > 0 ? 1 : 0);
    });
}
