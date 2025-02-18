import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/services/quiz-service';

export async function POST(request: NextRequest) {
  try {
    const { topic, level, numberOfQuestions, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    const quizService = new QuizService(apiKey);
    const { questions, quizPdfBuffer, answersPdfBuffer } = await quizService.generateQuiz({
      topic,
      level,
      numberOfQuestions
    });

    return NextResponse.json({
      questions,
      quizPdfBuffer: Array.from(quizPdfBuffer),
      answersPdfBuffer: Array.from(answersPdfBuffer)
    });
  } catch (error) {
    console.error('Error in quiz generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}