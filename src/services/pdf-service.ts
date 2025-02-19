import PDFDocument from 'pdfkit';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
      
      // Load the PDF document using PDF.js
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      if (!pdf) {
        throw new Error('No content found in PDF');
      }

      let extractedText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => 'str' in item ? item.str : '')
          .join(' ');
        extractedText += pageText + '\n';
      }

      console.log('PDF text extracted successfully');
      return this.processText(extractedText);
    } catch (error) {
      console.error('Error in PDF content extraction:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Failed to extract PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a new PDF document with Vietnamese font support
   * @returns PDFKit.PDFDocument
   */
  public createDocument(): PDFKit.PDFDocument {
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
      }
    });

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