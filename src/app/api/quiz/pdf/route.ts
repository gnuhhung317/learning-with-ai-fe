export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const level = formData.get('level') as string;
    const numberOfQuestions = Number(formData.get('numberOfQuestions')) || 5;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      );
    }

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('level', level);
    formDataToSend.append('numberOfQuestions', String(numberOfQuestions));
    formDataToSend.append('description', description);

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUIZ_PDF}`, {
      method: 'POST',
      body: formDataToSend
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const { questions } = await response.json();

    return NextResponse.json({
      questions,
    });
  } catch (error) {
    console.error('Error in PDF quiz generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz from PDF' },
      { status: 500 }
    );
  }
}