import { useTranslation } from "react-i18next";
import PhotosCarousel from "../../../../Utils/photosCarousel/photosCarousel";
import teamMembers from "../../../../Utils/TeamMembers.json"
import { Link } from "react-router-dom";
export default function ModuloG() {
    const { t } = useTranslation();

    return (
        <div className="relative grid p-[7%] z-[10] bg-white dark:bg-linkIt-300">
            <h3 className="text-black dark:text-white titles-size font-manrope font-bold text-center justify-self-center">{t('Conoce a alguno de los integrantes de nuestro equipo')}</h3>
            <div className="hidden lg:block">
                <div className="grid grid-cols-3 items-start justify-items-center my-[5%] gap-[5%] mx-[5%] dark:text-white text-center leading-tight">
                    <img src="/people-LinkIt/Tobi.png" className="bg-linkIt-500 rounded-xl w-full max-w-[200px] aspect-square object-cover" alt="Tobias Feuer" />
                    <img src="/people-LinkIt/ary-perfil.png" className="bg-linkIt-500 rounded-xl w-full max-w-[200px] aspect-square object-cover" alt="Ary Molchadsky" />
                    <img src="/people-LinkIt/juli-perfil.png" className="bg-linkIt-500 rounded-xl w-full max-w-[200px] aspect-square object-cover" alt="Julieta Jasin" />

                    <div className="flex flex-col space-y-1">
                    <Link target="_blank" to="https://www.linkedin.com/in/tobias-feuer/" className="text-center font-bold subtitles-size font-montserrat">Tobias Feuer</Link>
                    <span className="font-normal text-size  font-montserrat">COO & Co-Founder</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                    <Link target="_blank" to="https://www.linkedin.com/in/arymolchadsky/" className="text-center font-bold subtitles-size font-montserrat">Ary Molchadsky</Link>
                    <span className="font-normal text-size  font-montserrat">CEO & Co-Founder</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                    <Link target="_blank" to="https://www.linkedin.com/in/julieta-clara-26b207296/" className="text-center font-bold subtitles-size font-montserrat">Julieta Jasin</Link>
                    <span className="font-normal text-size  font-montserrat">Sr. Talent Acquisition Specialist</span>
                    </div>
                </div>
                <div className="grid grid-cols-4 items-start justify-items-center my-[5%] gap-[5%] mx-[5%] dark:text-white text-center leading-tight">
                    <img src="/people-LinkIt/shay-perfil.png" className="bg-linkIt-500 rounded-xl w-full max-w-[200px] aspect-square object-cover" alt="Shayna Iskandarani" />
                    <img src="/people-LinkIt/Magali.png" className="bg-linkIt-500 rounded-xl w-full max-w-[200px] aspect-square object-cover" alt="Magali Di Catarina" />
                    <img src="/people-LinkIt/Zoe.png" className="bg-linkIt-500 rounded-xl w-full max-w-[200px] aspect-square object-cover" alt="Zoe Feuer" />
                    <img src="/people-LinkIt/juan1.png" className="bg-linkIt-500 rounded-xl w-full max-w-[200px] aspect-square object-cover" alt="Juan Meyer" />

                    <div className="flex flex-col space-y-1">
                    <Link target="_blank" to="https://www.linkedin.com/in/shayna-iskandarani-126270211/" className="text-center subtitles-size font-bold font-montserrat">Shayna Iskandarani</Link>
                    <span className="font-normal text-size  font-montserrat">Sr. Talent Acquisition Specialist</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                    <Link target="_blank" to="https://www.linkedin.com/" className="text-center subtitles-size font-bold font-montserrat">Magali Di Catarina</Link>
                    <span className="font-normal text-size  font-montserrat">Talent Acquisition Specialist</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                    <Link target="_blank" to="https://www.linkedin.com/in/zoe-feuer-1a75261a2/" className="text-center subtitles-size font-bold font-montserrat">Zoe Feuer</Link>
                    <span className="font-normal text-size  font-montserrat">Growth Marketing Specialist</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                    <Link target="_blank" to="https://www.linkedin.com/in/zoe-feuer-1a75261a2/" className="text-center subtitles-size font-bold font-montserrat">Juan Meyer</Link>
                    <span className="font-normal text-size  font-montserrat">Full Stack Developer</span>
                    </div>
                </div>
            </div>
            <div className="lg:hidden">
                <PhotosCarousel arrayOfMembers={teamMembers} bgColor="gray" />
            </div>
        </div>
    )
}