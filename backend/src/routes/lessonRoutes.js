import express from 'express';
import { getLessonBySlug, getLessons } from '../controllers/courseController.js';

const router = express.Router();

router.get('/', getLessons);
router.get('/:slug', getLessonBySlug);

export default router;
