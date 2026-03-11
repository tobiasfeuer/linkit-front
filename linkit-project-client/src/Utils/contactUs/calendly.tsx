import { useTranslation } from "react-i18next"



export default function GetInTouch  () {
    const { t } = useTranslation();

    return (
        <div className=" flex flex-col items-center justify-center bg-white text-linkIt-300 w-full text-center py-8 h-[30vh]">
    <h2 className="text-linkIt-200 font-bold text-[1.5rem] md:text-[2rem] lg:text-[2.5rem] xs:text-[1.2rem] font-montserrat ">{t('Agenda una llamada con nuestro equipo!')}</h2>
    <button
      className="bg-linkIt-200 text-white font-bold rounded-[7px] p-3 px-6 mt-8 mb-4 font-montserrat "
      onClick={() => window.open('https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3qmMK1h4c08Aw_b5gFiF-vLjHYunVGIWvt6RyOJvaaQOVd8qQm9syzfgwV03LXDEnL7R_CHXbi', '_blank')}
    >
      {t('Agendar llamada')}
    </button>
  </div>
    )
}