import axios from "axios";
import { IUser, ICompany, IAdmin, WebsiteUser, UserLoginType } from "./types";
//import { SUPERADMN_ID } from "../../env";

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID

interface responseType {
  data: WebsiteUser
  code: number
}

export const URL = `${import.meta.env.VITE_ENDPOINT_URL}`;

export const editUser = async (user: IUser): Promise<responseType> => {
  const userObj = {
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    linkedin: user.linkedin,
    englishLevel: user.englishLevel,
    cv: user.cv,
    technologies: user.technologies,
    active: user.active,
  };
  const response = await axios.put(`${URL}/users/update/${user._id}`, userObj, {
    headers: { Authorization: `Bearer ${SUPERADMN_ID}`,
    'Accept-Language': sessionStorage.getItem('lang') },
  });
  return {data: response.data, code: response.status};
};

export async function editWebUserImage(user: WebsiteUser, image: string): Promise<WebsiteUser> {
  const role = user.role === 'company' ? 'companies' : `${user.role}s`
  const {data} = await axios.put(`${URL}/${role}/update/${user._id}`, {image: image }, {headers: {
    Authorization: `Bearer ${SUPERADMN_ID}`,
    'Accept-Language': sessionStorage.getItem('lang')
  }})
  return data
}

export async function changePassword(user: WebsiteUser | UserLoginType): Promise<string> {
  const {data} = await axios.get(`${URL}/auth/resetPassword?email=${user.email}`, {headers: {
    Authorization: `Bearer ${SUPERADMN_ID}`,
    'Accept-Language': sessionStorage.getItem('lang')
  }})
  return data
}

export const editAdmin = async (admin: Partial<IAdmin>, token: string): Promise<IAdmin> => {
  const adminObj = {
    country: admin.country,
    firstName: admin.firstName,
    lastName: admin.lastName,
    image: admin.image
  };
  const { data } = await axios.put(
    `${URL}/admins/update/${admin._id}`,
    adminObj,
    {
      headers: { Authorization: `Bearer ${token}`,
      'Accept-Language': sessionStorage.getItem('lang') },
    }
  );
  return data;
};

// COMPANY //

export const editCompany = async (company: ICompany): Promise<ICompany> => {
  const companyObj = {
    repName: company.repName,
    country: company.country,
    linkedin: company.linkedin,
    interested: company.interested
  };
  const response = await axios.put(
    `${URL}/companies/update/${company._id}`,
    companyObj,
    {
      headers: { Authorization: `Bearer ${SUPERADMN_ID}`,
      'Accept-Language': sessionStorage.getItem('lang') },
    }
  );
  return response.data;
};
