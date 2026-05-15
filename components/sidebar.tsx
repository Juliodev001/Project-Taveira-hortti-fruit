'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, ShoppingCart, BarChart2, TrendingUp,
  FileText, RotateCcw, Landmark, Users, LogOut, Sprout,
  Package, ArrowUpFromLine, UserCog, ChevronDown, ChevronLeft, Receipt,
  Menu, X, Contact, ClipboardList, DollarSign, MoreHorizontal, Boxes, Wifi,
} from 'lucide-react'

type NavItem = { href: string; label: string; icon: React.ElementType }
type NavSection = { id: string; label: string; color: string; items: NavItem[]; defaultOpen?: boolean }

const logoWrapStyle: React.CSSProperties = { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }

const sections: NavSection[] = [
  {
    id: 'geral', label: 'Geral', color: '#6c7fc4',
    items: [{ href: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    id: 'lavoura', label: 'Lavoura', color: '#5ab952',
    items: [
      { href: '/lavoura', label: 'Dashboard Lavoura', icon: Sprout },
      { href: '/lavoura/colheita', label: 'Colheitas', icon: BarChart2 },
      { href: '/lavoura/pagamento', label: 'Pagamentos', icon: Receipt },
      { href: '/lavoura/saida', label: 'Saída de Produção', icon: ArrowUpFromLine },
      { href: '/produtos', label: 'Produtos', icon: Package },
      { href: '/estoque', label: 'Administração', icon: Boxes },
    ],
  },
  {
    id: 'financeiro', label: 'Financeiro', color: '#e87320',
    items: [
      { href: '/compras', label: 'Compras', icon: ShoppingCart },
      { href: '/vendas', label: 'Vendas', icon: TrendingUp },
      { href: '/nfe', label: 'NF-e', icon: FileText },
      { href: '/devolucoes', label: 'Devoluções', icon: RotateCcw },
      { href: '/caixa', label: 'Caixa', icon: Landmark },
    ],
  },
  {
    id: 'gestao', label: 'Gestão', color: '#3d6b6e',
    items: [
      { href: '/produtores', label: 'Produtores', icon: Users },
      { href: '/clientes', label: 'Clientes', icon: Contact },
      { href: '/usuarios', label: 'Usuários', icon: UserCog },
    ],
  },
  {
    id: 'mais', label: 'Mais', color: '#8b5cf6', defaultOpen: false,
    items: [
      { href: '/romaneios', label: 'Romaneios', icon: ClipboardList },
      { href: '/contas-receber', label: 'Contas a Receber', icon: DollarSign },
      { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
    ],
  },
]

function NavLink({ href, label, icon: Icon, color, onClose }: {
  href: string; label: string; icon: React.ElementType; color: string; onClose?: () => void
}) {
  const pathname = usePathname()
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onClose}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          borderRadius: 6,
          position: 'relative',
          borderLeft: active ? `3px solid ${color}` : '3px solid transparent',
          backgroundColor: active ? `${color}18` : 'transparent',
          transition: 'background-color 0.1s',
          marginBottom: 2,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!active) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)'
        }}
        onMouseLeave={(e) => {
          if (!active) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: active ? color : 'rgba(255,255,255,0.45)',
          }}
        >
          <Icon size={16} />
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: active ? 600 : 400,
            color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
          }}
        >
          {label}
        </span>
        {active && (
          <div
            style={{
              marginLeft: 'auto',
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
        )}
      </div>
    </Link>
  )
}

function NavSection({ section, onClose }: {
  section: NavSection; onClose?: () => void
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(section.defaultOpen ?? true)
  const hasActive = section.items.some(item =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  )
  const isMais = section.id === 'mais'

  return (
    <div style={{ marginBottom: isMais ? 0 : 4 }}>
      {isMais ? (
        /* Botão "Mais" com visual especial + Framer Motion */
        <motion.button
          onClick={() => setOpen(o => !o)}
          whileHover={{
            backgroundColor: open ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.08)',
            borderColor: 'rgba(139,92,246,0.4)',
            scale: 1.01,
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '8px 10px',
            background: open ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${open ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
            cursor: 'pointer',
            borderRadius: 8,
            marginBottom: open ? 6 : 0,
            marginTop: 8,
          }}
        >
          <motion.div
            animate={{ rotate: open ? 360 : 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <MoreHorizontal size={14} color={open || hasActive ? '#8b5cf6' : 'rgba(255,255,255,0.4)'} />
          </motion.div>
          <span style={{ fontSize: 12, fontWeight: 700, color: open || hasActive ? '#8b5cf6' : 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
            Mais
          </span>
          <motion.div
            style={{ marginLeft: 'auto', display: 'flex' }}
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <ChevronDown size={11} color={open || hasActive ? '#8b5cf6' : 'rgba(255,255,255,0.25)'} />
          </motion.div>
        </motion.button>
      ) : (
        <motion.button
          onClick={() => setOpen(o => !o)}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '5px 10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 6,
            marginBottom: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{ backgroundColor: hasActive ? section.color : 'rgba(255,255,255,0.2)', scale: hasActive ? 1.3 : 1 }}
              transition={{ duration: 0.2 }}
              style={{ width: 5, height: 5, borderRadius: '50%' }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: hasActive ? section.color : 'rgba(255,255,255,0.35)',
              }}
            >
              {section.label}
            </span>
          </div>
          <motion.div
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            style={{ display: 'flex' }}
          >
            <ChevronDown size={11} color="rgba(255,255,255,0.25)" />
          </motion.div>
        </motion.button>
      )}

      {isMais ? (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="mais-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden', paddingLeft: 4 }}
            >
              {section.items.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.22, ease: 'easeOut' }}
                >
                  <NavLink {...item} color={section.color} onClose={onClose} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key={section.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {section.items.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.2, ease: 'easeOut' }}
                >
                  <NavLink {...item} color={section.color} onClose={onClose} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

export default function Sidebar({ userEmail, userName, userRole }: {
  userEmail?: string; userName?: string; userRole?: string
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const close = useCallback(() => setMobileOpen(false), [])

  const initials = userName
    ? userName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const roleLabel: Record<string, string> = { DONO: 'Dono', PARCEIRO: 'Parceiro', GERENTE: 'Gerente' }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{ padding: isMobile ? '16px 16px 12px' : '20px 16px 14px', position: 'relative', flexShrink: 0 }}>
        {isMobile && (
          <button
            onClick={close}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            <X size={15} />
          </button>
        )}
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={logoWrapStyle}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
            style={{ flexShrink: 0 }}
          >
            <Image
              src="/logo01.png"
              alt="Do Campo Alimentos"
              width={110}
              height={66}
              style={{ objectFit: 'contain', borderRadius: 8, display: 'block' }}
              priority
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
            }}>
              Sistema de
            </span>
            <span style={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '0.5px',
              background: 'linear-gradient(90deg, #5ab952, #a8e063)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>
              Gestão
            </span>
            <div style={{
              height: 2,
              width: 32,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #5ab952, transparent)',
            }} />
          </motion.div>
        </motion.div>
      </div>

      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, rgba(90,185,82,0.25), rgba(255,255,255,0.05), transparent)',
        margin: '0 14px 10px',
        flexShrink: 0,
      }} />

      {/* Nav */}
      <nav className="sidebar-nav-scroll" style={{ flex: 1, padding: '2px 8px' }}>
        {sections.map((section) => (
          <NavSection key={section.id} section={section} onClose={isMobile ? close : undefined} />
        ))}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8, paddingTop: 8 }}>
          <NavLink href="/conexoes" label="Conexões" icon={Wifi} color="#25D366" onClose={isMobile ? close : undefined} />
        </div>
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 12px 16px', flexShrink: 0 }}>
        <div style={{
          height: 1,
          background: 'rgba(255,255,255,0.07)',
          marginBottom: 10,
        }} />
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 8,
            padding: '10px 12px',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #5ab952, #3a8435)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: 'white',
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName || 'Usuário'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userRole ? roleLabel[userRole] ?? userRole : ''}{userEmail ? ` · ${userEmail}` : ''}
            </p>
          </div>
        </div>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.45)',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'background-color 0.1s, color 0.1s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(232,37,90,0.1)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#e8255a'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.03)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'
            }}
          >
            <LogOut size={14} />
            Sair da conta
          </button>
        </form>
      </div>
    </>
  )

  const asideBase: React.CSSProperties = {
    width: 248,
    height: '100vh',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(175deg, #1a1f3c 0%, #1e2447 55%, #192039 100%)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    overflow: 'hidden',
  }

  return (
    <>
      {/* Hamburger button — mobile open trigger */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{
            position: 'fixed',
            top: 14,
            left: 14,
            zIndex: 1100,
            width: 38,
            height: 38,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #1a1f3c, #1e2447)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
          aria-label="Abrir menu"
        >
          <Menu size={17} />
        </button>
      )}

      {/* Desktop collapse handle — on sidebar right border */}
      <AnimatePresence>
        {!isMobile && !collapsed && (
          <motion.button
            key="collapse-handle"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
            whileHover={{ scale: 1.18, borderColor: 'rgba(90,185,82,0.5)', color: '#5ab952' }}
            whileTap={{ scale: 0.88 }}
            onClick={() => setCollapsed(true)}
            style={{
              position: 'fixed',
              left: 235,
              top: 'calc(50vh - 13px)',
              zIndex: 1100,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: '#1a2040',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)',
              boxShadow: '2px 0 10px rgba(0,0,0,0.35)',
            }}
            aria-label="Recolher sidebar"
          >
            <ChevronLeft size={13} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating re-open button — desktop collapsed */}
      <AnimatePresence>
        {!isMobile && collapsed && (
          <motion.button
            key="reopen"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ scale: 1.08, backgroundColor: '#252c52' }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setCollapsed(false)}
            style={{
              position: 'fixed',
              top: 14,
              left: 14,
              zIndex: 1100,
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1a1f3c, #1e2447)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
            aria-label="Expandir sidebar"
          >
            <Menu size={17} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop — mobile only */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)' }}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar — collapse animation */}
      {!isMobile && (
        <motion.div
          animate={{ width: collapsed ? 0 : 248 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ flexShrink: 0, overflow: 'hidden', position: 'sticky', top: 0, height: '100vh' }}
        >
          <motion.aside
            className="sidebar-scroll"
            animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -24 : 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={asideBase}
          >
            {sidebarContent}
          </motion.aside>
        </motion.div>
      )}

      {/* Mobile sidebar — CSS slide */}
      {isMobile && (
        <aside
          className="sidebar-scroll"
          style={{
            ...asideBase,
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1050,
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.22s ease',
          }}
        >
          {sidebarContent}
        </aside>
      )}
    </>
  )
}
