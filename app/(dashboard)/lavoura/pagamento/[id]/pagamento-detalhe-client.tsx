'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, Printer, CheckCircle, Trash2, MessageCircle, X, Send } from 'lucide-react'
import PageSkeleton from '@/components/page-skeleton'

const GREEN = '#5ab952'
const NAVY = '#2d3561'
const PINK = '#e8255a'
const ORANGE = '#e87320'
const WA = '#25D366'

type Produto = { id: string; nome: string; unidade: string }
type Parceiro = { id: string; nome: string; percentual: number }
type Produtor = { id: string; nome: string; cpf: string | null; telefone: string | null; parceiros: Parceiro[] }
type Colheita = {
  id: string; data: string; produto: Produto
  quantidadeTotal: number; preco: number; qualidade: string | null
  descarte: number; nrDoc: string | null
}
type Fechamento = {
  id: string
  produtor: Produtor
  dataInicio: string; dataFim: string; dataPagamento: string
  valesEmbalagem: number; valesDinheiro: number; creditos: number; debitosAnteriores: number
  status: string; createdAt: string
  colheitas: Colheita[]
}

function fmtBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('pt-BR') }

export default function PagamentoDetalheClient() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [fechamento, setFechamento] = useState<Fechamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [waConfirm, setWaConfirm] = useState(false)
  const [waSending, setWaSending] = useState(false)
  const [waStatus, setWaStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const docRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/fechamento/${id}`).then(r => r.json()).then(setFechamento).finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageSkeleton cards={0} rows={8} />
  if (!fechamento) return <div style={{ padding: 40, color: PINK }}>Fechamento não encontrado.</div>

  const { produtor, colheitas, dataInicio, dataFim, dataPagamento, valesEmbalagem, valesDinheiro, creditos, debitosAnteriores, status } = fechamento

  const totalFaturas = colheitas.reduce((s, c) => s + (c.quantidadeTotal - c.descarte) * c.preco, 0)
  const totalDeducoes = valesEmbalagem + valesDinheiro + creditos + debitosAnteriores
  const aReceber = totalFaturas - totalDeducoes

  async function marcarPago() {
    setMarking(true)
    await fetch(`/api/fechamento/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAGO' }),
    })
    setFechamento(f => f ? { ...f, status: 'PAGO' } : f)
    setMarking(false)
  }

  async function excluir() {
    if (!confirm('Excluir este fechamento?')) return
    setDeleting(true)
    await fetch(`/api/fechamento/${id}`, { method: 'DELETE' })
    router.push('/lavoura/pagamento')
  }

  async function enviarWhatsApp() {
    if (!docRef.current) return
    setWaSending(true)
    setWaStatus(null)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(docRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' })
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
      const caption = `Olá, ${fechamento!.produtor.nome}! Segue seu comprovante de pagamento.\nPeríodo: ${fmtDate(fechamento!.dataInicio)} a ${fmtDate(fechamento!.dataFim)}\nA Receber: ${fmtBRL(aReceber)}`

      const res = await fetch('/api/whatsapp/send-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fechamento!.produtor.telefone, image: base64, caption }),
      })
      const data = await res.json()
      if (res.ok) {
        setWaStatus({ ok: true, msg: 'Enviado com sucesso!' })
        setWaConfirm(false)
        setTimeout(() => setWaStatus(null), 3000)
      } else {
        setWaStatus({ ok: false, msg: data.error ?? 'Erro ao enviar' })
      }
    } catch {
      setWaStatus({ ok: false, msg: 'Erro ao gerar imagem. Tente novamente.' })
    } finally {
      setWaSending(false)
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}
      >
        <div>
          <Link href="/lavoura/pagamento" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 13, textDecoration: 'none', marginBottom: 8 }}>
            <ChevronLeft size={14} /> Pagamentos
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0 }}>Fechamento — {produtor.nome}</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>{fmtDate(dataInicio)} a {fmtDate(dataFim)}</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{
            backgroundColor: status === 'PAGO' ? '#f0faf0' : '#fff7ed',
            color: status === 'PAGO' ? GREEN : ORANGE,
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          }}>{status === 'PAGO' ? 'Pago' : 'Pendente'}</span>

          <motion.button
            onClick={() => window.open(`/imprimir/pagamento/${id}`, '_blank')}
            whileHover={{ scale: 1.04, backgroundColor: '#1e2550', boxShadow: '0 6px 20px rgba(45,53,97,0.4)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', backgroundColor: NAVY, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <Printer size={14} /> Imprimir / PDF
          </motion.button>

          <motion.button
            onClick={() => {
              if (!produtor.telefone) {
                setWaStatus({ ok: false, msg: 'Produtor sem telefone cadastrado.' })
                setTimeout(() => setWaStatus(null), 3500)
                return
              }
              setWaConfirm(true)
              setWaStatus(null)
            }}
            whileHover={{ scale: 1.04, backgroundColor: '#1aa34a', boxShadow: '0 6px 20px rgba(37,211,102,0.4)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', backgroundColor: WA, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <MessageCircle size={14} /> WhatsApp
          </motion.button>

          {status !== 'PAGO' && (
            <motion.button
              onClick={marcarPago} disabled={marking}
              whileHover={!marking ? { scale: 1.04, backgroundColor: '#4aa344', boxShadow: '0 8px 25px rgba(90,185,82,0.45)' } : undefined}
              whileTap={!marking ? { scale: 0.95 } : undefined}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', backgroundColor: GREEN, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: marking ? 0.7 : 1 }}
            >
              <CheckCircle size={14} /> {marking ? 'Salvando...' : 'Marcar como Pago'}
            </motion.button>
          )}

          <motion.button
            onClick={excluir} disabled={deleting}
            whileHover={!deleting ? { scale: 1.1, backgroundColor: '#ffe0e8', boxShadow: `0 6px 18px ${PINK}30` } : undefined}
            whileTap={!deleting ? { scale: 0.88, rotate: -5 } : undefined}
            transition={{ type: 'spring', stiffness: 450, damping: 15 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', backgroundColor: '#fef2f2', color: PINK, border: `1px solid ${PINK}30`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </motion.div>

      {/* Documento */}
      <motion.div
        ref={docRef}
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
        style={{ backgroundColor: 'white', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden' }}
      >
        {/* Cabeçalho do documento */}
        <div style={{ padding: '24px 28px', borderBottom: '2px solid #f3f4f6', background: `linear-gradient(135deg, ${NAVY}08, ${GREEN}06)` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>
                Pagamento de Produtores
              </h2>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                Período: {fmtDate(dataInicio)} a {fmtDate(dataFim)} · Pagamento: {fmtDate(dataPagamento)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Produtor</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '2px 0 0' }}>{produtor.nome}</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>CPF: {produtor.cpf}</p>
            </div>
          </div>
        </div>

        {/* Tabela de colheitas */}
        {colheitas.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            <p>Nenhuma colheita registrada neste período para este produtor.</p>
          </div>
        ) : (
          <div className="table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                {['Data', 'Nº Doc', 'Produto / Qualidade', 'Qtd.', 'Descarte', 'Líquido', 'Preço/cx', 'Sub-total'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: h === 'Sub-total' ? 'right' : 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {colheitas.map((c, i) => {
                const liquido = c.quantidadeTotal - c.descarte
                const sub = liquido * c.preco
                return (
                  <motion.tr key={c.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.03 }}
                    style={{ borderBottom: '1px solid #f3f4f6' }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13, color: NAVY }}>{fmtDate(c.data)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{c.nrDoc ?? '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: NAVY }}>
                      {c.produto.nome}
                      {c.qualidade && <span style={{ fontSize: 11, color: ORANGE, marginLeft: 6, fontWeight: 700 }}>{c.qualidade}</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{c.quantidadeTotal.toFixed(1)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: PINK }}>{c.descarte > 0 ? c.descarte.toFixed(1) : '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: NAVY }}>{liquido.toFixed(1)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{fmtBRL(c.preco)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: GREEN, textAlign: 'right' }}>{fmtBRL(sub)}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}

        {/* Resumo financeiro */}
        <div style={{ padding: '20px 28px', borderTop: '2px solid #f3f4f6' }}>
          <div style={{ maxWidth: 360, marginLeft: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 14, color: '#6b7280' }}>Total Faturas</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{fmtBRL(totalFaturas)}</span>
            </div>
            {valesEmbalagem > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Vales Embalagem</span>
                <span style={{ fontSize: 13, color: PINK }}>- {fmtBRL(valesEmbalagem)}</span>
              </div>
            )}
            {valesDinheiro > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Vales Dinheiro</span>
                <span style={{ fontSize: 13, color: PINK }}>- {fmtBRL(valesDinheiro)}</span>
              </div>
            )}
            {creditos > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Créditos (Coleta e Filmagem)</span>
                <span style={{ fontSize: 13, color: PINK }}>- {fmtBRL(creditos)}</span>
              </div>
            )}
            {debitosAnteriores > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Débitos Anteriores</span>
                <span style={{ fontSize: 13, color: PINK }}>- {fmtBRL(debitosAnteriores)}</span>
              </div>
            )}
            {totalDeducoes > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f3f4f6', marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Total Deduções</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: PINK }}>- {fmtBRL(totalDeducoes)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: aReceber >= 0 ? '#f0faf0' : '#fff0f3', borderRadius: 10, marginTop: 10, border: `2px solid ${aReceber >= 0 ? GREEN : PINK}30` }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>A Receber</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: aReceber >= 0 ? GREEN : PINK }}>{fmtBRL(aReceber)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toast de status WhatsApp */}
      <AnimatePresence>
        {waStatus && (
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
            style={{
              position: 'fixed', bottom: 28, right: 28, zIndex: 2000,
              backgroundColor: waStatus.ok ? '#f0faf0' : '#fff0f3',
              border: `1px solid ${waStatus.ok ? GREEN : PINK}40`,
              color: waStatus.ok ? GREEN : PINK,
              padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600,
              boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
            }}
          >
            {waStatus.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmação WhatsApp */}
      <AnimatePresence>
        {waConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !waSending && setWaConfirm(false)}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1500 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                zIndex: 1600, backgroundColor: 'white', borderRadius: 16, padding: 28,
                width: 'min(420px, 90vw)', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: `${WA}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={18} color={WA} />
                  </div>
                  <p style={{ fontWeight: 700, color: NAVY, fontSize: 15, margin: 0 }}>Enviar pelo WhatsApp</p>
                </div>
                <button onClick={() => setWaConfirm(false)} disabled={waSending}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ backgroundColor: '#f9fafb', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px' }}>Enviar para</p>
                <p style={{ fontWeight: 700, color: NAVY, fontSize: 15, margin: '0 0 2px' }}>{produtor.nome}</p>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{produtor.telefone}</p>
              </div>

              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
                O comprovante de pagamento será gerado como imagem e enviado via WhatsApp.
              </p>

              {waStatus && !waStatus.ok && (
                <p style={{ fontSize: 13, color: PINK, marginBottom: 12, fontWeight: 600 }}>{waStatus.msg}</p>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setWaConfirm(false)} disabled={waSending}
                  style={{ padding: '9px 18px', border: '1.5px solid #e5e7eb', borderRadius: 10, background: 'white', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancelar
                </button>
                <motion.button
                  onClick={enviarWhatsApp} disabled={waSending}
                  whileHover={!waSending ? { scale: 1.04, backgroundColor: '#1aa34a' } : {}}
                  whileTap={!waSending ? { scale: 0.96 } : {}}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', backgroundColor: WA, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: waSending ? 'not-allowed' : 'pointer', opacity: waSending ? 0.75 : 1, fontFamily: 'inherit' }}
                >
                  <Send size={14} />
                  {waSending ? 'Enviando...' : 'Confirmar Envio'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
