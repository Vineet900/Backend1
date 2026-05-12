import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HeroSection from '../components/HeroSection'
import RoadmapSection from '../components/RoadmapSection'
import FeatureSection from '../components/FeatureSection'
import UserProgress from '../components/UserProgress'
import roadmapsData from '../content/roadmaps.json'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function HomePage() {
  const [roadmaps, setRoadmaps] = useState([])
  const [catalogPreview, setCatalogPreview] = useState({
    status: isSupabaseConfigured ? 'loading' : 'disabled',
    count: 0,
    courses: [],
    error: '',
  })

  useEffect(() => {
    // In a real app, this would be an API call
    setRoadmaps(roadmapsData)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let isMounted = true

    async function loadCatalogPreview() {
      const { data, count, error } = await supabase
        .from('courses')
        .select('id, title, description', { count: 'exact' })
        .limit(3)

      if (!isMounted) return

      if (error) {
        setCatalogPreview({
          status: 'error',
          count: 0,
          courses: [],
          error: error.message,
        })
        return
      }

      setCatalogPreview({
        status: 'ready',
        count: count || 0,
        courses: data || [],
        error: '',
      })
    }

    loadCatalogPreview()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-0"
    >
      <HeroSection />

      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="glass-card rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-cyan">
                Supabase Live Query
              </p>
              <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
                Frontend is wired to your `courses` table
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
                This preview loads directly from Supabase with the publishable key you provided.
              </p>
            </div>

            <div className="min-w-[160px] rounded-2xl border border-brand-cyan/20 bg-brand-cyan/10 px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-cyan/80">
                Courses Found
              </p>
              <p className="mt-2 text-4xl font-black text-white">
                {catalogPreview.status === 'ready' ? catalogPreview.count : '--'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {catalogPreview.status === 'loading' && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60 md:col-span-3">
                Loading courses from Supabase...
              </div>
            )}

            {catalogPreview.status === 'disabled' && (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-sm text-amber-100 md:col-span-3">
                Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to enable live catalog queries.
              </div>
            )}

            {catalogPreview.status === 'error' && (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-100 md:col-span-3">
                Supabase query failed: {catalogPreview.error}
              </div>
            )}

            {catalogPreview.status === 'ready' &&
              catalogPreview.courses.map((course) => (
                <article
                  key={course.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-lg font-bold text-white">{course.title}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/55">
                    {course.description || 'Description not available yet.'}
                  </p>
                </article>
              ))}
          </div>
        </div>
      </section>
      
      <UserProgress />
      
      {/* Background Section for Features and Roadmaps */}
      <div className="relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <FeatureSection />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      <RoadmapSection roadmaps={roadmaps} />

      {/* CTA Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="glass-card p-12 md:p-20 rounded-[3rem] border-brand-cyan/20 bg-mesh relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/10 blur-[100px]"></div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
              Ready to <span className="text-brand-cyan">Master</span> Your Craft?
            </h2>
            <p className="text-white/50 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of developers building the future. Start your learning journey today and level up your skills.
            </p>
            
            <button className="px-12 py-5 rounded-2xl bg-white text-bg-deep font-black text-lg hover:bg-brand-cyan transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95">
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
