import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  CheckCircle2, 
  Menu, 
  PanelRightClose, 
  PanelRightOpen, 
  Search,
  BookOpen,
  Zap,
  Target,
  ChevronRight,
  Clock,
  Layout,
  Star,
  Play
} from 'lucide-react'
import CourseLogo from '../components/CourseLogo'
import { useApp } from '../context/AppContext'
import { getAdjacentLessons, getCourseById, getLesson } from '../content/lessonStore'
import { t } from '../data/i18n'

export default function ChapterPage() {
  const { state, actions } = useApp()
  const navigate = useNavigate()
  const { courseId, chapterId } = useParams()
  const course = getCourseById(courseId)
  const lesson = getLesson(courseId, chapterId)
  const adjacent = getAdjacentLessons(courseId, chapterId)
  const language = state.language
  const [query, setQuery] = useState('')
  const [isPanelMinimized, setIsPanelMinimized] = useState(false)
  const focusActive = state.focusMode.sessionActive

  useEffect(() => {
    if (!focusActive) return undefined
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') actions.registerFocusViolation()
    }
    const onBlur = () => actions.registerFocusViolation()
    window.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
    }
  }, [focusActive, actions])

  useEffect(() => {
    if (!course || !lesson) return
    if (state.selectedCourseId === course.id && state.selectedChapterId === lesson.slug) return
    actions.selectChapter(course.id, lesson.slug)
  }, [actions, course, lesson, state.selectedCourseId, state.selectedChapterId])

  if (!course || !lesson) return <Navigate to="/courses" replace />

  const doneKey = `${course.id}:${lesson.id}`
  const isDone = Boolean(state.userProgress?.[lesson.id]?.isCompleted)
  
  // Strict Learning: Check if previous lesson is locked
  const isLocked = lesson.sort_order > 1 && !state.userProgress?.[adjacent.prev?.id]?.isCompleted
  
  if (isLocked) {
     toast.error('This lesson is locked. Please complete the previous chapter first.')
     return <Navigate to={`/chapter/${courseId}/${adjacent.prev.slug}`} replace />
  }
  const theoryKey = language === 'hi' ? 'hindi' : language
  const theory = lesson.theory?.[theoryKey] || lesson.theory?.english || ''
  const total = course.chapters.length
  const completed = course.chapters.filter((item) => state.completedChapters[`${course.id}:${item.slug}`]).length
  const progressPercent = Math.round((completed / total) * 100)
  
  const filteredChapters = course.chapters.filter((item) => {
    const text = `${item.chapterNumber}. ${item.title}`.toLowerCase()
    return text.includes(query.trim().toLowerCase())
  })

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      {/* Sidebar for Chapters */}
      <motion.aside 
        initial={false}
        animate={{ width: isPanelMinimized ? 80 : 320 }}
        className="hidden md:flex flex-col border-r border-white/5 bg-bg-deep/50 backdrop-blur-xl relative z-20"
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            {!isPanelMinimized && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Roadmap</p>
                <h2 className="text-lg font-black text-white truncate max-w-[180px]">{course.title[language]}</h2>
              </motion.div>
            )}
            <button 
              onClick={() => setIsPanelMinimized(!isPanelMinimized)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-brand-cyan transition-all"
            >
              {isPanelMinimized ? <PanelRightOpen size={20} /> : <PanelRightClose size={20} />}
            </button>
          </div>

          {!isPanelMinimized && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-h-0">
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-[10px] font-bold mb-2">
                  <span className="text-white/40 uppercase tracking-widest">Progress</span>
                  <span className="text-brand-cyan">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-cyan" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find chapter..."
                  className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan/30 transition-all"
                />
              </div>

              {/* Chapters List */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10">
                {filteredChapters.map((item) => {
                  const done = Boolean(state.completedChapters[`${course.id}:${item.slug}`])
                  const active = item.slug === lesson.slug
                  return (
                    <Link 
                      key={item.slug}
                      to={`/chapter/${course.id}/${item.slug}`}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${active ? 'bg-brand-cyan text-bg-deep font-bold shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'hover:bg-white/5 text-white/40 hover:text-white'}`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${active ? 'bg-bg-deep/20' : 'bg-white/5'}`}>
                        {item.chapterNumber}
                      </div>
                      <span className="text-sm truncate flex-1">{item.title}</span>
                      {done && <CheckCircle2 size={14} className={active ? 'text-bg-deep' : 'text-brand-cyan'} />}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}

          {isPanelMinimized && (
            <div className="flex flex-col items-center gap-4">
              {course.chapters.slice(0, 10).map((item) => (
                <Link 
                  key={item.slug}
                  to={`/chapter/${course.id}/${item.slug}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.slug === lesson.slug ? 'bg-brand-cyan text-bg-deep' : 'bg-white/5 text-white/20 hover:text-white'}`}
                >
                  <span className="text-xs font-black">{item.chapterNumber}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-bg-deep relative">
        {/* Glow behind content */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-brand-cyan/5 blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 relative z-10">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/courses" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 transition-all">
                <ArrowLeft size={20} />
              </Link>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[10px] font-black uppercase tracking-widest">
                Level {lesson.level}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {lesson.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-white/40">
                <Clock size={16} />
                <span className="text-sm font-bold">{lesson.estimatedTime} read</span>
              </div>
              <div className="flex items-center gap-2 text-brand-purple">
                <Star size={16} />
                <span className="text-sm font-bold">+100 XP Reward</span>
              </div>
              {isDone && (
                <div className="flex items-center gap-2 text-brand-cyan bg-brand-cyan/10 px-3 py-1 rounded-full border border-brand-cyan/20">
                  <CheckCircle2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Theory Section */}
          <section className="glass-card p-8 md:p-12 rounded-[2.5rem] border-white/5 mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                <BookOpen size={20} />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-widest">The Core Theory</h3>
            </div>
            <div className="prose prose-invert prose-brand-cyan max-w-none">
              <p className="text-lg text-white/70 leading-relaxed">
                {theory}
              </p>
            </div>
          </section>

          {/* Examples */}
          {lesson.examples && lesson.examples.length > 0 && (
            <div className="space-y-8 mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                  <Play size={20} />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Live Examples</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {lesson.examples.map((example, i) => (
                  <div key={i} className="glass-card rounded-3xl border-white/5 overflow-hidden">
                    <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold text-white/60">{example.title}</span>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                      </div>
                    </div>
                    <div className="p-6 bg-[#010409]">
                      <pre className="text-sm font-mono text-brand-cyan overflow-x-auto no-scrollbar">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                    {example.explanation && (
                      <div className="p-6 bg-white/[0.02] border-t border-white/5 text-sm text-white/40 leading-relaxed italic">
                        {example.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4">
              {adjacent.prev && (
                <Link 
                  to={`/chapter/${course.id}/${adjacent.prev.slug}`}
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                >
                  <ArrowLeft size={18} /> Previous
                </Link>
              )}
            </div>
            
            <button 
              onClick={() => actions.completeChapter(course.id, lesson.id)}
              className={`px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-2xl ${isDone ? 'bg-white/5 text-brand-cyan border border-brand-cyan/30' : 'bg-brand-cyan text-bg-deep hover:scale-105 active:scale-95 shadow-brand-cyan/20'}`}
            >
              {isDone ? 'Chapter Completed' : 'Mark as Complete'}
            </button>

            <div className="flex items-center gap-4">
              {adjacent.next && (
                <Link 
                  to={`/chapter/${course.id}/${adjacent.next.slug}`}
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan font-bold transition-all"
                >
                  Next Chapter <ChevronRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
