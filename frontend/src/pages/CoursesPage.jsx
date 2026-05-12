import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import {
  BookOpen, 
  Clock, 
  Search, 
  Zap, 
  Code2, 
  Database, 
  Cloud, 
  GitBranch, 
  Globe, 
  Layers, 
  Cpu,
  ArrowRight,
  Target,
  Lock
} from 'lucide-react'
import { CardSkeleton } from '../components/Skeleton'

const COURSE_ICONS = {
  html:       { icon: Globe,    color: 'text-orange-500', bg: 'bg-orange-500/10' },
  css:        { icon: Layers,   color: 'text-blue-500', bg: 'bg-blue-500/10' },
  javascript: { icon: Zap,      color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  react:      { icon: Cpu,      color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  nodejs:     { icon: Code2,    color: 'text-green-500', bg: 'bg-green-500/10'  },
  postgresql: { icon: Database, color: 'text-blue-600', bg: 'bg-blue-600/10'  },
  aws:        { icon: Cloud,    color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
}

const CATEGORIES = ['All Courses', 'Frontend', 'Backend', 'Full Stack', 'DevOps']

export default function CoursesPage() {
  const { courses, loading, userProgress } = useApp()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Courses')

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const title = c.title?.en || c.title || c.slug
      const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCategory === 'All Courses' || c.category === activeCategory
      return matchSearch && matchCat
    })
  }, [courses, search, activeCategory])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
      <header className="mb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[10px] font-black uppercase tracking-[0.3em] mb-6"
        >
          <Target size={14} /> Catalog
        </motion.div>
        <motion.h1 
          className="text-4xl md:text-6xl font-black text-white mb-6"
        >
          Explore <span className="text-brand-cyan">Roadmaps</span>
        </motion.h1>
      </header>

      <div className="space-y-8 mb-12">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roadmaps..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:ring-1 focus:ring-brand-cyan/50 transition-all text-lg"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat 
                ? 'bg-brand-cyan text-bg-deep shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                : 'bg-white/5 text-white/40 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              userProgress={userProgress} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CourseCard({ course, userProgress }) {
  const meta = COURSE_ICONS[course.slug] || { icon: BookOpen, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' }
  const Icon = meta.icon
  const lessons = course.chapters || []
  const total = lessons.length
  const done = lessons.filter(l => userProgress[l.id]?.isCompleted).length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-[2.5rem] border-white/5 p-8 relative overflow-hidden group flex flex-col h-full"
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div className={`w-14 h-14 rounded-2xl ${meta.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon size={28} className={meta.color} />
          </div>
          <span className="text-xs font-bold text-brand-purple uppercase">+250 XP</span>
        </div>

        <h3 className="text-2xl font-extrabold text-white mb-2">{course.title?.en || course.title}</h3>
        <p className="text-sm text-white/40 mb-8 line-clamp-2">{course.description?.en || course.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Chapters</p>
            <div className="text-xs font-bold text-white/70">{total} Lessons</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Level</p>
            <div className="text-xs font-bold text-white/70 uppercase">{course.difficulty || 'Beginner'}</div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-white/40 uppercase tracking-widest">Progress</span>
            <span className="text-brand-cyan">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-brand-cyan"
            />
          </div>
        </div>

        <Link 
          to={`/chapter/${course.slug}/${lessons[0]?.slug}`}
          className="w-full mt-auto py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-brand-cyan hover:text-bg-deep transition-all"
        >
          {progress > 0 ? 'Continue' : 'Start'}
          <ArrowRight size={18} />
        </Link>
      </div>
    </motion.div>
  )
}
