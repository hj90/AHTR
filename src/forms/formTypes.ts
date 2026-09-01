export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'email'
  | 'tel'
  | 'select'
  | 'radio'
  | 'checkbox';

export type FieldValue = string | boolean;
export type FormValues = Record<string, FieldValue>;

export interface FieldOption {
  label: string;
  value: string;
}

export type PdfFieldMapping =
  | {
      mode: 'acroform';
      fieldName: string;
      pdfFieldType?: 'text' | 'checkbox' | 'buttonGroup' | 'radio' | 'dropdown';
      exportValue?: string;
      exportValueByValue?: Record<string, string>;
    }
  | {
      mode: 'overlay';
      page: number;
      x: number;
      y: number;
      size?: number;
      maxWidth?: number;
      lineHeight?: number;
      renderAs?: 'text' | 'checkbox' | 'radio';
      optionMap?: Record<string, { x: number; y: number }>;
    };

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  requiredWhen?: Array<{
    fieldId: string;
    equals?: FieldValue;
    oneOf?: FieldValue[];
    message?: string;
  }>;
  helpText?: string;
  placeholder?: string;
  autocomplete?: string;
  options?: FieldOption[];
  validation?: {
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  pdf: PdfFieldMapping;
}

export interface FormSectionDefinition {
  id: string;
  title: string;
  description?: string;
  guidance?: {
    title: string;
    items: string[];
    sourceUrl: string;
  };
  fields: FormFieldDefinition[];
}

export interface PdfTemplateDefinition {
  id: string;
  name: string;
  description: string;
  templatePath: string;
  previewPath?: string;
  defaultDownloadName: string;
  sections: FormSectionDefinition[];
}
