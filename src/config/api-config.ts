export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    QUIZ: '/api/quiz',
    QUIZ_PDF: '/api/quiz/pdf',
    QUIZ_PDF_GENERATE: '/api/quiz/pdf/generate',
    QUIZ_ATTEMPT: '/api/quiz/attempt',
    QUIZ_HISTORY: '/api/quiz/history',
    QUIZ_SAVED: '/api/quiz/saved',
    ANALYTICS: '/api/analytics/performance'
  }
};