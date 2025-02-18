import { AI_CONFIG } from '../config/ai-config';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LearningPath {
  difficulty: string;
  duration: string;
  milestones: number;
  topics: string[];
  assessments: string[];
}

export class AIService {
  private apiKey: string;
  private context: ChatMessage[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error('Invalid response format from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async createLearningPath(userInput: {
    topic: string;
    level: string;
    goals: string[];
  }): Promise<LearningPath> {
    const prompt = `
      Create a structured learning path for:
      Topic: ${userInput.topic}
      Level: ${userInput.level}
      Goals: ${userInput.goals.join(', ')}
      
      Please provide your response in exactly two sections separated by three dashes (---)
      
      Section 1: Topics
      List each topic with a bullet point starting with '- '
      
      Section 2: Assessments
      Provide a JSON array of assessments in this exact format:
      [
        {
          "title": "Assessment Title",
          "type": "quiz",
          "description": "Assessment description",
          "questions": [
            {
              "question": "Question text",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "correctAnswer": 0,
              "explanation": "Explanation for the correct answer"
            }
          ]
        }
      ]
    `;

    try {
      const response = await this.generateResponse(prompt);
      const [topicsSection, assessmentsSection] = response.split('---').map(section => section.trim());
      
      // Parse topics (lines starting with '- ')
      const topics = topicsSection.split('\n').filter(line => line.startsWith('- '));
      
      // Parse assessments JSON
      let assessments = [];
      try {
        // Remove any markdown code block markers and clean the JSON string
        const cleanJson = assessmentsSection
          .replace(/```json\n|```/g, '')
          .trim();
        assessments = JSON.parse(cleanJson);
      } catch (e) {
        console.warn('Failed to parse assessments JSON:', e);
        // Fallback to basic assessment structure
        assessments = [{
          title: 'Basic Assessment',
          type: 'quiz',
          description: `Assessment for ${userInput.topic}`,
          questions: [{
            question: `Explain the key concepts of ${userInput.topic}`,
            options: topics.slice(0, 4).map(t => t.replace('- ', '')),
            correctAnswer: 0,
            explanation: 'Understanding fundamentals is essential'
          }]
        }];
      }

      return {
        difficulty: userInput.level,
        duration: AI_CONFIG.DEFAULT_LEARNING_PATH_TEMPLATE.estimatedDuration,
        milestones: AI_CONFIG.DEFAULT_LEARNING_PATH_TEMPLATE.milestones,
        topics: topics,
        assessments: assessments
      };
    } catch (error) {
      console.error('Error creating learning path:', error);
      throw new Error('Failed to create learning path');
    }
  }

  async analyzeDocument(documentContent: string): Promise<{
    summary: string;
    keyPoints: string[];
    suggestedTopics: string[];
  }> {
    const prompt = `
      Analyze the following educational content and provide:
      1. A concise summary
      2. Key learning points
      3. Suggested related topics for further study

      Content: ${documentContent}
    `;

    try {
      const response = await this.generateResponse(prompt);
      // Parse the response into structured data
      const [summary, ...points] = response.split('\n\n');
      
      return {
        summary: summary.replace('Summary: ', ''),
        keyPoints: points[0].split('\n').filter(p => p.startsWith('- ')),
        suggestedTopics: points[1].split('\n').filter(t => t.startsWith('- '))
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw new Error('Failed to analyze document');
    }
  }
}