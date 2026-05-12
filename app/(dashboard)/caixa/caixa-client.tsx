'use client'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Landmark, ArrowUpCircle, ArrowDownCircle, AlertCircle, Plus, Building2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const GREEN = '#5ab952'
const NAVY = '#2d3561'
const PINK = '#e8255a'
const ORANGE = '#e87320'
const TEAL = '#3d6b6e'

type Conta = { id: string; nome: string; tipo: string; saldoInicial: number; movimentacoes: Mov[] }
type Mov = { id: string; descricao: string; tipo: string; valor: number; data: Date; conciliado: boolean; contaNome?: string }

export default function CaixaClient({ contas, todasMovimentacoes, saldoTotal, entradPeriodo, saidPeriodo, pendentes }: {
  contas: Conta[]; todasMovimentacoes: Mov[]; saldoTotal: number; entradPeriodo: number; saidPeriodo: number; pendentes: number
}) {
  const cards = [
    { label: 'Saldo atual', value: formatCurrency(saldoTotal), color: saldoTotal >= 0 ? TEAL : PINK, icon: Landmark },
    { label: 'Entradas do período', value: formatCurrency(entradPeriodo), color: GREEN, icon: ArrowUpCircle },
    { label: 'Saídas do período', value: formatCurrency(saidPeriodo), color: PINK, icon: ArrowDownCircle },
    { label: 'Pendentes de conciliação', value: String(pendentes), color: ORANGE, icon: AlertCircle },
  ]

  const tipoIcone: Record<string, string> = { CAIXA_FISICO: '💵', CONTA_CORRENTE: '🏦', POUPANCA: '🏛', INVESTIMENTO: '📈' }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0 }}>Caixa e Conciliação Bancária</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Movimentações bancárias e controle de caixa</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Link href="/caixa/nova" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', backgroundColor: GREEN, color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              <Plus size={15} /> Nova movimentação
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {cards.map(({ label, value, color, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, type: 'spring', stiffness: 180 }}
            whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.1)' }}
            style={{ backgroundColor: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>{label}</p>
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 + 0.18 }}
                  style={{ color, fontSize: 20, fontWeight: 700, margin: '6px 0 0' }}
                >{value}</motion.p>
              </div>
              <div style={{ backgroundColor: `${color}15`, borderRadius: 10, padding: 9 }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {contas.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          {contas.map((c, i) => {
            const entradas = c.movimentacoes.filter((m) => m.tipo === 'ENTRADA').reduce((s, m) => s + m.valor, 0)
            const saidas = c.movimentacoes.filter((m) => m.tipo === 'SAIDA').reduce((s, m) => s + m.valor, 0)
            const saldo = c.saldoInicial + entradas - saidas
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.34 + i * 0.06, type: 'spring', stiffness: 220 }}
                whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.09)' }}
                style={{ backgroundColor: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', borderLeft: `4px solid ${TEAL}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{tipoIcone[c.tipo] ?? '🏦'}</span>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0, fontWeight: 500 }}>{c.nome}</p>
                </div>
                <p style={{ fontSize: 22, fontWeight: 700, color: saldo >= 0 ? TEAL : PINK, margin: 0 }}>{formatCurrency(saldo)}</p>
              </motion.div>
            )
          })}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.4 }}
        style={{ backgroundColor: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={16} color={TEAL} />
            <h3 style={{ margin: 0, color: NAVY, fontSize: 15, fontWeight: 600 }}>Movimentações</h3>
          </div>
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.55, type: 'spring', stiffness: 400 }}
            style={{ backgroundColor: `${NAVY}12`, color: NAVY, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {todasMovimentacoes.length}
          </motion.span>
        </div>
        {todasMovimentacoes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ padding: 64, textAlign: 'center', color: '#9ca3af' }}>
            <Landmark size={40} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontWeight: 600, margin: 0 }}>Nenhuma movimentação encontrada</p>
          </motion.div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                {['Data', 'Descrição', 'Tipo', 'Valor', 'Conciliação'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todasMovimentacoes.slice(0, 50).map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.03 }}
                  whileHover={{ backgroundColor: '#f8fffe' }}
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                >
                  <td style={{ padding: '12px 16px', fontSize: 13, color: NAVY }}>{formatDate(m.data)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: NAVY, fontWeight: 500 }}>{m.descricao}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content', backgroundColor: m.tipo === 'ENTRADA' ? '#f0faf0' : '#fff0f3', color: m.tipo === 'ENTRADA' ? GREEN : PINK, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {m.tipo === 'ENTRADA' ? '↑' : '↓'} {m.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: m.tipo === 'ENTRADA' ? GREEN : PINK }}>
                    {m.tipo === 'ENTRADA' ? '+' : '-'} {formatCurrency(m.valor)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ backgroundColor: m.conciliado ? '#f0faf0' : '#fff7ed', color: m.conciliado ? GREEN : ORANGE, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {m.conciliado ? 'Conciliado' : 'Pendente'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  )
}
