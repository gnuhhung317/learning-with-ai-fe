import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/config/api-config';

export async function POST(request: NextRequest) {
  try {
    const { questions } = await request.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid questions data' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUIZ_PDF_GENERATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: JSON.stringify({ questions, type: 'answers' })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const pdfBuffer = await response.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'attachment; filename=answers.pdf');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error in PDF generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDFs' },
      { status: 500 }
    );
  }
}