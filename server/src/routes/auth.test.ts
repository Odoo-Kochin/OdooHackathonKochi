import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../index.js'

describe('Auth API (/api/auth)', () => {
  const timestamp = Date.now()
  const validEmail = `newcustomer_${timestamp}@brightloop.test`
  const validPassword = 'SecurePassword123!'

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

  it('successfully registers a user with compliant password and customer role', async () => {
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

  it('successfully logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: validEmail,
        password: validPassword,
      })

    assert.equal(res.status, 200)
    assert.equal(res.body.success, true)
    assert.equal(res.body.user.email, validEmail)
    assert.ok(res.body.token)
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

  it('allows quick-login for demo roles (admin, staff, customer)', async () => {
    for (const role of ['admin', 'staff', 'customer'] as const) {
      const res = await request(app)
        .post('/api/auth/quick-login')
        .send({ role })

      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.equal(res.body.user.role, role)
      assert.ok(res.body.token)
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
