import { useNavigate } from 'react-router-dom'
import { FileText, Target, BarChart2, MessageSquare, ArrowRight, CheckCircle, Upload, Brain, Sparkles, Send, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import { GlobePulse } from '@/components/ui/cobe-globe-pulse'
import { BorderTrail } from '@/components/ui/border-trail'
import { TestimonialsSection } from '@/components/ui/testimonials-section'
import { RulerCarousel } from '@/components/ui/ruler-carousel'
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline'
import TypewriterText from '@/components/ui/TypewriterText'
import { HeroGeometric } from '@/components/ui/HeroGeometric'

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

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-0 bg-black/60 backdrop-blur-md border-b border-white/[0.06]">
        {/* Logo */}
        <div className="flex left-10 items-center shrink-0">
          <img src="/logo.png" alt="VectorOS" className="w-44 h-24 scale-[1.2] object-contain" />
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7">
          {['Features', 'How it Works', 'Templates', 'Pricing', 'Blog', 'About'].map((link) => (
            <a key={link} href="#" className="text-sm text-white/50 hover:text-white transition-colors">
              {link}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="text-sm px-5 py-2 rounded-full bg-black border border-purple-500 text-white font-semibold transition-all shadow-[0_0_12px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] hover:border-purple-400"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero — original HeroGeometric background with vapour text headline */}
      <HeroGeometric>
        {/* 1. Site name + Typewriter headline */}
        <div className="w-screen mb-6" style={{ height: '120px', marginLeft: 'calc(-50vw + 50%)' }}>
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-white/30 font-semibold tracking-[0.3em] uppercase text-sm">VectorOS</span>
            <h1 className="text-white font-extrabold tracking-tight text-center" style={{ fontSize: 'clamp(36px, 5vw, 72px)', lineHeight: 1.1 }}>
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
        <p className="text-base sm:text-lg text-white/50 font-light tracking-wide max-w-2xl mx-auto mb-8 px-4 leading-relaxed">
          VectorOS is your AI-powered career command center. Upload your resume, get an instant ATS score, rewrite every section with one click, and chat with an AI coach that knows your target role — all in one place. Stop guessing. Start landing interviews.
        </p>

        {/* 3. Feature capsules */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 px-4">
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
              className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] border border-white/[0.12] text-white/60 hover:bg-white/[0.10] hover:text-white/90 transition-all cursor-default"
            >
              {label}
            </span>
          ))}
        </div>

        {/* 4. CTA buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-black border border-purple-500 text-white font-semibold text-sm transition-all shadow-[0_0_16px_rgba(168,85,247,0.5)] hover:shadow-[0_0_28px_rgba(168,85,247,0.8)] hover:border-purple-400 hover:bg-black/80"
          >
            Start for Free <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-black border border-purple-500/40 text-white/70 font-medium text-sm transition-all hover:border-purple-400 hover:text-white hover:shadow-[0_0_16px_rgba(168,85,247,0.4)]"
          >
            Sign In
          </button>
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
          {/* Replace src with your actual demo video path */}
          <video
            className="w-full h-full object-cover rounded-xl"
            autoPlay
            muted
            loop
            playsInline
            src="/demo.mp4"
            onError={(e) => {
              // Fallback if video not found
              (e.target as HTMLVideoElement).style.display = 'none';
            }}
          />
          {/* Fallback screenshot / placeholder */}
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <span className="text-3xl">▶</span>
            </div>
            <p className="text-white/60 text-sm max-w-md">
              Drop your demo video at <code className="text-purple-400 text-xs bg-purple-500/10 px-2 py-0.5 rounded">public/demo.mp4</code> to show it here
            </p>
          </div>
        </ContainerScroll>
      </div>

      {/* How it works — Orbital Timeline */}
      <div className="px-8 py-24 max-w-7xl mx-auto">

        {/* Full-width heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 relative z-10"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">How it works</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            From upload to offer letter
          </h2>
        </motion.div>

        {/* 2-col: text left, timeline right — aligned at top */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — description + steps */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-white/40 text-lg leading-relaxed max-w-md mb-10">
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

          {/* Right — orbital timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative z-0"
            style={{ marginTop: '-120px' }}
          >
            <RadialOrbitalTimeline timelineData={howItWorksData} />
          </motion.div>

        </div>
      </div>

      {/* Features */}
      <section className="py-12 md:py-20">
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
              VectorOS combines every tool a modern job seeker needs — from resume parsing to ATS scoring to AI coaching — in one intelligent platform.
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
                className="space-y-3 p-10 hover:bg-white/[0.03] transition-colors group"
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

      {/* Pricing */}
      <div id="pricing" className="px-8 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Pricing Based on Your Success</h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            One platform. Three tiers. Every plan includes AI-powered editing, ATS scoring, and your personal career coach.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Plan 1 — Observer */}
          {[
            {
              name: 'The Observer',
              tag: 'Free',
              price: '0',
              period: 'forever',
              desc: 'Risk-free onboarding and feature sampling.',
              credits: '50 one-time credits',
              templates: '3 Classic templates',
              highlight: false,
              features: [
                'Full 5-step onboarding',
                'Basic ATS scoring',
                '3 ATS-friendly templates',
                '50 one-time credits',
                'Manual inline editing',
                'Basic chat advice',
              ],
              cta: 'Get Started Free',
            },
            {
              name: 'Active Job Seeker',
              tag: 'Most Popular',
              price: '19.99',
              period: '/month',
              desc: 'The standard tier for active job hunters.',
              credits: '2,000 credits / month',
              templates: '10 templates',
              highlight: true,
              features: [
                'Everything in Free',
                'Advanced ATS scoring',
                'Click-to-edit live preview',
                '10 templates incl. premium',
                '2,000 credits / month',
                'AI Coach applies edits',
              ],
              cta: 'Start Your Journey',
            },
            {
              name: 'Career Strategist',
              tag: 'Executive',
              price: '39.99',
              period: '/month',
              desc: 'For complex career histories and power users.',
              credits: '5,000 credits / month',
              templates: 'All 15 templates',
              highlight: false,
              features: [
                'Everything in Pro',
                'All 15 templates',
                'Multi-profile management',
                '5,000 credits / month',
                'Portfolio analysis',
                'Priority support',
              ],
              cta: 'Go Executive',
            },
          ].map((plan, i) => (
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
                  <span className="text-white/40 text-lg">$</span>
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
                  onClick={() => navigate('/signup')}
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

        {/* Add-ons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 p-6 rounded-2xl border border-white/10 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <p className="text-white font-semibold mb-1">Need more credits?</p>
            <p className="text-white/40 text-sm">Top up anytime. Credits never expire while your subscription is active.</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center px-5 py-3 rounded-xl border border-purple-500/30 bg-black">
              <p className="text-white font-bold">$10</p>
              <p className="text-white/40 text-xs">500 credits</p>
            </div>
            <div className="text-center px-5 py-3 rounded-xl border border-purple-500/50 bg-black shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              <p className="text-white font-bold">$25</p>
              <p className="text-xs text-purple-400">1,500 credits · 20% off</p>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-white/20 text-xs mt-6 flex items-center justify-center gap-2">
          <CheckCircle size={12} className="text-white/20" /> No hidden fees · Cancel anytime · All plans include core editor access
        </p>
      </div>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Globe CTA */}
      <div className="px-8 pb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-black grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-[0_0_60px_rgba(168,85,247,0.1)]"
        >
          {/* Left — text */}
          <div className="relative z-10 p-10 md:p-14 flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">Coming Soon</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
              One resume per job.<br />Applied automatically.
            </h2>
            <p className="text-white/40 text-base leading-relaxed mb-8 max-w-sm">
              VectorOS will generate a tailored, ATS-optimized resume for every job posting you target — then auto-submit it directly to LinkedIn, Indeed, Naukri, and 50+ portals. No copy-paste. No manual forms. Just interviews.
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
          <div className="flex items-center justify-center p-8 lg:p-12">
            <GlobePulse className="w-full max-w-sm" speed={0.004} />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-black/40 px-8 pt-16 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Top grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">

            {/* Brand col */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="VectorOS" className="w-30 scale-[1.3] h-20 object-contain" />
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
              © {new Date().getFullYear()} VectorOS. All rights reserved.
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
    </div>
  )
}

