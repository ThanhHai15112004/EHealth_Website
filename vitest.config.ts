import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
        exclude: ['node_modules', '.next', 'scripts/qc/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary', 'lcov'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/**',
                '.next/**',
                'scripts/**',
                'tests/**',
                '**/*.test.{ts,tsx}',
                '**/*.config.{ts,js,mjs}',
                'src/api/endpoints.ts',
                'src/app/**',
                'src/components/**',
                'src/contexts/**',
                '**/*.d.ts',
            ],
            thresholds: {
                lines: 40,
                functions: 40,
                branches: 30,
                statements: 40,
            },
        },
    },
});
