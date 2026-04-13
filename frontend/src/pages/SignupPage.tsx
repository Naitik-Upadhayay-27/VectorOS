import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { API_BASE } from '@/lib/config'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, user } = useAuthStore()
  const { openOnboarding } = useOnboardingStore()
  const navigate = useNavigate()

  // Already logged in
  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Signup failed')
      login(data.user, data.token, data.refreshToken)
      navigate('/dashboard')
      // Only new signups get onboarding
      setTimeout(() => openOnboarding(), 50)
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
          <img src="/logo.png" alt="Skill Vector" className="w-20 scale-[3] h-14 object-contain" />
        </div>

        {/* Card */}
        <div className="bg-black border border-purple-500/40 rounded-2xl p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
          <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-white/40 mb-6">Start your AI-powered job search</p>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/50 block mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.10] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all"
              />
            </div>
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
                placeholder="Min. 8 characters"
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
              {loading ? 'Creating account...' : "Create Account — It's Free"}
            </button>
          </form>

          <p className="text-center text-xs text-white/20 mt-4">
            By signing up you agree to our Terms & Privacy Policy
          </p>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-3 text-xs text-white/25">or</span>
            </div>
          </div>

          <button
            onClick={() => window.location.href = `${API_BASE}/api/auth/google`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-white/[0.08] rounded-xl text-sm font-medium text-white/50 hover:border-purple-500/40 hover:text-white/70 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
            Continue with Google
          </button>
          <p className="text-center text-xs text-white/40 mt-3">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

