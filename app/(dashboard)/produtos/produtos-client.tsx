'use client'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Package, Plus, TrendingUp, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import PageSkeleton from '@/components/page-skeleton'

const GREEN = '#5ab952'
const NAVY = '#2d3561'
const PINK = '#e8255a'

type Produto = { id: string; nome: string; unidade: string; categoria: string | null; ativo: boolean; createdAt: Date }

const iconesPorNome: Record<string, string> = {
  morango: '🍓', tomate: '🍅', alface: '🥬', pimentão: '🫑', pimenta: '🌶️',
  cebola: '🧅', alho: '🧄', cenoura: '🥕', batata: '🥔', abobrinha: '🥒',
  pepino: '🥒', berinjela: '🍆', brócolis: '🥦', couve: '🥬', espinafre: '🥬',
  repolho: '🥬', milho: '🌽', abóbora: '🎃', beterraba: '🫚', rabanete: '🌸',
  maçã: '🍎', banana: '🍌', laranja: '🍊', uva: '🍇', melão: '🍈',
  melancia: '🍉', manga: '🥭', abacaxi: '🍍', mamão: '🍑', goiaba: '🍈',
  limão: '🍋', maracujá: '🌸', caju: '🍑', acerola: '🍒', jabuticaba: '🫐',
  feijão: '🫘', soja: '🌿', arroz: '🌾', trigo: '🌾', milho: '🌽',
}

const iconesPorCategoria: Record<string, string> = {
  Fruta: '🍎', Hortaliça: '🥬', Legume: '🥕', Grão: '🌾', Erva: '🌿', Outros: '📦',
}

function getIcone(nome: string, categoria: string | null): string {
  const key = nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  for (const [k, v] of Object.entries(iconesPorNome)) {
    if (key.includes(k.normalize('NFD').replace(/[̀-ͯ]/g, ''))) return v
  }
  return (categoria && iconesPorCategoria[categoria]) ?? '🌱'
}

export default function ProdutosClient() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/produtos').then(r => r.json()).then(setProdutos).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSkeleton cards={3} rows={6} />

  const ativos = produtos.filter(p => p.ativo).length

  const cards = [
    { label: 'Total de produtos', value: produtos.length, color: NAVY, icon: Package },
    { label: 'Produtos ativos', value: ativos, color: GREEN, icon: TrendingUp },
    { label: 'Inativos', value: produtos.length - ativos, color: PINK, icon: AlertCircle },
  ]

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0 }}>Catálogo de Produtos</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Gerencie os produtos da lavoura</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="/produtos/novo" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', backgroundColor: GREEN, color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            <Plus size={15} /> Novo Produto
          </Link>
        </motion.div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {cards.map(({ label, value, color, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.09, duration: 0.4, type: 'spring', stiffness: 180 }}
            whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.1)' }}
            style={{ backgroundColor: 'white', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>{label}</p>
                <motion.p
                  initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.09 + 0.15, type: 'spring', stiffness: 300 }}
                  style={{ color, fontSize: 32, fontWeight: 700, margin: '6px 0 0' }}
                >{value}</motion.p>
              </div>
              <div style={{ backgroundColor: `${color}15`, borderRadius: 10, padding: 10 }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.4 }}
        style={{ backgroundColor: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: NAVY }}>Produtos cadastrados</h3>
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.45, type: 'spring', stiffness: 400 }}
            style={{ backgroundColor: `${NAVY}12`, color: NAVY, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}
          >{produtos.length}</motion.span>
        </div>

        {produtos.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ padding: 64, textAlign: 'center', color: '#9ca3af' }}>
            <Package size={40} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontWeight: 600, margin: '0 0 6px' }}>Nenhum produto cadastrado</p>
            <Link href="/produtos/novo" style={{ color: GREEN, fontSize: 13 }}>Cadastrar agora →</Link>
          </motion.div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                {['Nome', 'Unidade', 'Categoria', 'Status', 'Cadastrado em'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {produtos.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.36 + i * 0.04, duration: 0.3 }}
                  whileHover={{ backgroundColor: '#f8fffe' }}
                  style={{ borderBottom: '1px solid #f3f4f6', cursor: 'default' }}
                >
                  <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 600, color: NAVY }}>{getIcone(p.nome, p.categoria)} {p.nome}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{p.unidade}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{p.categoria ?? '—'}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ backgroundColor: p.ativo ? '#f0faf0' : '#fef2f2', color: p.ativo ? GREEN : PINK, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{formatDate(p.createdAt)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  )
}
