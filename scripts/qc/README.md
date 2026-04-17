# 🧪 EHealth QC Tool

Bộ công cụ tự động kiểm tra **3 tầng** để phát hiện lỗi mà không phải click tay.

## Scope

| Stage | Kiểm tra gì | Bắt được lỗi kiểu |
|---|---|---|
| **1. Static** | `tsc --noEmit` + `next lint` | TypeScript, import sai, unused vars |
| **2. API contract** | Login admin → gọi GET mọi endpoint trong `src/api/endpoints.ts` | 404 (path FE↔BE mismatch), 5xx (BE crash), 401/403 (RBAC) |
| **3. UI smoke** | Playwright login 6 role → mở mọi page không có `[param]` | React crash, console error, null dereference, network 4xx/5xx trong trang |

## Yêu cầu

```bash
# BE phải chạy sẵn (default http://localhost:3000)
cd ../EHealth-Api && npm run dev

# FE phải chạy sẵn (default http://localhost:3001)
cd ../EHealth_Website && npm run dev
```

## Chạy

```bash
# Ở trong EHealth_Website
npm run qc:all       # chạy hết (~3-5 phút)
npm run qc:quick     # static + api (~1 phút, bỏ UI)
npm run qc:static    # chỉ tsc + lint
npm run qc:api       # chỉ api contract check
npm run qc:ui        # chỉ UI smoke
```

Kết quả ghi ở `qc-reports/qc-report.md` (overwrite mỗi lần chạy) + snapshot `qc-report-TIMESTAMP.md`.

## Config qua ENV

```bash
QC_BE_URL=http://localhost:3000 \
QC_FE_URL=http://localhost:3001 \
npm run qc:all
```

## Tài khoản test

Mặc định dùng 6 tài khoản `*@ehealth.vn` password `Admin@123`. Sửa trong [types.ts](./types.ts) `TEST_ACCOUNTS`.

## Exit code

- `0` — 0 critical + 0 error (warnings OK)
- `1` — có critical hoặc error
- `2` — tool crash

Dùng được trong CI.

## Limit

Tool **KHÔNG** test:
- Form submit, modal, multi-step wizard (booking 5 bước) — cần custom flow test
- WebSocket / SSE / push notification
- Payment gateway real transaction
- File upload

Ước tính phủ: **~85% bugs runtime** sẽ lộ, còn ~15% cần click tay.
