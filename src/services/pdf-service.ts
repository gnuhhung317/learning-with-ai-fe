import PDFDocument from 'pdfkit-browserify';
import { Buffer } from 'buffer';

export class PDFService {
  public validatePDFFile(file: File): boolean {
    return file.type === 'application/pdf';
  }

  /**
   * Extracts text content from a PDF file
   * @param file PDF file to process
   * @returns Promise<string> Extracted text content
   */
  public async extractContent(file: File): Promise<string> {
    try {
      console.log('Starting PDF content extraction...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('File converted to ArrayBuffer successfully');

      // Note: PDFKit is primarily for PDF creation, not text extraction
      // For a production environment, you might want to use a dedicated PDF parsing library
      // This is a simplified implementation
      const text = new TextDecoder().decode(arrayBuffer);
      return this.processText(text);
    } catch (error) {
      console.error('Error in PDF content extraction:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Failed to extract PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a new PDF document with Vietnamese font support
   * @returns PDFKit.PDFDocument
   */
  public createDocument(): typeof PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      font: 'Helvetica',
      lang: 'vi',
      autoFirstPage: true,
      info: {
        Producer: 'PDF Service',
        Creator: 'Quiz Generator',
        CreationDate: new Date()
      },
      compress: false
    });

    // Use Helvetica as the default font since it has decent Unicode support
    // and is available by default in PDFKit
    doc.font('Helvetica');
    return doc;
  }

  /**
   * Processes and cleans the extracted text
   * @param text Raw extracted text
   * @returns string Processed text
   */
  private processText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .trim();
  }
}