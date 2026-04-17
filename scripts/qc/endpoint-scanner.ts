/**
 * Parse src/api/endpoints.ts để lấy tất cả endpoint strings.
 * Chỉ trả về các GET endpoint không có path param phức tạp (để tự test được).
 *
 * Lấy cả:
 *   - LIST: '/api/xyz'                 → static path
 *   - DETAIL: (id) => `/api/xyz/${id}` → template, cần id thay thế
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface EndpointInfo {
    group: string;           // AUTH_ENDPOINTS
    name: string;            // LIST
    path: string;            // /api/auth/login
    isTemplate: boolean;     // có placeholder ${...}
    placeholders: string[];  // tên param: ['id', 'patientId']
}

const GROUP_RE = /export const ([A-Z_]+_ENDPOINTS?)\s*=\s*\{([\s\S]*?)\};?/g;
const STATIC_ENTRY_RE = /^\s*([A-Z_0-9]+)\s*:\s*['"`]([^'"`]+)['"`]\s*,?/;
const TEMPLATE_ENTRY_RE = /^\s*([A-Z_0-9]+)\s*:\s*\(([^)]*)\)\s*=>\s*`([^`]+)`/;

export function scanEndpoints(projectRoot: string): EndpointInfo[] {
    const file = join(projectRoot, 'src', 'api', 'endpoints.ts');
    const src = readFileSync(file, 'utf8');
    const out: EndpointInfo[] = [];

    let m: RegExpExecArray | null;
    while ((m = GROUP_RE.exec(src))) {
        const group = m[1];
        const body = m[2];
        for (const rawLine of body.split('\n')) {
            const line = rawLine.replace(/\/\/.*$/, '').trim();
            if (!line) continue;

            const staticMatch = STATIC_ENTRY_RE.exec(line);
            if (staticMatch) {
                out.push({
                    group,
                    name: staticMatch[1],
                    path: staticMatch[2],
                    isTemplate: false,
                    placeholders: [],
                });
                continue;
            }

            const tplMatch = TEMPLATE_ENTRY_RE.exec(line);
            if (tplMatch) {
                const params = tplMatch[2].split(',').map(s => s.trim().split(':')[0].trim()).filter(Boolean);
                out.push({
                    group,
                    name: tplMatch[1],
                    path: tplMatch[3],
                    isTemplate: true,
                    placeholders: params,
                });
            }
        }
    }
    return out;
}

/**
 * Lọc các endpoint có thể test GET tự động.
 * - Không có param, HOẶC
 * - Có param nhưng đều nằm trong whitelist known IDs
 */
export function filterAutoTestable(
    endpoints: EndpointInfo[],
    knownIds: Record<string, string>,
): EndpointInfo[] {
    return endpoints.filter(ep => {
        if (!ep.isTemplate) return true;
        return ep.placeholders.every(p => knownIds[p] !== undefined);
    });
}

export function substitutePath(ep: EndpointInfo, knownIds: Record<string, string>): string {
    let path = ep.path;
    for (const p of ep.placeholders) {
        const v = knownIds[p];
        if (v === undefined) continue;
        path = path.replace(new RegExp(`\\$\\{${p}\\}`, 'g'), encodeURIComponent(v));
    }
    return path;
}
