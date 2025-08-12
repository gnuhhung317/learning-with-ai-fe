import { API_CONFIG } from '../config/api-config';

export interface QuizPayload {
  title: string;
  description?: string;
  groupId?: string;
  tags?: string[];
}

export interface QuestionPayload {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  promptType: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  type: string;
}

export interface Question extends QuestionPayload {
  id: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  groupId?: string;
  tags?: string[];
  createdAt: string;
  questions: Question[];
}

export class QuizService {
  private baseUrl = API_CONFIG.BASE_URL;

  async createQuiz(payload: QuizPayload) {
    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.QUIZZES}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error('Failed to create quiz');
    }
    return res.json();
  }

  async addQuestion(quizId: string, payload: QuestionPayload) {
    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.QUIZZES}/${quizId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error('Failed to add question');
    }
    return res.json();
  }

  async updateQuestion(questionId: string, payload: Partial<QuestionPayload>) {
    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.QUESTIONS}/${questionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error('Failed to update question');
    }
    return res.json();
  }

  async listGroups(): Promise<Group[]> {
    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.GROUPS}`);
    if (!res.ok) {
      throw new Error('Failed to fetch groups');
    }
    return res.json();
  }

  async listPromptTemplates(): Promise<PromptTemplate[]> {
    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PROMPT_TEMPLATES}`);
    if (!res.ok) {
      throw new Error('Failed to fetch prompt templates');
    }
    return res.json();
  }

  async listQuizzes(groupId?: string): Promise<Quiz[]> {
    const res = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.QUIZZES}${
        groupId ? `?group=${groupId}` : ''
      }`
    );
    if (!res.ok) {
      throw new Error('Failed to fetch quizzes');
    }
    return res.json();
  }
}
