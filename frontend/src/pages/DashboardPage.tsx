import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  FileText, Briefcase, TrendingUp, Plus, Clock, Trash2, Sparkles,
  Download, AlertTriangle, User, LayoutDashboard, Target, Zap,
  ChevronRight, MessageSquare, Crown, CheckCircle2, ArrowUpRight,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/store/authStore'
import { useDraftStore, type ResumeDraft } from '@/store/draftStore'
import { useCoverLetterDraftStore, type CoverLetterDraft } from '@/store/coverLetterDraftStore'
import { useTemplateResumeStore } from '@/store/templateResumeStore'
import { useChatStore } from '@/store/chatStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useProfileStore } from '@/store/profileStore'
import { useAtsStore } from '@/store/atsStore'
import { usePlanStore, CHAT_LIMITS } from '@/store/planStore'
import { apiFetch } from '@/lib/apiFetch'
import { API_BASE } from '@/lib/config'
import { TEMPLATES } from '@/components/resume-templates'
import { CL_TEMPLATES } from '@/components/cover-letter/templates'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import PaywallModal from '@/components/ui/PaywallModal'

const PAGE_W = 794
const PAGE_H = 1123
const THUMB_SCALE = 0.24

function ResumeThumbnail({ draft }: { draft: ResumeDraft }) {
  const template = TEMPLATES.find((t) => t.id === draft.templateId) ?? TEMPLATES[0]
  const Comp = template.component
  return (
    <div style={{ width: PAGE_W * THUMB_SCALE, height: PAGE_H * THUMB_SCALE, overflow: 'hidden', position: 'relative', background: '#fff' }}>
      <div style={{ width: PAGE_W, height: PAGE_H, transformOrigin: 'top left', transform: `scale(${THUMB_SCALE})`, pointerEvents: 'none', position: 'absolute' }}>
        <Comp data={draft.resumeData} />
      </div>
    </div>
  )
}

function CLDraftThumbnail({ draft }: { draft: CoverLetterDraft }) {
  const template = CL_TEMPLATES.find(t => t.id === draft.templateId) ?? CL_TEMPLATES[0]
  const Comp = template.component
  return (
    <div style={{ width: PAGE_W * THUMB_SCALE, height: PAGE_H * THUMB_SCALE, overflow: 'hidden', position: 'relative', background: '#fff' }}>
      <div style={{ width: PAGE_W, height: PAGE_H, transformOrigin: 'top left', transform: `scale(${THUMB_SCALE})`, pointerEvents: 'none', position: 'absolute' }}>
        <Comp data={draft.data as any} accentColor={template.defaultAccent} />
      </div>
    </div>
  )
}

function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Delete?</p>
            <p className="text-xs text-gray-400 mt-0.5">This cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">Delete <span className="font-semibold">"{name}"</span>?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white transition-colors">Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { drafts, deleteDraft, setActiveDraft } = useDraftStore()
  const { drafts: clDrafts, deleteDraft: deleteCLDraft, loadDrafts: loadCLDrafts } = useCoverLetterDraftStore()
  const resumeData = useTemplateResumeStore((s) => s.data)
  const { data: onboarding, openOnboarding, reset: resetOnboarding } = useOnboardingStore()
  const { profile } = useProfileStore()
  const aiMessages = useChatStore((s) => Math.max(0, s.messages.filter(m => m.role === 'assistant').length - 1))
  const atsResult = useAtsStore((s) => s.result)
  const { plan, chatsUsed, downloadsUsed } = usePlanStore()
  const hasResume = !!resumeData.personalInfo?.name
  const [deleteTarget, setDeleteTarget] = useState<ResumeDraft | null>(null)
  const [deleteCLTarget, setDeleteCLTarget] = useState<CoverLetterDraft | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)

  useEffect(() => {
    loadCLDrafts()
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

  const loadCLDraft = (draft: CoverLetterDraft) => {
    useCoverLetterStore.getState().setData(draft.data)
    useCoverLetterStore.getState().setTemplate(draft.templateId)
    useCoverLetterStore.getState().setActiveDraftId(draft.id)
    navigate('/cover-letter')
  }

  const downloadDraft = (e: React.MouseEvent, draft: ResumeDraft) => {
    e.stopPropagation()
    useTemplateResumeStore.getState().resetData(draft.resumeData)
    useTemplateResumeStore.getState().setTemplate(draft.templateId)
    setActiveDraft(draft.id)
    navigate('/resume/resume-1?print=1')
  }

  const startNewResume = () => {
    resetOnboarding()
    useChatStore.getState().clearMessages()
    useAtsStore.getState().clearResult()
    useDraftStore.getState().setActiveDraft(null)
    openOnboarding()
  }

  const planLabel = plan === 'free' ? 'Free' : plan === 'pro' ? 'Pro' : 'Exclusive'
  const planColor = plan === 'free' ? 'text-gray-500' : plan === 'pro' ? 'text-purple-600' : 'text-amber-500'
  const chatLimit = CHAT_LIMITS[plan]
  const chatPct = chatLimit === Infinity ? 100 : Math.min(100, Math.round((chatsUsed / chatLimit) * 100))
  const dlLimit = plan === 'free' ? 3 : plan === 'pro' ? 20 : Infinity
  const dlPct = dlLimit === Infinity ? 100 : Math.min(100, Math.round((downloadsUsed / dlLimit) * 100))

  return (
    <AppLayout>
      {deleteTarget && <DeleteModal name={deleteTarget.name} onConfirm={() => { deleteDraft(deleteTarget.id); setDeleteTarget(null) }} onCancel={() => setDeleteTarget(null)} />}
      {deleteCLTarget && <DeleteModal name={deleteCLTarget.name} onConfirm={() => { deleteCLDraft(deleteCLTarget.id); setDeleteCLTarget(null) }} onCancel={() => setDeleteCLTarget(null)} />}
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />

      <div className="h-full overflow-y-auto bg-[#f6f7fb]">
        <div className="max-w-7xl mx-auto px-6 py-7 space-y-6">

          {/* ── Top greeting bar ──────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutDashboard size={15} className="text-purple-500" />
                <span className="text-xs font-semibold text-purple-500 uppercase tracking-widest">Dashboard</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                <span className="text-purple-600">{user?.name?.split(' ')[0] ?? 'there'}</span> 👋
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {hasResume
                  ? `Resume ready for ${onboarding.jobTitle || 'your target role'} · ${atsResult ? `ATS ${atsResult.overallScore}/100` : 'Run ATS analysis'}`
                  : 'Create your first resume to get started'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Briefcase size={14} /> Browse Jobs
              </button>
              <button
                onClick={startNewResume}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <Plus size={14} /> New Resume
              </button>
            </div>
          </div>

          {/* ── Stats row ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Resumes', value: drafts.length, icon: FileText,
                sub: drafts.length > 0 ? `Last saved ${new Date(drafts[0]?.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'None yet',
                color: 'bg-purple-50 text-purple-600', action: () => hasResume ? navigate('/resume/resume-1') : startNewResume(),
              },
              {
                label: 'Cover Letters', value: clDrafts.length, icon: FileText,
                sub: clDrafts.length > 0 ? `Last saved ${new Date(clDrafts[0]?.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'None yet',
                color: 'bg-blue-50 text-blue-600', action: () => navigate('/cover-letter'),
              },
              {
                label: 'AI Chats', value: aiMessages, icon: MessageSquare,
                sub: chatLimit === Infinity ? 'Unlimited' : `${chatsUsed} / ${chatLimit} used`,
                color: 'bg-violet-50 text-violet-600', action: () => navigate('/resume/resume-1'),
              },
            ].map(({ label, value, icon: Icon, sub, color, action }) => (
              <button key={label} onClick={action}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-purple-100 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={16} />
                  </div>
                  <ArrowUpRight size={14} className="text-gray-300 group-hover:text-purple-400 transition-colors" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
                <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
              </button>
            ))}
          </div>

          {/* ── Main 2-col layout ─────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-6">

            {/* Left col — resumes + cover letters (2/3 width) */}
            <div className="col-span-2 space-y-6">

              {/* My Resumes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-gray-900">My Resumes</h2>
                  {drafts.length > 2 && (
                    <button onClick={() => navigate('/resume/resume-1')} className="text-xs text-purple-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      View all <ChevronRight size={12} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {drafts.slice(0, 2).map((draft) => (
                    <div key={draft.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-purple-100 transition-all group"
                      onClick={() => loadDraft(draft.id)}>
                      <div className="flex justify-center bg-gray-50 border-b border-gray-100 overflow-hidden">
                        <ResumeThumbnail draft={draft} />
                      </div>
                      <div className="px-3 py-2.5 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{draft.name}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={9} />
                            {new Date(draft.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button onClick={(e) => downloadDraft(e, draft)}
                            className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-300 hover:text-purple-500 transition-colors" title="Download">
                            <Download size={12} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(draft) }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors" title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* New resume card */}
                  <button onClick={startNewResume}
                    className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex flex-col items-center justify-center gap-2 min-h-[200px] group">
                    <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                      <Plus size={16} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <p className="text-xs font-semibold text-gray-400 group-hover:text-purple-600 transition-colors">New Resume</p>
                  </button>
                </div>
              </div>

              {/* Cover Letters */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-gray-900">Cover Letters</h2>
                  <button onClick={() => { useCoverLetterStore.getState().reset(); navigate('/cover-letter') }}
                    className="text-xs text-purple-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    <Plus size={11} /> New
                  </button>
                </div>
                {clDrafts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {clDrafts.slice(0, 3).map((draft) => (
                      <div key={draft.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-purple-100 transition-all"
                        onClick={() => loadCLDraft(draft)}>
                        <div className="flex justify-center bg-gray-50 border-b border-gray-100 overflow-hidden">
                          <CLDraftThumbnail draft={draft} />
                        </div>
                        <div className="px-3 py-2.5 flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{draft.name}</p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock size={9} />
                              {new Date(draft.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteCLTarget(draft) }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => { useCoverLetterStore.getState().reset(); navigate('/cover-letter') }}
                    className="w-full bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/20 transition-all py-8 flex flex-col items-center gap-2 group">
                    <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                      <Plus size={16} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <p className="text-xs font-semibold text-gray-400 group-hover:text-purple-600 transition-colors">Create your first cover letter</p>
                  </button>
                )}
              </div>

              {/* Quick nav */}
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-3">Quick Access</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Target,       label: 'ATS Analysis',   sub: atsResult ? `Score: ${atsResult.overallScore}/100` : 'Not run yet',  to: '/resume/resume-1', accent: 'bg-purple-500' },
                    { icon: Briefcase,    label: 'Job Search',     sub: 'Find matching roles',                                               to: '/jobs',            accent: 'bg-blue-500'   },
                    { icon: TrendingUp,   label: 'Applications',   sub: 'Track your apps',                                                   to: '/applications',    accent: 'bg-green-500'  },
                    { icon: User,         label: 'Profile',        sub: `${profile.profileCompleteness}% complete`,                          to: '/profile',         accent: 'bg-orange-500' },
                  ].map(({ icon: Icon, label, sub, to, accent }) => (
                    <button key={label} onClick={() => navigate(to)}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md hover:border-purple-100 transition-all group flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                        <Icon size={15} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-[11px] text-gray-400 truncate">{sub}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-purple-400 ml-auto shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right col — plan + AI coach + tips (1/3 width) */}
            <div className="space-y-4">

              {/* Plan card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {plan === 'lifetime' ? <Crown size={15} className="text-amber-500" /> : <Zap size={15} className="text-purple-500" />}
                    <span className={`text-sm font-bold ${planColor}`}>{planLabel} Plan</span>
                  </div>
                  {plan === 'free' && (
                    <button onClick={() => setPaywallOpen(true)}
                      className="text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 px-2.5 py-1 rounded-full transition-colors">
                      Upgrade
                    </button>
                  )}
                </div>

                {/* Downloads */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-500 font-medium">Free downloads</span>
                    <span className="text-[11px] font-semibold text-gray-700">
                      {Math.min(downloadsUsed, dlLimit === Infinity ? downloadsUsed : dlLimit)} / {dlLimit === Infinity ? '∞' : dlLimit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${dlPct}%` }} />
                  </div>
                </div>

                {/* Chats */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-500 font-medium">AI Chats</span>
                    <span className="text-[11px] font-semibold text-gray-700">
                      {chatsUsed} / {chatLimit === Infinity ? '∞' : chatLimit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${chatPct}%` }} />
                  </div>
                </div>

                {plan === 'free' && (
                  <div className="space-y-1.5">
                    {[
                      'First 3 downloads watermark-free',
                      'Unlimited downloads (with watermark)',
                      'All templates unlocked',
                      'Full ATS analysis',
                      'Unlimited AI chats',
                    ].map(f => (
                      <div key={f} className="flex items-center gap-2 text-[11px] text-gray-400">
                        <CheckCircle2 size={11} className="text-gray-300 shrink-0" />
                        {f}
                      </div>
                    ))}
                    <button onClick={() => setPaywallOpen(true)}
                      className="w-full mt-3 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all">
                      Unlock Pro — ₹149/week
                    </button>
                  </div>
                )}
              </div>

              {/* AI Coach card */}
              <div className="bg-gradient-to-br from-[#1a0533] to-[#2d1060] rounded-2xl p-5 text-white border border-purple-900/40">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/30 flex items-center justify-center">
                    <Sparkles size={13} className="text-purple-300" />
                  </div>
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">AI Coach</span>
                </div>
                <p className="text-sm leading-relaxed text-white/80 mb-4">
                  {atsResult
                    ? `ATS score: ${atsResult.overallScore}/100. ${atsResult.overallScore < 75 ? `Top fix: ${atsResult.quickWins?.[0]?.replace(/\*\*/g, '') ?? 'improve keyword match'}.` : 'Great score! Keep optimizing.'}`
                    : hasResume
                    ? `Run ATS analysis to find missing keywords for ${onboarding.jobTitle || 'your target role'}.`
                    : 'Create a resume to unlock AI coaching and ATS scoring.'}
                </p>
                <button onClick={() => navigate('/resume/resume-1')}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2">
                  Open Resume Editor <ArrowUpRight size={12} />
                </button>
              </div>

              {/* Profile completeness */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900">Profile</span>
                  <span className="text-xs font-bold text-purple-600">{profile.profileCompleteness}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all"
                    style={{ width: `${profile.profileCompleteness}%` }} />
                </div>
                <p className="text-[11px] text-gray-400 mb-3">
                  {profile.profileCompleteness < 100
                    ? 'Complete your profile to improve job matches'
                    : 'Profile complete — you\'re all set!'}
                </p>
                <button onClick={() => navigate('/profile')}
                  className="w-full py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Edit Profile
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
