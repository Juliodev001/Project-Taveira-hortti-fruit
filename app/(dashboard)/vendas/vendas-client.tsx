'use client'
import { motion } from 'motion/react'
import Link from 'next/link'
import { TrendingUp, Clock, CheckCircle, Plus, FileText } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const GREEN = '#5ab952'
const NAVY = '#2d3561'
const ORANGE = '#e87320'

type NFe = {
  id: string
  dataEmissao: Date
  numero: string | null
  totalValor: number
  statusFinanceiro: string
  status: string
  cliente: { nome: string }
}

export default function VendasClient({ nfes, receita, aReceber, recebido }: {
  nfes: NFe[]; receita: number; aReceber: number; recebido: number
}) {
  const cards = [
    { label: 'Receita (NF-e)', value: receita, sub: `${nfes.length} NF-e no período`, color: NAVY, icon: TrendingUp },
    { label: 'A Receber', value: aReceber, sub: 'Títulos em aberto', color: ORANGE, icon: Clock },
    { label: 'Recebido', value: recebido, sub: 'Pagamentos confirmados', color: GREEN, icon: CheckCircle },
  ]

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0 }}>Vendas</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Movimentações geradas a partir de NF-e emitidas</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="/nfe" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', backgroundColor: GREEN, color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            <Plus size={15} /> Nova NF-e
          </Link>
        </motion.div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {cards.map(({ label, value, sub, color, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, type: 'spring', stiffness: 180 }}
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            style={{ backgroundColor: 'white', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>{label}</p>
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 + 0.2 }}
                  style={{ color, fontSize: 26, fontWeight: 700, margin: '6px 0 3px' }}
                >{formatCurrency(value)}</motion.p>
                <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>{sub}</p>
              </div>
              <div style={{ backgroundColor: `${color}15`, borderRadius: 10, padding: 10 }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
        style={{ backgroundColor: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: NAVY, fontSize: 15, fontWeight: 600 }}>Vendas Registradas (NF-e)</h3>
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
            style={{ backgroundColor: `${NAVY}12`, color: NAVY, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {nfes.length} registros
          </motion.span>
        </div>
        {nfes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ padding: 64, textAlign: 'center', color: '#9ca3af' }}>
            <FileText size={40} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontWeight: 600, margin: 0 }}>Nenhuma venda registrada</p>
          </motion.div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                {['Emissão', 'NF', 'Cliente', 'Valor', 'Financeiro', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nfes.map((n, i) => (
                <motion.tr
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38 + i * 0.04 }}
                  whileHover={{ backgroundColor: '#f8fffe' }}
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                >
                  <td style={{ padding: '13px 16px', fontSize: 13, color: NAVY }}>{formatDate(n.dataEmissao)}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{n.numero ?? '-'}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 500, color: NAVY }}>{n.cliente.nome}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: NAVY }}>{formatCurrency(n.totalValor)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ backgroundColor: n.statusFinanceiro === 'RECEBIDO' ? '#f0faf0' : '#fff7ed', color: n.statusFinanceiro === 'RECEBIDO' ? GREEN : ORANGE, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {n.statusFinanceiro === 'RECEBIDO' ? 'Recebido' : 'A Receber'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ backgroundColor: '#f0faf0', color: GREEN, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Autorizada</span>
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
