import axios from 'axios'
import { supabase } from './supabase'

const rawApiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
export const API_BASE_URL = rawApiBase.replace(/\/api\/?$/, '')
const API_ENDPOINT = `${API_BASE_URL}/api`

/**
 * Create axios instance with JWT authentication
 */
const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Add JWT token to request headers if available
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (supabase) {
        const { data } = await supabase.auth.getSession()
        const token = data?.session?.access_token

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error)
    }

    return config
  },
  (error) => Promise.reject(error),
)

/**
 * Handle response errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request - session may be expired')
    }
    return Promise.reject(error)
  },
)

/**
 * Auth API
 */
export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (data) => apiClient.post('/auth/register', data),
  verify: (email, otp) => apiClient.post('/auth/verify', { email, otp }),
  logout: () => apiClient.post('/auth/logout'),
}

/**
 * User API
 */
export const userAPI = {
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (updates) => apiClient.put('/user/update', updates),
  syncStats: (stats) => apiClient.post('/user/sync-stats', stats),
  convertXP: (amount) => apiClient.post('/user/convert-xp', { amount }),
  getLeaderboard: () => apiClient.get('/user/leaderboard'),
}

/**
 * Course & Learning API
 */
export const courseAPI = {
  getCourses: () => apiClient.get('/courses'),
  getCourse: (id) => apiClient.get(`/courses/${id}`),
  getDailyPlan: (level, lang) => apiClient.get(`/courses/daily-plan?level=${level}&language=${lang}`),
  updateProgress: (progress) => apiClient.post('/progress/lesson', progress),
  getCourseProgress: (courseId) => apiClient.get(`/progress/${courseId}`),
}

/**
 * Quiz API
 */
export const quizAPI = {
  submitAttempt: (quizId, data) => apiClient.post(`/quizzes/${quizId}/submit`, data),
}

/**
 * AI Tutor API
 */
export const tutorAPI = {
  ask: (payload) => apiClient.post('/tutor', payload),
}

/**
 * Certificate API
 */
export const certificateAPI = {
  generate: (courseId) => apiClient.post(`/certificates/generate/${courseId}`),
  verify: (code) => apiClient.get(`/certificates/verify/${code}`),
}

/**
 * Upload API
 */
export const uploadAPI = {
  uploadAvatar: (formData) => apiClient.post('/uploads/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

/**
 * Admin API
 */
export const adminAPI = {
  getStats: () => apiClient.get('/admin/stats'),
  getHealth: () => apiClient.get('/admin/system-health'),
  getAuditLogs: (page = 1) => apiClient.get(`/admin/audit-logs?page=${page}`),
  manageUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  banUser: (id, banned) => apiClient.post(`/admin/users/${id}/ban`, { banned }),
  adjustPoints: (userId, amount, reason) => apiClient.post('/admin/points/adjust', { userId, amount, reason }),
}

export default apiClient
