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

function EbooksCardsMobile() {
    const [currentPage, setCurrentPage] = useState(0)
    const dispatch = useDispatch()
    const eBooks = useSelector((state: stateProps) => state.resources.ebooks);

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
        setCurrentPage(currentPage === eBooks.length - 1 ? 0 : currentPage + 1)
    }

    const handlePrevius = () => {
        setCurrentPage(currentPage === 0 ? eBooks.length - 1 : currentPage - 1)
    }

    return (
        <div className="flex w-full justify-center items-center">
            <button disabled={eBooks.length <= 1}>
            <img src={whiteArrow} onClick={handlePrevius} alt="previus-icon" className="rotate-90 w-[20px] justify-self-start ssm:justify-self-center cursor-pointer" />
            </button>
            <div className='grid lg:grid-cols-3 items-center gap-2 w-full h-full'>
                {
                    eBooks.length > 0 && (

                            <EbooksCard
                                title={eBooks[currentPage].title}
                                description={eBooks[currentPage].description}
                                link={eBooks[currentPage].link}
                                category={eBooks[currentPage].category}
                                key={currentPage}
                                image={eBooks[currentPage].image}
                            />
                        )}
            </div>
            <button disabled={eBooks.length <= 1}>
            <img onClick={handleNext} src={whiteArrow} alt="next-icon" className="-rotate-90 w-[20px] justify-self-start ssm:justify-self-center cursor-pointer" />
            </button>
        </div>
    )
}

export default EbooksCardsMobile