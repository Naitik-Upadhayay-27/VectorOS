import { useState, useEffect } from 'react'
import { X, Clock } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function UpgradePromo() {
  const [visible, setVisible] = useState(true)
  const [time, setTime] = useState({ h: 47, m: 58, s: 12 })

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) return { h: 0, m: 0, s: 0 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="absolute bottom-4 right-4 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20">
      <div className="bg-gradient-to-r from-brand-500 to-purple-500 px-3 py-2 flex items-center justify-between">
        <span className="text-white text-xs font-bold">Limited Time: 50% OFF!</span>
        <button onClick={() => setVisible(false)} className="text-white/70 hover:text-white">
          <X size={12} />
        </button>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-600 mb-2">Unlock full AI access and advanced tools. Limited time offer.</p>
        <div className="flex items-center gap-1 mb-3">
          <Clock size={11} className="text-orange-500" />
          <span className="text-xs text-gray-500">Offer ends in</span>
        </div>
        <div className="flex gap-1 mb-3">
          {[['h', time.h], ['m', time.m], ['s', time.s]].map(([label, val]) => (
            <div key={label as string} className="flex-1 bg-gray-900 rounded-lg py-1.5 text-center">
              <p className="text-white text-sm font-bold leading-none">{pad(val as number)}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
        <Button size="sm" className="w-full justify-center bg-orange-500 hover:bg-orange-600">
          Claim 50% Discount
        </Button>
      </div>
    </div>
  )
}
