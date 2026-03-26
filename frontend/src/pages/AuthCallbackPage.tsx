import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore } from '@/store/onboardingStore'

// Capture URL params immediately at module load time, before any React rendering
const _initialSearch = window.location.search

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { openOnboarding } = useOnboardingStore()

  useEffect(() => {
    // Use the captured search string from module load, not current location
    const params = new URLSearchParams(_initialSearch)
    const token = params.get('token')
    const refreshToken = params.get('refreshToken')
    const userRaw = params.get('user')

    console.log('[AuthCallback] initial search:', _initialSearch.slice(0, 80))
    console.log('[AuthCallback] token:', !!token, 'user:', !!userRaw)

    if (!token || !userRaw) {
      console.error('[AuthCallback] Missing params in:', _initialSearch)
      navigate('/login?error=missing_params', { replace: true })
      return
    }

    try {
      const decoded = atob(userRaw.replace(/-/g, '+').replace(/_/g, '/'))
      const user = JSON.parse(decoded)
      console.log('[AuthCallback] Logging in:', user.email)
      login(user, token, refreshToken ?? undefined)
      navigate('/dashboard', { replace: true })
      if (!useAuthStore.getState().hasOnboarded) {
        setTimeout(() => openOnboarding(), 100)
      }
    } catch (e) {
      console.error('[AuthCallback] Error:', e)
      navigate('/login?error=parse_error', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Signing you in...</p>
      </div>
    </div>
  )
}

