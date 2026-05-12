import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatCPF, isVencido, cn } from '@/lib/utils'

// ─── formatCurrency ───────────────────────────────────────────────────────────
describe('formatCurrency', () => {
  it('formata zero como R$ 0,00', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })

  it('formata valor inteiro', () => {
    expect(formatCurrency(1000)).toBe('R$ 1.000,00')
  })

  it('formata valor com centavos', () => {
    expect(formatCurrency(99.9)).toBe('R$ 99,90')
  })

  it('formata valor negativo', () => {
    expect(formatCurrency(-250.5)).toBe('-R$ 250,50')
  })

  it('formata valor grande', () => {
    expect(formatCurrency(1234567.89)).toBe('R$ 1.234.567,89')
  })
})

// ─── formatDate ───────────────────────────────────────────────────────────────
describe('formatDate', () => {
  it('formata uma data string ISO', () => {
    const result = formatDate('2026-05-06')
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('formata um objeto Date', () => {
    const date = new Date(2026, 0, 15) // 15 de janeiro de 2026
    const result = formatDate(date)
    expect(result).toBe('15/01/2026')
  })

  it('aceita string ISO completa com horário', () => {
    const result = formatDate('2026-05-06T12:00:00.000Z')
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})

// ─── formatCPF ────────────────────────────────────────────────────────────────
describe('formatCPF', () => {
  it('formata CPF com 11 dígitos', () => {
    expect(formatCPF('12345678901')).toBe('123.456.789-01')
  })

  it('formata CPF com zeros à esquerda', () => {
    expect(formatCPF('01234567890')).toBe('012.345.678-90')
  })

  it('formata CPF do seed (admin)', () => {
    expect(formatCPF('14358729580')).toBe('143.587.295-80')
  })
})

// ─── isVencido ────────────────────────────────────────────────────────────────
describe('isVencido', () => {
  const passado = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 dias atrás
  const futuro = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 7 dias à frente

  it('retorna true quando vencido e não pago', () => {
    expect(isVencido(passado, 'A_PAGAR')).toBe(true)
  })

  it('retorna false quando pago, mesmo com data passada', () => {
    expect(isVencido(passado, 'PAGO')).toBe(false)
  })

  it('retorna false quando vencimento é futuro', () => {
    expect(isVencido(futuro, 'A_PAGAR')).toBe(false)
  })

  it('retorna false quando vencimento futuro e status VENCIDO (inconsistência de dados)', () => {
    expect(isVencido(futuro, 'VENCIDO')).toBe(false)
  })
})

// ─── cn (classnames) ──────────────────────────────────────────────────────────
describe('cn', () => {
  it('une classes simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('remove classes conflitantes do Tailwind (merge)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('ignora valores falsy', () => {
    expect(cn('foo', false && 'bar', undefined, null, '')).toBe('foo')
  })

  it('aplica condicionais', () => {
    const ativo = true
    expect(cn('base', ativo && 'ativo')).toBe('base ativo')
  })
})
