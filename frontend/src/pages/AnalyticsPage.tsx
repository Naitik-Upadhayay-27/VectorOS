import AppLayout from '@/components/layout/AppLayout'
import { TrendingUp, Target, Award, Zap } from 'lucide-react'

const scoreHistory = [65, 68, 70, 72, 75, 72, 78, 80]
const maxScore = 100

const skillGaps = [
  { skill: 'TypeScript', priority: 'high', resources: 'TypeScript Handbook' },
  { skill: 'System Design', priority: 'high', resources: 'Grokking System Design' },
  { skill: 'GraphQL', priority: 'medium', resources: 'How to GraphQL' },
  { skill: 'Docker', priority: 'medium', resources: 'Docker Docs' },
  { skill: 'AWS', priority: 'low', resources: 'AWS Free Tier' },
]

const priorityColor: Record<string, string> = {
  high: 'text-red-600 bg-red-50 border-red-100',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-100',
  low: 'text-green-600 bg-green-50 border-green-100',
}

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Track your progress and identify opportunities</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: Award, label: 'Resume Score', value: '80/100', delta: '+8 this week', color: 'text-brand-500', bg: 'bg-brand-50' },
            { icon: Target, label: 'Avg Match Rate', value: '78%', delta: '+5% vs last week', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: TrendingUp, label: 'Interview Rate', value: '21%', delta: '3 of 14 apps', color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: Zap, label: 'AI Rewrites', value: '24', delta: 'this month', color: 'text-orange-500', bg: 'bg-orange-50' },
          ].map(({ icon: Icon, label, value, delta, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={15} className={color} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-1">{delta}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Score trend */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Resume Score Trend</h3>
            <div className="flex items-end gap-2 h-32">
              {scoreHistory.map((score, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">{score}</span>
                  <div
                    className="w-full bg-brand-500 rounded-t-md transition-all"
                    style={{ height: `${(score / maxScore) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'].map((w) => (
                <span key={w} className="text-xs text-gray-400 flex-1 text-center">{w}</span>
              ))}
            </div>
          </div>

          {/* Application funnel */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Application Funnel</h3>
            <div className="space-y-3">
              {[
                { label: 'Saved', count: 5, pct: 100, color: 'bg-gray-300' },
                { label: 'Applied', count: 14, pct: 90, color: 'bg-brand-400' },
                { label: 'Screened', count: 8, pct: 57, color: 'bg-blue-400' },
                { label: 'Interview', count: 3, pct: 21, color: 'bg-purple-400' },
                { label: 'Offer', count: 1, pct: 7, color: 'bg-green-400' },
              ].map(({ label, count, pct, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skill gaps */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card col-span-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Skill Gap Analysis</h3>
            <div className="space-y-2">
              {skillGaps.map((gap) => (
                <div key={gap.skill} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityColor[gap.priority]}`}>
                      {gap.priority}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{gap.skill}</span>
                  </div>
                  <a href="#" className="text-xs text-brand-500 hover:underline">{gap.resources} →</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  )
}

