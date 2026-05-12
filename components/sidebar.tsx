'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  motion, AnimatePresence, useMotionValue,
  useSpring, MotionConfig,
} from 'motion/react'
import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, ShoppingCart, BarChart2, TrendingUp,
  FileText, RotateCcw, Landmark, Users, LogOut, Sprout,
  Package, ArrowUpFromLine, UserCog, ChevronDown, Receipt,
  Menu, X,
} from 'lucide-react'

type NavItem = { href: string; label: string; icon: React.ElementType }
type NavSection = { id: string; label: string; color: string; items: NavItem[] }

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
      { href: '/usuarios', label: 'Usuários', icon: UserCog },
    ],
  },
]

function NavLink({ href, label, icon: Icon, color, index, onClose }: {
  href: string; label: string; icon: React.ElementType; color: string; index: number; onClose?: () => void
}) {
  const pathname = usePathname()
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
  const [hovered, setHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) * 0.12)
    y.set((e.clientY - cy) * 0.12)
  }

  function handleMouseLeave() {
    x.set(0); y.set(0); setHovered(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 24 }}
      style={{ position: 'relative' }}
    >
      {active && (
        <motion.div
          layoutId="active-pill"
          style={{
            position: 'absolute', inset: 0, borderRadius: 10,
            background: `linear-gradient(120deg, ${color}28, ${color}12)`,
            border: `1px solid ${color}40`,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        />
      )}
      <Link
        href={href}
        onClick={onClose}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ textDecoration: 'none', display: 'block', position: 'relative' }}
      >
        <motion.div
          style={{ x: springX, y: springY }}
          animate={{ backgroundColor: hovered && !active ? 'rgba(255,255,255,0.04)' : 'transparent' }}
          transition={{ duration: 0.15 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, position: 'relative', width: '100%' }}>
            {active && (
              <motion.div
                layoutId={`bar-${href}`}
                style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 4px 4px 0', backgroundColor: color,
                  boxShadow: `0 0 8px ${color}`,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <motion.div
              animate={{
                backgroundColor: active ? `${color}30` : hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                scale: hovered ? 1.08 : 1,
                rotate: hovered && !active ? 3 : 0,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                width: 30, height: 30, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <motion.div
                animate={{ color: active ? color : hovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.38)' }}
                transition={{ duration: 0.15 }}
              >
                <Icon size={15} />
              </motion.div>
            </motion.div>
            <motion.span
              animate={{
                color: active ? '#ffffff' : hovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)',
                x: hovered ? 2 : 0,
              }}
              transition={{ duration: 0.15 }}
              style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}
            >
              {label}
            </motion.span>
            {active && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginLeft: 'auto' }}>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

function NavSection({ section, sectionIndex, onClose }: {
  section: NavSection; sectionIndex: number; onClose?: () => void
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const hasActive = section.items.some(item =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: sectionIndex * 0.08, type: 'spring', stiffness: 200, damping: 24 }}
      style={{ marginBottom: 6 }}
    >
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '5px 10px', background: 'none', border: 'none',
          cursor: 'pointer', borderRadius: 8, marginBottom: 3,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <motion.div
            animate={{
              backgroundColor: hasActive ? section.color : 'rgba(255,255,255,0.15)',
              boxShadow: hasActive ? `0 0 8px ${section.color}80` : 'none',
              scale: hasActive ? 1.2 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            style={{ width: 6, height: 6, borderRadius: '50%' }}
          />
          <motion.span
            animate={{ color: hasActive ? section.color : 'rgba(255,255,255,0.28)' }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase' }}
          >
            {section.label}
          </motion.span>
        </div>
        <motion.div
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        >
          <ChevronDown size={11} color="rgba(255,255,255,0.22)" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28, opacity: { duration: 0.15 } }}
            style={{ overflow: 'hidden' }}
          >
            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.04 } }, hide: {} }}
              initial="hide"
              animate="show"
            >
              {section.items.map((item, i) => (
                <NavLink key={item.href} {...item} color={section.color} index={i} onClose={onClose} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
      {/* Background blobs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, #5ab952 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: 80, left: -80,
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, #e87320 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }} />

      {/* Logo */}
      <div style={{ padding: isMobile ? '16px 18px 12px' : '22px 18px 16px', position: 'relative' }}>
        {isMobile && (
          <button
            onClick={close}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
            }}
          >
            <X size={16} />
          </button>
        )}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ display: 'flex', alignItems: 'center', gap: 11 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            whileHover={{ scale: 1.15, rotate: 10 }}
            style={{
              width: 42, height: 42, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, #5ab952 0%, #3a8435 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 4px 16px rgba(90,185,82,0.4)',
              cursor: 'default',
            }}
          >
            🍓
          </motion.div>
          <div>
            <div style={{ lineHeight: 1.1 }}>
              <span style={{ color: '#e8255a', fontSize: 18, fontWeight: 800, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>do </span>
              <span style={{ color: '#5ab952', fontSize: 18, fontWeight: 800, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>campo</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', margin: '2px 0 0' }}>
              Alimentos · Gestão
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        style={{
          height: 1, originX: 0,
          background: 'linear-gradient(90deg, rgba(90,185,82,0.3), rgba(255,255,255,0.06), transparent)',
          margin: '0 16px 10px',
        }}
      />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
        {sections.map((section, i) => (
          <NavSection key={section.id} section={section} sectionIndex={i} onClose={isMobile ? close : undefined} />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 12px 18px', position: 'relative' }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={{
            height: 1, originX: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
            marginBottom: 12,
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 12,
            padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
            cursor: 'default',
          }}
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400 }}
            style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #5ab952, #3a8435)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: 'white',
              boxShadow: '0 2px 8px rgba(90,185,82,0.35)',
            }}
          >
            {initials}
          </motion.div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName || 'Usuário'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userRole ? roleLabel[userRole] ?? userRole : ''}{userEmail ? ` · ${userEmail}` : ''}
            </p>
          </div>
        </motion.div>

        <form action="/api/auth/logout" method="POST">
          <motion.button
            whileHover={{ backgroundColor: 'rgba(232,37,90,0.1)', x: 2, color: '#e8255a' } as never}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            type="submit"
            style={{
              display: 'flex', alignItems: 'center', gap: 9, width: '100%',
              padding: '8px 12px', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            Sair da conta
          </motion.button>
        </form>
      </div>
    </>
  )

  return (
    <MotionConfig reducedMotion="user">
      {/* Hamburger button — mobile only */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{
            position: 'fixed', top: 14, left: 14, zIndex: 1100,
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #1a1f3c, #1e2447)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Backdrop — mobile only */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(3px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="sidebar-scroll"
        animate={isMobile ? { x: mobileOpen ? 0 : -270 } : { x: 0, opacity: 1 }}
        initial={isMobile ? { x: -270 } : { x: -270, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        style={{
          width: 256,
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
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {sidebarContent}
      </motion.aside>
    </MotionConfig>
  )
}
