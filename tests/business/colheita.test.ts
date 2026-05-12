import { describe, it, expect } from 'vitest'

// Regra de negócio central: divisão 60% dono / 40% parceiro
const PERC_DONO = 0.6
const PERC_PARCEIRO = 0.4

function calcularDivisao(quantidadeTotal: number) {
  return {
    quantidadeDono: quantidadeTotal * PERC_DONO,
    quantidadeParceiro: quantidadeTotal * PERC_PARCEIRO,
  }
}

describe('Regra de divisão da colheita (60/40)', () => {
  it('divide corretamente 100 caixas', () => {
    const { quantidadeDono, quantidadeParceiro } = calcularDivisao(100)
    expect(quantidadeDono).toBe(60)
    expect(quantidadeParceiro).toBe(40)
  })

  it('divide corretamente um número fracionado', () => {
    const { quantidadeDono, quantidadeParceiro } = calcularDivisao(10.5)
    expect(quantidadeDono).toBeCloseTo(6.3)
    expect(quantidadeParceiro).toBeCloseTo(4.2)
  })

  it('a soma das partes sempre é igual ao total', () => {
    const totais = [1, 5, 23.7, 100, 999.99]
    totais.forEach((total) => {
      const { quantidadeDono, quantidadeParceiro } = calcularDivisao(total)
      expect(quantidadeDono + quantidadeParceiro).toBeCloseTo(total)
    })
  })

  it('dono recebe sempre 60% do total', () => {
    const { quantidadeDono } = calcularDivisao(50)
    expect(quantidadeDono / 50).toBeCloseTo(0.6)
  })

  it('parceiro recebe sempre 40% do total', () => {
    const { quantidadeParceiro } = calcularDivisao(50)
    expect(quantidadeParceiro / 50).toBeCloseTo(0.4)
  })

  it('zero caixas resulta em zero para ambos', () => {
    const { quantidadeDono, quantidadeParceiro } = calcularDivisao(0)
    expect(quantidadeDono).toBe(0)
    expect(quantidadeParceiro).toBe(0)
  })

  it('dono recebe mais que o parceiro em qualquer colheita positiva', () => {
    const totais = [1, 10, 100, 1000]
    totais.forEach((total) => {
      const { quantidadeDono, quantidadeParceiro } = calcularDivisao(total)
      expect(quantidadeDono).toBeGreaterThan(quantidadeParceiro)
    })
  })
})

// ─── Cálculo de saída financeira ──────────────────────────────────────────────
describe('Cálculo financeiro de saída da lavoura', () => {
  function calcularTotal(quantidade: number, valorUnit: number) {
    return quantidade * valorUnit
  }

  it('calcula total corretamente', () => {
    expect(calcularTotal(10, 25)).toBe(250)
  })

  it('calcula com valores decimais', () => {
    expect(calcularTotal(3.5, 12.5)).toBeCloseTo(43.75)
  })

  it('zero quantidade resulta em zero receita', () => {
    expect(calcularTotal(0, 50)).toBe(0)
  })

  it('zero valor resulta em zero receita', () => {
    expect(calcularTotal(100, 0)).toBe(0)
  })
})
