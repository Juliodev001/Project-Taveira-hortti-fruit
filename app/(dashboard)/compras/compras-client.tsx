'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { DollarSign, Clock, CreditCard, AlertTriangle, Plus, Search, Upload } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import PageSkeleton from '@/components/page-skeleton'

const GREEN = '#5ab952'
const NAVY = '#2d3561'
const PINK = '#e8255a'
const ORANGE = '#e87320'

type Compra = {
  id: string; data: string; vencimento: string; status: string; totalValor: number
  categoria: string; observacao: string | null
  fornecedor: { nome: string }; itens: { produto: string }[]
}

const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
  PAGO: { label: 'Pago', color: 'white', bg: GREEN },
  A_PAGAR: { label: 'A Pagar', color: ORANGE, bg: '#fff7ed' },
  VENCIDO: { label: 'Vencido', color: 'white', bg: PINK },
}

const categoriaLabel: Record<string, string> = {
  MATERIA_PRIMA: 'Matéria Prima', INSUMO: 'Insumo',
  DESPESA_OPERACIONAL: 'Desp. Operacional', DESPESA_ADMINISTRATIVA: 'Desp. Administrativa', OUTROS: 'Outros',
}

export default function ComprasClient() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('TODOS')
  const [aba, setAba] = useState<'contas' | 'registradas'>('contas')

  useEffect(() => {
    fetch('/api/compras')
      .then((r) => r.json())
      .then((data: Compra[]) => {
        const hoje = new Date()
        setCompras(data.map((c) => ({
          ...c,
          status: c.status === 'A_PAGAR' && new Date(c.vencimento) < hoje ? 'VENCIDO' : c.status,
        })))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSkeleton cards={4} rows={7} />

  const totalPeriodo = compras.reduce((s, c) => s + c.totalValor, 0)
  const aPagar = compras.filter((c) => c.status === 'A_PAGAR').reduce((s, c) => s + c.totalValor, 0)
  const pago = compras.filter((c) => c.status === 'PAGO').reduce((s, c) => s + c.totalValor, 0)
  const vencido = compras.filter((c) => c.status === 'VENCIDO').reduce((s, c) => s + c.totalValor, 0)

  const filtradas = compras.filter((c) => {
    const matchQ = !q || c.fornecedor.nome.toLowerCase().includes(q.toLowerCase()) || c.observacao?.toLowerCase().includes(q.toLowerCase())
    const matchStatus = statusFiltro === 'TODOS' || c.status === statusFiltro
    return matchQ && matchStatus
  })

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0 }}>Compras e Despesas</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Controle de compras, despesas e contas a pagar</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10, background: 'white', cursor: 'pointer', fontSize: 13, color: NAVY, fontWeight: 500 }}
          >
            <Upload size={15} /> Importar XML
          </motion.button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/compras/nova" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', backgroundColor: GREEN, color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              <Plus size={15} /> Nova Compra
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total no Período', value: totalPeriodo, icon: DollarSign, color: NAVY },
          { label: 'A Pagar', value: aPagar, icon: Clock, color: ORANGE },
          { label: 'Pago', value: pago, icon: CreditCard, color: GREEN },
          { label: 'Vencido', value: vencido, icon: AlertTriangle, color: PINK },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 180 }}
            whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
            style={{ backgroundColor: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `4px solid ${color}` }}
          >
            <div>
              <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>{label}</p>
              <p style={{ color, fontSize: 20, fontWeight: 700, margin: '6px 0 0' }}>{formatCurrency(value)}</p>
            </div>
            <Icon size={20} color={color} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ backgroundColor: 'white', borderRadius: 12, padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: 12, alignItems: 'center' }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por fornecedor ou descrição..."
            style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
          />
        </div>
        <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}
          style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: NAVY, outline: 'none', cursor: 'pointer' }}
        >
          <option value="TODOS">Todos os status</option>
          <option value="A_PAGAR">A Pagar</option>
          <option value="PAGO">Pago</option>
          <option value="VENCIDO">Vencido</option>
        </select>
      </motion.div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {(['contas', 'registradas'] as const).map((t) => (
          <motion.button key={t} onClick={() => setAba(t)}
            whileHover={{ scale: 1.03, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, backgroundColor: aba === t ? NAVY : 'white', color: aba === t ? 'white' : '#6b7280', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {t === 'contas' ? `Contas a Pagar (${filtradas.filter((c) => c.status !== 'PAGO').length})` : `Compras Registradas (${filtradas.length})`}
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        style={{ backgroundColor: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}
      >
        {filtradas.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            Nenhuma {aba === 'contas' ? 'conta a pagar' : 'compra'} encontrada no período
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                {['Data', 'Fornecedor', 'Categoria', 'Vencimento', 'Total', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c, i) => {
                const st = statusLabel[c.status] ?? statusLabel.A_PAGAR
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13, color: NAVY }}>{formatDate(c.data)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: NAVY }}>{c.fornecedor.nome}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{categoriaLabel[c.categoria] ?? c.categoria}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{formatDate(c.vencimento)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: NAVY }}>{formatCurrency(c.totalValor)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: st.bg, color: st.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  )
}
