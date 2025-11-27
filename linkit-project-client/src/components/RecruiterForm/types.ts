export interface FormFieldConfig {
  fieldName: string;
  airtableField: string;
  type: 'text' | 'email' | 'url' | 'select' | 'multi-select' | 'textarea' | 'number' | 'file';
  label: string;
  placeholder?: string;
  instructions?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
}

export interface RecruiterData {
  id: string;
  name: string;
  lastName?: string;
  urlSlug: string;
  email?: string;
  photoUrl?: string;
  active: boolean;
  formUrl?: string;
  recruitmentRoleCode?: string;
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

