import { motion } from 'framer-motion';
import { GridPattern } from '@/components/ui/grid-pattern';

type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
};

const testimonials: Testimonial[] = [
  { name: 'Priya Sharma',   role: 'Software Engineer',  company: 'Google',   quote: 'VectorOS rewrote my resume bullets in minutes. I went from zero callbacks to 4 interviews in a week. The ATS scorer told me exactly what was missing.',                                                    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharma&backgroundColor=b6e3f4'    },
  { name: 'Marcus Johnson', role: 'Product Manager',    company: 'Stripe',   quote: 'The AI chat coach knew my target role and tailored every suggestion to it. It felt like having a career advisor on call 24/7.',                                                                              image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusJohnson&backgroundColor=c0aede'  },
  { name: 'Aisha Patel',    role: 'Data Scientist',     company: 'Meta',     quote: 'I uploaded my PDF and within 30 seconds my entire resume was structured and scored. The gap analysis was brutally honest — exactly what I needed.',                                                          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AishaPatel&backgroundColor=ffd5dc'     },
  { name: 'James Wu',       role: 'Frontend Developer', company: 'Shopify',  quote: 'The inline editing on the live preview is a game changer. I could see every change reflected instantly — no more guessing how it would look.',                                                              image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesWu&backgroundColor=d1f4d1'        },
  { name: 'Sofia Reyes',    role: 'UX Designer',        company: 'Figma',    quote: 'I landed my dream job at Figma after using VectorOS for 2 weeks. The keyword gap analysis helped me tailor my resume to the exact job description.',                                                        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SofiaReyes&backgroundColor=ffeaa7'     },
  { name: 'Daniel Kim',     role: 'Backend Engineer',   company: 'Notion',   quote: 'The ATS score went from 42 to 87 after following the AI suggestions. I finally understand what recruiters are actually looking for.',                                                                        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanielKim&backgroundColor=b6e3f4'      },
  { name: 'Layla Hassan',   role: 'Marketing Lead',     company: 'HubSpot',  quote: 'Even as a non-technical person, the onboarding was seamless. The AI understood my career goals and built a resume that actually represented me.',                                                           image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LaylaHassan&backgroundColor=ffd5dc'    },
  { name: 'Ryan Torres',    role: 'DevOps Engineer',    company: 'AWS',      quote: 'The credit system is fair and transparent. I used the AI coach heavily during my job search and never felt nickel-and-dimed.',                                                                              image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RyanTorres&backgroundColor=c0aede'     },
  { name: 'Mei Lin',        role: 'ML Engineer',        company: 'OpenAI',   quote: 'VectorOS identified that I was underselling my impact. After the AI rewrites, my experience section finally matched the seniority I was applying for.',                                                     image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MeiLin&backgroundColor=ffeaa7'         },
];

export function TestimonialsSection() {
  return (
    <section className="relative w-full py-24 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Real Results, Real Voices
          </h2>
          <p className="text-white/40 text-base max-w-xl">
            See how job seekers are landing interviews faster with VectorOS — real stories, real impact.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {testimonials.map(({ name, role, company, quote, image }, index) => (
            <motion.div
              key={index}
              initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
              whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * index, duration: 0.7 }}
              className="relative grid grid-cols-[auto_1fr] gap-x-3 overflow-hidden border border-white/[0.08] hover:border-purple-500/40 bg-black/40 hover:bg-black/60 p-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]"
            >
              {/* Grid pattern overlay */}
              <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-white/[0.01] [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
                  <GridPattern width={25} height={25} x={-12} y={4} strokeDasharray="3" className="stroke-white/10 absolute inset-0 h-full w-full" />
                </div>
              </div>

              {/* Avatar */}
              <img alt={name} src={image} loading="lazy" className="w-9 h-9 rounded-full object-cover bg-white/10 shrink-0 mt-0.5" />

              {/* Content */}
              <div>
                <div className="-mt-0.5 mb-2">
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <span className="text-white/30 text-[11px] tracking-tight">{role} · {company}</span>
                </div>
                <blockquote>
                  <p className="text-white/60 text-xs leading-relaxed font-light">{quote}</p>
                </blockquote>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

