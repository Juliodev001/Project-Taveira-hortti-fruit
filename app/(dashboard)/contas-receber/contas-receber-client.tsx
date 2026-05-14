'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { DollarSign, Clock, CheckCircle, AlertTriangle, RefreshCw, Plus, X, Filter } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const GREEN = '#5ab952'
const NAVY = '#2d3561'
const PINK = '#e8255a'
const ORANGE = '#e87320'

type Cliente = { id: string; nome: string }
type Titulo = {
  id: string; descricao: string; valor: number
  dataEmissao: string; dataVenc: string; dataPagamento: string | null
  status: string; origem: string; nfeId: string | null
  cliente: Cliente
}

const statusConf: Record<string, { label: string; bg: string; color: string }> = {
  A_RECEBER: { label: 'Em Aberto', bg: '#fff7ed', color: ORANGE },
  VENCIDO: { label: 'Vencido', bg: '#fff0f3', color: PINK },
  RECEBIDO: { label: 'Recebido', bg: '#f0faf0', color: GREEN },
}

const origemLabel: Record<string, string> = {
  NFE: 'NF-e', ROMANEIO: 'Romaneio', MANUAL: 'Manual'
}

const emptyForm = { clienteId: '', descricao: '', valor: '', dataVenc: '', dataEmissao: new Date().toISOString().slice(0, 10) }

export default function ContasReceberClient({ titulos: inicial, clientes }: { titulos: Titulo[]; clientes: Cliente[] }) {
  const router = useRouter()
  const [titulos, setTitulos] = useState(inicial)
  const [statusFiltro, setStatusFiltro] = useState('Em aberto')
  const [origemFiltro, setOrigemFiltro] = useState('TODAS')
  const [clienteFiltro, setClienteFiltro] = useState('TODOS')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')

  const filtrados = titulos.filter(t => {
    const matchStatus = statusFiltro === 'TODOS' ||
      (statusFiltro === 'Em aberto' && (t.status === 'A_RECEBER' || t.status === 'VENCIDO')) ||
      t.status === statusFiltro
    const matchOrigem = origemFiltro === 'TODAS' || t.origem === origemFiltro
    const matchCliente = clienteFiltro === 'TODOS' || t.clienteId === clienteFiltro
    const dv = new Date(t.dataVenc)
    const matchDe = !de || dv >= new Date(de)
    const matchAte = !ate || dv <= new Date(ate)
    return matchStatus && matchOrigem && matchCliente && matchDe && matchAte
  })

  const emAberto = titulos.filter(t => t.status === 'A_RECEBER').reduce((s, t) => s + t.valor, 0)
  const vencido = titulos.filter(t => t.status === 'VENCIDO').reduce((s, t) => s + t.valor, 0)
  const recebido = titulos.filter(t => t.status === 'RECEBIDO').reduce((s, t) => s + t.valor, 0)
  const totalFiltrado = filtrados.reduce((s, t) => s + t.valor, 0)

  async function sincronizar() {
    setSyncing(true)
    try {
      const res = await fetch('/api/titulos/sincronizar', { method: 'POST' })
      const data = await res.json()
      if (data.criados > 0) {
        router.refresh()
        alert(`${data.criados} título(s) sincronizado(s) das NF-e.`)
      } else {
        alert('Nenhum título novo para sincronizar.')
      }
    } finally {
      setSyncing(false)
    }
  }

  async function marcarRecebido(id: string) {
    await fetch(`/api/titulos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'RECEBIDO' }) })
    setTitulos(prev => prev.map(t => t.id === id ? { ...t, status: 'RECEBIDO', dataPagamento: new Date().toISOString() } : t))
  }

  async function excluir(id: string) {
    await fetch(`/api/titulos/${id}`, { method: 'DELETE' })
    setTitulos(prev => prev.filter(t => t.id !== id))
  }

  async function criarTitulo() {
    if (!form.clienteId || !form.descricao || !form.valor || !form.dataVenc) { setError('Preencha todos os campos'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/titulos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId: form.clienteId, descricao: form.descricao, valor: parseFloat(form.valor), dataEmissao: form.dataEmissao, dataVenc: form.dataVenc }),
      })
      if (!res.ok) throw new Error('Erro')
      const novo = await res.json()
      setTitulos(prev => [...prev, novo])
      setModal(false); setForm(emptyForm)
    } catch {
      setError('Erro ao criar título')
    } finally {
      setLoading(false)
    }
  }

  const inp = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' }
  const lbl = { fontSize: 13, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 5 } as React.CSSProperties

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0 }}>Contas a Receber</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Gerencie os títulos a receber (NF-e, romaneios e manuais)</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button onClick={sincronizar} disabled={syncing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: '1.5px solid #e5e7eb', backgroundColor: 'white', color: NAVY, borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: syncing ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            <RefreshCw size={14} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} /> {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </motion.button>
          <motion.button onClick={() => setModal(true)} whileHover={{ scale: 1.03, backgroundColor: '#4aa344' }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', backgroundColor: GREEN, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Plus size={15} /> Novo Título
          </motion.button>
        </div>
      </motion.div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Em Aberto', value: emAberto, color: ORANGE, icon: Clock },
          { label: 'Vencido', value: vencido, color: PINK, icon: AlertTriangle },
          { label: 'Recebido', value: recebido, color: GREEN, icon: CheckCircle },
          { label: 'Total Filtrado', value: totalFiltrado, color: NAVY, icon: DollarSign },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, type: 'spring', stiffness: 200 }}
            style={{ backgroundColor: 'white', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>{label}</p>
                <p style={{ color, fontSize: 22, fontWeight: 700, margin: '4px 0 0' }}>{formatCurrency(value)}</p>
              </div>
              <div style={{ backgroundColor: `${color}15`, borderRadius: 10, padding: 8 }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filtros */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ backgroundColor: 'white', borderRadius: 14, padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 18, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Filter size={14} color="#9ca3af" style={{ marginBottom: 12 }} />
        {[
          { label: 'Status', value: statusFiltro, onChange: setStatusFiltro, opts: [['TODOS','Todos'],['Em aberto','Em aberto'],['VENCIDO','Vencido'],['RECEBIDO','Recebido']] },
          { label: 'Origem', value: origemFiltro, onChange: setOrigemFiltro, opts: [['TODAS','Todas'],['NFE','NF-e'],['ROMANEIO','Romaneio'],['MANUAL','Manual']] },
        ].map(({ label, value, onChange, opts }) => (
          <div key={label} style={{ minWidth: 130 }}>
            <label style={lbl}>{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inp, padding: '8px 12px', fontSize: 13 }}>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
        <div style={{ minWidth: 160 }}>
          <label style={lbl}>Cliente</label>
          <select value={clienteFiltro} onChange={e => setClienteFiltro(e.target.value)} style={{ ...inp, padding: '8px 12px', fontSize: 13 }}>
            <option value="TODOS">Todos</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>De</label>
          <input type="date" value={de} onChange={e => setDe(e.target.value)} style={{ ...inp, padding: '8px 12px', fontSize: 13, width: 145 }} />
        </div>
        <div>
          <label style={lbl}>Até</label>
          <input type="date" value={ate} onChange={e => setAte(e.target.value)} style={{ ...inp, padding: '8px 12px', fontSize: 13, width: 145 }} />
        </div>
      </motion.div>

      {/* Tabela */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
        style={{ backgroundColor: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: NAVY, fontSize: 15, fontWeight: 600 }}>Títulos ({filtrados.length})</h3>
        </div>
        {filtrados.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: '#9ca3af' }}>
            <DollarSign size={40} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontWeight: 600, margin: 0 }}>Nenhum título encontrado</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                {['Vencimento', 'Descrição', 'Cliente', 'Origem', 'Valor', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((t, i) => {
                const st = statusConf[t.status] ?? statusConf.A_RECEBER
                return (
                  <motion.tr key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.04 }} whileHover={{ backgroundColor: '#f8fffe' }}
                    style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: t.status === 'VENCIDO' ? PINK : NAVY, fontWeight: t.status === 'VENCIDO' ? 600 : 400 }}>
                      {formatDate(new Date(t.dataVenc))}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: NAVY }}>{t.descricao}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: NAVY }}>{t.cliente.nome}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ backgroundColor: `${NAVY}10`, color: NAVY, padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{origemLabel[t.origem] ?? t.origem}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: NAVY }}>{formatCurrency(t.valor)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ backgroundColor: st.bg, color: st.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {t.status !== 'RECEBIDO' && (
                        <motion.button onClick={() => marcarRecebido(t.id)} whileHover={{ scale: 1.05, backgroundColor: '#f0faf0' }} whileTap={{ scale: 0.95 }}
                          style={{ padding: '5px 12px', border: `1.5px solid ${GREEN}`, borderRadius: 7, background: 'white', color: GREEN, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                          ✓ Recebido
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Modal novo título */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000 }} />
            <div className="modal-wrapper">
            <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              style={{ backgroundColor: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: 0 }}>Novo Título</h2>
                <motion.button onClick={() => setModal(false)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#6b7280' }}>
                  <X size={16} />
                </motion.button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={lbl}>Cliente *</label>
                  <select value={form.clienteId} onChange={e => setForm(p => ({ ...p, clienteId: e.target.value }))} style={inp}>
                    <option value="">Selecione</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Descrição *</label>
                  <input value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Ex: Venda de produtos - Abril" style={inp} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={lbl}>Valor (R$) *</label>
                    <input type="number" value={form.valor} min={0} step="any" onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} placeholder="0,00" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Emissão</label>
                    <input type="date" value={form.dataEmissao} onChange={e => setForm(p => ({ ...p, dataEmissao: e.target.value }))} style={inp} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Vencimento *</label>
                  <input type="date" value={form.dataVenc} onChange={e => setForm(p => ({ ...p, dataVenc: e.target.value }))} style={inp} />
                </div>
              </div>
              {error && <p style={{ color: PINK, fontSize: 13, margin: '10px 0 0', padding: '8px 12px', backgroundColor: `${PINK}10`, borderRadius: 8 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                <motion.button onClick={() => setModal(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{ padding: '10px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10, background: 'white', fontSize: 14, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</motion.button>
                <motion.button onClick={criarTitulo} disabled={loading}
                  whileHover={!loading ? { scale: 1.03, backgroundColor: '#4aa344' } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
                  style={{ padding: '10px 20px', backgroundColor: GREEN, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {loading ? 'Salvando...' : 'Criar Título'}
                </motion.button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
