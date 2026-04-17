/**
 * Vitest setup — import jest-dom matchers, mock global APIs cần thiết
 */

import '@testing-library/jest-dom/vitest';

// Fake localStorage cho môi trường jsdom (một số util gọi trực tiếp)
if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map<string, string>();
    (globalThis as any).localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, String(v)),
        removeItem: (k: string) => store.delete(k),
        clear: () => store.clear(),
        key: (i: number) => Array.from(store.keys())[i] ?? null,
        get length() { return store.size; },
    };
}
