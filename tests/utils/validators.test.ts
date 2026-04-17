/**
 * Unit tests cho src/utils/validators.ts
 * Check nghiệp vụ: email, SĐT VN, password (policy bảo mật), CCCD/CMND, URL, birth date.
 */

import { describe, it, expect } from 'vitest';
import {
    isValidEmail,
    isValidPhoneNumber,
    validatePassword,
    isRequired,
    hasMinLength,
    hasMaxLength,
    isValidIdNumber,
    isValidUrl,
    isValidBirthDate,
} from '@/utils/validators';

describe('isValidEmail', () => {
    it.each([
        ['abc@xyz.com', true],
        ['user.name@sub.domain.vn', true],
        ['no-at-sign', false],
        ['missing@domain', false],
        ['@no-local.com', false],
        ['', false],
    ])('%s → %s', (email, expected) => {
        expect(isValidEmail(email)).toBe(expected);
    });
});

describe('isValidPhoneNumber', () => {
    it.each([
        ['0912345678', true],
        ['0798765432', true],
        ['091 234 5678', true],  // có dấu cách
        ['091234567', false],    // thiếu số
        ['0212345678', false],   // đầu số sai
        ['abcdefghij', false],
    ])('%s → %s', (phone, expected) => {
        expect(isValidPhoneNumber(phone)).toBe(expected);
    });
});

describe('validatePassword — policy bảo mật', () => {
    it('Password hợp lệ đủ 4 quy tắc', () => {
        const r = validatePassword('Admin@123');
        expect(r.isValid).toBe(true);
        expect(r.errors).toEqual([]);
    });
    it('Thiếu chữ hoa → error có message', () => {
        const r = validatePassword('admin@123');
        expect(r.isValid).toBe(false);
        expect(r.errors).toContain('Mật khẩu phải chứa ít nhất 1 chữ hoa');
    });
    it('Thiếu chữ thường → error', () => {
        const r = validatePassword('ADMIN@123');
        expect(r.isValid).toBe(false);
        expect(r.errors).toContain('Mật khẩu phải chứa ít nhất 1 chữ thường');
    });
    it('Thiếu số → error', () => {
        const r = validatePassword('AdminTest');
        expect(r.isValid).toBe(false);
        expect(r.errors).toContain('Mật khẩu phải chứa ít nhất 1 số');
    });
    it('Ngắn hơn 8 ký tự → error', () => {
        const r = validatePassword('Ab1');
        expect(r.isValid).toBe(false);
        expect(r.errors).toContain('Mật khẩu phải có ít nhất 8 ký tự');
    });
    it('Rỗng → 4 error', () => {
        const r = validatePassword('');
        expect(r.isValid).toBe(false);
        expect(r.errors.length).toBeGreaterThanOrEqual(4);
    });
});

describe('isRequired', () => {
    it.each([
        ['', false],
        ['   ', false],
        ['abc', true],
        [0, true],
        [null, false],
        [undefined, false],
        [false, true],
    ])('%s → %s', (v, expected) => {
        expect(isRequired(v)).toBe(expected);
    });
});

describe('hasMinLength / hasMaxLength', () => {
    it('min length boundary', () => {
        expect(hasMinLength('abc', 3)).toBe(true);
        expect(hasMinLength('ab', 3)).toBe(false);
    });
    it('max length boundary', () => {
        expect(hasMaxLength('abc', 3)).toBe(true);
        expect(hasMaxLength('abcd', 3)).toBe(false);
    });
});

describe('isValidIdNumber — CCCD/CMND', () => {
    it.each([
        ['123456789', true],     // CMND 9 số
        ['001234567890', true],  // CCCD 12 số
        ['12345678901', false],  // 11 số (không hợp lệ)
        ['abcdefghi', false],    // không phải số
        ['', false],
    ])('%s → %s', (id, expected) => {
        expect(isValidIdNumber(id)).toBe(expected);
    });
});

describe('isValidUrl', () => {
    it.each([
        ['https://ehealth.vn', true],
        ['http://localhost:3000', true],
        ['not a url', false],
        ['', false],
    ])('%s → %s', (url, expected) => {
        expect(isValidUrl(url)).toBe(expected);
    });
});

describe('isValidBirthDate', () => {
    it('Ngày quá khứ hợp lệ', () => {
        expect(isValidBirthDate('2000-01-01')).toBe(true);
    });
    it('Ngày tương lai không hợp lệ', () => {
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        expect(isValidBirthDate(future)).toBe(false);
    });
    it('Quá 150 tuổi không hợp lệ', () => {
        expect(isValidBirthDate('1800-01-01')).toBe(false);
    });
});
