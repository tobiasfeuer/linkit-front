import { Accordion, AccordionItem } from "@szhsin/react-accordion";
import { useEffect, useState} from "react";
import { useSelector} from "react-redux"; 
import axios from "axios";
import { OKRsType } from "../../../../../admin.types";
import swal from 'sweetalert';
import { t } from 'i18next'

export type stateProps = {
    resources: {
        allresources: OKRsType;
    };
}
function AccordionOKRs(){
        const token = useSelector((state: any) => state.Authentication.token);
        const [okrData, setOkrData] = useState<OKRsType[]>([]);

        useEffect(() => {
            const loadData = async (): Promise<any> => {
                try {
                    const response = await axios(
                        `${import.meta.env.VITE_ENDPOINT_URL}/OKRs/find`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Accept-Language': sessionStorage.getItem('lang')
                            }
                        }
                    );
        
                    const arrayOKRS = response.data.filter((okr: { archived: boolean }) => !okr.archived);
        
                    setOkrData(arrayOKRS);
                } catch (error) {
                    console.error("Error al cargar las información", error);
                }
            };
            loadData();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);


        const handleDelete = async (_id:string)=>{
         
            const deleteData = async (): Promise<any> => {
                try {
                    const response = await axios.delete(
                        `${import.meta.env.VITE_ENDPOINT_URL}/OKRs/delete/${_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Accept-Language': sessionStorage.getItem('lang')
                            }
                        }
                    );
                    if(response.data) swal(t('OKR eliminado'));
                    
                } catch (error) {
                    console.error("Error al eliminar el OKR", error);
                }
            };
            deleteData();
        }
        

    return (
        <div>
                <div>
                    {okrData.map((okr, index) => (
                        <div key={index}>
                            <button
                             type="button"
                             className="flex items-center border border-linkIt-300 rounded-[7px] p-2 shadow-md hover:border-linkIt-200 transition-all duration-300 ease-in-out mr-5"
                             onClick={() => handleDelete(okr._id)}
                            >X</button>
                            <h2 className="text-black text-[2vw] font-bold">{okr.generalTitleOKR } </h2>  
                            
                                <div>
                                    {okr.areas.map((area, areaIndex) => (
                                        <Accordion key={areaIndex} className="accordion-item">
                                            <div>
                                            <h2 className="text-black text-[1vw] font-italic">{area.name}</h2>
                                                {area.specificOKRsArea.map((specificOKRArea, specificIndex) => (
                                                    <AccordionItem key={specificIndex} header={"+  " + specificOKRArea.okrSpecificName} className="accordion-item">
                                                        <div>
                                                            {specificOKRArea.okrsSpecific.map((okrSpecificc, okrIndex) => (
                                                                <p key={okrIndex}>{okrSpecificc}</p>
                                                            ))}
                                                        </div>
                                                    </AccordionItem>
                                                ))}
                                            </div>
                                        </Accordion>
                                    ))}
                                </div>
                        </div>
                    ))}
                </div>
        </div>
    );
    
}

export {AccordionOKRs};