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
      <div className="dashboard-content">
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  )
}
