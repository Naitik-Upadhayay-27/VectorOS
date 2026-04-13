import { useState } from 'react'
import Sidebar from './Sidebar'
import MobileGate from './MobileGate'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem('sidebar-collapsed')
      // Default is expanded (false) — only collapse if user explicitly did so
      return stored !== null ? stored === 'true' : false
    } catch { return false }
  })

  const toggle = () => {
    setCollapsed((v) => {
      const next = !v
      try { localStorage.setItem('sidebar-collapsed', String(next)) } catch {}
      return next
    })
  }

  return (
    <MobileGate>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
        <main className="flex-1 overflow-hidden min-h-0">
          {children}
        </main>
      </div>
    </MobileGate>
  )
}
