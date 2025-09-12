import { useState, useEffect } from "react";
import axios from "axios";
import swal from 'sweetalert';
// import { SpecificOKRsArea, Area, OKRsType } from "../../../admin.types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { IUser } from "../../../../../../../components/Profiles/types";
import {OKRsType, SpecificOKRsArea} from "../../../../../admin.types"
import FormSpecificResults from './FormSpecificResults'


export type stateProps = {
    Authentication: {
      user: IUser
    }
    resources: {
      allresources: OKRsType;
    };
  }
  
  type OnCloseFunction = () => void;
  
  interface FormStatisticsOKRsProps {
    onClose: OnCloseFunction;
  }
  
  export default function FormStatisticsOKRs({ onClose,   }: FormStatisticsOKRsProps) {
    
    const token = useSelector((state: stateProps) => state.Authentication.user._id)
    const {t} = useTranslation()
    const [showForm, setShowForm] = useState(false);
    
    const [viewForm, setViewForm] = useState(false);
    
    const [lastAreaName, setLastAreaName] = useState("")

    const [specificOKRsAreaComplete, setSpecificOKRsAreaComplete] = useState<SpecificOKRsArea>({
      
      okrSpecificName:"",
      okrsSpecific:[]
    }
    );
   
    const [arraySpecificOKRsArea, setArraySpecificOKRsArea] = useState([
      specificOKRsAreaComplete
    ])

    const [arrayAreas, setArrayAreas] = useState([
      {
        name:lastAreaName,
        specificOKRsArea:arraySpecificOKRsArea || []
      }
    ])

  const [specificResultName, setSpecificResultName] = useState<string>("");

  const [viewOKRForm, setViewOKRForm]=useState<boolean>(true)
  
 
  
  const [completeOKR, setCompleteOKR] = useState<Partial<OKRsType>>({
    generalTitleOKR:"",
    areas:[
      {
        name:"",
        specificOKRsArea:[
          {
            okrSpecificName:"",
            okrsSpecific:[]
            }
        ]
          }
        ],
        archived:false
      });



      // const [errors, setErrors] = useState({
        //     generalTitleOKR:"",
        // areas:[
          //     {
    //         name:"",
    //         specificOKRsArea:[
    //             {
    //             okrSpecificName:"",
    //             okrsSpecific:[]
    //             }
    //         ]
    //     }
    // ],
    // archived:false
    // });
    
        
    useEffect(() => {
  // Filtra los objetos que cumplen la condición okrSpecificName !== ""
  const filteredArray = arraySpecificOKRsArea.filter(specificOKR => specificOKR.okrSpecificName !== "");

  // Añade el nuevo objeto solo si okrSpecificName no es una cadena vacía
  if (specificOKRsAreaComplete.okrSpecificName !== "") {
    // Añade el nuevo objeto al array filtrado
    filteredArray.push(specificOKRsAreaComplete);
  }

  // Actualiza el estado con el nuevo array filtrado
  setArraySpecificOKRsArea(filteredArray);

}, [specificOKRsAreaComplete]);

const closeViewForm = ()=>{
  setViewOKRForm(false)

} 
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setCompleteOKR({
        ...completeOKR,
        [name]: value,
      });
      
      //     const validationError = validations(completeOKR as ResourceProps);
      // setErrors(validationError);
    };
    
    //   const handleBlurErrors = () => {
      //     const validationError = validations(completeOKR as ResourceProps);
      //     setErrors(validationError);
      //   }
      
      
      
  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const areaName = e.target.value;

  const areaAlreadyExists = arrayAreas?.some((area)=> area.name=== areaName)
  
  if (!areaAlreadyExists){

  setSpecificOKRsAreaComplete({
    okrSpecificName:"",
    okrsSpecific:[]
  });

  setArraySpecificOKRsArea([
    specificOKRsAreaComplete
  ])

    setLastAreaName(areaName);
    setShowForm(true);
  } else {
    setShowForm(false)
    swal(t('Esta área ya existe'));
    console.error()
  }
}


const handleResultNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {

  setSpecificResultName(e.target.value);
};

const noShowForm = () => {  
  setViewForm(false);
  
};



    const handleOkrsSpecificUpdate = (newspecificResult: SpecificOKRsArea["okrsSpecific"]) => {

        setSpecificOKRsAreaComplete({
          okrSpecificName:specificResultName,
          okrsSpecific:newspecificResult
      });
      
    
    };
    
    const showForm2 = () => {
      setViewForm(true);
    };

      
      const handleChangeArrayArea=()=>{
      
      setArrayAreas(() => {
     
        const areaExists = arrayAreas?.some((area) => area.name === lastAreaName)

        if (!areaExists) {
          arrayAreas.push({
            name:lastAreaName,
            specificOKRsArea:arraySpecificOKRsArea
          });
          if (arrayAreas[0].name === "") {
            arrayAreas.shift();
          }

          return arrayAreas;
        } else {
          swal("Esta área ya existe");
          return arrayAreas; 
        }
      });

      setSpecificOKRsAreaComplete({
        okrSpecificName:"",
        okrsSpecific:[]
      });

      swal(t("Área añadida con éxito"));
      }

      
      const handleChangeAdd=() =>{
      
        setCompleteOKR(
          prevCompleteOKR => {
            return {
              ...prevCompleteOKR,
              areas:arrayAreas
            };
          }
          ); 
        }
        
   
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // const validationError = validations(completeOKR as ResourceProps);
      // setErrors(validationError);
      
      try {
          const endPoint = `${import.meta.env.VITE_ENDPOINT_URL}/OKRs/create`;
          const response = await axios.post(endPoint, completeOKR, {
            headers: { Authorization: `Bearer ${token}`,
            'Accept-Language': sessionStorage.getItem('lang')}
          });
          
          setCompleteOKR(
            {
              generalTitleOKR:"",
              areas:[
                {
                      name:"",
                      specificOKRsArea:[
                          {
                          okrSpecificName:"",
                          okrsSpecific:[]
                          }
                      ]
                  }
              ],
              archived:false
          });
  
          swal(t("El OKR fue creado con éxito"));
          onClose()
  
          return response.data;
        } catch (error: any) {
          console.error(error.response.data)
        }
      };
    

    return(
      <>
      {viewOKRForm && (

      <div className="flex justify-center items-center">
            <div className=" flex flex-row justify-center items-center bg-linkIt-500 opa m-10 rounded-[20px] border-[3px] border-linkIt-300">
            
              <button
                className={`background-button m-4`}
                onClick={closeViewForm}
              >X</button>
           
                <div>
                    <h1 className="text-3xl">{t("Nuevo OKR")}</h1>
                </div>

                <form 
                    onSubmit={handleSubmit}
                    className=" mx-4 mb-0  flex flex-col "
                    action="">
                        <div className="flex flex-col justify-start mx-3 mb-1 px-160 ">

                            <div className="w-fit px-3 mb-0">
                                <label className="block uppercase tracking-wide text-black text-xs font-bold m-5">{t("Título OKR principal")}
                                </label>
                                <input className={'"appearance-none block w-fit bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'}
                                type="text"
                                name="generalTitleOKR"
                                placeholder={t("Mercado Posiciona...")}
                                autoComplete="off"
                                onChange={handleChange}
                                // onBlur={handleBlurErrors}
                                /> 
                              <div className="my-4">{completeOKR.generalTitleOKR}</div>
                            </div>
                           
                            <div className="w-fit px-3 mb-6">
                              {completeOKR && completeOKR.generalTitleOKR && completeOKR.generalTitleOKR.length > 0 && completeOKR.generalTitleOKR !== " " ? (
                                <div className="mx-4 flex flex-col">
                                  
                                    <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2 mr-2">Area</label>
                                    <select
                                      name="area"
                                      onChange={handleAreaChange}
                                      value={lastAreaName}
                                      className="w-full bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"
                                    >
                                      <option value="">{t('Seleccionar')}</option>
                                      <option value="LinkIT">LinkIT</option>
                                      <option value="Sales">Sales</option>
                                      <option value="Q4-Recruiting">Q4-Recruiting</option>
                                      <option value="Recruiting">Recruiting</option>
                                    </select>
                                  
                                  <button
                                    className="bg-linkIt-300 flex justify-center items-center rounded-[7px] mb-5 ml-6 p-6 h-12 w-32 text-white text-[10px] xl:text-xl shadow-md hover:bg-transparent hover:border-linkIt-300 hover:text-black hover:shadow-sm hover:shadow-linkIt-300 transition-all duration-300 ease-in-out active:scale-90"
                                    type="button"
                                    onClick={handleChangeArrayArea}
                                  >
                                    {t('Agregar área')}
                                  </button>

                                  <button 
                                className="bg-linkIt-300 flex justify-center items-center rounded-[7px]  ml-6 h-12 w-32 text-white text-[10px] xl:text-xl shadow-md hover:bg-transparent hover:border-linkIt-300 hover:text-black hover:shadow-sm hover:shadow-linkIt-300 transition-all duration-300 ease-in-out active:scale-90"
                                type="submit"
                                onClick={handleChangeAdd}>
                                {t('Crear OKR')}
                                
                                </button>
                                </div>
                              ) : null}
                            </div>
                        </div>    
                </form>

            {showForm && (
              <div className=" flex flex-col justify-center items-center bg-linkIt-500 opa m-3 rounded-[20px] border-[3px] border-linkIt-300 p-5"
              >
              
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">{t("Resultado clave")}</label>
                  <input className={'"appearance-none block w-fit bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'}
                                      type="text"
                                      name="okrSpecificName"
                                      // placeholder={errors.title ? "*" : ""}
                                      autoComplete="off"
                                      onChange={handleResultNameChange}
                                      // onBlur={handleBlurErrors}
                                      /> 
                  <button
                  className="border border-linkIt-300 rounded-[7px] p-2 shadow-md hover:border-linkIt-200 transition-all duration-300 ease-in-out"
                  type="button"
                  onClick={showForm2} 
                  >{t('Crear Resultados específicos')}
                  </button>

                  {viewForm && (
                  <FormSpecificResults
                    onOkrsSpecificUpdate={handleOkrsSpecificUpdate}
                    onClose={() => {
                      noShowForm();
                    }}
                    token={token}
                  />
                  )}
            </div>)
          }
            </div>


        </div>
      )}
        </>
    )
}