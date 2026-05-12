'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'

const GREEN = '#5ab952'
const NAVY = '#2d3561'
const PINK = '#e8255a'

const UNIDADES = ['CAIXA', 'KG', 'UNIDADE', 'SACO', 'LITRO', 'DUZIA', 'FARDO']

export default function NovoProduto() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [unidade, setUnidade] = useState('CAIXA')
  const [categoria, setCategoria] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) { setError('Nome obrigatório'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome.trim(), unidade, categoria: categoria.trim() || null }),
    })
    if (res.ok) { router.push('/produtos'); router.refresh() }
    else { const d = await res.json().catch(() => ({})); setError(d.error || 'Erro ao salvar'); setLoading(false) }
  }

  const inp = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { fontSize: 13, fontWeight: 500, color: NAVY, display: 'block', marginBottom: 6 } as React.CSSProperties

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Link href="/produtos" style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 6 }}>← Produtos</Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: 0 }}>Novo Produto</h1>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Cadastre um produto da lavoura</p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxWidth: 500 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={lbl}>Nome do produto *</label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Morango, Tomate, Alface..." required style={inp} />
          </div>
          <div>
            <label style={lbl}>Unidade de medida</label>
            <select value={unidade} onChange={e => setUnidade(e.target.value)} style={inp}>
              {UNIDADES.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Categoria</label>
            <input value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Ex: Fruta, Hortaliça, Legume..." style={inp} />
          </div>
          {error && <p style={{ color: PINK, fontSize: 13, margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <Link href="/produtos" style={{ padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: 10, textDecoration: 'none', fontSize: 14, color: NAVY }}>
              Cancelar
            </Link>
            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.04, backgroundColor: '#4aa344', boxShadow: '0 8px 25px rgba(90,185,82,0.45)' } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ padding: '10px 24px', backgroundColor: GREEN, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Salvando...' : 'Cadastrar Produto'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  )
}
