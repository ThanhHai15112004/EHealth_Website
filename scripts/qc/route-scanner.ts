/**
 * Scan tất cả Next.js routes dưới src/app
 * Bỏ qua dynamic routes [id] vì không có data để fill.
 */

import { readdirSync, statSync } from 'fs';
import { join, relative, sep } from 'path';

export interface RouteInfo {
    path: string;                    // /admin/users
    file: string;                    // src/app/admin/users/page.tsx
    roleHint: 'admin' | 'doctor' | 'patient' | 'pharmacist' | 'staff' | 'public';
    hasDynamicParam: boolean;        // chứa [id]
}

function inferRole(routePath: string): RouteInfo['roleHint'] {
    if (routePath.startsWith('/admin')) return 'admin';
    if (routePath.startsWith('/portal/doctor')) return 'doctor';
    if (routePath.startsWith('/portal/pharmacist')) return 'pharmacist';
    if (routePath.startsWith('/portal/receptionist')) return 'staff';
    if (routePath.startsWith('/patient')) return 'patient';
    return 'public';
}

function walk(dir: string, collected: string[] = []): string[] {
    let entries: string[] = [];
    try { entries = readdirSync(dir); } catch { return collected; }
    for (const name of entries) {
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) walk(full, collected);
        else if (name === 'page.tsx' || name === 'page.ts') collected.push(full);
    }
    return collected;
}

export function scanRoutes(projectRoot: string): RouteInfo[] {
    const appDir = join(projectRoot, 'src', 'app');
    const pages = walk(appDir);
    return pages.map(file => {
        const rel = relative(appDir, file);
        const parts = rel.split(sep).slice(0, -1); // drop 'page.tsx'
        // Strip Next.js route groups (parentheses)
        const cleaned = parts.filter(p => !(p.startsWith('(') && p.endsWith(')')));
        const routePath = '/' + cleaned.join('/');
        const hasDynamicParam = cleaned.some(p => p.includes('['));
        return {
            path: routePath === '/' ? '/' : routePath,
            file: relative(projectRoot, file),
            roleHint: inferRole(routePath),
            hasDynamicParam,
        };
    });
}
