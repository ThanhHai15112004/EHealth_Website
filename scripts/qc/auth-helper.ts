/**
 * Login helper — lấy access token cho từng role
 * Cache trong RAM để gọi nhiều lần không phải login lại
 */

import axios from 'axios';
import { QC_CONFIG, TestAccount, TEST_ACCOUNTS } from './types';

const tokenCache = new Map<string, { token: string; user: any; fetchedAt: number }>();

export async function login(account: TestAccount): Promise<{ token: string; user: any }> {
    const cached = tokenCache.get(account.role);
    if (cached && Date.now() - cached.fetchedAt < 25 * 60 * 1000) {
        return { token: cached.token, user: cached.user };
    }

    const url = `${QC_CONFIG.beUrl}/api/auth/login/email`;
    try {
        const res = await axios.post(url, {
            email: account.email,
            password: account.password,
            clientInfo: {
                deviceId: `qc-${account.role}-${Date.now()}`,
                deviceName: 'qc-tool',
                ipAddress: '127.0.0.1',
                userAgent: 'EHealth-QC/1.0',
            },
        }, { timeout: QC_CONFIG.apiTimeoutMs });

        const data = res.data?.data;
        const token = data?.accessToken || data?.token;
        const user = data?.user;
        if (!token) throw new Error(`No token in response: ${JSON.stringify(res.data).slice(0, 200)}`);

        tokenCache.set(account.role, { token, user, fetchedAt: Date.now() });
        return { token, user };
    } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        throw new Error(`Login ${account.email} fail: ${msg}`);
    }
}

export async function loginAdmin() {
    return login(TEST_ACCOUNTS.find(a => a.role === 'admin')!);
}

export async function loginAll(): Promise<Record<string, { token: string; user: any }>> {
    const result: Record<string, { token: string; user: any }> = {};
    for (const acc of TEST_ACCOUNTS) {
        try {
            result[acc.role] = await login(acc);
        } catch (err: any) {
            result[acc.role] = { token: '', user: { error: err.message } };
        }
    }
    return result;
}
