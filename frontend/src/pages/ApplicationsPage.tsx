import { useState } from 'react'
import { Building2, MapPin, Calendar, ChevronDown, Plus } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { clsx } from 'clsx'

type Status = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'

const statusConfig: Record<Status, { label: string; className: string }> = {
  saved:     { label: 'Saved',     className: 'bg-gray-100 text-gray-600 border-gray-200' },
  applied:   { label: 'Applied',   className: 'bg-blue-50 text-blue-700 border-blue-100' },
  interview: { label: 'Interview', className: 'bg-purple-50 text-purple-700 border-purple-100' },
  offer:     { label: 'Offer',     className: 'bg-green-50 text-green-700 border-green-100' },
  rejected:  { label: 'Rejected',  className: 'bg-red-50 text-red-700 border-red-100' },
}

const mockApps = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'Stripe', location: 'Remote', status: 'interview' as Status, appliedAt: '2026-03-15', match: 87 },
  { id: '2', title: 'Product Manager', company: 'Notion', location: 'San Francisco', status: 'applied' as Status, appliedAt: '2026-03-18', match: 74 },
  { id: '3', title: 'Full Stack Engineer', company: 'Linear', location: 'Remote', status: 'offer' as Status, appliedAt: '2026-03-10', match: 91 },
  { id: '4', title: 'Data Scientist', company: 'Anthropic', location: 'San Francisco', status: 'rejected' as Status, appliedAt: '2026-03-05', match: 62 },
  { id: '5', title: 'Backend Engineer', company: 'Vercel', location: 'Remote', status: 'saved' as Status, appliedAt: '', match: 79 },
]

const columns: Status[] = ['saved', 'applied', 'interview', 'offer', 'rejected']

export default function ApplicationsPage() {
  const [apps, setApps] = useState(mockApps)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')

  const byStatus = (s: Status) => apps.filter((a) => a.status === s)

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-sm text-gray-500 mt-1">{apps.length} total applications</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {(['kanban', 'list'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    view === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button size="sm"><Plus size={13} /> Add Application</Button>
          </div>
        </div>

        {view === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
            {columns.map((status) => {
              const { label } = statusConfig[status]
              const items = byStatus(status)
              return (
                <div key={status} className="w-64 shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={statusConfig[status].className}>{label}</Badge>
                    <span className="text-xs text-gray-400">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((app) => (
                      <div key={app.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-card hover:shadow-md transition-shadow cursor-pointer">
                        <p className="text-xs font-semibold text-gray-800 mb-1">{app.title}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <Building2 size={10} /> {app.company}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                          <MapPin size={10} /> {app.location}
                        </div>
                        {app.match && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Match</span>
                            <span className={clsx('text-xs font-semibold', app.match >= 80 ? 'text-green-600' : app.match >= 65 ? 'text-blue-600' : 'text-orange-500')}>
                              {app.match}%
                            </span>
                          </div>
                        )}
                        {app.appliedAt && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <Calendar size={10} /> {app.appliedAt}
                          </div>
                        )}
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
                        No applications
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Role', 'Company', 'Location', 'Status', 'Match', 'Applied'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-gray-800">{app.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{app.company}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{app.location}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusConfig[app.status].className}>{statusConfig[app.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700">{app.match}%</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{app.appliedAt || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

