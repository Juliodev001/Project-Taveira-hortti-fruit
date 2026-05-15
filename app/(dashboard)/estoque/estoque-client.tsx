'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Boxes, TrendingUp, TrendingDown, Minus, Search, ChevronDown, X } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { ProdutoEstoque } from './page'

const GREEN = '#5ab952'
const NAVY = '#2d3561'
const PINK = '#e8255a'
const ORANGE = '#e87320'

const UNIT_LABEL: Record<string, string> = {
  CAIXA: 'cx', KG: 'kg', UNIDADE: 'un', SACO: 'sc', LITRO: 'L', DUZIA: 'dz', FARDO: 'fd',
}

function Sparkline({ precos, color }: { precos: number[]; color: string }) {
  const values = precos.filter(p => p > 0)
  if (values.length < 2) return <div style={{ height: 40 }} />
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 130, H = 40
  const pts = values.map((p, i) => {
    const x = ((i / (values.length - 1)) * (W - 8) + 4).toFixed(1)
    const y = (H - 6 - ((p - min) / range) * (H - 12)).toFixed(1)
    return `${x},${y}`
  }).join(' ')
  const lastX = parseFloat(pts.split(' ').at(-1)!.split(',')[0])
  const lastY = parseFloat(pts.split(' ').at(-1)!.split(',')[1])
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
      <circle cx={lastX} cy={lastY} r={3.5} fill={color} />
    </svg>
  )
}

function TrendBadge({ trend, ultimo, media }: { trend: string; ultimo: number; media: number }) {
  if (trend === 'up') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, backgroundColor: '#fff0f3', color: PINK, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
      <TrendingUp size={11} /> Subindo
    </span>
  )
  if (trend === 'down') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, backgroundColor: '#f0faf0', color: GREEN, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
      <TrendingDown size={11} /> Caindo
    </span>
  )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, backgroundColor: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
      <Minus size={11} /> Estável
    </span>
  )
}

export default function EstoqueClient({ produtos }: { produtos: ProdutoEstoque[] }) {
  const [q, setQ] = useState('')
  const [selecionado, setSelecionado] = useState<string | null>(null)

  const filtrados = produtos.filter(p =>
    !q || p.produto.nome.toLowerCase().includes(q.toLowerCase())
  )

  const totalCaixas = filtrados.reduce((s, p) => s + p.totalQtd, 0)
  const totalEntradas = filtrados.reduce((s, p) => s + p.totalEntradas, 0)
  const valorTotalEstoque = filtrados.reduce((s, p) => s + p.totalQtd * p.mediaPreco, 0)
  const mediaGeral = totalCaixas > 0 ? valorTotalEstoque / totalCaixas : 0

  const produtoSel = selecionado ? produtos.find(p => p.produto.id === selecionado) : null

  const cardColor = (trend: string) =>
    trend === 'up' ? PINK : trend === 'down' ? GREEN : ORANGE

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0 }}>Administração</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
            Resumo de colheitas por produto · média ponderada de preço
          </p>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Produtos', value: String(filtrados.length), suffix: '', color: NAVY },
          { label: 'Total de Caixas', value: totalCaixas.toFixed(0), suffix: ' cx', color: GREEN },
          { label: 'Preço Médio Geral', value: formatCurrency(mediaGeral), suffix: '/cx', color: ORANGE },
          { label: 'Valor Total do Estoque', value: formatCurrency(valorTotalEstoque), suffix: '', color: '#7c3aed' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 + i * 0.05 }}
            style={{ backgroundColor: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `3px solid ${s.color}` }}>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.color, margin: 0 }}>
              {s.value}<span style={{ fontSize: 14, fontWeight: 500, color: '#9ca3af' }}>{s.suffix}</span>
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ backgroundColor: 'white', borderRadius: 12, padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar produto..."
            style={{ paddingLeft: 36, padding: '9px 14px 9px 36px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, color: NAVY, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
        </div>
      </motion.div>

      {/* Cards grid */}
      {filtrados.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ backgroundColor: 'white', borderRadius: 14, padding: 64, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Boxes size={48} style={{ color: '#d1d5db', margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontWeight: 600, color: '#6b7280', margin: 0 }}>Nenhum produto com colheita registrada</p>

        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtrados.map((p, i) => {
            const cor = cardColor(p.trend)
            const sel = selecionado === p.produto.id
            const unit = UNIT_LABEL[p.produto.unidade] ?? p.produto.unidade.toLowerCase()
            return (
              <motion.div
                key={p.produto.id}
                initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.35, type: 'spring', stiffness: 200 }}
                whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                onClick={() => setSelecionado(sel ? null : p.produto.id)}
                style={{
                  backgroundColor: 'white', borderRadius: 16, padding: 22,
                  boxShadow: sel ? `0 0 0 2px ${cor}, 0 8px 28px rgba(0,0,0,0.1)` : '0 2px 8px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${cor}`, cursor: 'pointer',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: NAVY, fontSize: 16, margin: 0 }}>{p.produto.nome}</p>
                    {p.produto.categoria && (
                      <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{p.produto.categoria}</p>
                    )}
                  </div>
                  <TrendBadge trend={p.trend} ultimo={p.ultimoPreco} media={p.mediaPreco} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total colhido</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: NAVY, margin: 0, lineHeight: 1 }}>
                      {p.totalQtd.toFixed(0)}
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#9ca3af', marginLeft: 3 }}>{unit}</span>
                    </p>
                    {p.totalDescarte > 0 && (
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '3px 0 0' }}>
                        descarte: {p.totalDescarte.toFixed(0)} {unit}
                      </p>
                    )}
                  </div>
                  <Sparkline precos={p.historicoPrecos} color={cor} />
                </div>

                <div style={{ height: 1, backgroundColor: '#f3f4f6', margin: '0 0 12px' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, textAlign: 'center' }}>
                  {[
                    { label: 'Média/cx', value: formatCurrency(p.mediaPreco), color: cor },
                    { label: 'Mínimo', value: formatCurrency(p.precoMin), color: '#6b7280' },
                    { label: 'Máximo', value: formatCurrency(p.precoMax), color: '#6b7280' },
                  ].map(stat => (
                    <div key={stat.label} style={{ backgroundColor: '#f9fafb', borderRadius: 8, padding: '8px 4px' }}>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: 0.3 }}>{stat.label}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                    {p.totalEntradas} colheita{p.totalEntradas !== 1 ? 's' : ''}
                    {p.ultimaColheita ? ` · última ${formatDate(new Date(p.ultimaColheita))}` : ''}
                  </p>
                  <motion.div animate={{ rotate: sel ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                    <ChevronDown size={14} color="#9ca3af" />
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {produtoSel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden', marginTop: 20 }}>
            <div style={{ backgroundColor: 'white', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: NAVY, fontSize: 15, fontWeight: 700 }}>
                    Histórico de Preços · {produtoSel.produto.nome}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>
                    Últimas {produtoSel.historico.length} colheitas
                  </p>
                </div>
                <motion.button onClick={() => setSelecionado(null)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#6b7280' }}>
                  <X size={15} />
                </motion.button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      {['Data', 'Caixas Líquidas', 'Descarte', 'Preço / cx', 'Total Bruto'].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {produtoSel.historico.map((h, i) => {
                      const isAbove = h.preco > produtoSel.mediaPreco * 1.02
                      const isBelow = h.preco < produtoSel.mediaPreco * 0.98
                      return (
                        <motion.tr key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{formatDate(new Date(h.data))}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: NAVY }}>
                            {h.quantidade.toFixed(1)} {UNIT_LABEL[produtoSel.produto.unidade] ?? ''}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>
                            {h.descarte > 0 ? `${h.descarte.toFixed(1)} ${UNIT_LABEL[produtoSel.produto.unidade] ?? ''}` : '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              fontSize: 13, fontWeight: 700,
                              color: isAbove ? PINK : isBelow ? GREEN : NAVY,
                            }}>
                              {formatCurrency(h.preco)}
                              {isAbove && <TrendingUp size={11} style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                              {isBelow && <TrendingDown size={11} style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: NAVY }}>
                            {h.preco > 0 ? formatCurrency(h.total) : '—'}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f0faf0' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: NAVY }}>Média ponderada</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                        {produtoSel.totalQtd.toFixed(0)} cx total
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>
                        {produtoSel.totalDescarte.toFixed(0)} cx descarte
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 800, color: GREEN }}>
                        {formatCurrency(produtoSel.mediaPreco)} / cx
                      </td>
                      <td style={{ padding: '12px 16px' }} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
