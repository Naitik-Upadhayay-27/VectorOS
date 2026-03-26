import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { API_BASE } from '@/lib/config'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, hasOnboarded } = useAuthStore()
  const { openOnboarding } = useOnboardingStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Login failed')
      login(data.user, data.token, data.refreshToken)
      if (!hasOnboarded) {
        navigate('/dashboard')
        setTimeout(() => openOnboarding(), 50)
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="VectorOS" className="w-20 scale-[3] h-14 object-contain" />
        </div>

        {/* Card */}
        <div className="bg-black border border-purple-500/40 rounded-2xl p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
          <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-white/40 mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/50 block mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.10] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 block mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.10] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-black border border-purple-500 text-white font-semibold text-sm transition-all shadow-[0_0_16px_rgba(168,85,247,0.4)] hover:shadow-[0_0_28px_rgba(168,85,247,0.7)] hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-3 text-xs text-white/25">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.location.href = `${API_BASE}/api/auth/google`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white/[0.08] rounded-xl text-sm font-medium text-white/50 hover:border-purple-500/40 hover:text-white/70 transition-all">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white/[0.08] rounded-xl text-sm font-medium text-white/50 hover:border-purple-500/40 hover:text-white/70 transition-all">
              <img src="https://www.linkedin.com/favicon.ico" className="w-4 h-4" alt="" />
              LinkedIn
            </button>
          </div>

          <p className="text-center text-xs text-white/40 mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

