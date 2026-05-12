import { describe, it, expect } from 'vitest'

// Regra de negócio: soma dos percentuais dos parceiros ≤ 100%
function validarPercentuais(parceiros: { nome: string; percentual: number }[]): {
  valido: boolean
  total: number
  erro?: string
} {
  const total = parceiros.reduce((s, p) => s + p.percentual, 0)
  if (total > 100) return { valido: false, total, erro: `Total de ${total}% excede 100%` }
  if (parceiros.some((p) => p.percentual <= 0)) return { valido: false, total, erro: 'Percentual deve ser maior que zero' }
  if (parceiros.some((p) => p.percentual > 100)) return { valido: false, total, erro: 'Percentual individual não pode exceder 100%' }
  return { valido: true, total }
}

describe('Validação de percentuais de parceiros', () => {
  it('aceita parceiro único com 100%', () => {
    const { valido } = validarPercentuais([{ nome: 'João', percentual: 100 }])
    expect(valido).toBe(true)
  })

  it('aceita dois parceiros que somam 100%', () => {
    const { valido, total } = validarPercentuais([
      { nome: 'João', percentual: 60 },
      { nome: 'Maria', percentual: 40 },
    ])
    expect(valido).toBe(true)
    expect(total).toBe(100)
  })

  it('aceita parceiros que somam menos de 100%', () => {
    const { valido } = validarPercentuais([
      { nome: 'João', percentual: 30 },
      { nome: 'Maria', percentual: 30 },
    ])
    expect(valido).toBe(true)
  })

  it('rejeita quando soma excede 100%', () => {
    const { valido, erro } = validarPercentuais([
      { nome: 'João', percentual: 70 },
      { nome: 'Maria', percentual: 50 },
    ])
    expect(valido).toBe(false)
    expect(erro).toContain('excede 100%')
  })

  it('rejeita percentual zero', () => {
    const { valido } = validarPercentuais([{ nome: 'João', percentual: 0 }])
    expect(valido).toBe(false)
  })

  it('rejeita percentual negativo', () => {
    const { valido } = validarPercentuais([{ nome: 'João', percentual: -10 }])
    expect(valido).toBe(false)
  })

  it('aceita lista vazia (sem parceiros)', () => {
    const { valido, total } = validarPercentuais([])
    expect(valido).toBe(true)
    expect(total).toBe(0)
  })

  it('calcula o total correto com múltiplos parceiros', () => {
    const { total } = validarPercentuais([
      { nome: 'A', percentual: 25 },
      { nome: 'B', percentual: 25 },
      { nome: 'C', percentual: 25 },
    ])
    expect(total).toBe(75)
  })
})
