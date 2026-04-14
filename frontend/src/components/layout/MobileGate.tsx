import { useEffect, useState } from 'react'

export default function MobileGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 948)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 948)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!isMobile) return <>{children}</>

  return (
    <>
      {/* Still render children (so onboarding modal can show) but hide the app UI */}
      <div className="hidden">{children}</div>

      <div className="fixed inset-0 z-[9999] bg-[#030303] flex flex-col items-center justify-center px-6 text-center">
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm">
          {/* Pug */}
          <div className="w-40 h-40 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <img src="/pug.png" alt="Cute pug" className="w-full h-full object-cover" />
          </div>

          <div className="space-y-3">
            <p className="text-purple-400 text-xs font-bold uppercase tracking-widest">Mobile coming soon</p>
            <h1 className="text-white text-2xl font-extrabold leading-tight">This pup needs a bigger screen 🐾</h1>
            <p className="text-white/40 text-sm leading-relaxed">
              Skill Vector is currently optimized for laptops and desktops. We're working hard to bring the full experience to mobile — hang tight!
            </p>
          </div>

          <div className="w-full h-px bg-white/[0.06]" />

          <div className="space-y-3 w-full">
            <p className="text-white/30 text-xs">In the meantime, open us on your laptop or desktop</p>
            <div className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-black border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shrink-0" />
              <span className="text-white/70 text-sm font-semibold tracking-tight">skillvector.in</span>
            </div>
          </div>

          <p className="text-white/20 text-[11px] tracking-wide">Skill Vector · Mobile dropping soon ✦</p>
        </div>
      </div>
    </>
  )
}
