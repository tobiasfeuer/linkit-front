import EventCard from "./EventCard";
import { useEffect, useState } from 'react'
import blackArrow from "/Vectores/arrow.png";
import axios from "axios";
import { setEvents } from "../../../../../redux/features/ResourcesSlice";
import { useDispatch, useSelector } from "react-redux";
import { ResourceProps } from "../../../../Paneles/admin.types";

export type stateProps = {
    resources: {
        events: ResourceProps[];
    };
}

function EventsCardsMobile() {

    const [currentPage, setCurrentPage] = useState(0)

    const dispatch = useDispatch()
    const events = useSelector((state: stateProps) => state.resources.events);

    const handleNext = () => {
        setCurrentPage(currentPage === events.length - 1 ? 0 : currentPage + 1)
    }

    const handlePrevius = () => {
        setCurrentPage(currentPage === 0 ? events.length - 1 : currentPage - 1)
    }

    useEffect(() => {
        const loadData = async (): Promise<void> => {
            try {
                const response = await axios(
                    `${import.meta.env.VITE_ENDPOINT_URL}/posts/find?type=social`,
                );
                dispatch(setEvents(response.data));
            } catch (error) {
                console.error("Error al cargar las información", error);
            }
        };
        loadData();
    }, [dispatch])

    return (
        <div className="flex w-full h-full justify-center items-center">
            <button disabled={events.length <= 1}>
                <img src={blackArrow} onClick={handlePrevius} alt="previus-icon" className="rotate-90 w-[20px] justify-self-start ssm:justify-self-center cursor-pointer" />
            </button>
            <div className='flex items-end justify-center gap-2 w-full h-full'>
                {
                    events.length > 0 && (
                        <EventCard
                            image={events[events.length - 1 - currentPage].image}
                            title={events[events.length - 1 - currentPage].title}
                            category={events[events.length - 1 - currentPage].category}
                            description={events[events.length - 1 - currentPage].description}
                            link={events[events.length - 1 - currentPage].link}
                            key={currentPage}
                        />
                    )
                }
            </div>
            <button disabled={events.length <= 1}>
                <img onClick={handleNext} src={blackArrow} alt="next-icon" className="-rotate-90 w-[20px] justify-self-start ssm:justify-self-center cursor-pointer" />
            </button>
        </div>
    )
}

export default EventsCardsMobile
