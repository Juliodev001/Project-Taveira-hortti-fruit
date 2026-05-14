// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockCookieGet, mockCookieSet, mockCookieDelete } = vi.hoisted(() => {
  process.env.SESSION_SECRET = 'test-secret-key-minimo-32-chars-ok'
  return {
    mockCookieGet: vi.fn(),
    mockCookieSet: vi.fn(),
    mockCookieDelete: vi.fn(),
  }
})

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({ get: mockCookieGet, set: mockCookieSet, delete: mockCookieDelete })
  ),
}))

import { encrypt, decrypt, createSession, getSession } from '@/lib/session'

beforeEach(() => vi.clearAllMocks())

describe('encrypt / decrypt', () => {
  it('gera um token JWT e recupera o payload corretamente', async () => {
    const payload = { userId: 'u-1', name: 'Admin', email: 'admin@test.com', role: 'DONO', expiresAt: new Date() }
    const token = await encrypt(payload)
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)

    const result = await decrypt(token)
    expect(result?.userId).toBe('u-1')
    expect(result?.email).toBe('admin@test.com')
    expect(result?.role).toBe('DONO')
  })

  it('retorna null para token inválido', async () => {
    expect(await decrypt('token.invalido.qualquer')).toBeNull()
  })

  it('retorna null para string vazia', async () => {
    expect(await decrypt('')).toBeNull()
  })

  it('retorna null para undefined', async () => {
    expect(await decrypt(undefined)).toBeNull()
  })

  it('retorna null para token adulterado', async () => {
    const token = await encrypt({ userId: 'u-1', name: 'x', email: 'x@x.com', role: 'DONO', expiresAt: new Date() })
    expect(await decrypt(token.slice(0, -5) + 'XXXXX')).toBeNull()
  })
})

describe('createSession', () => {
  it('cria o cookie de sessão com httpOnly', async () => {
    await createSession('u-1', 'Admin', 'admin@test.com', 'DONO')
    expect(mockCookieSet).toHaveBeenCalledWith(
      'session',
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
    )
  })

  it('o token armazenado no cookie contém o userId e role corretos', async () => {
    await createSession('u-99', 'Teste', 'teste@test.com', 'GERENTE')
    const [, token] = mockCookieSet.mock.calls[0]
    const payload = await decrypt(token)
    expect(payload?.userId).toBe('u-99')
    expect(payload?.role).toBe('GERENTE')
  })
})

describe('getSession', () => {
  it('retorna null quando não há cookie de sessão', async () => {
    mockCookieGet.mockReturnValue(undefined)
    expect(await getSession()).toBeNull()
  })

  it('retorna o payload quando há sessão válida', async () => {
    const token = await encrypt({ userId: 'u-1', name: 'Admin', email: 'admin@test.com', role: 'DONO', expiresAt: new Date() })
    mockCookieGet.mockReturnValue({ value: token })
    const session = await getSession()
    expect(session?.userId).toBe('u-1')
  })

  it('retorna null para cookie com token corrompido', async () => {
    mockCookieGet.mockReturnValue({ value: 'corrompido' })
    expect(await getSession()).toBeNull()
  })
})
