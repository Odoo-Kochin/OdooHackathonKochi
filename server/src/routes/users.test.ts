import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../index.js'

describe('Users API (/api/users)', () => {
  const timestamp = Date.now()
  const testEmail = `testuser_${timestamp}@odookochi.test`
  const testName = 'Test User'

  it('GET /api/users should return 200 and a list of users', async () => {
    const res = await request(app).get('/api/users')
    assert.equal(res.status, 200)
    assert.equal(res.body.success, true)
    assert.ok(Array.isArray(res.body.data))
  })

  it('POST /api/users rejects invalid payload (invalid email)', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        email: 'not-an-email',
        name: 'Invalid Email User',
      })
    assert.equal(res.status, 400)
    assert.equal(res.body.success, false)
    assert.ok(res.body.errors || res.body.issues)
  })

  it('POST /api/users creates a user successfully', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        email: testEmail,
        name: testName,
        role: 'user',
      })
    assert.equal(res.status, 201)
    assert.equal(res.body.success, true)
    assert.ok(res.body.data.id)
    assert.equal(res.body.data.email, testEmail)
    assert.equal(res.body.data.name, testName)
  })

  it('GET /api/users includes the newly created user', async () => {
    const res = await request(app).get('/api/users')
    assert.equal(res.status, 200)
    assert.equal(res.body.success, true)
    const userFound = res.body.data.some((u: any) => u.email === testEmail)
    assert.ok(userFound, 'Newly created user should be present in /api/users list')
  })
})
