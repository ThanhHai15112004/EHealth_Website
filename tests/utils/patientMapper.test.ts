/**
 * Unit tests cho src/utils/patientMapper.ts
 * Check nghiệp vụ mapping BE Patient → FE PatientProfile:
 *   - detect "bản thân" qua trùng email/phone/name
 *   - polyfill relationship qua localStorage
 *   - parse allergies (string CSV hoặc array)
 *   - fallback các field thiếu
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mapToProfile, saveLocalRelation, LOCAL_RELATIONS_KEY } from '@/utils/patientMapper';

const basePatient: any = {
    id: 'PAT001',
    full_name: 'Nguyễn Văn A',
    date_of_birth: '1990-05-15T00:00:00.000Z',
    gender: 'MALE',
    phone_number: '0912345678',
    email: 'a@ehealth.vn',
    id_card_number: '001234567890',
    address: '123 Lê Lợi',
    status: 'ACTIVE',
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
};

beforeEach(() => {
    localStorage.clear();
});

describe('mapToProfile — detect "bản thân"', () => {
    it('Trùng email → isPrimary = true, relationship = self', () => {
        const user = { email: 'a@ehealth.vn', fullName: 'Khác', phone: '0000' };
        const profile = mapToProfile(basePatient, user);
        expect(profile.isPrimary).toBe(true);
        expect(profile.relationship).toBe('self');
        expect(profile.relationshipLabel).toBe('Bản thân');
    });

    it('Trùng phone → isPrimary = true', () => {
        const user = { email: 'khac@x.com', fullName: 'Khác', phone: '0912345678' };
        const profile = mapToProfile(basePatient, user);
        expect(profile.isPrimary).toBe(true);
    });

    it('Trùng tên (case insensitive) → isPrimary = true', () => {
        const user = { fullName: 'NGUYỄN VĂN A', email: 'x@y.com', phone: '0000' };
        const profile = mapToProfile(basePatient, user);
        expect(profile.isPrimary).toBe(true);
    });

    it('Không trùng gì → isPrimary = false, relationship = other', () => {
        const user = { fullName: 'Người khác', email: 'x@y.com', phone: '0000' };
        const profile = mapToProfile(basePatient, user);
        expect(profile.isPrimary).toBe(false);
        expect(profile.relationship).toBe('other');
    });
});

describe('mapToProfile — polyfill relationship từ localStorage', () => {
    it('localStorage ghi "parent" → profile trả relationship parent', () => {
        saveLocalRelation('PAT001', 'parent', 'Cha');
        const profile = mapToProfile(basePatient);
        expect(profile.relationship).toBe('parent');
        expect(profile.relationshipLabel).toBe('Cha');
    });

    it('localStorage ghi "self" → isPrimary tự động true dù user không truyền', () => {
        saveLocalRelation('PAT001', 'self', 'Bản thân');
        const profile = mapToProfile(basePatient);
        expect(profile.relationship).toBe('self');
        expect(profile.isPrimary).toBe(true);
    });
});

describe('mapToProfile — parse allergies', () => {
    it('String CSV → split thành mảng', () => {
        const p = { ...basePatient, allergies: 'tôm cua, kháng sinh, sữa' };
        const profile = mapToProfile(p);
        expect(profile.allergies).toEqual(['tôm cua', 'kháng sinh', 'sữa']);
    });

    it('Array giữ nguyên', () => {
        const p = { ...basePatient, allergies: ['penicillin'] };
        const profile = mapToProfile(p);
        expect(profile.allergies).toEqual(['penicillin']);
    });

    it('Rỗng → []', () => {
        const p = { ...basePatient, allergies: undefined };
        const profile = mapToProfile(p);
        expect(profile.allergies).toEqual([]);
    });
});

describe('mapToProfile — fallback field thiếu', () => {
    it('DOB dạng ISO → lấy phần ngày', () => {
        const profile = mapToProfile(basePatient);
        expect(profile.dob).toBe('1990-05-15');
    });

    it('Gender lowercase', () => {
        expect(mapToProfile({ ...basePatient, gender: 'FEMALE' }).gender).toBe('female');
    });

    it('Status INACTIVE → isActive false', () => {
        expect(mapToProfile({ ...basePatient, status: 'INACTIVE' }).isActive).toBe(false);
    });

    it('Fallback ID từ patient_id nếu không có id', () => {
        const { id, ...rest } = basePatient;
        const profile = mapToProfile({ ...rest, patient_id: 'PAT999' });
        expect(profile.id).toBe('PAT999');
    });

    it('Fallback phone từ contact.phone_number', () => {
        const p = { ...basePatient, phone_number: '', contact: { phone_number: '0988888888' } };
        expect(mapToProfile(p).phone).toBe('0988888888');
    });
});

describe('saveLocalRelation', () => {
    it('Ghi vào localStorage theo key đúng', () => {
        saveLocalRelation('PAT999', 'child', 'Con');
        const raw = localStorage.getItem(LOCAL_RELATIONS_KEY);
        expect(raw).toBeTruthy();
        const data = JSON.parse(raw!);
        expect(data.PAT999).toEqual({ relationship: 'child', label: 'Con' });
    });
});
