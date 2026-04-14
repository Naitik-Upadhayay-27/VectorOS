import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { FileText, Target, BarChart2, MessageSquare, ArrowRight, CheckCircle, Upload, Brain, Sparkles, Send, TrendingUp, Play, Pause, Volume2, VolumeX, Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import { GlobePulse } from '@/components/ui/cobe-globe-pulse'
import { BorderTrail } from '@/components/ui/border-trail'
import { TestimonialsSection } from '@/components/ui/testimonials-section'
import { RulerCarousel } from '@/components/ui/ruler-carousel'
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline'
import TypewriterText from '@/components/ui/TypewriterText'
import { HeroGeometric } from '@/components/ui/HeroGeometric'
import PaywallModal from '@/components/ui/PaywallModal'

// ── Scroll-triggered video player ───────────────────────────────────────────
function DemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted]     = useState(true)
  const [ready, setReady]     = useState(false)

  // Auto-play when 40% of the video is visible, pause when it leaves
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setPlaying(true)).catch(() => {})
        } else {
          video.pause()
          setPlaying(false)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [ready])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else          { v.pause(); setPlaying(false) }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <div className="relative w-full h-full group rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        src="/video.mp4"
        preload="metadata"          // loads first frame + duration, not full file
        muted
        loop
        playsInline
        className="w-full h-full object-cover rounded-xl"
        onCanPlay={() => setReady(true)}
      />

      {/* Custom controls overlay — visible on hover */}
      <div className="absolute inset-0 flex items-end justify-between px-4 pb-4
                      bg-gradient-to-t from-black/60 via-transparent to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-10 h-10 rounded-full
                     bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
        >
          {playing
            ? <Pause size={16} className="text-white" />
            : <Play  size={16} className="text-white ml-0.5" />}
        </button>

        <button
          onClick={toggleMute}
          className="flex items-center justify-center w-10 h-10 rounded-full
                     bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
        >
          {muted
            ? <VolumeX size={16} className="text-white" />
            : <Volume2 size={16} className="text-white" />}
        </button>
      </div>

      {/* Play button overlay when paused and not yet interacted */}
      {!playing && ready && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30
                          backdrop-blur-sm flex items-center justify-center
                          transition-all hover:scale-110">
            <Play size={24} className="text-white ml-1" />
          </div>
        </button>
      )}
    </div>
  )
}

const features = [
  { icon: FileText,       title: 'AI Resume Builder',      desc: 'ATS-optimized templates with real-time AI rewriting and bullet point enhancement.' },
  { icon: Target,         title: 'Job Matching Engine',    desc: 'Semantic matching against job descriptions with keyword gap detection and match scores.' },
  { icon: MessageSquare,  title: 'Conversational AI',      desc: 'Chat with your AI coach to refine your resume section by section.' },
  { icon: BarChart2,      title: 'Career Analytics',       desc: 'Track application success rates, skill gaps, and resume score trends over time.' },
]

const perks = [
  'Unlimited resume versions',
  'ATS keyword optimization',
  'Cover letter generator',
  'Application tracker',
  'Skill gap analysis',
  'Auto-apply (coming soon)',
]

const howItWorksData = [
  {
    id: 1,
    title: "Upload Resume",
    date: "Step 1",
    content: "Upload your existing PDF resume or start from scratch. Our AI instantly parses and structures your data.",
    category: "Input",
    icon: Upload,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "AI Analysis",
    date: "Step 2",
    content: "Gemini AI analyzes your resume against your target role, scoring keyword density, formatting, and impact.",
    category: "Analysis",
    icon: Brain,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Smart Editing",
    date: "Step 3",
    content: "Edit directly on the live preview or let the AI rewrite sections. Every change reflects instantly.",
    category: "Edit",
    icon: Sparkles,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 75,
  },
  {
    id: 4,
    title: "ATS Scoring",
    date: "Step 4",
    content: "Run a full ATS score against your target role. Get keyword gaps, quick wins, and a gap analysis.",
    category: "Score",
    icon: TrendingUp,
    relatedIds: [3, 5],
    status: "in-progress" as const,
    energy: 55,
  },
  {
    id: 5,
    title: "AI Chat Coach",
    date: "Step 5",
    content: "Chat with your AI coach to refine tone, add missing skills, or tailor the resume for a specific job.",
    category: "Coach",
    icon: MessageSquare,
    relatedIds: [4, 6],
    status: "pending" as const,
    energy: 35,
  },
  {
    id: 6,
    title: "Apply & Track",
    date: "Step 6",
    content: "Download your polished resume and track every application — status, notes, and match scores in one place.",
    category: "Apply",
    icon: Send,
    relatedIds: [5],
    status: "pending" as const,
    energy: 15,
  },
]

const NAV_LINKS = [
  { label: 'Features',     href: '#features'     },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing',      href: '#pricing'      },
  { label: 'Testimonials', href: '#blog'         },
]

function MobileNav({ user, navigate }: { user: any; navigate: (path: string) => void }) {
  const [open, setOpen] = useState(false)

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-14 md:h-20 bg-black/70 backdrop-blur-md border-b border-white/[0.06]">
        {/* Logo */}
        <div className="flex items-center shrink-0 gap-4">
          <img src="/logo.png" alt="Skill Vector" className="w-20 h-10 scale-[1.7] md:w-16 md:h-16 object-contain" />
          <span className="text-white font-bold text-sm md:text-base tracking-tight">Skill Vector</span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href}
              onClick={(e) => { e.preventDefault(); scrollTo(href) }}
              className="text-sm text-white/50 hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </div>

        {/* Desktop auth + mobile hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop auth */}
          {user ? (
            <button onClick={() => navigate('/dashboard')}
              className="hidden md:block text-xs md:text-sm px-4 py-1.5 rounded-full bg-black border border-purple-500 text-white font-semibold shadow-[0_0_12px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] transition-all">
              Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                className="hidden md:block text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5">
                Sign In
              </button>
              <button onClick={() => navigate('/signup')}
                className="hidden md:block text-xs md:text-sm px-4 py-1.5 rounded-full bg-black border border-purple-500 text-white font-semibold shadow-[0_0_12px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] transition-all">
                Get Started
              </button>
            </>
          )}

          {/* Mobile: CTA + hamburger */}
          <button onClick={() => navigate(user ? '/dashboard' : '/signup')}
            className="md:hidden text-xs px-3 py-1.5 rounded-full bg-black border border-purple-500 text-white font-semibold shadow-[0_0_10px_rgba(168,85,247,0.4)]">
            {user ? 'Dashboard' : 'Get Started'}
          </button>
          <button onClick={() => setOpen(!open)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute top-14 md:top-20 left-0 right-0 bg-[#0a0a0f] border-b border-white/[0.08] px-4 py-4 space-y-1"
            onClick={(e) => e.stopPropagation()}>
            {NAV_LINKS.map(({ label, href }) => (
              <button key={label} onClick={() => scrollTo(href)}
                className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors">
                {label}
              </button>
            ))}
            <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
              {!user && (
                <button onClick={() => { navigate('/login'); setOpen(false) }}
                  className="w-full py-2.5 text-sm text-white/60 hover:text-white transition-colors text-center">
                  Sign In
                </button>
              )}
              <button onClick={() => { navigate(user ? '/dashboard' : '/signup'); setOpen(false) }}
                className="w-full py-2.5 rounded-xl bg-black border border-purple-500 text-white text-sm font-semibold shadow-[0_0_12px_rgba(168,85,247,0.3)] text-center">
                {user ? 'Go to Dashboard' : 'Get Started Free'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallPlan, setPaywallPlan] = useState<'pro' | 'lifetime'>('pro')

  const openPaywall = (plan: 'pro' | 'lifetime') => {
    if (!user) { navigate('/signup'); return }
    setPaywallPlan(plan)
    setPaywallOpen(true)
  }

  useEffect(() => {
    if (window.location.hash === '#pricing') {
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Nav */}
      <MobileNav user={user} navigate={navigate} />

      {/* Hero */}
      <HeroGeometric>
        {/* 1. Headline */}
        <div className="w-full mb-6 px-4">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-white/30 font-semibold tracking-[0.3em] uppercase text-xs sm:text-sm">Skill Vector</span>
            <h1 className="text-white font-extrabold tracking-tight text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight">
              <TypewriterText
                texts={["Get Hired Faster.", "Beat the ATS.", "Own Your Career."]}
                typeSpeed={90}
                deleteSpeed={45}
                pauseAfter={2400}
              />
            </h1>
          </div>
        </div>

        {/* 2. Subheading */}
        <p className="text-sm sm:text-base md:text-lg text-white/50 font-light tracking-wide max-w-2xl mx-auto mb-8 px-6 leading-relaxed text-center">
          Skill Vector is your AI-powered career command center. Upload your resume, get an instant ATS score, rewrite every section with one click, and chat with an AI coach that knows your target role — all in one place.
        </p>

        {/* 3. Feature capsules */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 px-4">
          {[
            '✦ AI Resume Builder',
            '✦ ATS Scoring',
            '✦ Inline Editing',
            '✦ AI Chat Coach',
            '✦ Job Matching',
            '✦ Application Tracker',
          ].map((label) => (
            <span
              key={label}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.05] border border-white/[0.12] text-white/60 hover:bg-white/[0.10] hover:text-white/90 transition-all cursor-default"
            >
              {label}
            </span>
          ))}
        </div>

        {/* 4. CTA buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap px-4">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/signup')}
            className="inline-flex items-center gap-2 px-5 md:px-7 py-3 md:py-3.5 rounded-full bg-black border border-purple-500 text-white font-semibold text-sm transition-all shadow-[0_0_16px_rgba(168,85,247,0.5)] hover:shadow-[0_0_28px_rgba(168,85,247,0.8)] hover:border-purple-400 hover:bg-black/80"
          >
            {user ? 'Go to Dashboard' : 'Build My Resume'} <ArrowRight size={15} />
          </button>
          {!user && (
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-5 md:px-7 py-3 md:py-3.5 rounded-full bg-black border border-purple-500/40 text-white/70 font-medium text-sm transition-all hover:border-purple-400 hover:text-white hover:shadow-[0_0_16px_rgba(168,85,247,0.4)]"
          >
            Find Your Job <ArrowRight size={15} />
          </button>
          )}
        </div>
      </HeroGeometric>

      {/* Scroll Demo — video showcase */}
      <div className="bg-[#030303]">
        <ContainerScroll
          titleComponent={
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">See it in action</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                Your entire job search,<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white/90 to-rose-400">
                  powered by AI
                </span>
              </h2>
            </div>
          }
        >
          <DemoVideo />
        </ContainerScroll>
      </div>

      {/* How it works — Orbital Timeline */}
      <div id="how-it-works" className="px-4 md:px-8 py-12 md:py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 md:mb-16 relative z-10"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">How it works</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            From upload to offer letter
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left — steps grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-white/40 text-base leading-relaxed max-w-md mb-8">
              Six steps. One platform. Click any node on the right to explore each stage of your job search journey.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { n: '01', label: 'Upload Resume', desc: 'PDF or start from scratch — AI parses it instantly' },
                { n: '02', label: 'AI Analysis', desc: 'Scored against your target role and industries' },
                { n: '03', label: 'Smart Editing', desc: 'Edit inline or let AI rewrite any section' },
                { n: '04', label: 'ATS Scoring', desc: 'Close keyword gaps before you apply' },
                { n: '05', label: 'AI Coach', desc: 'Chat with an AI that knows your career goals' },
                { n: '06', label: 'Apply & Track', desc: 'Download and track every application' },
              ].map(({ n, label, desc }) => (
                <div
                  key={n}
                  className="p-3 rounded-lg bg-black border border-purple-500/30 hover:border-purple-500/70 hover:shadow-[0_0_12px_rgba(168,85,247,0.2)] transition-all group"
                >
                  <span className="text-[10px] font-mono text-purple-400/50 group-hover:text-purple-400 transition-colors">{n}</span>
                  <p className="text-xs font-semibold text-white mt-0.5 mb-0.5">{label}</p>
                  <p className="text-[10px] text-white/35 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — orbital timeline (hidden on mobile, shown on lg+) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative z-0 hidden lg:block"
            style={{ marginTop: '-120px' }}
          >
            <RadialOrbitalTimeline timelineData={howItWorksData} />
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-12 md:py-20">
        <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 mx-auto max-w-2xl space-y-6 text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">Features</p>
            <h2 className="text-balance text-4xl font-bold text-white lg:text-5xl">
              The AI-powered foundation for your job search
            </h2>
            <p className="text-white/40 text-base leading-relaxed">
              Skill Vector combines every tool a modern job seeker needs — from resume parsing to ATS scoring to AI coaching — in one intelligent platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mx-auto grid max-w-4xl lg:max-w-6xl divide-x divide-y border border-white/[0.08] sm:grid-cols-2 lg:grid-cols-3"
            style={{ '--tw-divide-opacity': '0.08' } as React.CSSProperties}
          >
            {[
              { icon: FileText,      title: 'AI Resume Builder',   desc: 'ATS-optimized templates with real-time AI rewriting and instant bullet point enhancement.' },
              { icon: Target,        title: 'ATS Scoring',         desc: 'Scores your resume against your target role using the same criteria as Workday and Greenhouse.' },
              { icon: Sparkles,      title: 'Inline AI Editing',   desc: 'Click any text on the live preview to edit it directly — like Canva, but for resumes.' },
              { icon: MessageSquare, title: 'AI Chat Coach',        desc: 'Chat with an AI that knows your resume, target role, and career goals. Edits apply instantly.' },
              { icon: Upload,        title: 'PDF Auto-Fill',        desc: 'Upload your existing PDF and AI parses and structures your entire resume in seconds.' },
              { icon: TrendingUp,    title: 'Gap Analysis',         desc: 'Identifies the exact keywords and skills missing between your current resume and target role.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="space-y-3 p-4 md:p-10 hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ruler Carousel */}
      <div id="templates">
      <RulerCarousel originalItems={[
        { id: 1, title: 'ATS SCORE' },
        { id: 2, title: 'AI REWRITE' },
        { id: 3, title: 'LIVE PREVIEW' },
        { id: 4, title: 'PDF IMPORT' },
        { id: 5, title: 'CHAT COACH' },
        { id: 6, title: 'GAP ANALYSIS' },
        { id: 7, title: '15 TEMPLATES' },
        { id: 8, title: 'JOB MATCHING' },
        { id: 9, title: 'APPLY TRACK' },
      ]} />
      </div>

      {/* Pricing */}
      <div id="pricing" className="px-4 md:px-8 py-16 md:py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">Pricing</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Simple, Honest Pricing</h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            Start free. Upgrade when you're ready. No subscriptions that auto-renew without you noticing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              name: 'Free',
              tag: 'Get Started',
              price: '0',
              symbol: '₹',
              period: 'forever',
              desc: 'Try the platform risk-free. No card required.',
              highlight: false,
              features: [
                '3 free downloads · unlimited with watermark',
                '6 resume templates',
                '6 cover letter templates',
                '25 AI chat messages',
                'AI resume builder',
                'Application tracker',
                'Basic inline editing',
              ],
              cta: 'Start Free',
              ctaAction: () => navigate('/signup'),
            },
            {
              name: 'Pro',
              tag: 'Most Popular',
              price: '149',
              symbol: '₹',
              period: '/ week',
              desc: 'Everything you need for an active job search.',
              highlight: true,
              features: [
                '20 PDF downloads (no watermark)',
                'All resume templates',
                'All cover letter templates',
                '1000 AI chat messages',
                'ATS score analysis',
                'Tailor resume to job description',
                'AI cover letter generation',
              ],
              cta: 'Get Pro',
              ctaAction: () => openPaywall('pro'),
            },
            {
              name: 'Lifetime',
              tag: 'Best Value',
              price: '899',
              symbol: '₹',
              period: '/ month',
              desc: 'Unlimited access. All features. Billed monthly.',
              highlight: false,
              features: [
                'Unlimited downloads (no watermark)',
                'All templates — now & future',
                'Unlimited AI chat messages',
                'All Pro features',
                'ATS score + JD tailoring',
                'Priority support',
                'Monthly billing — cancel anytime',
              ],
              cta: 'Get Exclusive',
              ctaAction: () => openPaywall('lifetime'),
            },
          ].map((plan) => (
            <div key={plan.name} className="relative">
              <div className={`relative h-full rounded-2xl border p-6 flex flex-col gap-5 bg-black transition-all
                ${plan.highlight
                  ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                  : 'border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                }`}
              >
                {plan.highlight && (
                  <BorderTrail
                    style={{ boxShadow: '0px 0px 40px 20px rgb(168 85 247 / 40%), 0 0 80px 40px rgb(168 85 247 / 20%)' }}
                    size={80}
                    className="bg-purple-500"
                  />
                )}

                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white text-sm">{plan.name}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border
                      ${plan.highlight
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border-white/10 text-white/50'
                      }`}
                    >
                      {plan.tag}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{plan.desc}</p>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1">
                  <span className="text-white/40 text-lg">{plan.symbol}</span>
                  <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                  <span className="text-white/40 text-sm mb-1">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                      <span className="w-1 h-1 rounded-full bg-purple-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={plan.ctaAction}
                  className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all
                    ${plan.highlight
                      ? 'bg-black border border-purple-500 text-white shadow-[0_0_16px_rgba(168,85,247,0.4)] hover:shadow-[0_0_24px_rgba(168,85,247,0.7)]'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:border-purple-500/50 hover:text-white'
                    }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </motion.div>

        <p className="text-center text-white/20 text-xs mt-8 flex items-center justify-center gap-2">
          <CheckCircle size={12} className="text-white/20" /> Secure payments via Razorpay · No hidden fees · Pro expires after 7 days · Lifetime renews monthly
        </p>
      </div>

      {/* Testimonials */}
      <div id="blog"><TestimonialsSection /></div>

      {/* Globe CTA */}
      <div id="about" className="px-4 md:px-8 pb-16 md:pb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-black grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-[0_0_60px_rgba(168,85,247,0.1)]"
        >
          {/* Left — text */}
          <div className="relative z-10 p-6 md:p-10 lg:p-14 flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">Coming Soon</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-5 leading-tight">
              One resume per job.<br />Applied automatically.
            </h2>
            <p className="text-white/40 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
              Skill Vector will generate a tailored, ATS-optimized resume for every job posting you target — then auto-submit it directly to LinkedIn, Indeed, Naukri, and 50+ portals. No copy-paste. No manual forms. Just interviews.
            </p>
            <ul className="space-y-2.5 mb-10">
              {[
                'Paste a job URL — AI builds a custom resume for it',
                'Resume is scored and optimized before submission',
                'Auto-fills and submits application forms on your behalf',
                'Tracks every application status in real time',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-black border border-purple-500 text-white font-semibold text-sm transition-all shadow-[0_0_16px_rgba(168,85,247,0.4)] hover:shadow-[0_0_28px_rgba(168,85,247,0.7)]"
              >
                Get Early Access <ArrowRight size={15} />
              </button>
              <span className="text-white/25 text-xs">Free during beta</span>
            </div>
          </div>

          {/* Right — globe */}
          <div className="flex items-center justify-center p-4 md:p-8 lg:p-12">
            <GlobePulse className="w-full max-w-xs md:max-w-sm" speed={0.004} />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-black/40 px-4 md:px-8 pt-12 md:pt-16 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Top grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-10 mb-10 md:mb-14">

            {/* Brand col — full width on mobile */}
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <img src="/logo.png" alt="Skill Vector" className="w-26 scale-[2] h-12 object-contain" />
                <span className="text-white font-bold text-lg tracking-tight">Skill Vector</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">
                Your AI-powered career command center. Build, optimize, and track your job applications — from upload to offer letter.
              </p>
              <div className="flex items-center gap-3">
                {['Twitter', 'LinkedIn', 'GitHub'].map((s) => (
                  <a key={s} href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:border-purple-500/50 hover:text-white/70 transition-all text-xs">
                    {s[0]}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Product</p>
              <ul className="space-y-2.5">
                {['Features', 'Templates', 'ATS Scoring', 'AI Coach', 'Pricing', 'Changelog'].map((l) => (
                  <li key={l}><a href="#" className="text-white/35 text-sm hover:text-white/70 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Company</p>
              <ul className="space-y-2.5">
                {['About', 'Blog', 'Careers', 'Press', 'Contact'].map((l) => (
                  <li key={l}><a href="#" className="text-white/35 text-sm hover:text-white/70 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Legal</p>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((l) => (
                  <li key={l}><a href="#" className="text-white/35 text-sm hover:text-white/70 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs">
              © {new Date().getFullYear()} Skill Vector. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Privacy', 'Terms', 'Cookies'].map((l) => (
                <a key={l} href="#" className="text-white/20 text-xs hover:text-white/50 transition-colors">{l}</a>
              ))}
            </div>
            <p className="text-white/20 text-xs">Built with ❤️ and AI</p>
          </div>
        </div>
      </footer>
      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason={paywallPlan === 'pro' ? 'download_limit' : 'template_locked'}
        initialPlan={paywallPlan}
      />
    </div>
  )
}

