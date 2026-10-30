"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_USERS = exports.UserDetailResponseSchema = exports.UserListResponseSchema = exports.CreateUserRequestSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
// ============================================================================
// USER SCHEMAS & CONTRACTS
// ============================================================================
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().nullable().optional(),
    role: zod_1.z.enum(['admin', 'user']).default('user'),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.CreateUserRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1).optional(),
    role: zod_1.z.enum(['admin', 'user']).optional().default('user'),
});
exports.UserListResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.array(exports.UserSchema),
    message: zod_1.z.string().optional(),
});
exports.UserDetailResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: exports.UserSchema,
    message: zod_1.z.string().optional(),
});
// ============================================================================
// CANONICAL MOCK DATA
// Used by Express backend mock handlers and frontend mock testing
// ============================================================================
exports.MOCK_USERS = [
    {
        id: 'e2b3c4d5-6789-4abc-9def-0123456789ab',
        email: 'alex.hackathon@odoo.com',
        name: 'Alex Rivera',
        role: 'admin',
        createdAt: '2026-10-30T10:00:00.000Z',
        updatedAt: '2026-10-30T10:00:00.000Z',
    },
    {
        id: 'a1b2c3d4-5678-490a-bcde-f12345678901',
        email: 'sarah.dev@odoo.com',
        name: 'Sarah Chen',
        role: 'user',
        createdAt: '2026-10-30T11:30:00.000Z',
        updatedAt: '2026-10-30T11:30:00.000Z',
    },
];
