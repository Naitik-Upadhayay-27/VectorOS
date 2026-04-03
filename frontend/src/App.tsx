import { Routes, Route, Navigate, useEffect } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import ResumeEditorPage from '@/pages/ResumeEditorPage'
import JobsPage from '@/pages/JobsPage'
import ApplicationsPage from '@/pages/ApplicationsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import ProfilePage from '@/pages/ProfilePage'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { useAuthStore } from '@/store/authStore'
import { useDraftStore } from '@/store/draftStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const { user } = useAuthStore()
  const { loadForUser, currentUserId } = useDraftStore()

  // On page refresh, reload drafts for the persisted user
  useEffect(() => {
    if (user && user.id !== currentUserId) {
      loadForUser(user.id)
    }
  }, [user?.id])

  return (
    <>
      <OnboardingFlow />
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/resume/:id" element={<ProtectedRoute><ResumeEditorPage /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

