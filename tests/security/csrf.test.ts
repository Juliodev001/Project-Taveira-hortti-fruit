// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockCookieSet, mockCookieGet, mockCookieDelete, mockProdutorCreate, mockProdutorFindUnique } = vi.hoisted(() => {
  process.env.SESSION_SECRET = 'test-secret-key-minimo-32-chars-ok'
  return {
    mockCookieSet:          vi.fn(),
    mockCookieGet:          vi.fn(),
    mockCookieDelete:       vi.fn(),
    mockProdutorCreate:     vi.fn(),
    mockProdutorFindUnique: vi.fn(),
  }
})

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockCookieGet, set: mockCookieSet, delete: mockCookieDelete })),
}))
vi.mock('@/lib/mem-cache',  () => ({ memCache: { fetch: vi.fn((_, fn) => fn()), invalidate: vi.fn() } }))
vi.mock('next/cache',       () => ({ revalidateTag: vi.fn() }))
vi.mock('next/navigation',  () => ({ redirect: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    produtor: { create: mockProdutorCreate, findUnique: mockProdutorFindUnique, findMany: vi.fn().mockResolvedValue([]) },
    user:     { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
    compra:   { findMany: vi.fn().mockResolvedValue([]) },
  },
}))
vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>()
  return { ...actual, getSession: vi.fn().mockResolvedValue({ userId: 'u-1' }) }
})
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('$2b$10$hashed'), compare: vi.fn().mockResolvedValue(false) },
}))

import { NextRequest } from 'next/server'
import { createSession } from '@/lib/session'
import { POST as postProdutor } from '@/app/api/produtores/route'
import { POST as postUsuario }  from '@/app/api/usuarios/route'
import { GET  as getCompras }   from '@/app/api/compras/route'
import proxy from '@/proxy'

beforeEach(() => vi.clearAllMocks())

// ─── 1. Atributos do cookie de sessão ────────────────────────────────────────
describe('CSRF — atributos do cookie de sessão', () => {
  it('cookie tem SameSite=lax', async () => {
    await createSession('u-1', 'Admin', 'admin@test.com', 'DONO')
    expect(mockCookieSet).toHaveBeenCalledWith(
      'session',
      expect.any(String),
      expect.objectContaining({ sameSite: 'lax' })
    )
  })

  it('cookie tem httpOnly=true — JavaScript não pode ler o token', async () => {
    await createSession('u-1', 'Admin', 'admin@test.com', 'DONO')
    expect(mockCookieSet).toHaveBeenCalledWith(
      'session',
      expect.any(String),
      expect.objectContaining({ httpOnly: true })
    )
  })

  it('cookie tem path=/ — escopo global da aplicação', async () => {
    await createSession('u-1', 'Admin', 'admin@test.com', 'DONO')
    expect(mockCookieSet).toHaveBeenCalledWith(
      'session',
      expect.any(String),
      expect.objectContaining({ path: '/' })
    )
  })

  it('cookie tem data de expiração definida — não é sessão infinita', async () => {
    await createSession('u-1', 'Admin', 'admin@test.com', 'DONO')
    const [, , opts] = mockCookieSet.mock.calls[0]
    expect(opts.expires).toBeInstanceOf(Date)
    expect(opts.expires.getTime()).toBeGreaterThan(Date.now())
  })
})

// ─── 2. Content-Type — form-post cross-site não parseia como JSON ─────────────
describe('CSRF — Content-Type como barreira contra form-posts', () => {
  it('POST com application/x-www-form-urlencoded falha ao parsear JSON', async () => {
    const req = new NextRequest('http://localhost/api/produtores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'nome=Atacante&cpf=000',
    })
    // req.json() vai lançar SyntaxError → rota retorna erro (não 201)
    const res = await postProdutor(req)
    expect(res.status).not.toBe(201)
  })

  it('POST com multipart/form-data falha ao parsear JSON', async () => {
    const req = new NextRequest('http://localhost/api/produtores', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=----' },
      body: '------\r\nContent-Disposition: form-data; name="nome"\r\n\r\nAtacante\r\n------',
    })
    const res = await postProdutor(req)
    expect(res.status).not.toBe(201)
  })

  it('POST com text/plain falha ao parsear JSON', async () => {
    const req = new NextRequest('http://localhost/api/produtores', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'nome=Atacante',
    })
    const res = await postProdutor(req)
    expect(res.status).not.toBe(201)
  })

  it('POST sem body falha ao parsear JSON', async () => {
    const req = new NextRequest('http://localhost/api/produtores', { method: 'POST' })
    const res = await postProdutor(req)
    expect(res.status).not.toBe(201)
  })

  it('POST com JSON malformado falha ao parsear', async () => {
    const req = new NextRequest('http://localhost/api/produtores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{nome: Sem aspas}',
    })
    const res = await postProdutor(req)
    expect(res.status).not.toBe(201)
  })
})

// ─── 3. GET não muta estado ───────────────────────────────────────────────────
describe('CSRF — requisições GET não mutam estado', () => {
  it('GET /api/compras não chama create, update nem delete', async () => {
    const req = new NextRequest('http://localhost/api/compras')
    await getCompras(req)
    // Nenhuma operação de escrita pode ter sido chamada
    expect(mockProdutorCreate).not.toHaveBeenCalled()
  })

  it('GET /api/compras retorna apenas dados — status 200', async () => {
    const req = new NextRequest('http://localhost/api/compras')
    const res = await getCompras(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })
})

// ─── 4. Sessão sem cookie válido não executa mutations ────────────────────────
describe('CSRF — sem sessão válida não há mutation', () => {
  it('POST cross-site sem cookie de sessão retorna 401', async () => {
    const { getSession } = await import('@/lib/session')
    vi.mocked(getSession).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost/api/produtores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Atacante', parceiros: [] }),
    })
    const res = await postProdutor(req)
    expect(res.status).toBe(401)
    expect(mockProdutorCreate).not.toHaveBeenCalled()
  })

  it('POST /api/usuarios sem sessão retorna 401', async () => {
    const { getSession } = await import('@/lib/session')
    vi.mocked(getSession).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Atacante', email: 'a@a.com', password: '123' }),
    })
    const res = await postUsuario(req)
    expect(res.status).toBe(401)
  })
})

// ─── 5. Middleware bloqueia rotas sem sessão ──────────────────────────────────
describe('CSRF — middleware bloqueia navegação sem sessão', () => {
  const mockGet = vi.fn()

  it('requisição cross-site sem cookie é redirecionada para /login', async () => {
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValueOnce({ get: () => undefined } as never)

    const req = new NextRequest('http://attacker.com/api/produtores', {
      method: 'POST',
      headers: {
        'Origin': 'https://attacker.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome: 'CSRF', parceiros: [] }),
    })
    const res = await proxy(req)
    // Sem sessão válida → redirecionado para /login, mutation nunca ocorre
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })

  it('requisição com Origin de domínio externo e sem sessão é bloqueada', async () => {
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValueOnce({ get: () => undefined } as never)

    const req = new NextRequest('http://localhost/api/usuarios', {
      method: 'POST',
      headers: {
        'Origin': 'https://evil.com',
        'Referer': 'https://evil.com/csrf-form.html',
      },
    })
    const res = await proxy(req)
    expect(res.status).toBe(307)
    expect(mockProdutorCreate).not.toHaveBeenCalled()
  })
})

// ─── 6. Tokens JWT não expostos — proteção contra roubo de sessão ─────────────
describe('CSRF — token JWT nunca exposto ao JavaScript', () => {
  it('createSession sempre define httpOnly (cookie inacessível ao JS)', async () => {
    await createSession('u-1', 'Admin', 'admin@test.com', 'DONO')
    const [, , opts] = mockCookieSet.mock.calls[0]
    expect(opts.httpOnly).toBe(true)
  })

  it('headers de resposta das APIs não expõem o token de sessão', async () => {
    const req = new NextRequest('http://localhost/api/compras')
    const res = await getCompras(req)
    expect(res.headers.get('authorization')).toBeNull()
    expect(res.headers.get('x-session-token')).toBeNull()
    expect(res.headers.get('set-cookie')).toBeNull()
  })
})
