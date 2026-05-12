import { supabase } from '../database/supabase.js';
import { createCourseSchema, updateCourseSchema } from '../validations/courseValidation.js';

const normalizeCourseSlug = (course) =>
  course.slug ||
  course.category ||
  String(course.title || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildLegacyLessons = (course, lessons) => {
  const slug = normalizeCourseSlug(course);
  const title = String(course.title || '').toLowerCase();
  const courseId = String(course.id || '').toLowerCase();

  return (lessons || [])
    .filter((lesson) => {
      const lessonCourseId = String(lesson.course_id || '').toLowerCase();
      return (
        lessonCourseId === slug ||
        lessonCourseId === title ||
        lessonCourseId === courseId
      );
    })
    .sort((a, b) => {
      const orderA = Number(a.chapter_number ?? a.sort_order ?? 0);
      const orderB = Number(b.chapter_number ?? b.sort_order ?? 0);
      return orderA - orderB;
    });
};

const attachCourseMetaToLesson = (lesson, course) => ({
  ...lesson,
  course: course
    ? {
        id: course.id,
        title: course.title,
        slug: normalizeCourseSlug(course),
      }
    : null,
});

const resolveCourseForLesson = (lesson, courses) => {
  const lessonCourseId = String(lesson.course_id || '').toLowerCase();

  return (
    courses.find((course) => {
      const slug = normalizeCourseSlug(course);
      const title = String(course.title || '').toLowerCase();
      return lessonCourseId === slug || lessonCourseId === title || String(course.id) === String(lesson.course_id);
    }) || null
  );
};

/**
 * @desc    Get all courses (public/published)
 * @route   GET /api/courses
 */
export const getCourses = async (req, res, next) => {
  try {
    // 1. Fetch all courses
    const { data: courses, error: courseErr } = await supabase
      .from('courses')
      .select('*')
      .order('id', { ascending: true });

    if (courseErr) throw courseErr;

    // 2. Fetch all lessons to link them (since DB relationship is broken)
    const { data: allLessons, error: lessonErr } = await supabase
      .from('lessons')
      .select('*');

    if (lessonErr) throw lessonErr;

    // #region agent log
    {
      const sample = (allLessons || []).slice(0, 5);
      const firstCourse = (courses || [])[0];
      fetch('http://127.0.0.1:7732/ingest/86ec5a58-d4a6-4e8f-b77c-d4a11ced4ed2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '94aba5' },
        body: JSON.stringify({
          sessionId: '94aba5',
          runId: 'pre-fix',
          hypothesisId: 'H1-H2-H5',
          location: 'courseController.js:getCourses:afterLessonsFetch',
          message: 'lesson rows shape vs courses',
          data: {
            allLessonsCount: (allLessons || []).length,
            sampleLessonCourseIds: sample.map((l) => String(l?.course_id || '')),
            firstCourseId: firstCourse ? String(firstCourse.id) : null,
            firstCourseTitle: firstCourse ? String(firstCourse.title || '') : null,
            firstCourseSlug: firstCourse ? normalizeCourseSlug(firstCourse) : null,
            idWouldMatchFirstSample: sample.map((l) =>
              firstCourse
                ? String(l?.course_id || '').toLowerCase() === String(firstCourse.id).toLowerCase()
                : null,
            ),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion

    // 3. Map lessons to courses manually
    const coursesWithLessons = courses.map(course => ({
      ...course,
      slug: normalizeCourseSlug(course),
      lessons: buildLegacyLessons(course, allLessons),
    }));

    // #region agent log
    fetch('http://127.0.0.1:7732/ingest/86ec5a58-d4a6-4e8f-b77c-d4a11ced4ed2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '94aba5' },
      body: JSON.stringify({
        sessionId: '94aba5',
        runId: 'pre-fix',
        hypothesisId: 'H1',
        location: 'courseController.js:getCourses:afterMap',
        message: 'per-course matched lesson count',
        data: {
          perCourse: coursesWithLessons.map((c) => ({
            courseId: String(c.id),
            lessonCount: (c.lessons || []).length,
          })),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    res.status(200).json({
      success: true,
      count: coursesWithLessons.length,
      data: coursesWithLessons
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single course with full content
 * @route   GET /api/courses/:id
 */
export const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const normalizedId = String(id).trim().toLowerCase();

    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select('*');

    if (courseError) throw courseError;

    const course = (courses || []).find((entry) => {
      const title = String(entry.title || '').toLowerCase();
      const slug = normalizeCourseSlug(entry);
      return String(entry.id) === id || title === normalizedId || slug === normalizedId;
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // 2. Fetch lessons for this course manually
    const { data: lessons, error: lessonErr } = await supabase
      .from('lessons')
      .select('*')
      .order('chapter_number', { ascending: true });

    if (lessonErr) throw lessonErr;

    res.status(200).json({ 
      success: true, 
      data: {
        ...course,
        slug: normalizeCourseSlug(course),
        lessons: buildLegacyLessons(course, lessons),
      } 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all lessons
 * @route   GET /api/lessons
 */
export const getLessons = async (req, res, next) => {
  try {
    const { courseId } = req.query;

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .order('course_id', { ascending: true })
      .order('chapter_number', { ascending: true });

    if (lessonsError) throw lessonsError;

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*');

    if (coursesError) throw coursesError;

    let normalizedLessons = (lessons || []).map((lesson) =>
      attachCourseMetaToLesson(lesson, resolveCourseForLesson(lesson, courses || [])),
    );

    if (courseId) {
      const normalizedCourseId = String(courseId).trim().toLowerCase();
      normalizedLessons = normalizedLessons.filter((lesson) => {
        const slug = lesson.course?.slug?.toLowerCase();
        const title = lesson.course?.title?.toLowerCase();
        return (
          String(lesson.course_id).toLowerCase() === normalizedCourseId ||
          slug === normalizedCourseId ||
          title === normalizedCourseId
        );
      });
    }

    res.status(200).json({
      success: true,
      count: normalizedLessons.length,
      data: normalizedLessons,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single lesson by slug
 * @route   GET /api/lessons/:slug
 */
export const getLessonBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (lessonError) throw lessonError;

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*');

    if (coursesError) throw coursesError;

    const course = resolveCourseForLesson(lesson, courses || []);

    res.status(200).json({
      success: true,
      data: attachCourseMetaToLesson(lesson, course),
    });
  } catch (err) {
    next(err);
  }
};



/**
 * @desc    Create new course (Admin/Instructor Only)
 * @route   POST /api/courses
 */
export const createCourse = async (req, res, next) => {
  try {
    const validatedData = createCourseSchema.parse(req.body);

    const { data: course, error } = await supabase
      .from('courses')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update course (Admin/Instructor Only)
 * @route   PUT /api/courses/:id
 */
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateCourseSchema.parse(req.body);

    const { data: course, error } = await supabase
      .from('courses')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};
/**
 * @desc    Get personalized daily learning plan
 * @route   GET /api/courses/daily-plan
 */
export const getDailyPlan = async (req, res, next) => {
  try {
    const { level = 'beginner' } = req.query;

    const { data: courses } = await supabase.from('courses').select('*').limit(5);
    const { data: lessons } = await supabase.from('lessons').select('*').limit(100);

    // Manual join
    const allLessons = lessons.filter(l => 
        l.level?.toLowerCase() === level.toLowerCase()
    );
    
    const randomLesson = allLessons.length > 0 
        ? allLessons[Math.floor(Math.random() * allLessons.length)]
        : lessons[0];

    res.status(200).json({
      success: true,
      data: {
        courseCount: courses?.length || 0,
        lesson: randomLesson?.title || 'Explore new horizons',
        exercise: `Practice ${randomLesson?.title || 'coding'} fundamentals`,
        quiz: `Take the ${randomLesson?.title || 'module'} assessment`,
        miniProject: `Build a mini project using ${randomLesson?.title || 'these skills'}`,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};


/**
 * @desc    Delete course (Admin Only)
 * @route   DELETE /api/courses/:id
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
