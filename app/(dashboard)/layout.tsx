import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import Sidebar from '@/components/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f8' }}>
      <Sidebar
        userEmail={session.email}
        userName={session.name ?? undefined}
        userRole={session.role}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <main style={{
          flex: 1,
          padding: '28px 32px',
          overflowY: 'auto',
          maxWidth: 1400,
          width: '100%',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
