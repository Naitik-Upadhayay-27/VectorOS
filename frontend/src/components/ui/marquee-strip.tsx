import { motion } from 'framer-motion'

const companies = [
  'Google', 'Meta', 'Apple', 'Amazon', 'Microsoft', 'Stripe', 'Figma',
  'Notion', 'OpenAI', 'Shopify', 'Netflix', 'Airbnb', 'Uber', 'LinkedIn',
  'Salesforce', 'HubSpot', 'Atlassian', 'Twilio', 'Vercel', 'GitHub',
]

// Duplicate for seamless loop
const items = [...companies, ...companies]

export function MarqueeStrip() {
  return (
    <div className="w-full py-12 overflow-hidden border-y border-white/[0.06]">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-white/20 mb-8">
        VectorOS users have landed roles at
      </p>
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#030303] to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#030303] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {items.map((name, i) => (
            <span
              key={i}
              className="text-2xl font-bold text-white/20 hover:text-white/50 transition-colors cursor-default shrink-0"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

