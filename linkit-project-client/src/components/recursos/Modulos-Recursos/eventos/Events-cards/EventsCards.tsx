import EventCard from "./EventCard";
import { useEffect, useState } from "react";

import axios from "axios";
import { setEvents } from "../../../../../redux/features/ResourcesSlice";
import { useDispatch, useSelector } from "react-redux";
import { ResourceProps } from "../../../../Paneles/admin.types";
import blackArrow from "/Vectores/arrow.png";
import whiteArrow from "/Vectores/white-arrow.png";
import { RootState } from "../../../../../redux/types";

export type stateProps = {
  resources: {
    events: ResourceProps[];
  };
};

function EventsCards() {
  const maxEventsPerPage: number = 3;
  const [currentPage, setCurrentPage] = useState(0);
  const isDarkMode = useSelector((state: RootState) => state.darkMode);

  const dispatch = useDispatch();
  const events2 = useSelector((state: stateProps) => state.resources.events);
  const events = [...events2].reverse()

  const handleNext = () => {
    setCurrentPage(
      currentPage === Math.ceil(events.length / maxEventsPerPage) - 1
        ? 0
        : currentPage + 1
    );
  };

  const handlePrevius = () => {
    setCurrentPage(
      currentPage === 0
        ? Math.ceil(events.length / maxEventsPerPage) - 1
        : currentPage - 1
    );
  };

  const startIndex: number = currentPage * maxEventsPerPage;
  const endIndex: number = startIndex + maxEventsPerPage;

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const response = await axios(
          `${import.meta.env.VITE_ENDPOINT_URL}/posts/find?type=social`
        );
        dispatch(setEvents(response.data));
      } catch (error) {
        console.error("Error al cargar las información", error);
      }
    };
    loadData();
  }, [dispatch]);

  return (
    <div className="flex w-full h-full justify-center items-center font-montserrat">
      <img
        src={isDarkMode ? whiteArrow : blackArrow}
        onClick={handlePrevius}
        alt="previus-icon"
        className="rotate-90 w-[20px] justify-self-start ssm:justify-self-center cursor-pointer"
      />
      <div className="grid grid-cols-3 items-end gap-3 w-full h-full mx-3">
        {events.slice(startIndex, endIndex).map((event, index) => {
          return (
            <EventCard
              image={event.image}
              title={event.title}
              category={event.category}
              description={event.description}
              link={event.link}
              createdDate={event.createdDate} 
              createdBy={event.createdBy}
              key={index}
            />
          );
        })}
      </div>
      <img
        onClick={handleNext}
        src={isDarkMode ? whiteArrow : blackArrow}
        alt="next-icon"
        className="-rotate-90 w-[20px] justify-self-start ssm:justify-self-center cursor-pointer"
      />
    </div>
  );
}

export default EventsCards;