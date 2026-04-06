import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Briefcase, Send, BarChart2, LogOut, ChevronRight, Sparkles, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { useProfileStore } from '@/store/profileStore'

const nav = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile',          icon: User,            label: 'My Profile' },
  { to: '/resume/resume-1',  icon: FileText,        label: 'Resume Editor' },
  { to: '/jobs',             icon: Briefcase,       label: 'Job Search' },
  { to: '/applications',     icon: Send,            label: 'Applications' },
  { to: '/analytics',        icon: BarChart2,       label: 'Analytics' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { profile } = useProfileStore()
  const navigate = useNavigate()

  return (
    <aside className="w-56 h-screen bg-[#030303] border-r border-white/[0.06] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="VectorOS" className="w-8 h-8 object-contain" />
          <span className="text-white font-bold text-base tracking-tight">VectorOS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-purple-500/15 text-white border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Upgrade card */}
      {user?.plan === 'free' && (
        <div className="mx-3 mb-3 p-3 bg-black border border-purple-500/30 rounded-xl shadow-[0_0_16px_rgba(168,85,247,0.1)]">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={12} className="text-purple-400" />
            <p className="text-xs text-white font-semibold">Upgrade to Pro</p>
          </div>
          <p className="text-[11px] text-white/30 mb-2.5 leading-relaxed">Unlimited AI rewrites + auto-apply</p>
          <button
            onClick={() => { window.location.href = '/#pricing' }}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-black border border-purple-500 text-white text-xs font-semibold rounded-full hover:shadow-[0_0_12px_rgba(168,85,247,0.5)] transition-all">
            Upgrade <ChevronRight size={11} />
          </button>
        </div>
      )}

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3 space-y-0.5">
        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Sign out
        </button>
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="w-7 h-7 rounded-full bg-purple-500/30 border border-purple-500/50 flex items-center justify-center text-purple-300 text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">{user?.name}</p>
            <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

