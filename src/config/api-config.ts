export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    QUIZ: '/api/quiz',
    QUIZ_PDF: '/api/quiz/pdf',
    QUIZ_PDF_GENERATE: '/api/quiz/pdf/generate',
    QUIZZES: '/api/quizzes',
    QUESTIONS: '/api/questions',
    PROMPT_TEMPLATES: '/api/prompt-templates',
    GROUPS: '/api/groups'
  }
};