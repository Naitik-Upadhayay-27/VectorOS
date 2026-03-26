import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export default function Badge({ children, className, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
    secondary: 'bg-gray-100 text-gray-600 border-gray-200',
    destructive: 'bg-red-500/20 text-red-400 border-red-500/30',
    outline: 'bg-transparent text-gray-600 border-gray-300',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  )
}

export { Badge }

