import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDecrypt, mockGet } = vi.hoisted(() => ({
  mockDecrypt: vi.fn(),
  mockGet: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ decrypt: mockDecrypt }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockGet })),
}))

import { NextRequest } from 'next/server'
import proxy from '@/proxy'

const makeReq = (path: string) => new NextRequest(`http://localhost${path}`)

const mockSession = { userId: 'user-123', name: 'Admin', email: 'admin@test.com', role: 'DONO', expiresAt: new Date() }

beforeEach(() => vi.clearAllMocks())

describe('Proxy middleware — rotas públicas', () => {
  it('permite acesso a /login sem sessão', async () => {
    mockGet.mockReturnValue(undefined)
    mockDecrypt.mockResolvedValue(null)
    const res = await proxy(makeReq('/login'))
    expect(res.headers.get('location')).toBeNull()
  })

  it('permite acesso a /api/auth/logout sem sessão', async () => {
    mockGet.mockReturnValue(undefined)
    mockDecrypt.mockResolvedValue(null)
    const res = await proxy(makeReq('/api/auth/logout'))
    expect(res.headers.get('location')).toBeNull()
  })
})

describe('Proxy middleware — proteção de rotas', () => {
  it('redireciona para /login quando não há sessão', async () => {
    mockGet.mockReturnValue(undefined)
    mockDecrypt.mockResolvedValue(null)
    const res = await proxy(makeReq('/'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })

  it('redireciona para /login em rota de API protegida sem sessão', async () => {
    mockGet.mockReturnValue(undefined)
    mockDecrypt.mockResolvedValue(null)
    const res = await proxy(makeReq('/api/produtores'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })

  it('permite acesso a rota protegida com sessão válida', async () => {
    mockGet.mockReturnValue({ value: 'valid-token' })
    mockDecrypt.mockResolvedValue(mockSession)
    const res = await proxy(makeReq('/produtores'))
    expect(res.headers.get('location')).toBeNull()
  })

  it('redireciona usuário autenticado que tenta acessar /login para /', async () => {
    mockGet.mockReturnValue({ value: 'valid-token' })
    mockDecrypt.mockResolvedValue(mockSession)
    const res = await proxy(makeReq('/login'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/$/)
  })
})
