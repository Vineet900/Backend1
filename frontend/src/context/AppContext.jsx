import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { userAPI, courseAPI, quizAPI, authAPI } from '../lib/api'
import { fetchContentFromDB } from '../content/lessonStore'
import { toast } from 'react-hot-toast'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [language, setLanguage] = useState(localStorage.getItem('preferred_language') || 'en')
  
  const [stats, setStats] = useState({
    xp: 0,
    sp: 0,
    streak: 0,
    level: 1
  })

  const [assessmentMode, setAssessmentMode] = useState({
    isActive: false,
    timerRemaining: 0,
    violations: 0,
    deductions: 0
  })

  /**
   * Load Initial Data
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // 1. Fetch Course Content from Production API
      const { COURSES } = await fetchContentFromDB()
      setCourses(COURSES)

      // 2. Fetch User Session
      const session = isSupabaseConfigured
        ? (await supabase.auth.getSession()).data.session
        : null
      
      if (session) {
        setUser(session.user)
        
        // 3. Fetch Production Profile
        try {
          const { data: profileRes } = await userAPI.getProfile()
          if (profileRes.success) {
            const resolvedRole =
              profileRes.data.role ||
              profileRes.data.profile?.role ||
              session.user.app_metadata?.role ||
              session.user.user_metadata?.role ||
              'STUDENT'
            const p = {
              ...profileRes.data.profile,
              role: resolvedRole,
              isAdmin: resolvedRole === 'ADMIN',
            }
            setProfile(p)
            setStats({
              xp: p.xp || 0,
              sp: p.wallets?.[0]?.balance || 0,
              streak: p.streaks?.[0]?.current_streak || 0,
              level: p.level || 1
            })
          }
        } catch (profileErr) {
          console.warn('Profile not found, user might be new:', profileErr)
          // For social login or new users where backend hasn't synced yet,
          // we can use session user data as a fallback or trigger a sync
          const fallbackRole =
            session.user.app_metadata?.role ||
            session.user.user_metadata?.role ||
            'STUDENT'
          setProfile({
            username: session.user.user_metadata?.username || session.user.email.split('@')[0],
            full_name: session.user.user_metadata?.full_name || 'New Agent',
            xp: 0,
            level: 1,
            role: fallbackRole,
            isAdmin: fallbackRole === 'ADMIN',
          })
        }
      }
    } catch (err) {
      console.error('Initialization error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    if (!isSupabaseConfigured) return undefined

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session) loadData()
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [loadData])

  /**
   * Actions Object for components
   */
  const actions = {
    // Auth Actions
    signIn: async (email, password) => {
      try {
        const { data: response } = await authAPI.login(email, password)
        if (response.success) {
          // IMPORTANT: Manually set session on frontend to keep in sync with backend
          if (isSupabaseConfigured && response.data?.session) {
            await supabase.auth.setSession(response.data.session)
          }
          await loadData()
          return { success: true }
        }
        return { error: response.message || 'Login failed' }
      } catch (err) {
        return { error: err.response?.data?.message || 'Login failed' }
      }
    },

    signUp: async (formData) => {
      try {
        const { data } = await authAPI.register(formData)
        return data
      } catch (err) {
        return { error: err.response?.data?.message || 'Registration failed' }
      }
    },

    verifyOTP: async (email, otp) => {
      try {
        const { data: response } = await authAPI.verify(email, otp)
        if (response.success) {
           if (isSupabaseConfigured && response.data?.session) {
             await supabase.auth.setSession(response.data.session)
           }
           await loadData()
           return { success: true }
        }
        return { error: response.message || 'Verification failed' }
      } catch (err) {
        return { error: err.response?.data?.message || 'Verification failed' }
      }
    },

    // Learning Actions
    completeChapter: async (courseId, lessonId) => {
      try {
        const { data } = await courseAPI.updateProgress({
          lessonId,
          isCompleted: true
        })
        if (data.success) {
          toast.success('Chapter completed! +100 XP', {
            icon: '🔥',
            duration: 4000
          })
          
          // Achievement check (Local logic but synced with DB)
          if (data.data?.is_first_lesson) {
             toast('Achievement Unlocked: Early Bird!', { icon: '🏆' })
          }

          loadData() // Refresh stats
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to sync progress')
      }
    },

    // Assessment Actions
    startAssessment: (subject, duration) => {
      setAssessmentMode({
        isActive: true,
        timerRemaining: duration,
        violations: 0,
        deductions: 0
      })
    },

    submitAssessment: async (quizId, answers, timeTaken, violations) => {
      try {
        const { data } = await quizAPI.submitAttempt(quizId, {
          answers,
          time_taken_seconds: timeTaken,
          violations
        })
        if (data.success) {
          setAssessmentMode(prev => ({ ...prev, isActive: false }))
          loadData() // Refresh XP/SP
          return data.data
        }
      } catch (err) {
        toast.error('Failed to submit quiz')
      }
    },

    registerViolation: () => {
      setAssessmentMode(prev => ({
        ...prev,
        violations: prev.violations + 1,
        deductions: (prev.violations + 1) * 50
      }))
    },

    // Profile Actions
    updateLanguage: (lang) => {
      setLanguage(lang)
      localStorage.setItem('preferred_language', lang)
    },

    signInWithGoogle: async () => {
      if (!isSupabaseConfigured) {
        const message = 'Supabase auth is not configured for this environment'
        toast.error(message)
        return { error: message }
      }

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/home'
          }
        })
        if (error) throw error
        return { success: true }
      } catch (err) {
        toast.error(err.message || 'Google Auth failed')
        return { error: err.message }
      }
    },

    logout: async () => {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      }
      setUser(null)
      setProfile(null)
    }
  }

  const value = {
    user,
    profile,
    loading,
    courses,
    language,
    stats,
    assessmentMode,
    actions
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
