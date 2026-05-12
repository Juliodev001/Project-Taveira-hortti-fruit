'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
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

const statusConfig: Record<string, { label: string; badgeStyle: React.CSSProperties }> = {
  PAGO:    { label: 'Pago',    badgeStyle: { backgroundColor: '#E6F4E5', color: '#2d7d28' } },
  A_PAGAR: { label: 'A Pagar', badgeStyle: { backgroundColor: '#FFF3E0', color: '#b85c00' } },
  VENCIDO: { label: 'Vencido', badgeStyle: { backgroundColor: '#FDECEA', color: '#c0113a' } },
}

const categoriaLabel: Record<string, string> = {
  MATERIA_PRIMA: 'Matéria Prima',
  INSUMO: 'Insumo',
  DESPESA_OPERACIONAL: 'Desp. Operacional',
  DESPESA_ADMINISTRATIVA: 'Desp. Administrativa',
  OUTROS: 'Outros',
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

  const listaExibida = aba === 'contas'
    ? filtradas.filter((c) => c.status !== 'PAGO')
    : filtradas

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Compras e Despesas</h1>
          <p className="page-subtitle">Controle de compras, despesas e contas a pagar</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
            <Upload size={14} /> Importar XML
          </button>
          <Link href="/compras/nova" className="btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}>
            <Plus size={14} /> Nova Compra
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        {[
          { label: 'Total no Período', value: totalPeriodo, icon: DollarSign, color: NAVY },
          { label: 'A Pagar', value: aPagar, icon: Clock, color: ORANGE },
          { label: 'Pago', value: pago, icon: CreditCard, color: GREEN },
          { label: 'Vencido', value: vencido, icon: AlertTriangle, color: PINK },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="meta-stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
            <div>
              <p className="meta-stat-label" style={{ marginBottom: 4 }}>{label}</p>
              <p className="meta-stat-value" style={{ color, fontSize: 20 }}>{formatCurrency(value)}</p>
            </div>
            <div
              className="meta-icon-wrap"
              style={{ width: 36, height: 36, background: `${color}18`, borderRadius: 8, color }}
            >
              <Icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar: busca + filtro */}
      <div
        className="meta-card"
        style={{ padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={14}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8A8D91', pointerEvents: 'none' }}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por fornecedor ou descrição..."
            className="meta-input"
            style={{ paddingLeft: 32 }}
          />
        </div>
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="meta-select"
          style={{ minWidth: 150 }}
        >
          <option value="TODOS">Todos os status</option>
          <option value="A_PAGAR">A Pagar</option>
          <option value="PAGO">Pago</option>
          <option value="VENCIDO">Vencido</option>
        </select>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
        {(['contas', 'registradas'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setAba(t)}
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              border: `1px solid ${aba === t ? NAVY : '#E4E6EB'}`,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: aba === t ? 600 : 400,
              backgroundColor: aba === t ? NAVY : '#ffffff',
              color: aba === t ? '#ffffff' : '#65676B',
              transition: 'all 0.1s',
              fontFamily: 'inherit',
              boxShadow: aba === t ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
            {t === 'contas'
              ? `Contas a Pagar (${filtradas.filter((c) => c.status !== 'PAGO').length})`
              : `Compras Registradas (${filtradas.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="meta-card" style={{ overflow: 'hidden' }}>
        {listaExibida.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#8A8D91', fontSize: 14 }}>
            Nenhuma {aba === 'contas' ? 'conta a pagar' : 'compra'} encontrada no período
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="meta-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Fornecedor</th>
                  <th className="col-hide-mobile">Categoria</th>
                  <th className="col-hide-mobile">Vencimento</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {listaExibida.map((c) => {
                  const st = statusConfig[c.status] ?? statusConfig.A_PAGAR
                  return (
                    <tr
                      key={c.id}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ color: '#65676B', fontWeight: 400 }}>{formatDate(c.data)}</td>
                      <td style={{ fontWeight: 500, color: '#1C1E21' }}>{c.fornecedor.nome}</td>
                      <td className="col-hide-mobile" style={{ color: '#65676B' }}>
                        {categoriaLabel[c.categoria] ?? c.categoria}
                      </td>
                      <td className="col-hide-mobile" style={{ color: '#65676B' }}>{formatDate(c.vencimento)}</td>
                      <td style={{ fontWeight: 600, color: '#1C1E21' }}>{formatCurrency(c.totalValor)}</td>
                      <td>
                        <span className="meta-badge" style={st.badgeStyle}>{st.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
