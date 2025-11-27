import EbooksCard from "./EbooksCard"
import { useEffect, useState } from 'react'
import './ebooksCard.css'
import whiteArrow from "/Vectores/white-arrow.png";
import { setEbooks } from '../../../../../redux/features/ResourcesSlice';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { ResourceProps } from '../../../../Paneles/admin.types';

export type stateProps = {
    resources: {
        ebooks: ResourceProps[];
    };
  }

function EbooksCards() {
    const items: number = 3;
    const [currentPage, setCurrentPage] = useState(0)
    const dispatch = useDispatch()
    const eBooks2 = useSelector((state: stateProps) => state.resources.ebooks);
    const eBooks= [...eBooks2].reverse();
    

    useEffect(() => {
        const loadData = async (): Promise<void> => {
            try {
                const response = await axios(
                    `${import.meta.env.VITE_ENDPOINT_URL}/posts/find?type=blog`,
                );
                dispatch(setEbooks(response.data));
            } catch (error) {
                console.error("Error al cargar las información", error);
            }
        };
        loadData();
    }, [dispatch])


    const handleNext = () => {
        setCurrentPage(currentPage === Math.ceil(eBooks.length / items) - 1 ? 0 : currentPage + 1)
    }

    const handlePrevius = () => {
        setCurrentPage(currentPage === 0 ? Math.ceil(eBooks.length / items) - 1 : currentPage - 1)
    }

    const startIndex = currentPage * items
    const endIndex = startIndex + items


    return (
        <div className="flex w-full justify-center items-center">
            <img 
            src={whiteArrow} 
            onClick={handlePrevius} 
            alt="previus-icon" 
            className="rotate-90 w-[20px] justify-self-start ssm:justify-self-center cursor-pointer" />
            <div className='grid lg:grid-cols-3 items-center gap-3 w-full h-full mx-3'>
                {
                    eBooks.slice(startIndex, endIndex).map((ebook, index) => {
                        return (

                            <EbooksCard
                                image={ebook.image}
                                title={ebook.title}
                                description={ebook.description}
                                link={ebook.link}
                                category={ebook.category}
                                key={index}
                                createdBy={ebook.createdBy}
                                createdDate={ebook.createdDate}
                            />
                        )
                    })
                }
            </div>
            <img onClick={handleNext} src={whiteArrow} alt="next-icon" className="-rotate-90 w-[20px] justify-self-start ssm:justify-self-center cursor-pointer" />
        </div>
    )
}

export default EbooksCards