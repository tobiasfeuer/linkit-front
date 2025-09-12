import axios from 'axios';
import { TestimonialCardProps } from '../Talentos/ModulosTalentos/ModuloTalentosC/TestimonialCard/TestimonialCard';

export const URL = `${import.meta.env.VITE_ENDPOINT_URL}`

export const getReviews = async (): Promise<TestimonialCardProps[]> => {
	const response = await axios.get<TestimonialCardProps[]>(`${URL}/reviews/find`, {
    headers: { Authorization: `Bearer 6564e8c0e53b0475ffe277f2`,
    'Accept-Language': sessionStorage.getItem('lang') },
  })
	return response.data
}

