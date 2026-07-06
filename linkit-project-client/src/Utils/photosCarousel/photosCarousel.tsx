import blackArrow from '/Vectores/arrow.png'
import { useState } from 'react'
import whiteArrow from "/Vectores/white-arrow.png"
import { useSelector } from "react-redux";
import { RootState } from "../../redux/types";
import { Link } from 'react-router-dom';

interface members {
    id: number,
    img: string,
    name: string,
    position: string,
    link: string,
    rol?: string
}
interface PhotosCarouselProps { 
    arrayOfMembers: members[],
    bgColor: string
}

export default function PhotosCarousel({arrayOfMembers, bgColor}: PhotosCarouselProps) {

    const [current, setCurrent] = useState(1)
    const length = arrayOfMembers.length
    const isDarkMode = useSelector(
        (state: RootState) => state.darkMode);

    const nextSlide = () => {
        setCurrent(current === length ? 1 : current + 1)
     }
    
        const prevSlide = () => {
            setCurrent(current === 1 ? length : current - 1)
        }

    return (
        <div className="grid grid-cols-3 justify-items-center items-center dark:text-white">
            
            <img src={isDarkMode ? whiteArrow : blackArrow} alt="prev" onClick={prevSlide} className='w-[20px] rotate-90 cursor-pointer'/>
                {arrayOfMembers.map((item) => {
                    return (
                        <div className={`mt-5 justify-items-center ${item.id === current ? "grid" : "hidden"}`} key={item.id}>
                            <img
                              src={item.img}
                              alt={item.name}
                              className={`aspect-square w-full max-w-[220px] rounded-xl object-cover object-top ${bgColor === "white" ? "bg-white" : "bg-linkIt-500"}`}
                            />
                            <Link target="_blank" to={item.link} className="subtitles-size mb-1 mt-2 whitespace-normal text-center font-bold">
                              {item.name}
                            </Link>
                            <p className="text-size px-4 text-center">{item.position}</p>{ item.rol &&
                            <p className='text-size text-center'>{item.rol}</p>}
                        </div>
                    )
                })}
            <img src={isDarkMode ? whiteArrow : blackArrow} alt="next" onClick={nextSlide} className='w-[20px] -rotate-90 cursor-pointer'/>

        </div>
    )
 }