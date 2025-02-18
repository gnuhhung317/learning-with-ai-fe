import PDFDocument from 'pdfkit-browserify';
import { AI_CONFIG } from '../config/ai-config';
import { PDFService } from './pdf-service';
import { encode } from 'punycode';
import path from 'path';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizGenerationParams {
  topic: string;
  level: string;
  numberOfQuestions: number;
}

export class QuizService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async generateQuiz(
    params: QuizGenerationParams
  ): Promise<{
    questions: QuizQuestion[];
    quizPdfBuffer: Uint8Array;
    answersPdfBuffer: Uint8Array;
  }> {
    try {
      const questions = await this.generateQuestionsFromAI(params);
      const quizPdfBuffer = await this.generateQuizPdf(questions);
      const answersPdfBuffer = await this.generateAnswersPdf(questions);

      return {
        questions,
        quizPdfBuffer,
        answersPdfBuffer,
      };
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  public async generateQuizFromPDF(file: File, numberOfQuestions: number = 5, level: string = 'intermediate'): Promise<{
    questions: QuizQuestion[];
    quizPdfBuffer: Uint8Array;
    answersPdfBuffer: Uint8Array;
  }> {
    try {
      const pdfService = new PDFService();
      if (!pdfService.validatePDFFile(file)) {
        throw new Error('Invalid file type. Please upload a PDF file.');
      }

      const content = await pdfService.extractContent(file);
      
      // Preprocess the content to make it more suitable for quiz generation
      const processedContent = this.preprocessContent(content);
      
      const questions = await this.generateQuestionsFromAI({
        topic: processedContent,
        level: level,
        numberOfQuestions: numberOfQuestions
      });

      const quizPdfBuffer = await this.generateQuizPdf(questions);
      const answersPdfBuffer = await this.generateAnswersPdf(questions);

      return {
        questions,
        quizPdfBuffer,
        answersPdfBuffer,
      };
    } catch (error) {
      console.error('Error generating quiz from PDF:', error);
      throw new Error('Failed to generate quiz from PDF');
    }
  }

  private preprocessContent(content: string): string {
    // Remove any special characters and excessive whitespace
    let processed = content
      .replace(/[^\w\s.,?!-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Ensure the content is not too long for the API
    const maxLength = 5000;
    if (processed.length > maxLength) {
      processed = processed.slice(0, maxLength);
      // Try to end at a complete sentence
      const lastPeriod = processed.lastIndexOf('.');
      if (lastPeriod > maxLength * 0.8) {
        processed = processed.slice(0, lastPeriod + 1);
      }
    }

    return processed;
  }

  private async generateQuestionsFromAI(
    params: QuizGenerationParams
  ): Promise<QuizQuestion[]> {
    const batchSize = 20;
    const totalQuestions = params.numberOfQuestions;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds
    let allQuestions: QuizQuestion[] = [];
  
    const generateBatch = async (startIndex: number, size: number, retryCount = 0): Promise<QuizQuestion[]> => {
      try {
        const prompt = `
          Tạo ${size} câu hỏi trắc nghiệm về chủ đề ${params.topic} ở trình độ ${params.level}.
          Mỗi câu hỏi cần:
          - Rõ ràng và súc tích
          - Có đúng 4 lựa chọn
          - Có một đáp án đúng
          - Bao gồm giải thích cho đáp án đúng
  
          Trả về kết quả theo định dạng JSON sau:
          {
            "questions": [
              {
                "question": "Nội dung câu hỏi",
                "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
                "correctAnswer": 0,
                "explanation": "Giải thích tại sao đây là đáp án đúng"
              }
            ]
          }
        `;
  
        const response = await fetch(
          `${AI_CONFIG.GEMINI_API_ENDPOINT}/${AI_CONFIG.GEMINI_API_VERSION}/models/${AI_CONFIG.GEMINI_MODEL}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 5000,
              },
            }),
          }
        );
  
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
  
        const data = await response.json();
        const content = data.candidates[0]?.content?.parts[0]?.text;
        if (!content) {
          throw new Error('Invalid response format from Gemini API');
        }
  
        let cleanContent = content.replace(/```json\n|```/g, '').trim();
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in API response');
        }
  
        const parsedContent = JSON.parse(jsonMatch[0]);
        if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
          throw new Error('Invalid questions format in API response');
        }
  
        const validQuestions = parsedContent.questions.filter(q => {
          return q.question &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            typeof q.correctAnswer === 'number' &&
            q.correctAnswer >= 0 &&
            q.correctAnswer < 4;
        });
  
        if (validQuestions.length === 0) {
          throw new Error('No valid questions found in API response');
        }
  
        return validQuestions;
      } catch (error) {
        console.error(`Error generating questions batch ${startIndex / batchSize + 1}:`, error);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying batch ${startIndex / batchSize + 1} (attempt ${retryCount + 1})...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return generateBatch(startIndex, size, retryCount + 1);
        }
        
        throw new Error(`Failed to generate questions batch after ${maxRetries} retries`);
      }
    };
  
    // Generate batches in parallel
    const batchPromises = [];
    for (let i = 0; i < totalQuestions; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, totalQuestions - i);
      batchPromises.push(generateBatch(i, currentBatchSize));
      
      // Add a small delay between starting batches to avoid rate limiting
      if (i + batchSize < totalQuestions) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  
    try {
      const batchResults = await Promise.all(batchPromises);
      allQuestions = batchResults.flat();
      return allQuestions;
    } catch (error) {
      console.error('Error in batch processing:', error);
      throw new Error('Failed to generate questions');
    }
  }

  private async generateQuizPdf(questions: QuizQuestion[]): Promise<Uint8Array> {
    if (!questions || questions.length === 0) {
      throw new Error('No questions provided for PDF generation');
    }

    return new Promise((resolve, reject) => {
      try {
        const pdfService = new PDFService();
        const doc = pdfService.createDocument();


        const chunks: Uint8Array[] = [];
        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        doc.on('end', () => {
          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const result = new Uint8Array(totalLength);
          let offset = 0;
          chunks.forEach(chunk => {
            result.set(chunk, offset);
            offset += chunk.length;
          });
          resolve(result);
        });

        // Title
        doc.fontSize(24).text('Bài Kiểm Tra', { align: 'center' });
        doc.moveDown();

        // Instructions
        doc.fontSize(12)
           .text('Hướng dẫn: Chọn câu trả lời đúng nhất cho mỗi câu hỏi.', { align: 'left' });
        doc.moveDown();
        // Questions
        questions.forEach((q, index) => {
          // Question text
          doc.fontSize(14)
             .text(`${index + 1}. ${q.question}`, { continued: false });
          doc.moveDown(0.5);

          // Options with radio buttons
          q.options.forEach((option, optIndex) => {
            doc.fontSize(12)
               .text(`○ ${String.fromCharCode(65 + optIndex)}. ${option}`, {
                 indent: 30,
                 continued: false
               });
          });
          
  
        });

        doc.end();
      } catch (error) {
        console.log('Error generating quiz PDF:', error);
        reject(new Error('Failed to generate quiz PDF'));
      }
    });
  }

  private async generateAnswersPdf(questions: QuizQuestion[]): Promise<Uint8Array> {
    if (!questions || questions.length === 0) {
      throw new Error('No questions provided for PDF generation');
    }

    return new Promise((resolve, reject) => {
      try {
        const pdfService = new PDFService();
        const doc = pdfService.createDocument();

        const chunks: Uint8Array[] = [];
        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        doc.on('end', () => {
          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const result = new Uint8Array(totalLength);
          let offset = 0;
          chunks.forEach(chunk => {
            result.set(chunk, offset);
            offset += chunk.length;
          });
          resolve(result);
        });

        // Title
        doc.fontSize(24).text('Đáp Án', { align: 'center' });
        doc.moveDown();

        // Questions and Answers
        questions.forEach((q, index) => {
          // Question
          doc.fontSize(14)
             .text(`${index + 1}. ${q.question}`, { continued: false });
          doc.moveDown(0.5);

          // Correct Answer
          doc.fontSize(12)
             .fillColor('#0000FF')
             .text(`Đáp án đúng: ${String.fromCharCode(65 + q.correctAnswer)}`, {
               continued: false
             });
          doc.fillColor('#000000');
          doc.moveDown(0.5);

          // Explanation
          if (q.explanation) {
            doc.fontSize(11)
               .fillColor('#666666')
               .text(`Giải thích: ${q.explanation}`, {
                 indent: 30,
                 continued: false
               });
            doc.fillColor('#000000');
          }
          doc.moveDown();
        });

        doc.end();
      } catch (error) {
        reject(new Error('Failed to generate answers PDF'));
      }
    });
  }
}
