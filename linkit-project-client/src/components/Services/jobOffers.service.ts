import axios from 'axios';
import { JobCardProps } from '../Talentos/ModulosTalentos/ModuloTalentosG/JobCard/JobCard';
import { URL } from './reviews.service';
//import { SUPERADMN_ID } from '../../env';
const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID

export const getJobOffers = async (): Promise<JobCardProps[]> => {

	const response = await axios.get<JobCardProps[]>(`${URL}/jds/find`, {
    headers: { Authorization: `Bearer ${SUPERADMN_ID}`,
    'Accept-Language': sessionStorage.getItem('lang') },
  })
	return response.data
}