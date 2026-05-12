import { courseAPI } from '../lib/api'

export let LESSONS = []
export let COURSES = []

/**
 * Initialize content from Production API
 */
export async function fetchContentFromDB() {
  try {
    const { data: response } = await courseAPI.getCourses()
    const coursesData = response.data

    // Flatten for LESSONS array (Legacy support)
    LESSONS = (coursesData || []).flatMap(course => {
      const sections = course.sections || []
      if (sections.length > 0) {
        return sections.flatMap(section => 
          (section.lessons || []).map(lesson => ({
            ...lesson,
            category: course.slug || course.category || course.id,
            courseId: course.id,
            sectionId: section.id
          }))
        )
      } else if (course.lessons) {
        // Fallback for flat lesson structure
        return course.lessons.map(lesson => ({
          ...lesson,
          category: course.slug || course.category || course.id,
          courseId: course.id,
          sectionId: 'default'
        }))
      }
      return []
    })

    // Format for COURSES array (Legacy support)
    COURSES = (coursesData || []).map(course => {
      const sections = course.sections || []
      return {
        ...course,
        id: course.id,
        slug: course.slug || course.category || course.id,
        chapters: sections.length > 0 
          ? sections.flatMap(s => (s.lessons || []).map(l => ({ ...l, sectionTitle: s.title })))
          : (course.lessons || []).map(l => ({ ...l, sectionTitle: 'Lessons' }))
      }
    })

    return { LESSONS, COURSES }
  } catch (err) {
    console.error('Failed to sync content from API:', err)
    return { LESSONS: [], COURSES: [] }
  }
}

export function getCourses() {
  return COURSES
}

export function getCourseById(courseId) {
  return COURSES.find((course) => course.id === courseId || course.slug === courseId)
}

export function getLesson(courseId, lessonSlug) {
  const course = getCourseById(courseId)
  return course?.chapters.find((lesson) => lesson.slug === lessonSlug)
}

export function getAdjacentLessons(courseId, lessonSlug) {
  const course = getCourseById(courseId)
  if (!course) return { prev: null, next: null }
  const index = course.chapters.findIndex((lesson) => lesson.slug === lessonSlug)
  if (index === -1) return { prev: null, next: null }
  return {
    prev: course.chapters[index - 1] || null,
    next: course.chapters[index + 1] || null,
  }
}

export function searchLessons(query, language = 'en') {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return LESSONS.filter((lesson) => {
    const text = [
      lesson.title,
      lesson.content || '',
      lesson.summary || '',
    ]
      .join(' ')
      .toLowerCase()
    return text.includes(q)
  }).map((lesson) => ({
    courseId: lesson.category,
    chapterId: lesson.slug,
    chapterTitle: lesson.title,
  }))
}
