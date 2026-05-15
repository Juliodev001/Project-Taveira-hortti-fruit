'use client'
import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign, Clock, CreditCard, Building2,
  TrendingUp, TrendingDown, ShoppingCart, Users, ArrowRight,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

const GREEN = '#5ab952'
const NAVY = '#2d3561'
const PINK = '#e8255a'
const ORANGE = '#e87320'
const TEAL = '#3d6b6e'

type DashData = {
  contasAPagar: { total: number; em7: number; em15: number; em30: number; acima30: number }
  contasAReceber: { total: number; em7: number; em15: number; em30: number; acima30: number }
  saldoBancario: { nome: string; saldo: number }[]
  totalSaldo: number
  fechamentosResumo: {
    pendentes: number
    pagos: number
    lista: { id: string; produtor: string; cpf: string | null; dataInicio: string; dataFim: string; dataPagamento: string; status: string }[]
  }
}

type PeriodoData = {
  receita: number
  despesa: number
  comprasPorCategoria: { categoria: string; total: number }[]
  porMes: { label: string; receita: number; despesa: number }[]
}

const PERIODOS = [
  { value: 'mes_atual', label: 'Este mês' },
  { value: 'mes_passado', label: 'Mês passado' },
  { value: 'ultimos_3_meses', label: '3 meses' },
  { value: 'ultimos_6_meses', label: '6 meses' },
  { value: 'ano_atual', label: 'Este ano' },
  { value: 'ano_passado', label: 'Ano passado' },
]

function periodoLabel(v: string) {
  return PERIODOS.find(p => p.value === v)?.label ?? v
}

const catInfo: Record<string, { label: string; color: string }> = {
  MATERIA_PRIMA:          { label: 'Matéria-Prima',        color: GREEN },
  INSUMO:                 { label: 'Insumo',               color: TEAL },
  DESPESA_OPERACIONAL:    { label: 'Desp. Operacional',    color: ORANGE },
  DESPESA_ADMINISTRATIVA: { label: 'Desp. Administrativa', color: NAVY },
  OUTROS:                 { label: 'Outros',               color: '#6b7280' },
}

/* ── Tooltip customizado para o gráfico ── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E4E6EB',
      borderRadius: 6,
      padding: '10px 14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      fontSize: 13,
    }}>
      <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#1C1E21' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ margin: '2px 0', color: entry.color, fontWeight: 500 }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

/* ── Gráfico ── */
function GraficoComparativo({ data, periodo }: { data: PeriodoData['porMes']; periodo: string }) {
  if (data.length === 0) return null

  const chartData = data.map(d => ({
    name: d.label,
    Receita: d.receita,
    Despesas: d.despesa,
  }))

  return (
    <div className="meta-card" style={{ marginTop: 16 }}>
      <div className="meta-card-header">
        <div>
          <p className="meta-card-title">Receita vs Despesas</p>
          <p className="meta-card-subtitle">{periodoLabel(periodo)} · por mês</p>
        </div>
      </div>
      <div className="meta-card-body" style={{ paddingTop: 12 }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E6EB" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#65676B' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#8A8D91' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Legend
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: 12, color: '#65676B', paddingTop: 8 }}
            />
            <Bar dataKey="Receita" fill={GREEN} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Despesas" fill={PINK} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── Seletor de período ── */
function PeriodoSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 16 }}>
      {PERIODOS.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          style={{
            padding: '5px 12px',
            borderRadius: 100,
            border: `1px solid ${value === p.value ? NAVY : '#E4E6EB'}`,
            backgroundColor: value === p.value ? NAVY : '#ffffff',
            color: value === p.value ? '#ffffff' : '#65676B',
            fontSize: 13,
            fontWeight: value === p.value ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.1s',
            fontFamily: 'inherit',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

/* ── Gastos por Categoria ── */
function GastosPorCategoria({ data, subtitulo }: { data: { categoria: string; total: number }[]; subtitulo: string }) {
  const totalGeral = data.reduce((s, c) => s + c.total, 0)

  return (
    <div className="meta-card">
      <div className="meta-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="meta-icon-wrap" style={{ background: `${ORANGE}18` }}>
            <ShoppingCart size={15} color={ORANGE} />
          </div>
          <div>
            <p className="meta-card-title">Gastos por Categoria</p>
            <p className="meta-card-subtitle">{subtitulo}</p>
          </div>
        </div>
        <span style={{ color: ORANGE, fontWeight: 700, fontSize: 14 }}>
          {formatCurrency(totalGeral)}
        </span>
      </div>
      <div className="meta-card-body">
        {data.length === 0 ? (
          <p style={{ color: '#8A8D91', fontSize: 13, textAlign: 'center', padding: '12px 0', margin: 0 }}>Nenhuma compra no período</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.map(({ categoria, total }) => {
              const { label, color } = catInfo[categoria] ?? { label: categoria, color: '#6b7280' }
              const pct = totalGeral > 0 ? (total / totalGeral) * 100 : 0
              return (
                <div key={categoria}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#1C1E21' }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1E21' }}>{formatCurrency(total)}</span>
                      <span className="meta-badge" style={{ backgroundColor: color, color: 'white', fontSize: 11 }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 6, backgroundColor: '#F0F2F5', borderRadius: 3, overflow: 'hidden' }}>
                    <div
                      style={{ height: '100%', width: `${pct}%`, borderRadius: 3, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Fechamentos / Pagamentos ── */
function FechamentosProdutores({ data }: { data: DashData['fechamentosResumo'] }) {
  function fmtDate(d: string) { return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }

  return (
    <div className="meta-card">
      <div className="meta-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="meta-icon-wrap" style={{ background: `${NAVY}18` }}>
            <Users size={15} color={NAVY} />
          </div>
          <p className="meta-card-title">Pagamentos de Produtores</p>
        </div>
        <Link href="/lavoura/pagamento" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, color: GREEN, fontWeight: 600, textDecoration: 'none' }}>
          Ver todos <ArrowRight size={12} />
        </Link>
      </div>
      <div className="meta-card-body" style={{ paddingTop: 12, paddingBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <span className="meta-badge" style={{ backgroundColor: '#FFF3E0', color: '#b85c00' }}>
            {data.pendentes} Pendente{data.pendentes !== 1 ? 's' : ''}
          </span>
          <span className="meta-badge" style={{ backgroundColor: '#E6F4E5', color: '#2d7d28' }}>
            {data.pagos} Pago{data.pagos !== 1 ? 's' : ''}
          </span>
        </div>

        {data.lista.length === 0 ? (
          <p style={{ color: '#8A8D91', fontSize: 13, textAlign: 'center', padding: '16px 0', margin: 0 }}>
            Nenhum fechamento cadastrado
          </p>
        ) : (
          <div>
            {data.lista.map((f) => (
              <div
                key={f.id}
                className="meta-data-row"
                style={{ alignItems: 'center' }}
              >
                <div>
                  <Link href={`/lavoura/pagamento/${f.id}`} style={{ textDecoration: 'none' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1C1E21' }}>{f.produtor}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8A8D91' }}>
                      {fmtDate(f.dataInicio)} – {fmtDate(f.dataFim)}
                    </p>
                  </Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: '#8A8D91' }}>pag. {fmtDate(f.dataPagamento)}</span>
                  <span
                    className="meta-badge"
                    style={
                      f.status === 'PAGO'
                        ? { backgroundColor: '#E6F4E5', color: '#2d7d28' }
                        : { backgroundColor: '#FFF3E0', color: '#b85c00' }
                    }
                  >
                    {f.status === 'PAGO' ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Stat card ── */
function StatCard({
  title, rawValue, icon: Icon, color, subtitle, trend,
}: {
  title: string; rawValue: number; icon: React.ElementType
  color: string; subtitle?: string; trend?: 'up' | 'down'
}) {
  return (
    <div className="meta-stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="meta-stat-label">{title}</p>
          <p className="meta-stat-value" style={{ color }}>
            {formatCurrency(rawValue)}
          </p>
          {subtitle && (
            <p className="meta-stat-trend">
              {trend === 'up' && <ArrowUpRight size={12} color={GREEN} />}
              {trend === 'down' && <ArrowDownRight size={12} color={PINK} />}
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="meta-icon-wrap"
          style={{
            width: 36,
            height: 36,
            background: `${color}18`,
            borderRadius: 8,
            color,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

/* ── Data row ── */
function PrazoRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="meta-data-row">
      <span className="meta-data-label">{label}</span>
      <span style={{ fontWeight: 600, fontSize: 13, color }}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}

/* ── Main export ── */
export default function DashboardClient({ data }: { data: DashData }) {
  const [periodo, setPeriodo] = useState('mes_atual')
  const [periodoData, setPeriodoData] = useState<PeriodoData>({ receita: 0, despesa: 0, comprasPorCategoria: [], porMes: [] })

  useEffect(() => {
    fetch(`/api/dashboard/financeiro?periodo=${periodo}`)
      .then(r => r.json())
      .then(d => setPeriodoData({
        receita: d.receita,
        despesa: d.despesa,
        comprasPorCategoria: d.comprasPorCategoria,
        porMes: d.porMes ?? [],
      }))
  }, [periodo])

  const margem = periodoData.receita - periodoData.despesa

  return (
    <div>
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral do negócio</p>
        </div>
      </div>

      <PeriodoSelector value={periodo} onChange={setPeriodo} />

      {/* Top stat cards */}
      <div className="stats-grid" style={{ marginTop: 20 }}>
        <StatCard title="Receita" rawValue={periodoData.receita} icon={TrendingUp} color={GREEN} subtitle={periodoLabel(periodo)} />
        <StatCard title="Despesas" rawValue={periodoData.despesa} icon={TrendingDown} color={PINK} subtitle={periodoLabel(periodo)} />
        <StatCard title="Margem" rawValue={margem} icon={DollarSign} color={margem >= 0 ? GREEN : PINK} subtitle={periodoLabel(periodo)} />
        <StatCard title="Saldo Total" rawValue={data.totalSaldo} icon={Building2} color={NAVY} />
      </div>

      {/* Gráfico */}
      <GraficoComparativo data={periodoData.porMes} periodo={periodo} />

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 16 }}>
        {/* Contas a Pagar */}
        <div className="meta-card">
          <div className="meta-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="meta-icon-wrap" style={{ background: `${ORANGE}18` }}>
                <Clock size={15} color={ORANGE} />
              </div>
              <p className="meta-card-title">Contas a Pagar</p>
            </div>
            <span style={{ color: ORANGE, fontWeight: 700, fontSize: 14 }}>
              {formatCurrency(data.contasAPagar.total)}
            </span>
          </div>
          <div className="meta-card-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
            <PrazoRow label="Próx. 7 dias" value={data.contasAPagar.em7} color={PINK} />
            <PrazoRow label="Próx. 15 dias" value={data.contasAPagar.em15} color={ORANGE} />
            <PrazoRow label="Próx. 30 dias" value={data.contasAPagar.em30} color={NAVY} />
            <PrazoRow label="Acima de 30 dias" value={data.contasAPagar.acima30} color="#8A8D91" />
          </div>
        </div>

        {/* Contas a Receber */}
        <div className="meta-card">
          <div className="meta-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="meta-icon-wrap" style={{ background: `${GREEN}18` }}>
                <DollarSign size={15} color={GREEN} />
              </div>
              <p className="meta-card-title">Contas a Receber</p>
            </div>
            <span style={{ color: GREEN, fontWeight: 700, fontSize: 14 }}>
              {formatCurrency(data.contasAReceber.total)}
            </span>
          </div>
          <div className="meta-card-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
            <PrazoRow label="Próx. 7 dias" value={data.contasAReceber.em7} color={GREEN} />
            <PrazoRow label="Próx. 15 dias" value={data.contasAReceber.em15} color={GREEN} />
            <PrazoRow label="Próx. 30 dias" value={data.contasAReceber.em30} color={NAVY} />
            <PrazoRow label="Acima de 30 dias" value={data.contasAReceber.acima30} color="#8A8D91" />
          </div>
        </div>

        {/* Saldo Bancário */}
        <div className="meta-card">
          <div className="meta-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="meta-icon-wrap" style={{ background: `${TEAL}18` }}>
                <Building2 size={15} color={TEAL} />
              </div>
              <p className="meta-card-title">Saldo Bancário</p>
            </div>
          </div>
          <div className="meta-card-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
            {data.saldoBancario.length === 0 ? (
              <p style={{ color: '#8A8D91', fontSize: 13, margin: 0 }}>Nenhuma conta cadastrada</p>
            ) : (
              data.saldoBancario.map((c) => (
                <PrazoRow key={c.nome} label={c.nome} value={c.saldo} color={c.saldo >= 0 ? TEAL : PINK} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Previsão de Caixa */}
      <div className="meta-card" style={{ marginTop: 16 }}>
        <div className="meta-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="meta-icon-wrap" style={{ background: `${NAVY}18` }}>
              <CreditCard size={15} color={NAVY} />
            </div>
            <div>
              <p className="meta-card-title">Previsão de Caixa</p>
              <p className="meta-card-subtitle">Baseado em vencimentos</p>
            </div>
          </div>
        </div>
        <div className="meta-card-body">
          <div className="stats-grid-3" style={{ gap: 10 }}>
            {[
              { label: '7 dias', entrada: data.contasAReceber.em7, saida: data.contasAPagar.em7 },
              { label: '15 dias', entrada: data.contasAReceber.em15, saida: data.contasAPagar.em15 },
              { label: '30 dias', entrada: data.contasAReceber.em30, saida: data.contasAPagar.em30 },
            ].map(({ label, entrada, saida }) => {
              const saldo = entrada - saida
              return (
                <div
                  key={label}
                  style={{
                    border: `1px solid ${saldo >= 0 ? GREEN : PINK}40`,
                    borderRadius: 8,
                    padding: '14px 16px',
                    textAlign: 'center',
                    background: `${saldo >= 0 ? GREEN : PINK}06`,
                  }}
                >
                  <p style={{ color: '#8A8D91', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>
                    {label}
                  </p>
                  <p style={{ color: GREEN, fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>+ {formatCurrency(entrada)}</p>
                  <p style={{ color: PINK, fontSize: 13, fontWeight: 600, margin: '0 0 8px' }}>- {formatCurrency(saida)}</p>
                  <hr className="meta-divider" style={{ margin: '8px 0' }} />
                  <p style={{ color: saldo >= 0 ? GREEN : PINK, fontSize: 16, fontWeight: 700, margin: 0 }}>
                    {formatCurrency(saldo)}
                  </p>
                </div>
              )
            })}
          </div>
          <p style={{ color: '#8A8D91', fontSize: 11, marginTop: 12, marginBottom: 0 }}>
            Alertas baseados na data de vencimento dos títulos.
          </p>
        </div>
      </div>

      {/* Gastos por Categoria + Fechamentos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
        <GastosPorCategoria data={periodoData.comprasPorCategoria} subtitulo={periodoLabel(periodo)} />
        <FechamentosProdutores data={data.fechamentosResumo} />
      </div>
    </div>
  )
}
