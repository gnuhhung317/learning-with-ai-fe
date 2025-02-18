export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/services/quiz-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const apiKey = formData.get('apiKey') as string;
    const level = formData.get('level') as string;
    const numberOfQuestions = Number(formData.get('numberOfQuestions')) || 5;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      );
    }

    const quizService = new QuizService(apiKey);
    const { questions, quizPdfBuffer, answersPdfBuffer } = await quizService.generateQuizFromPDF(file, numberOfQuestions, level);

    return NextResponse.json({
      questions,
      quizPdfBuffer: Array.from(quizPdfBuffer),
      answersPdfBuffer: Array.from(answersPdfBuffer)
    });
  } catch (error) {
    console.error('Error in PDF quiz generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz from PDF' },
      { status: 500 }
    );
  }
}