import axios from 'axios';

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID;
const ENDPOINT_URL = import.meta.env.VITE_ENDPOINT_URL;

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

/**
 * Obtiene la configuración del formulario desde Airtable
 * @param view Nombre de la vista en Airtable (ej: "RecruiterFormWebView")
 * @param lang Idioma para los labels ("es" | "en")
 */
export const getFormConfig = async (view: string = 'RecruiterFormWebView', lang: string = 'es'): Promise<FormFieldConfig[]> => {
  try {
    const response = await axios.get<FormFieldConfig[]>(
      `${ENDPOINT_URL}/resources/form-config`,
      {
        params: {
          view,
          lang
        },
        headers: {
          Authorization: `Bearer ${SUPERADMN_ID}`,
          'Accept-Language': lang
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching form config:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener configuración del formulario');
  }
};

/**
 * Obtiene datos de un recruiter por su URL slug
 * @param slug URL slug del recruiter (ej: "julieta")
 */
export const getRecruiterBySlug = async (slug: string, roleCode?: string): Promise<RecruiterData> => {
  try {
    const response = await axios.get<RecruiterData>(
      `${ENDPOINT_URL}/recruiters/payroll`,
      {
        params: roleCode ? { slug, roleCode } : { slug },
        headers: {
          Authorization: `Bearer ${SUPERADMN_ID}`,
          'Accept-Language': sessionStorage.getItem('lang') || 'es'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching recruiter:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener datos del reclutador');
  }
};

/**
 * Envía la postulación del formulario
 * @param formData Datos del formulario
 * @param recruiterSlug URL slug del recruiter
 */
export const submitRecruiterApplication = async (formData: Record<string, any>, recruiterSlug: string) => {
  try {
    const payload = {
      ...formData,
      recruiterSlug
    };

    const response = await axios.post(
      `${ENDPOINT_URL}/postulations/create`,
      payload,
      {
        headers: {
          'Accept-Language': sessionStorage.getItem('lang') || 'es'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error submitting application:', error);
    if (error.response) {
      throw error;
    }
    throw new Error(error?.message || 'Error al enviar la postulación');
  }
};

