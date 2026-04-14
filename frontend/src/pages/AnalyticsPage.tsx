import { useEffect, useState } from 'react'
import { TrendingUp, Target, Award, Zap, Briefcase } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'
import { useProfileStore } from '@/store/profileStore'
import { useTemplateResumeStore } from '@/store/templateResumeStore'

type Status = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
interface App { _id: string; status: Status; matchScore?: number; createdAt: string; company: string; jobTitle: string }

export default function AnalyticsPage() {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useProfileStore()
  const resumeData = useTemplateResumeStore(s => s.data)

  
  useEffect(() => {
    apiFetch(`${API_BASE}/api/applications`).then(r => r.json()).then(d => setApps(d.applications ?? [])).finally(() => setLoading(false))
  }, [])

  const total = apps.length
  const applied = apps.filter(a => a.status === 'applied').length
  const interviews = apps.filter(a => a.status === 'interview').length
  const offers = apps.filter(a => a.status === 'offer').length
  const rejected = apps.filter(a => a.status === 'rejected').length
  const withScore = apps.filter(a => a.matchScore)
  const avgMatch = withScore.length ? Math.round(withScore.reduce((s, a) => s + (a.matchScore ?? 0), 0) / withScore.length) : 0
  const interviewRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0
  const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0

  // Group apps by week for trend
  const weeklyApps = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - (7 - i) * 7)
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7)
    return apps.filter(a => { const d = new Date(a.createdAt); return d >= weekStart && d < weekEnd }).length
  })
  const maxWeekly = Math.max(...weeklyApps, 1)

  // Top companies applied to
  const companyCounts = apps.reduce((acc, a) => { acc[a.company] = (acc[a.company] || 0) + 1; return acc }, {} as Record<string, number>)
  const topCompanies = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Skills from resume
  const skills = resumeData.skills?.flatMap(s => s.skills).slice(0, 8) || profile.topSkills.slice(0, 8)

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto bg-[#f4f5f7]">
        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time insights from your job search</p>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { icon: Briefcase, label: 'Total Applications', value: total, delta: `${applied} applied`, color: 'text-gray-900', bg: 'bg-white' },
              { icon: Target, label: 'Avg Match Rate', value: avgMatch ? `${avgMatch}%` : '—', delta: `${withScore.length} scored`, color: 'text-green-600', bg: 'bg-green-50' },
              { icon: TrendingUp, label: 'Interview Rate', value: interviewRate ? `${interviewRate}%` : '—', delta: `${interviews} of ${applied} apps`, color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: Award, label: 'Offer Rate', value: offerRate ? `${offerRate}%` : '—', delta: `${offers} offer${offers !== 1 ? 's' : ''}`, color: 'text-orange-500', bg: 'bg-orange-50' },
            ].map(({ icon: Icon, label, value, delta, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}>
                <div className="flex items-center gap-2 mb-2"><Icon size={14} className={color} /><span className="text-xs text-gray-500">{label}</span></div>
                <p className={`text-2xl font-bold ${color}`}>{loading ? '—' : value}</p>
                <p className="text-xs text-gray-400 mt-1">{delta}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Weekly applications trend */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Applications per Week</h3>
              <div className="flex items-end gap-2 h-28">
                {weeklyApps.map((count, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    {count > 0 && <span className="text-[10px] text-gray-400">{count}</span>}
                    <div className="w-full bg-purple-500 rounded-t-md transition-all" style={{ height: `${(count / maxWeekly) * 100}%`, minHeight: count > 0 ? 4 : 0 }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {['W1','W2','W3','W4','W5','W6','W7','W8'].map(w => <span key={w} className="text-[10px] text-gray-400 flex-1 text-center">{w}</span>)}
              </div>
            </div>

            {/* Application funnel */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Application Funnel</h3>
              <div className="space-y-3">
                {[
                  { label: 'Saved', count: apps.filter(a => a.status === 'saved').length, color: 'bg-gray-300' },
                  { label: 'Applied', count: applied, color: 'bg-blue-400' },
                  { label: 'Interview', count: interviews, color: 'bg-purple-400' },
                  { label: 'Offer', count: offers, color: 'bg-green-400' },
                  { label: 'Rejected', count: rejected, color: 'bg-red-300' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16">{label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-4">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Top companies */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Top Companies Applied</h3>
              {topCompanies.length > 0 ? (
                <div className="space-y-2">
                  {topCompanies.map(([company, count]) => (
                    <div key={company} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                      <span className="text-sm font-medium text-gray-800">{company}</span>
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{count} app{count > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Add applications to see insights</p>
              )}
            </div>

            {/* Skills from resume */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Your Skills</h3>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <span key={s} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg border border-purple-100">{s}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Complete your profile to see skill insights</p>
              )}
              {profile.targetRoles.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Target Roles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.targetRoles.map(r => <span key={r} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">{r}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
