/**
 * Unit tests cho src/utils/formatters.ts
 * Check nghiệp vụ: format tiền VND, số, ngày giờ VN, số điện thoại, file size.
 */

import { describe, it, expect } from 'vitest';
import {
    formatCurrency,
    formatCurrencyShort,
    formatNumber,
    formatPhoneNumber,
    maskPhoneNumber,
    formatFileSize,
    formatPercentage,
    formatRelativeTime,
} from '@/utils/formatters';

describe('formatCurrency — tiền VND', () => {
    it('Format 100000 thành "100.000 ₫" hoặc tương đương', () => {
        const result = formatCurrency(100_000);
        expect(result).toMatch(/100[\.,]000/);
        expect(result).toMatch(/₫|VND/);
    });
    it('Format 0 vẫn hợp lệ', () => {
        expect(formatCurrency(0)).toMatch(/0/);
    });
});

describe('formatCurrencyShort — số rút gọn', () => {
    it.each([
        [500, '500'],
        [5_000, '5k'],
        [1_500_000, '1.5 triệu'],
        [2_500_000_000, '2.5 tỷ'],
    ])('%d → %s', (n, expected) => {
        expect(formatCurrencyShort(n)).toBe(expected);
    });
});

describe('formatNumber — định dạng VN', () => {
    it('1234567 → chứa dấu ngăn', () => {
        const r = formatNumber(1_234_567);
        expect(r).toMatch(/1[\.,]234[\.,]567/);
    });
});

describe('formatPhoneNumber — 10 số chia nhóm 4-3-3', () => {
    it('0909123456 → 0909 123 456', () => {
        expect(formatPhoneNumber('0909123456')).toBe('0909 123 456');
    });
    it('Số không phải 10 chữ số → giữ nguyên', () => {
        expect(formatPhoneNumber('12345')).toBe('12345');
    });
    it('Có ký tự đặc biệt → loại bỏ rồi format', () => {
        expect(formatPhoneNumber('(090) 912-3456')).toBe('0909 123 456');
    });
});

describe('maskPhoneNumber — ẩn 3 số giữa', () => {
    it('0909123456 → 0909 *** 456', () => {
        expect(maskPhoneNumber('0909123456')).toBe('0909 *** 456');
    });
    it('Số < 10 chữ số → giữ nguyên', () => {
        expect(maskPhoneNumber('12345')).toBe('12345');
    });
});

describe('formatFileSize — chuyển bytes', () => {
    it.each([
        [0, '0 Bytes'],
        [1024, '1 KB'],
        [1048576, '1 MB'],
        [1073741824, '1 GB'],
    ])('%d bytes → %s', (bytes, expected) => {
        expect(formatFileSize(bytes)).toBe(expected);
    });
    it('1536 bytes → 1.5 KB', () => {
        expect(formatFileSize(1536)).toBe('1.5 KB');
    });
});

describe('formatPercentage', () => {
    it('50 → 50%', () => {
        expect(formatPercentage(50)).toBe('50%');
    });
    it('50.567 với decimals=2 → 50.57%', () => {
        expect(formatPercentage(50.567, 2)).toBe('50.57%');
    });
});

describe('formatRelativeTime — thời gian tương đối', () => {
    it('Vừa xong (< 10 giây)', () => {
        const now = new Date();
        expect(formatRelativeTime(now)).toBe('Vừa xong');
    });
    it('N phút trước', () => {
        const past = new Date(Date.now() - 5 * 60 * 1000);
        expect(formatRelativeTime(past)).toBe('5 phút trước');
    });
    it('N giờ trước', () => {
        const past = new Date(Date.now() - 3 * 60 * 60 * 1000);
        expect(formatRelativeTime(past)).toBe('3 giờ trước');
    });
    it('N ngày trước', () => {
        const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        expect(formatRelativeTime(past)).toBe('2 ngày trước');
    });
});
