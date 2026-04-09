import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FileText, Briefcase, TrendingUp, ArrowRight, Plus, Clock, Trash2, Sparkles, Download, Send, Calendar, Eye, AlertTriangle, User } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/store/authStore'
import { useDraftStore, type ResumeDraft } from '@/store/draftStore'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useChatStore } from '@/store/chatStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useProfileStore } from '@/store/profileStore'
import { useAtsStore } from '@/store/atsStore'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'
import { TEMPLATES } from '@/components/resume-templates'

const PAGE_W = 794
const PAGE_H = 1123
const THUMB_SCALE = 0.28

// Renders a live scaled-down resume preview
function ResumeThumbnail({ draft }: { draft: ResumeDraft }) {
  const template = TEMPLATES.find((t) => t.id === draft.templateId) ?? TEMPLATES[0]
  const Comp = template.component
  const thumbW = PAGE_W * THUMB_SCALE
  const thumbH = PAGE_H * THUMB_SCALE
  return (
    <div style={{ width: thumbW, height: thumbH, overflow: 'hidden', position: 'relative', background: '#fff' }}>
      <div style={{
        width: PAGE_W,
        height: PAGE_H,
        transformOrigin: 'top left',
        transform: `scale(${THUMB_SCALE})`,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
      }}>
        <Comp data={draft.resumeData} />
      </div>
    </div>
  )
}

// Delete confirmation modal
function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Delete Resume?</p>
            <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete <span className="font-semibold">"{name}"</span>? All saved data and chat history will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { drafts, deleteDraft, setActiveDraft } = useDraftStore()
  const resumeData = useTemplateResumeStore((s) => s.data)
  const { data: onboarding, openOnboarding, reset: resetOnboarding } = useOnboardingStore()
  const { profile } = useProfileStore()
  // Reactive — subscribes to store so count updates live
  const aiMessages = useChatStore((s) => Math.max(0, s.messages.filter(m => m.role === 'assistant').length - 1))
  const atsResult = useAtsStore((s) => s.result)
  const hasResume = !!resumeData.personalInfo?.name
  const activeDraft = drafts[0] // most recently saved
  const [deleteTarget, setDeleteTarget] = useState<ResumeDraft | null>(null)
  const [appStats, setAppStats] = useState({ total: 0, interview: 0, offer: 0 })

  useEffect(() => {
    apiFetch(`${API_BASE}/api/applications`).then(r => r.json()).then(d => {
      const apps = d.applications ?? []
      setAppStats({
        total: apps.length,
        interview: apps.filter((a: any) => a.status === 'interview').length,
        offer: apps.filter((a: any) => a.status === 'offer').length,
      })
    }).catch(() => {})
  }, [])

  const loadDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId)
    if (!draft) return
    const store = useTemplateResumeStore.getState()
    store.resetData(draft.resumeData)
    store.setTemplate(draft.templateId)
    if (draft.sectionOrder?.length) store.setSectionOrder(draft.sectionOrder)
    if (draft.layout && Object.keys(draft.layout).length) store.setLayout(draft.layout)
    const chatStore = useChatStore.getState()
    chatStore.clearMessages()
    draft.chatMessages.forEach((msg) => chatStore.addMessage(msg))
    useAtsStore.getState().setResult(draft.atsResult ?? null)
    setActiveDraft(draftId)
    navigate('/resume/resume-1')
  }

  const downloadDraft = (e: React.MouseEvent, draft: ResumeDraft) => {
    e.stopPropagation()
    // Load the draft, navigate to editor, then trigger print
    useTemplateResumeStore.getState().resetData(draft.resumeData)
    useTemplateResumeStore.getState().setTemplate(draft.templateId)
    setActiveDraft(draft.id)
    navigate('/resume/resume-1?print=1')
  }

  const confirmDelete = () => {
    if (deleteTarget) { deleteDraft(deleteTarget.id); setDeleteTarget(null) }
  }

  return (
    <AppLayout>
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      <div className="h-full overflow-y-auto bg-[#f4f5f7]">
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">

          {/* ── Hero row ─────────────────────────────────────────────── */}
          <div className="flex items-start gap-6">
            {/* Welcome text */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, <span className="text-purple-600">{user?.name?.split(' ')[0] ?? 'there'}</span>.
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                {hasResume
                  ? <>Your resume is ready for <span className="text-purple-600 font-semibold">{onboarding.jobTitle || 'your target role'}</span>. Run an ATS analysis to see how you score.</>
                  : 'Upload your resume or start from scratch to get AI-powered coaching and ATS scoring.'}
              </p>
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => navigate('/resume/resume-1')}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
                >
                  {hasResume ? 'Edit Resume' : 'Create New Resume'}
                </button>
                <button
                  onClick={() => navigate('/jobs')}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:bg-gray-50 transition-colors"
                >
                  View Jobs
                </button>
              </div>
            </div>

            {/* Stat cards */}
            <div className="flex gap-4 shrink-0">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm min-w-[130px]">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Resumes</p>
                <p className="text-4xl font-bold text-gray-900">{String(drafts.length).padStart(2, '0')}</p>
                <p className="text-[11px] text-purple-500 mt-1 flex items-center gap-1">
                  <TrendingUp size={10} /> {drafts.length > 0 ? `${drafts.length} saved` : 'No drafts yet'}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm min-w-[130px]">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Applications</p>
                <p className="text-4xl font-bold text-gray-900">{String(appStats.total).padStart(2, '0')}</p>
                <p className="text-[11px] text-purple-500 mt-1 flex items-center gap-1">
                  <Send size={10} /> {appStats.interview} interviews
                </p>
              </div>
              <div className="bg-purple-600 rounded-2xl p-5 min-w-[160px] relative overflow-hidden cursor-pointer" onClick={() => navigate('/profile')}>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-purple-200 mb-2">Target Role</p>
                <p className="text-lg font-bold text-white leading-tight truncate max-w-[130px]">
                  {profile.targetRoles[0] || onboarding.jobTitle || '—'}
                </p>
                <p className="text-[11px] text-purple-300 mt-1 truncate">
                  {profile.profileCompleteness}% profile complete
                </p>
              </div>
            </div>
          </div>

          {/* ── My Resumes ───────────────────────────────────────────── */}
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Resumes</h2>
                <p className="text-sm text-gray-400 mt-0.5">Tailored versions for different roles</p>
              </div>
              <button className="text-sm text-purple-600 font-semibold flex items-center gap-1 hover:text-purple-700">
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Draft cards */}
              {drafts.slice(0, 2).map((draft) => (
                <div
                  key={draft.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                  onClick={() => loadDraft(draft.id)}
                >
                  {/* Live resume thumbnail */}
                  <div className="flex justify-center overflow-hidden rounded-t-2xl border-b border-gray-100 bg-gray-50">
                    <ResumeThumbnail draft={draft} />
                  </div>
                  {/* Footer */}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">{draft.name}</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(draft.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => downloadDraft(e, draft)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-purple-500 transition-colors"
                        title="Download PDF"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(draft) }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create new draft card */}
              <button
                onClick={() => {
                  resetOnboarding()
                  useChatStore.getState().clearMessages()
                  useAtsStore.getState().clearResult()
                  useDraftStore.getState().setActiveDraft(null)
                  openOnboarding()
                }}
                className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex flex-col items-center justify-center gap-3 min-h-[220px] group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                  <Plus size={18} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-gray-500 group-hover:text-purple-600 transition-colors">Create New Resume</p>
                <p className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors">Upload or start from scratch</p>
              </button>
            </div>
          </div>

          {/* ── Bottom 2-col ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-6">

            {/* Quick Actions (styled like Curated Matches) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                {onboarding.targetDomains.length > 0 && (
                  <span className="text-[11px] bg-purple-100 text-purple-600 font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> AI Ready
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {[
                  { icon: FileText,  label: 'Resume Editor',  sub: 'Edit & optimize with AI',    to: '/resume/resume-1', match: 'Open Editor' },
                  { icon: Briefcase, label: 'Job Search',     sub: 'Find matching opportunities', to: '/jobs',            match: 'Browse Jobs' },
                  { icon: User,      label: 'My Profile',     sub: `${profile.profileCompleteness}% complete — add target roles`, to: '/profile', match: 'Edit Profile' },
                ].map(({ icon: Icon, label, sub, to, match }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-900">{label}</p>
                          <span className="text-xs font-bold text-purple-600">{match}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                        {onboarding.targetDomains.length > 0 && (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {onboarding.targetDomains.slice(0, 2).map((d) => (
                              <span key={d} className="text-[10px] border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wide font-medium">{d}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigate(to)}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-full transition-colors"
                      >
                        Open Now
                      </button>
                      <button className="px-4 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-full hover:bg-gray-50 transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right col */}
            <div className="space-y-4">
              {/* Recent Activity */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {/* Resume Created — real draft name + date */}
                  <div className="flex items-start gap-3 px-4 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Send size={13} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">Resume</p>
                        <span className="text-[10px] font-bold text-gray-400 tracking-wide">
                          {activeDraft ? new Date(activeDraft.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {activeDraft ? `"${activeDraft.name}" — last saved` : 'No resume saved yet'}
                      </p>
                      <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${activeDraft ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                        {activeDraft ? 'Saved' : 'Not started'}
                      </span>
                    </div>
                  </div>

                  {/* AI Coach Session — real message count */}
                  <div className="flex items-start gap-3 px-4 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar size={13} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">AI Coach Session</p>
                        <span className="text-[10px] font-bold text-gray-400 tracking-wide">TODAY</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {aiMessages > 0 ? `${aiMessages} AI response${aiMessages !== 1 ? 's' : ''} this session` : 'No AI edits yet this session'}
                      </p>
                      <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${aiMessages > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {aiMessages > 0 ? 'Active' : 'Idle'}
                      </span>
                    </div>
                  </div>

                  {/* ATS Analysis — real score if available */}
                  <div className="flex items-start gap-3 px-4 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Eye size={13} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">ATS Analysis</p>
                        <span className="text-[10px] font-bold text-gray-400 tracking-wide">
                          {atsResult ? 'DONE' : 'PENDING'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {atsResult
                          ? `Score: ${atsResult.overallScore}/100 — ${atsResult.overallScore >= 75 ? 'Good' : atsResult.overallScore >= 50 ? 'Needs Work' : 'Poor'}`
                          : 'Run analysis to see your score'}
                      </p>
                      <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        atsResult
                          ? atsResult.overallScore >= 75 ? 'bg-green-100 text-green-600'
                          : atsResult.overallScore >= 50 ? 'bg-amber-100 text-amber-600'
                          : 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {atsResult ? `${atsResult.overallScore}/100` : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Applications */}
                  <div className="flex items-start gap-3 px-4 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Briefcase size={13} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">Applications</p>
                        <span className="text-[10px] font-bold text-gray-400 tracking-wide">TOTAL</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {appStats.total > 0
                          ? `${appStats.total} applied · ${appStats.interview} interviews · ${appStats.offer} offers`
                          : 'No applications tracked yet'}
                      </p>
                      <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${appStats.total > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {appStats.total > 0 ? `${appStats.total} tracked` : 'Start applying'}
                      </span>
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    <button
                      onClick={() => navigate('/applications')}
                      className="w-full py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      View Full Tracker
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Coach card */}
              <div className="bg-gradient-to-br from-purple-700 to-indigo-700 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-purple-300" />
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-300">AI Coach</p>
                </div>
                <p className="text-sm leading-relaxed text-white/90">
                  {atsResult
                    ? `Your ATS score is ${atsResult.overallScore}/100. ${atsResult.overallScore < 75 ? `Focus on: ${atsResult.quickWins?.[0] ?? 'improving keyword match'}.` : 'Great score! Keep optimizing for your target role.'}`
                    : hasResume
                    ? `"Your resume looks strong. Run an ATS analysis to find missing keywords for ${onboarding.jobTitle || 'your target role'} and boost your match rate."`
                    : '"Upload your resume to get personalized AI coaching. I\'ll analyze your experience and suggest improvements for your target role."'}
                </p>
                <button
                  onClick={() => navigate('/resume/resume-1')}
                  className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-colors"
                >
                  Apply Suggestion
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}

