'use client'
import { motion, useSpring, useTransform, useInView } from 'motion/react'
import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { DollarSign, Clock, CreditCard, AlertTriangle, Building2, TrendingUp, TrendingDown, ArrowUpRight, ShoppingCart, Users, ArrowRight } from 'lucide-react'
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
    lista: { id: string; produtor: string; cpf: string; dataInicio: string; dataFim: string; dataPagamento: string; status: string }[]
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

function GraficoComparativo({ data, periodo }: { data: PeriodoData['porMes']; periodo: string }) {
  const maxVal = Math.max(...data.flatMap(d => [d.receita, d.despesa]), 1)
  const H = 150

  if (data.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22, type: 'spring', stiffness: 160 }}
      style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Receita vs Despesas</h3>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>{periodoLabel(periodo)} · por mês</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[{ color: GREEN, label: 'Receita' }, { color: PINK, label: 'Despesas' }].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
              <span style={{ fontSize: 11, color: '#6b7280' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: data.length > 8 ? 4 : 10, height: H + 20, paddingTop: 4 }}>
        {data.map((m, i) => {
          const hR = Math.max((m.receita / maxVal) * H, m.receita > 0 ? 3 : 0)
          const hD = Math.max((m.despesa / maxVal) * H, m.despesa > 0 ? 3 : 0)
          const positivo = m.receita >= m.despesa
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: H }}>
                <motion.div
                  initial={{ height: 0 }} animate={{ height: hR }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                  title={`Receita: ${formatCurrency(m.receita)}`}
                  style={{ width: 13, background: `linear-gradient(180deg, ${GREEN}bb, ${GREEN})`, borderRadius: '4px 4px 0 0', cursor: 'default' }}
                />
                <motion.div
                  initial={{ height: 0 }} animate={{ height: hD }}
                  transition={{ delay: i * 0.05 + 0.04, duration: 0.5, ease: 'easeOut' }}
                  title={`Despesas: ${formatCurrency(m.despesa)}`}
                  style={{ width: 13, background: `linear-gradient(180deg, ${PINK}bb, ${PINK})`, borderRadius: '4px 4px 0 0', cursor: 'default' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: positivo ? GREEN : PINK }} title={`Margem: ${formatCurrency(m.receita - m.despesa)}`} />
                <span style={{ fontSize: 9, color: '#9ca3af', textAlign: 'center', whiteSpace: 'nowrap' }}>{m.label}</span>
              </div>
            </div>
          )
        })}
      </div>
      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>● verde = margem positiva · ● vermelho = margem negativa · passe o mouse nas barras para ver os valores</p>
    </motion.div>
  )
}

function PeriodoSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 16 }}>
      {PERIODOS.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            border: `1.5px solid ${value === p.value ? NAVY : '#e5e7eb'}`,
            backgroundColor: value === p.value ? NAVY : 'white',
            color: value === p.value ? 'white' : '#6b7280',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

function GastosPorCategoria({ data, subtitulo }: { data: { categoria: string; total: number }[]; subtitulo: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const totalGeral = data.reduce((s, c) => s + c.total, 0)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, type: 'spring', stiffness: 160 }}
      whileHover={{ y: -4, boxShadow: `0 16px 40px ${ORANGE}18, 0 4px 12px rgba(0,0,0,0.07)` }}
      style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${ORANGE}`, position: 'relative', overflow: 'hidden' }}
    >
      <motion.div animate={{ opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: `radial-gradient(circle, ${ORANGE} 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div whileHover={{ rotate: 15, scale: 1.1 }} style={{ background: `${ORANGE}15`, borderRadius: 8, padding: 6 }}>
            <ShoppingCart size={16} color={ORANGE} />
          </motion.div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Gastos por Categoria</h3>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{subtitulo}</p>
          </div>
        </div>
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.55, type: 'spring', stiffness: 300 }}
          style={{ color: ORANGE, fontWeight: 800, fontSize: 15 }}
        >
          {formatCurrency(totalGeral)}
        </motion.span>
      </div>

      {data.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Nenhuma compra no período</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.map(({ categoria, total }, i) => {
            const { label, color } = catInfo[categoria] ?? { label: categoria, color: '#6b7280' }
            const pct = totalGeral > 0 ? (total / totalGeral) * 100 : 0
            return (
              <motion.div
                key={categoria}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.06, duration: 0.35 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{formatCurrency(total)}</span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.06, type: 'spring', stiffness: 300 }}
                      style={{ fontSize: 10, fontWeight: 700, color: 'white', backgroundColor: color, padding: '2px 7px', borderRadius: 20 }}
                    >
                      {pct.toFixed(0)}%
                    </motion.span>
                  </div>
                </div>
                <div style={{ height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${pct}%` } : { width: 0 }}
                    transition={{ delay: 0.6 + i * 0.07, duration: 0.7, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${color}cc, ${color})` }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function FechamentosProdutores({ data }: { data: DashData['fechamentosResumo'] }) {
  function fmtDate(d: string) { return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 160 }}
      whileHover={{ y: -4, boxShadow: `0 16px 40px ${NAVY}12, 0 4px 12px rgba(0,0,0,0.07)` }}
      style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${NAVY}`, position: 'relative', overflow: 'hidden' }}
    >
      <motion.div animate={{ opacity: [0.04, 0.09, 0.04] }} transition={{ duration: 6, repeat: Infinity, delay: 1.5 }}
        style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: `radial-gradient(circle, ${NAVY} 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div whileHover={{ rotate: 15, scale: 1.1 }} style={{ background: `${NAVY}15`, borderRadius: 8, padding: 6 }}>
            <Users size={16} color={NAVY} />
          </motion.div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Pagamentos de Produtores</h3>
        </div>
        <motion.div whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 400 }}>
          <Link href="/lavoura/pagamento" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: GREEN, fontWeight: 600, textDecoration: 'none' }}>
            Ver todos <ArrowRight size={12} />
          </Link>
        </motion.div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { label: `${data.pendentes} Pendente${data.pendentes !== 1 ? 's' : ''}`, color: ORANGE, bg: '#fff7ed' },
          { label: `${data.pagos} Pago${data.pagos !== 1 ? 's' : ''}`, color: GREEN, bg: '#f0faf0' },
        ].map(({ label, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 350, damping: 18 }}
            style={{ backgroundColor: bg, color, padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1px solid ${color}30` }}
          >
            {label}
          </motion.div>
        ))}
      </div>

      {data.lista.length === 0 ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
          Nenhum fechamento cadastrado
        </motion.p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.lista.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.3 }}
              whileHover={{ backgroundColor: `${NAVY}05`, paddingLeft: 8, borderRadius: 8 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 2px', borderBottom: '1px solid #f3f4f6', transition: 'padding 0.15s' }}
            >
              <div>
                <Link href={`/lavoura/pagamento/${f.id}`} style={{ textDecoration: 'none' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: NAVY }}>{f.produtor}</p>
                  <p style={{ margin: '1px 0 0', fontSize: 11, color: '#9ca3af' }}>{fmtDate(f.dataInicio)} – {fmtDate(f.dataFim)}</p>
                </Link>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>pag. {fmtDate(f.dataPagamento)}</span>
                <motion.span
                  animate={f.status === 'PENDENTE' ? { opacity: [1, 0.6, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    backgroundColor: f.status === 'PAGO' ? '#f0faf0' : '#fff7ed',
                    color: f.status === 'PAGO' ? GREEN : ORANGE,
                    padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  }}
                >
                  {f.status === 'PAGO' ? 'Pago' : 'Pendente'}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function AnimatedNumber({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const spring = useSpring(0, { stiffness: 60, damping: 18 })
  const display = useTransform(spring, (v) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  )

  useEffect(() => {
    if (inView) spring.set(value)
  }, [inView, value, spring])

  return (
    <motion.span ref={ref} style={{ color, fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
      {display}
    </motion.span>
  )
}

function StatCard({
  title, rawValue, icon: Icon, color, subtitle, delay = 0, trend,
}: {
  title: string; rawValue: number; icon: React.ElementType
  color: string; subtitle?: string; delay?: number; trend?: 'up' | 'down'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 160, damping: 20 }}
      whileHover={{ y: -6, boxShadow: `0 16px 40px ${color}22, 0 4px 12px rgba(0,0,0,0.08)` }}
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: '24px 24px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderLeft: `4px solid ${color}`,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
        style={{
          position: 'absolute', top: -30, right: -30, width: 120, height: 120,
          borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div>
          <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</p>
          <div style={{ margin: '10px 0 0' }}>
            <AnimatedNumber value={rawValue} color={color} />
          </div>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.3 }}
              style={{ color: '#9ca3af', fontSize: 12, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {trend === 'up' && <ArrowUpRight size={11} color={GREEN} />}
              {trend === 'down' && <ArrowUpRight size={11} color={PINK} style={{ transform: 'rotate(90deg)' }} />}
              {subtitle}
            </motion.p>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 15, scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{
            background: `linear-gradient(135deg, ${color}25, ${color}10)`,
            border: `1px solid ${color}30`,
            borderRadius: 12, padding: 12,
            boxShadow: `0 4px 12px ${color}20`,
          }}
        >
          <Icon size={22} color={color} />
        </motion.div>
      </div>
    </motion.div>
  )
}

function PrazoRow({ label, value, color, delay = 0 }: { label: string; value: number; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.3 }}
      whileHover={{ backgroundColor: `${color}08`, paddingLeft: 6, borderRadius: 8 }}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 2px', borderBottom: '1px solid #f3f4f6', transition: 'padding 0.15s' }}
    >
      <span style={{ color: '#6b7280', fontSize: 13 }}>{label}</span>
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: delay + 0.1 }}
        style={{ color, fontWeight: 700, fontSize: 13 }}
      >
        {formatCurrency(value)}
      </motion.span>
    </motion.div>
  )
}

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
      <motion.div
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: NAVY, margin: 0, letterSpacing: -0.5 }}>Dashboard</h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Visão geral do negócio</p>
          </div>
        </div>
        <PeriodoSelector value={periodo} onChange={setPeriodo} />
      </motion.div>

      {/* Top stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
        <StatCard title="Receita" rawValue={periodoData.receita} icon={TrendingUp} color={GREEN} delay={0.05} subtitle={periodoLabel(periodo)} />
        <StatCard title="Despesas" rawValue={periodoData.despesa} icon={TrendingDown} color={PINK} delay={0.1} subtitle={periodoLabel(periodo)} />
        <StatCard title="Margem" rawValue={margem} icon={DollarSign} color={margem >= 0 ? GREEN : PINK} delay={0.15} subtitle={periodoLabel(periodo)} />
        <StatCard title="Saldo Total" rawValue={data.totalSaldo} icon={Building2} color={NAVY} delay={0.2} />
      </div>

      <GraficoComparativo data={periodoData.porMes} periodo={periodo} />

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
        {/* Contas a Pagar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, type: 'spring', stiffness: 160 }}
          whileHover={{ y: -4, boxShadow: `0 16px 40px ${ORANGE}18, 0 4px 12px rgba(0,0,0,0.07)` }}
          style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${ORANGE}`, position: 'relative', overflow: 'hidden' }}
        >
          <motion.div animate={{ opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 5, repeat: Infinity }}
            style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${ORANGE} 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.div whileHover={{ rotate: 15, scale: 1.1 }} style={{ background: `${ORANGE}15`, borderRadius: 8, padding: 6 }}>
                <Clock size={16} color={ORANGE} />
              </motion.div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Contas a Pagar</h3>
            </div>
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
              style={{ color: ORANGE, fontWeight: 800, fontSize: 15 }}
            >
              {formatCurrency(data.contasAPagar.total)}
            </motion.span>
          </div>
          <PrazoRow label="Próx. 7 dias" value={data.contasAPagar.em7} color={PINK} delay={0.3} />
          <PrazoRow label="Próx. 15 dias" value={data.contasAPagar.em15} color={ORANGE} delay={0.35} />
          <PrazoRow label="Próx. 30 dias" value={data.contasAPagar.em30} color={NAVY} delay={0.4} />
          <PrazoRow label="Acima de 30 dias" value={data.contasAPagar.acima30} color="#6b7280" delay={0.45} />
        </motion.div>

        {/* Contas a Receber */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 160 }}
          whileHover={{ y: -4, boxShadow: `0 16px 40px ${GREEN}18, 0 4px 12px rgba(0,0,0,0.07)` }}
          style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${GREEN}`, position: 'relative', overflow: 'hidden' }}
        >
          <motion.div animate={{ opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.div whileHover={{ rotate: 15, scale: 1.1 }} style={{ background: `${GREEN}15`, borderRadius: 8, padding: 6 }}>
                <DollarSign size={16} color={GREEN} />
              </motion.div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Contas a Receber</h3>
            </div>
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.45, type: 'spring', stiffness: 300 }}
              style={{ color: GREEN, fontWeight: 800, fontSize: 15 }}
            >
              {formatCurrency(data.contasAReceber.total)}
            </motion.span>
          </div>
          <PrazoRow label="Próx. 7 dias" value={data.contasAReceber.em7} color={GREEN} delay={0.35} />
          <PrazoRow label="Próx. 15 dias" value={data.contasAReceber.em15} color={GREEN} delay={0.4} />
          <PrazoRow label="Próx. 30 dias" value={data.contasAReceber.em30} color={NAVY} delay={0.45} />
          <PrazoRow label="Acima de 30 dias" value={data.contasAReceber.acima30} color="#6b7280" delay={0.5} />
        </motion.div>

        {/* Saldo Bancário */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, type: 'spring', stiffness: 160 }}
          whileHover={{ y: -4, boxShadow: `0 16px 40px ${TEAL}18, 0 4px 12px rgba(0,0,0,0.07)` }}
          style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${TEAL}`, position: 'relative', overflow: 'hidden' }}
        >
          <motion.div animate={{ opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 5, repeat: Infinity, delay: 2 }}
            style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${TEAL} 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }} style={{ background: `${TEAL}15`, borderRadius: 8, padding: 6 }}>
              <Building2 size={16} color={TEAL} />
            </motion.div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Saldo Bancário</h3>
          </div>
          {data.saldoBancario.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Nenhuma conta cadastrada</p>
          ) : (
            data.saldoBancario.map((c, i) => (
              <PrazoRow key={c.nome} label={c.nome} value={c.saldo} color={c.saldo >= 0 ? TEAL : PINK} delay={0.4 + i * 0.06} />
            ))
          )}
        </motion.div>
      </div>

      {/* Previsão de Caixa */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: 'spring', stiffness: 160 }}
        style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <motion.div whileHover={{ rotate: 10, scale: 1.1 }} style={{ background: `${NAVY}15`, borderRadius: 8, padding: 6 }}>
            <CreditCard size={16} color={NAVY} />
          </motion.div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Previsão de Caixa</h3>
          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }}>baseado em vencimentos</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: '7 dias', entrada: data.contasAReceber.em7, saida: data.contasAPagar.em7 },
            { label: '15 dias', entrada: data.contasAReceber.em15, saida: data.contasAPagar.em15 },
            { label: '30 dias', entrada: data.contasAReceber.em30, saida: data.contasAPagar.em30 },
          ].map(({ label, entrada, saida }, i) => {
            const saldo = entrada - saida
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 220 }}
                whileHover={{ scale: 1.03, boxShadow: `0 8px 24px ${saldo >= 0 ? GREEN : PINK}22`, y: -2 }}
                style={{
                  border: `1.5px solid ${saldo >= 0 ? GREEN : PINK}30`,
                  borderRadius: 12, padding: '16px 20px', textAlign: 'center',
                  background: `linear-gradient(135deg, ${saldo >= 0 ? GREEN : PINK}06, transparent)`,
                  cursor: 'default',
                }}
              >
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.07 }}
                  style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 12px' }}
                >
                  {label}
                </motion.p>
                <p style={{ color: GREEN, fontSize: 13, fontWeight: 600, margin: '0 0 3px' }}>+ {formatCurrency(entrada)}</p>
                <p style={{ color: PINK, fontSize: 13, fontWeight: 600, margin: '0 0 8px' }}>- {formatCurrency(saida)}</p>
                <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${saldo >= 0 ? GREEN : PINK}40, transparent)`, margin: '8px 0' }} />
                <motion.p
                  initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.65 + i * 0.07, type: 'spring', stiffness: 300 }}
                  style={{ color: saldo >= 0 ? GREEN : PINK, fontSize: 17, fontWeight: 800, margin: 0 }}
                >
                  {formatCurrency(saldo)}
                </motion.p>
              </motion.div>
            )
          })}
        </div>
        <p style={{ color: '#9ca3af', fontSize: 11, marginTop: 14 }}>⚠️ Alertas baseados na data de vencimento dos títulos</p>
      </motion.div>

      {/* Gastos por Categoria + Fechamentos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 16 }}>
        <GastosPorCategoria data={periodoData.comprasPorCategoria} subtitulo={periodoLabel(periodo)} />
        <FechamentosProdutores data={data.fechamentosResumo} />
      </div>
    </div>
  )
}
