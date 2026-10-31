import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../index.js'
import { signToken, verifyToken } from '../lib/jwt.js'

describe('Auth API & JWT Authentication (/api/auth)', () => {
  const timestamp = Date.now()
  const validEmail = `jwtuser_${timestamp}@brightloop.test`
  const validPassword = 'SecurePassword123!'
  let registeredJwtToken: string

  describe('JWT Helper Functions (Unit)', () => {
    it('signs and verifies a valid JWT payload correctly', () => {
      const payload = {
        id: 'test-user-id-123',
        email: 'test@brightloop.io',
        role: 'admin' as const,
        name: 'Test Admin',
      }
      const token = signToken(payload, '1h')
      assert.ok(token)
      assert.equal(token.split('.').length, 3, 'JWT must contain header.payload.signature')

      const decoded = verifyToken(token)
      assert.ok(decoded)
      assert.equal(decoded.id, payload.id)
      assert.equal(decoded.email, payload.email)
      assert.equal(decoded.role, payload.role)
    })

    it('returns null when verifying a malformed or forged token', () => {
      const badToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.badpayload.invalidsig'
      const result = verifyToken(badToken)
      assert.equal(result, null)
    })

    it('returns null when verifying an expired token', async () => {
      const payload = {
        id: 'exp-user-id',
        email: 'exp@brightloop.io',
        role: 'customer' as const,
      }
      // Token expires in 0s (instantly expired)
      const expiredToken = signToken(payload, '0s')
      // Small pause to guarantee expiration
      await new Promise((resolve) => setTimeout(resolve, 50))
      const result = verifyToken(expiredToken)
      assert.equal(result, null)
    })
  })

  describe('Registration & Password Rules', () => {
    it('rejects registration with a weak password (no uppercase)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `weak1_${timestamp}@brightloop.test`,
          name: 'Weak Pass User',
          password: 'password123!',
        })

      assert.equal(res.status, 400)
      assert.equal(res.body.success, false)
    })

    it('rejects registration with a weak password (no special char)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `weak2_${timestamp}@brightloop.test`,
          name: 'Weak Pass User',
          password: 'Password123',
        })

      assert.equal(res.status, 400)
      assert.equal(res.body.success, false)
    })

    it('rejects registration with a password of length <= 8', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `short_${timestamp}@brightloop.test`,
          name: 'Short Pass User',
          password: 'Ab1!xyz',
        })

      assert.equal(res.status, 400)
      assert.equal(res.body.success, false)
    })

    it('successfully registers user and returns a cryptographically signed JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: validEmail,
          name: 'Valid Customer',
          company: 'Bright Innovations',
          password: validPassword,
        })

      assert.equal(res.status, 201)
      assert.equal(res.body.success, true)
      assert.equal(res.body.user.email, validEmail)
      assert.equal(res.body.user.role, 'customer')

      // Validate JWT format
      registeredJwtToken = res.body.token
      assert.ok(registeredJwtToken)
      assert.equal(registeredJwtToken.split('.').length, 3, 'Token must be a valid 3-part JWT')

      const decoded = verifyToken(registeredJwtToken)
      assert.ok(decoded)
      assert.equal(decoded.email, validEmail)
      assert.equal(decoded.role, 'customer')
    })

    it('rejects duplicate registration with the same email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: validEmail,
          name: 'Duplicate User',
          password: validPassword,
        })

      assert.equal(res.status, 400)
      assert.equal(res.body.success, false)
      assert.match(res.body.message, /already exists/i)
    })
  })

  describe('Login & Session Verification (/api/auth/me)', () => {
    it('successfully logs in with valid credentials and issues a signed JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validEmail,
          password: validPassword,
        })

      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.equal(res.body.user.email, validEmail)

      // Validate returned token
      const token = res.body.token
      assert.ok(token)
      assert.equal(token.split('.').length, 3)

      const decoded = verifyToken(token)
      assert.ok(decoded)
      assert.equal(decoded.id, res.body.user.id)
    })

    it('rejects login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validEmail,
          password: 'WrongPassword999!',
        })

      assert.equal(res.status, 401)
      assert.equal(res.body.success, false)
    })

    it('GET /api/auth/me returns active profile when passed a valid JWT Bearer header', async () => {
      assert.ok(registeredJwtToken)
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${registeredJwtToken}`)

      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.equal(res.body.user.email, validEmail)
    })

    it('GET /api/auth/me returns 401 when missing Authorization header', async () => {
      const res = await request(app).get('/api/auth/me')
      assert.equal(res.status, 401)
      assert.equal(res.body.success, false)
    })

    it('GET /api/auth/me returns 401 when passed a tampered/invalid JWT Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.tampered.token')

      assert.equal(res.status, 401)
      assert.equal(res.body.success, false)
    })
  })

  describe('Quick Login & Password Reset', () => {
    it('allows quick-login for demo roles (admin, staff, customer) and returns role-specific JWTs', async () => {
      for (const role of ['admin', 'staff', 'customer'] as const) {
        const res = await request(app)
          .post('/api/auth/quick-login')
          .send({ role })

        assert.equal(res.status, 200)
        assert.equal(res.body.success, true)
        assert.equal(res.body.user.role, role)

        const token = res.body.token
        assert.ok(token)
        assert.equal(token.split('.').length, 3)

        const decoded = verifyToken(token)
        assert.ok(decoded)
        assert.equal(decoded.role, role)
      }
    })

    it('simulates sending a password reset link to registered email', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: validEmail })

      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.match(res.body.message, /dispatched/i)
    })
  })
})
