'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'

const GREEN = '#5ab952'
const NAVY = '#2d3561'
const PINK = '#e8255a'

export default function NovaMov() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const body = {
      contaBancariaId: fd.get('contaBancariaId'),
      data: fd.get('data'),
      descricao: fd.get('descricao'),
      tipo: fd.get('tipo'),
      valor: parseFloat(fd.get('valor') as string),
    }
    const res = await fetch('/api/caixa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      router.push('/caixa')
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.error || 'Erro ao registrar movimentação')
      setLoading(false)
    }
  }

  const inp = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { fontSize: 13, fontWeight: 500, color: NAVY, display: 'block', marginBottom: 6 } as React.CSSProperties

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Link href="/caixa" style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          ← Voltar
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: 0 }}>Nova Movimentação</h1>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Registre uma entrada ou saída</p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxWidth: 600 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={lbl}>Tipo *</label>
            <select name="tipo" required style={inp}>
              <option value="ENTRADA">↑ Entrada</option>
              <option value="SAIDA">↓ Saída</option>
            </select>
          </div>

          <div>
            <label style={lbl}>Data *</label>
            <input type="date" name="data" required defaultValue={new Date().toISOString().slice(0, 10)} style={inp} />
          </div>

          <div>
            <label style={lbl}>Descrição *</label>
            <input type="text" name="descricao" required placeholder="Ex: Pagamento fornecedor João" style={inp} />
          </div>

          <div>
            <label style={lbl}>Valor (R$) *</label>
            <input type="number" name="valor" required min="0.01" step="0.01" placeholder="0,00" style={inp} />
          </div>

          <div>
            <label style={lbl}>Conta bancária *</label>
            <ContaSelect inp={inp} />
          </div>

          {error && <p style={{ color: PINK, fontSize: 13, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Link href="/caixa" style={{ padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: 10, textDecoration: 'none', fontSize: 14, color: NAVY }}>
              Cancelar
            </Link>
            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.04, backgroundColor: '#4aa344', boxShadow: '0 8px 25px rgba(90,185,82,0.45)' } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ padding: '10px 24px', backgroundColor: GREEN, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Salvando...' : 'Registrar'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ContaSelect({ inp }: { inp: React.CSSProperties }) {
  const [contas, setContas] = useState<Array<{ id: string; nome: string; tipo: string }>>([])
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    fetch('/api/caixa').then(r => r.json()).then(d => { setContas(Array.isArray(d) ? d : []); setLoaded(true) })
  }

  return (
    <select name="contaBancariaId" required style={inp}>
      <option value="">Selecione uma conta</option>
      {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
    </select>
  )
}
