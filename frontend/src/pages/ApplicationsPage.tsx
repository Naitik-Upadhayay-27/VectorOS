import { useState, useEffect } from "react"
import { Building2, MapPin, Calendar, Plus, Trash2, ExternalLink, Search } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { apiFetch } from "@/lib/apiFetch"
import { API_BASE } from "@/lib/config"

type Status = "saved" | "applied" | "interview" | "offer" | "rejected"

const STATUS_CONFIG = {
  saved:     { label: "Saved",     color: "bg-gray-100 text-gray-600",    dot: "bg-gray-400" },
  applied:   { label: "Applied",   color: "bg-blue-50 text-blue-700",     dot: "bg-blue-500" },
  interview: { label: "Interview", color: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
  offer:     { label: "Offer",     color: "bg-green-50 text-green-700",   dot: "bg-green-500" },
  rejected:  { label: "Rejected",  color: "bg-red-50 text-red-600",       dot: "bg-red-400" },
} as const

interface App {
  _id: string; jobTitle: string; company: string; location?: string
  jobUrl?: string; status: Status; matchScore?: number; appliedAt?: string; createdAt: string
}

const COLS: Status[] = ["saved", "applied", "interview", "offer", "rejected"]

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState("")
  const [addForm, setAddForm] = useState({ jobTitle: "", company: "", location: "", jobUrl: "", status: "saved" as Status })

  useEffect(() => {
    apiFetch(`${API_BASE}/api/applications`).then(r => r.json()).then(d => setApps(d.applications ?? [])).finally(() => setLoading(false))
  }, [])

  const addApp = async () => {
    if (!addForm.jobTitle || !addForm.company) return
    const res = await apiFetch(`${API_BASE}/api/applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) })
    const d = await res.json()
    setApps(a => [d.application, ...a])
    setShowAdd(false)
    setAddForm({ jobTitle: "", company: "", location: "", jobUrl: "", status: "saved" })
  }

  const updateStatus = async (id: string, status: Status) => {
    setApps(a => a.map(x => x._id === id ? { ...x, status } : x))
    await apiFetch(`${API_BASE}/api/applications/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
  }

  const deleteApp = async (id: string) => {
    setApps(a => a.filter(x => x._id !== id))
    await apiFetch(`${API_BASE}/api/applications/${id}`, { method: "DELETE" })
  }

  const filtered = apps.filter(a => !search || a.jobTitle.toLowerCase().includes(search.toLowerCase()) || a.company.toLowerCase().includes(search.toLowerCase()))
  const byStatus = (s: Status) => filtered.filter(a => a.status === s)
  const stats = { total: apps.length, applied: apps.filter(a => a.status === "applied").length, interview: apps.filter(a => a.status === "interview").length, offer: apps.filter(a => a.status === "offer").length }

  return (
    <AppLayout>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[440px] mx-4">
            <h3 className="text-base font-bold text-gray-900 mb-4">Add Application</h3>
            <div className="space-y-3">
              {([["jobTitle","Job Title","e.g. Frontend Engineer"],["company","Company","e.g. Google"],["location","Location","e.g. Remote"],["jobUrl","Job URL","https://..."]] as [string,string,string][]).map(([k,l,p]) => (
                <div key={k}>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{l}</label>
                  <input value={(addForm as any)[k]} onChange={e => setAddForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-400" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {COLS.map(st => (
                    <button key={st} onClick={() => setAddForm(f => ({ ...f, status: st }))}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border capitalize transition-all ${addForm.status === st ? "bg-purple-600 text-white border-purple-600" : "border-gray-200 text-gray-600"}`}>
                      {STATUS_CONFIG[st].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={addApp} disabled={!addForm.jobTitle || !addForm.company}
                className="flex-1 py-2.5 bg-purple-600 disabled:opacity-50 rounded-xl text-sm font-semibold text-white">Add</button>
            </div>
          </div>
        </div>
      )}
      <div className="h-full overflow-y-auto bg-[#f4f5f7]">
        <div className="px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
              <p className="text-sm text-gray-500 mt-0.5">{stats.total} total · {stats.interview} interviews · {stats.offer} offers</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                  className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-purple-400 bg-white w-48" />
              </div>
              <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl">
                {(["kanban", "list"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${view === v ? "bg-purple-600 text-white" : "text-gray-500"}`}>{v}</button>
                ))}
              </div>
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl">
                <Plus size={13} /> Add Application
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[{l:"Total",v:stats.total,c:"text-gray-900",bg:"bg-white"},{l:"Applied",v:stats.applied,c:"text-blue-600",bg:"bg-blue-50"},{l:"Interviews",v:stats.interview,c:"text-purple-600",bg:"bg-purple-50"},{l:"Offers",v:stats.offer,c:"text-green-600",bg:"bg-green-50"}].map(({l,v,c,bg}) => (
              <div key={l} className={`${bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}>
                <p className="text-xs text-gray-500 mb-1">{l}</p>
                <p className={`text-3xl font-bold ${c}`}>{v}</p>
              </div>
            ))}
          </div>
          {loading ? <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading...</div>
          : view === "kanban" ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {COLS.map(status => {
                const items = byStatus(status); const cfg = STATUS_CONFIG[status]
                return (
                  <div key={status} className="w-64 shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="text-xs font-bold text-gray-700">{cfg.label}</span>
                      <span className="text-xs text-gray-400 ml-auto">{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map(app => (
                        <div key={app._id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-xs font-bold text-gray-800 flex-1 pr-2">{app.jobTitle}</p>
                            <button onClick={() => deleteApp(app._id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-400"><Trash2 size={11} /></button>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1"><Building2 size={10} /> {app.company}</div>
                          {app.location && <div className="flex items-center gap-1 text-[11px] text-gray-400"><MapPin size={10} /> {app.location}</div>}
                          <div className="flex items-center justify-between mt-2">
                            <select value={app.status} onChange={e => updateStatus(app._id, e.target.value as Status)}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-0 outline-none cursor-pointer ${cfg.color}`}>
                              {COLS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                            </select>
                            {app.matchScore && <span className="text-[10px] font-bold text-green-600">{app.matchScore}%</span>}
                          </div>
                          {app.appliedAt && <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1"><Calendar size={9} /> {new Date(app.appliedAt).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</div>}
                        </div>
                      ))}
                      {items.length === 0 && <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">No applications</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{["Role","Company","Location","Status","Match","Applied",""].map(h => <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(app => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs font-semibold text-gray-800">{app.jobTitle}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{app.company}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{app.location || "—"}</td>
                      <td className="px-4 py-3">
                        <select value={app.status} onChange={e => updateStatus(app._id, e.target.value as Status)}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_CONFIG[app.status].color}`}>
                          {COLS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-700">{app.matchScore ? `${app.matchScore}%` : "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString(undefined,{month:"short",day:"numeric"}) : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noreferrer" className="p-1 text-gray-400 hover:text-purple-500"><ExternalLink size={12} /></a>}
                          <button onClick={() => deleteApp(app._id)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No applications yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
