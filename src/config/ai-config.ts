// Google AI Studio Configuration
export const AI_CONFIG = {
  // API Configuration
  GEMINI_API_ENDPOINT: process.env.GEMINI_API_ENDPOINT || 'https://generativelanguage.googleapis.com',
  GEMINI_API_VERSION: 'v1beta',
  
  // Model Configuration
  GEMINI_MODEL: 'gemini-1.5-flash',
  CONTEXT_WINDOW_SIZE: 2000000, // 2 million tokens context window
  
  // Feature Flags
  ENABLE_OCR: true,
  ENABLE_SEMANTIC_SEARCH: true,
  ENABLE_PERSONALIZED_LEARNING: true,
  
  // Integration Settings
  VECTOR_DB_CONFIG: {
    provider: 'pinecone',
    dimension: 1536,
    metric: 'cosine'
  },
  
  // Security Settings
  MAX_REQUESTS_PER_MIN: 60,
  REQUIRE_API_KEY: true,
  
  // Learning Path Configuration
  DEFAULT_LEARNING_PATH_TEMPLATE: {
    difficulty: 'beginner',
    estimatedDuration: '8 weeks',
    milestones: 4,
    assessmentFrequency: 'weekly'
  }
};

// Authentication Configuration
export const AUTH_CONFIG = {
  FIREBASE_CONFIG: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  }
};

// Storage Configuration
export const STORAGE_CONFIG = {
  FIRESTORE_COLLECTIONS: {
    users: 'users',
    learningPaths: 'learning_paths',
    progress: 'user_progress',
    documents: 'learning_documents'
  },
  DRIVE_API_VERSION: 'v3'
};