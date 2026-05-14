'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Users, Plus, Search, Pencil, Trash2, Phone, Mail, FileText, X } from 'lucide-react'

const GREEN = '#5ab952'
const NAVY = '#2d3561'
const PINK = '#e8255a'

type Cliente = {
  id: string
  nome: string
  cnpjCpf: string | null
  telefone: string | null
  email: string | null
  createdAt: string
  _count?: { nfes: number }
}

const empty = { nome: '', cnpjCpf: '', telefone: '', email: '' }

export default function ClientesClient({ clientes: inicial }: { clientes: Cliente[] }) {
  const [clientes, setClientes] = useState(inicial)
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtrados = clientes.filter(c =>
    !q ||
    c.nome.toLowerCase().includes(q.toLowerCase()) ||
    (c.cnpjCpf ?? '').includes(q) ||
    (c.telefone ?? '').includes(q)
  )

  function openCreate() {
    setEditing(null)
    setForm(empty)
    setError('')
    setModal(true)
  }

  function openEdit(c: Cliente) {
    setEditing(c)
    setForm({ nome: c.nome, cnpjCpf: c.cnpjCpf ?? '', telefone: c.telefone ?? '', email: c.email ?? '' })
    setError('')
    setModal(true)
  }

  function closeModal() {
    setModal(false)
    setEditing(null)
    setForm(empty)
    setError('')
  }

  async function handleSave() {
    if (!form.nome.trim()) { setError('Nome é obrigatório'); return }
    setLoading(true)
    setError('')
    try {
      const body = { nome: form.nome.trim(), cnpjCpf: form.cnpjCpf || null, telefone: form.telefone || null, email: form.email || null }
      if (editing) {
        const res = await fetch(`/api/clientes/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!res.ok) throw new Error((await res.json()).error || 'Erro ao salvar')
        const updated = await res.json()
        setClientes(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c))
      } else {
        const res = await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!res.ok) throw new Error((await res.json()).error || 'Erro ao criar')
        const novo = await res.json()
        setClientes(prev => [novo, ...prev])
      }
      closeModal()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir')
      setClientes(prev => prev.filter(c => c.id !== id))
    } catch {
      alert('Não foi possível excluir. O cliente pode ter NF-e ou devoluções vinculadas.')
    } finally {
      setLoading(false)
      setConfirmDelete(null)
    }
  }

  const inp = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' }
  const lbl = { fontSize: 13, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 5 } as React.CSSProperties

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0 }}>Clientes</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Cadastro e gestão de clientes</p>
        </div>
        <motion.button
          onClick={openCreate}
          whileHover={{ scale: 1.03, backgroundColor: '#4aa344' }}
          whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', backgroundColor: GREEN, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <Plus size={15} /> Novo Cliente
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}
      >
        {[
          { label: 'Total de Clientes', value: clientes.length, color: NAVY, icon: Users },
          { label: 'Com NF-e emitida', value: clientes.filter(c => (c._count?.nfes ?? 0) > 0).length, color: GREEN, icon: FileText },
          { label: 'Cadastrados este mês', value: clientes.filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth()).length, color: '#e87320', icon: Plus },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 + 0.1, duration: 0.4, type: 'spring', stiffness: 180 }}
            style={{ backgroundColor: 'white', borderRadius: 14, padding: '18px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>{label}</p>
                <p style={{ color, fontSize: 28, fontWeight: 700, margin: '4px 0 0' }}>{value}</p>
              </div>
              <div style={{ backgroundColor: `${color}15`, borderRadius: 10, padding: 10 }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
        style={{ backgroundColor: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <h3 style={{ margin: 0, color: NAVY, fontSize: 15, fontWeight: 600 }}>Clientes Cadastrados</h3>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Buscar por nome, CPF/CNPJ..."
              style={{ ...inp, paddingLeft: 36, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
            />
          </div>
        </div>

        {filtrados.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 64, textAlign: 'center', color: '#9ca3af' }}>
            <Users size={40} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontWeight: 600, margin: '0 0 6px' }}>Nenhum cliente encontrado</p>
            <p style={{ fontSize: 13, margin: 0 }}>Clique em &quot;Novo Cliente&quot; para cadastrar</p>
          </motion.div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                {['Nome', 'CPF / CNPJ', 'Telefone', 'E-mail', 'NF-e', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.04 }}
                  whileHover={{ backgroundColor: '#f8fffe' }}
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                >
                  <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 600, color: NAVY }}>{c.nome}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{c.cnpjCpf ?? <span style={{ color: '#d1d5db' }}>—</span>}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>
                    {c.telefone
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={12} />{c.telefone}</span>
                      : <span style={{ color: '#d1d5db' }}>—</span>}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>
                    {c.email
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12} />{c.email}</span>
                      : <span style={{ color: '#d1d5db' }}>—</span>}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ backgroundColor: `${NAVY}12`, color: NAVY, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {c._count?.nfes ?? 0} NF-e
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <motion.button onClick={() => openEdit(c)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        style={{ background: `${NAVY}12`, border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: NAVY }}>
                        <Pencil size={13} />
                      </motion.button>
                      <motion.button onClick={() => setConfirmDelete(c.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        style={{ background: `${PINK}12`, border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: PINK }}>
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Modal criar/editar */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000 }} />
            <div className="modal-wrapper">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              style={{ backgroundColor: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0 }}>{editing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <motion.button onClick={closeModal} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#6b7280' }}>
                  <X size={16} />
                </motion.button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={lbl}>Nome *</label>
                  <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                    placeholder="Nome completo ou razão social" style={inp} autoFocus />
                </div>
                <div>
                  <label style={lbl}>CPF / CNPJ</label>
                  <input value={form.cnpjCpf} onChange={e => setForm(p => ({ ...p, cnpjCpf: e.target.value }))}
                    placeholder="000.000.000-00 ou 00.000.000/0001-00" style={inp} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lbl}>Telefone</label>
                    <input value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}
                      placeholder="(00) 00000-0000" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>E-mail</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="email@exemplo.com" style={inp} />
                  </div>
                </div>
              </div>

              {error && (
                <p style={{ color: PINK, fontSize: 13, margin: '12px 0 0', padding: '8px 12px', backgroundColor: `${PINK}10`, borderRadius: 8 }}>{error}</p>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
                <motion.button onClick={closeModal} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{ padding: '10px 18px', border: '1.5px solid #e5e7eb', borderRadius: 10, background: 'white', fontSize: 14, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={handleSave} disabled={loading}
                  whileHover={!loading ? { scale: 1.03, backgroundColor: '#4aa344' } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  style={{ padding: '10px 22px', backgroundColor: GREEN, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {loading ? 'Salvando...' : editing ? 'Salvar' : 'Cadastrar'}
                </motion.button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000 }} />
            <div className="modal-wrapper">
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{ backgroundColor: 'white', borderRadius: 14, padding: 24, width: 320, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${PINK}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Trash2 size={20} color={PINK} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>Excluir cliente?</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>Esta ação não pode ser desfeita.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button onClick={() => setConfirmDelete(null)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{ flex: 1, padding: '10px', border: '1.5px solid #e5e7eb', borderRadius: 10, background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={() => handleDelete(confirmDelete)} disabled={loading}
                  whileHover={{ scale: 1.02, backgroundColor: '#c91845' }} whileTap={{ scale: 0.97 }}
                  style={{ flex: 1, padding: '10px', backgroundColor: PINK, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {loading ? 'Excluindo...' : 'Excluir'}
                </motion.button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
