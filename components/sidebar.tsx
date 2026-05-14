'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, ShoppingCart, BarChart2, TrendingUp,
  FileText, RotateCcw, Landmark, Users, LogOut, Sprout,
  Package, ArrowUpFromLine, UserCog, ChevronDown, Receipt,
  Menu, X, Contact, ClipboardList, DollarSign, MoreHorizontal, Boxes,
} from 'lucide-react'

type NavItem = { href: string; label: string; icon: React.ElementType }
type NavSection = { id: string; label: string; color: string; items: NavItem[]; defaultOpen?: boolean }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #5ab952 0%, #3a8435 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            🍓
          </div>
          <div>
            <div style={{ lineHeight: 1.15 }}>
              <span style={{ color: '#e8255a', fontSize: 17, fontWeight: 800, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>do </span>
              <span style={{ color: '#5ab952', fontSize: 17, fontWeight: 800, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>campo</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', margin: '2px 0 0' }}>
              Alimentos · Gestão
            </p>
          </div>
        </div>
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

  return (
    <>
      {/* Hamburger button — mobile only */}
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

      {/* Backdrop — mobile only */}
      {isMobile && mobileOpen && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar-scroll"
        style={{
          width: 248,
          height: '100vh',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(175deg, #1a1f3c 0%, #1e2447 55%, #192039 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          zIndex: isMobile ? 1050 : 'auto',
          overflow: 'hidden',
          transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: isMobile ? 'transform 0.2s ease' : 'none',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
