/**
 * Axios Client Configuration
 * Cấu hình Axios cho việc gọi API
 * 
 * @description
 * - Tự động thêm token vào header
 * - Xử lý refresh token khi hết hạn
 * - Xử lý lỗi chung
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '@/config';

// ============================================
// Khởi tạo Axios Instance
// ============================================

const axiosClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================
// Request Interceptor
// Thêm access token vào mỗi request
// ============================================

axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Lấy token từ localStorage (guard SSR Next.js)
        const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY) : null;

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// ============================================
// Response Interceptor
// Xử lý response và refresh token khi hết hạn
// Sử dụng hàng đợi (queue) để tránh race condition
// khi nhiều request đồng thời nhận 401
// ============================================

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Chỉ xử lý 401 (Token hết hạn), bỏ qua nếu đã retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Nếu đang refresh rồi, đợi kết quả từ request đầu tiên
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (newToken: string) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            }
                            resolve(axiosClient(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = typeof window !== 'undefined'
                    ? localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY)
                    : null;

                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(
                    `${API_CONFIG.BASE_URL}/api/auth/refresh-token`,
                    { refreshToken }
                );

                const newAccessToken = response.data?.data?.accessToken;
                const newRefreshToken = response.data?.data?.refreshToken;

                if (!newAccessToken) {
                    throw new Error('No access token in refresh response');
                }

                // Lưu token mới
                localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, newRefreshToken);
                }

                // Xử lý tất cả request đang đợi trong hàng đợi
                processQueue(null, newAccessToken);

                // Retry request gốc với token mới
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return axiosClient(originalRequest);
            } catch (refreshError) {
                // Refresh thất bại → hủy tất cả request đang đợi
                processQueue(refreshError, null);

                // Force logout
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
                    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
                    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Xử lý các lỗi khác
        return Promise.reject(error);
    }
);

export default axiosClient;
