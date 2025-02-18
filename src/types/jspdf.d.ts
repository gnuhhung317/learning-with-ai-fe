declare module 'jspdf' {
  export interface jsPDFOptions {
    orientation?: 'p' | 'portrait' | 'l' | 'landscape';
    unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc';
    format?: string | number[];
  }

  export class jsPDF {
    constructor(options?: jsPDFOptions | string, unit?: string, format?: string | number[]);
    addImage(imageData: string, format: string, x: number, y: number, width: number, height: number): void;
    output(type: string): string | ArrayBuffer;
    internal: {
      pageSize: {
        getWidth: () => number;
        getHeight: () => number;
      };
    };
  }
}