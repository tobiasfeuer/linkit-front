import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { validateVacancy } from "../../../errors/validation";
import { VacancyProps } from "../../../admin.types";
import { ValidationError } from "../../../errors/errors";
import swal from "sweetalert";
import { validations } from "./Validation";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setJobOffers } from "../../../../../redux/features/JobCardsSlice";
import { useNavigate } from "react-router-dom";
import { stateProps } from "./Vacancies2";
import { useSelector } from "react-redux/es/hooks/useSelector";
import JoditEditor from "jodit-react";
import "./FormVacancie.css";
import Swal from "sweetalert2";

interface AirtableEntry {
  Client: string;
  "Talent Pool Stack": (string | undefined)[];
}

type OnCloseFunction = () => void;

interface FormVacancieProps {
  onClose: OnCloseFunction;
  setSaveStatus: (status: boolean) => void;
  editing?: { isEditing: boolean; vacancieID?: string };
  setEditing: (status: { isEditing: boolean; vacancieID?: string }) => void;
  saveStatus: boolean;
}

interface InfoList {
  [key: string]: string[];
}

export default function FormVacancie({
  onClose,
  setSaveStatus,
  editing,
  setEditing,
  saveStatus,
}: FormVacancieProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [companyNames, setCompanyNames] = useState<string[]>([]);
  const [technologiesNames, setTechnologiesNames] = useState<string[]>([]);
  const [countries, setCountries] = useState([]);
  const editor = useRef(null);
  const token = useSelector((state: any) => state.Authentication.token);
  const [information, setInformation] = useState<Partial<VacancyProps>>({
    code: "",
    title: "",
    description: "",
    type: "",
    location: "",
    modality: "",
    stack: [],
    aboutUs: "",
    aboutClient: "",
    responsabilities: [],
    requirements: [],
    niceToHave: [],
    benefits: [],
    company: "",
    status: "open",
  });

  const [errors, setErrors] = useState({
    code: "",
    title: "",
    description: "",
    type: "",
    location: "",
    modality: "",
    stack: "",
    aboutUs: "",
    aboutClient: "",
    responsabilities: "",
    requirements: "",
    niceToHave: "",
    benefits: "",
    company: "",
  });

  const [infoList, setInfoList] = useState<InfoList>({
    stack: [],
    requirements: [],
    responsabilities: [],
    niceToHave: [],
    benefits: [],
  });
  const AlljobData = useSelector(
    (state: stateProps) => state.jobCard.allJobOffers
  );

  const technologiesRightNames = (arr: string[]) => {
    const technologiesNoChange = [
      "IOS",
      "UX/UI",
      "HTML",
      "CSS",
      "SQL",
      "BI",
      "PM",
      "CI/CD",
      "CITRIX",
      "PCI",
      "GCP",
      "AEM",
      "CRM",
      "AWS",
      "PHP"
    ];
    return arr.map((t: string) => {
      if (t === t.toUpperCase()) {
        const correctNames = t.split(" ").map((n) => {
          if (technologiesNoChange.includes(n)) return n;
          else {
            let firstLetterFinded = false;
            const correctName = n.split("").map((l) => {
              if (!/^[a-zA-Z]+$/.test(l)) return l;
              else {
                if (!firstLetterFinded) {
                  firstLetterFinded = true;
                  return l.toUpperCase();
                } else return l.toLowerCase();
              }
            });
            const correctNameString = correctName.toString()
            return correctNameString.replace(/,/g, "")
          }
        });
        const combinedString:string = correctNames.reduce((accumulator:string, currentValue:string) => {
          return accumulator + " " + currentValue;
      }, "");
        return combinedString.trim()
      }
     else return t
    });
  };

  useEffect(() => {
    const fetchAirtableData = async () => {
      const { data } = await axios.get<AirtableEntry[]>(
        `${import.meta.env.VITE_ENDPOINT_URL}/resources/companyjds`
      );
      const allCompanies: string[] = [];
      const companies = data.map((entry: any) => entry.Client);
      const technologies: string[] = [
        ...new Set(
          data
            .map((entry: any) => entry["Talent Pool Stack"])
            .flat()
            .filter((t: undefined|string) => typeof t === "string")
        ),
      ];
      setTechnologiesNames(technologiesRightNames(technologies));
      companies.forEach((comp: string) => {
        if (!allCompanies.includes(comp)) allCompanies.push(comp);
      });
      setCompanyNames(allCompanies);
    };
    fetchAirtableData();
  }, []);

  const addToList = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const { name } = e.currentTarget;
      const value = (e.target as HTMLInputElement).value;

      if (!infoList[name]?.includes(value)) {
        setInfoList({
          ...infoList,
          [name]: [...(infoList[name] || []), value],
        });

        setInformation({
          ...information,
          [name]: [...(infoList[name] || []), value],
        });
      } else {
        swal(t("Ya se encuentra agregado"));
      }

      (e.target as HTMLInputElement).value = "";
    }
  };

  const addToListBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    const { name } = e.currentTarget;
    const value = (e.target as HTMLInputElement).value;

    if (value.trim() !== "") {
      if (!infoList[name]?.includes(value)) {
        setInfoList({
          ...infoList,
          [name]: [...(infoList[name] || []), value],
        });

        setInformation({
          ...information,
          [name]: [...(infoList[name] || []), value],
        });
      } else {
        swal(t("Ya se encuentra agregado"));
      }
    }
    (e.target as HTMLInputElement).value = "";
  };

  const deleteFromList = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string,
    listName: string
  ) => {
    e.preventDefault();
    const updateList = infoList[listName]?.filter((i) => i !== id);

    setInfoList({
      ...infoList,
      [listName]: updateList,
    });

    setInformation({
      ...information,
      [listName]: updateList,
    });
  };
  const generarListaDesordenada = (arrayDeStrings: string[]) => {
    const regex = /<ul.*?>/g;
    if (arrayDeStrings.length === 1 && regex.test(arrayDeStrings[0]))
      return arrayDeStrings[0];
    const items = arrayDeStrings
      .map((item, index) => `<li key=${index}>${item}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  };
  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | string,
    inputName?: string
  ) => {
    let name = "";
    let value = "";
    const arrayProps = [
      "responsabilities",
      "requirements",
      "niceToHave",
      "benefits",
    ];
    const stringProps = ["description", "aboutUs", "aboutClient"];
    if (typeof e === "string") {
      name = inputName ? inputName : "";
      value = e;
      if (arrayProps.includes(name))
        setInformation((prevInformation) => ({
          ...prevInformation,
          [name]: [value],
        }));
      if (stringProps.includes(name)) {
        setInformation((prevInformation) => ({
          ...prevInformation,
          [name]: value,
        }));
      }
    } else {
      name = e.target.name;
      value = e.target.value;
      setInformation((prevInformation) => ({
        ...prevInformation,
        [name]: value,
      }));
    }

    const validationError = validations(information as VacancyProps);
    setErrors(validationError);
  };

  const handleBlurErrors = () => {
    const validationError = validations(information as VacancyProps);
    setErrors(validationError);
  };

  useEffect(() => {
    if (editing?.isEditing && editing?.vacancieID) {
      const VacancieToUpdate = AlljobData?.find(
        (j) => j._id === editing.vacancieID
      );
      VacancieToUpdate &&
        setInformation({
          ...information,
          code: VacancieToUpdate.code,
          title: VacancieToUpdate.title,
          description: VacancieToUpdate.description,
          type: VacancieToUpdate.type,
          location: VacancieToUpdate.location,
          modality: VacancieToUpdate.modality,
          aboutUs:
            VacancieToUpdate.aboutUs !== undefined
              ? VacancieToUpdate.aboutUs
              : "",
          aboutClient:
            VacancieToUpdate.aboutClient !== undefined
              ? VacancieToUpdate.aboutClient
              : "",
          company: VacancieToUpdate.company,
          stack: VacancieToUpdate.stack,
          requirements: [
            generarListaDesordenada(VacancieToUpdate.requirements),
          ],
          responsabilities:
            VacancieToUpdate.responsabilities !== undefined
              ? [generarListaDesordenada(VacancieToUpdate.responsabilities)]
              : [],
          niceToHave:
            VacancieToUpdate.niceToHave !== undefined
              ? [generarListaDesordenada(VacancieToUpdate.niceToHave)]
              : [],
          benefits:
            VacancieToUpdate.benefits !== undefined
              ? [generarListaDesordenada(VacancieToUpdate.benefits)]
              : [],
        });
      VacancieToUpdate &&
        setInfoList({
          stack: VacancieToUpdate.stack,
          requirements: VacancieToUpdate.requirements,
          responsabilities:
            VacancieToUpdate.responsabilities !== undefined
              ? VacancieToUpdate.responsabilities
              : [],
          niceToHave:
            VacancieToUpdate.niceToHave !== undefined
              ? VacancieToUpdate.niceToHave
              : [],
          benefits:
            VacancieToUpdate.benefits !== undefined
              ? VacancieToUpdate.benefits
              : [],
        });
    } else {
      setInformation({
        code: "",
        title: "",
        description:
          "Hola! Estamos buscando un increíble Sr Full Stack Developer para unirse al equipo de nuestro cliente. ¿Tenés interés en nuevos desafíos, el trabajo en equipo y buscas disfrutar el camino? ¡No dejes de contactarte!",
        type: "",
        location: "",
        modality: "",
        stack: [],
        aboutUs:
          "Somos LinkIT, una consultora de selección de personal. Buscamos brindar oportunidades, conectar y colaborar con el talento de LATAM hacia todo el mundo.",
        aboutClient: "",
        responsabilities: [],
        requirements: [],
        niceToHave: [],
        benefits: [],
        company: "",
        status: "open",
      });
      setInfoList({
        stack: [],
        requirements: [],
        responsabilities: [],
        niceToHave: [],
        benefits: [],
      });
    }
  }, [editing]);

  useEffect(() => {
    if (!token) navigate("/unauthorized");
    const fetchData = async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_ENDPOINT_URL}/resources/countries`
      );
      const countries = data.map((country: any) => country.name);
      setCountries(countries);
    };
    fetchData();
  }, []);
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validations(information as VacancyProps);
    setErrors(validationError);
    try {
      validateVacancy(information as VacancyProps);
      const endPoint = `${import.meta.env.VITE_ENDPOINT_URL}/jds/create`;
      const response = await axios.post(endPoint, information, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": sessionStorage.getItem("lang"),
        },
      });

      swal(t("La vacante fue creada con éxito"));
      setInformation({
        code: "",
        title: "",
        description: "",
        type: "",
        location: "",
        modality: "",
        stack: [],
        aboutUs: "",
        aboutClient: "",
        responsabilities: [],
        requirements: [],
        niceToHave: [],
        benefits: [],
        company: "",
      });
      const allJds = await axios.get(
        `${import.meta.env.VITE_ENDPOINT_URL}/jds/find`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang"),
          },
        }
      );
      dispatch(setJobOffers(allJds.data));
      onClose();
      setSaveStatus(true);
      return response.data;
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.response.data,
        icon: "error",
        background: "#ECEEF0",
        confirmButtonColor: "#01A28B",
        confirmButtonText: t("Continuar"),
      });
      console.error((error as Error).message);
      throw new ValidationError(
        `${t("Error al ingresar los datos en el formulario" )}: ${
          (error as Error).message
        }`
      );
    }
  };

  const [inputClicked, setInputClicked] = useState(false);
  const handleInputClick = () => {
    setInputClicked(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        const endPoint = `${import.meta.env.VITE_ENDPOINT_URL}/jds/update/${editing?.vacancieID}`;
      await axios.put(endPoint, information, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": sessionStorage.getItem("lang"),
        },
      });
    } catch (error: any) {
      console.error(
        t("Error al enviar la solicitud: "),
        (error as Error).message
      );
    }
    setEditing({
      isEditing: false,
      vacancieID: undefined,
    });
    setInformation({
      code: "",
      title: "",
      description: "",
      type: "",
      location: "",
      modality: "",
      stack: [],
      aboutUs: "",
      aboutClient: "",
      responsabilities: [],
      requirements: [],
      niceToHave: [],
      benefits: [],
      company: "",
    });
    setInfoList({
      stack: [],
      requirements: [],
      responsabilities: [],
      niceToHave: [],
      benefits: [],
    });
    setSaveStatus(!saveStatus);
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className=" flex flex-col justify-center items-center bg-linkIt-500  mx-32 my-10  rounded-[7px] border-[3px] border-linkIt-300 ">
        <div className="flex w-full justify-end ">
          <button className={`background-button m-2`} onClick={onClose}>
            X
          </button>
        </div>
        <div className=" flex flex-col text-center mb-12">
          <h1 className="text-3xl">{t("Nueva vacante")}</h1>
        </div>

        <form
          onSubmit={editing?.isEditing ? handleSave : handleSubmit}
          className="flex flex-col justify-center items-center"
          action=""
        >
          <div className="flex flex-wrap justify-start mx-3 mb-6 px-16">
            <div className="w-fit px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Código")}
              </label>
              <input
                className={
                  errors.code
                    ? '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                    : '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                }
                type="text"
                name="code"
                placeholder={errors.code ? "*" : ""}
                autoComplete="off"
                value={information.code}
                onChange={handleChange}
                onBlur={handleBlurErrors}
              />
            </div>

            <div className="w-fit px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Titulo")}
              </label>
              <input
                className={
                  errors.title
                    ? '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                    : '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                }
                type="text"
                name="title"
                value={information.title}
                placeholder={errors.title ? "*" : ""}
                autoComplete="off"
                onChange={handleChange}
                onBlur={handleBlurErrors}
              />
            </div>

            <div className="w-fit px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Nombre de la empresa")}
              </label>
              <input
                className={
                  errors.company
                    ? '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                    : '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                }
                autoComplete="off"
                list="company-list"
                name="company"
                value={information.company}
                placeholder={errors.company ? "*" : ""}
                onChange={handleChange}
                onBlur={handleBlurErrors}
              />
              <datalist id="company-list">
                {companyNames.map((comp) => (
                  <option value={comp}></option>
                ))}
              </datalist>
            </div>

            <div className="w-fit px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Ubicación")}
              </label>
              <select
                className={
                  errors.location
                    ? '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                    : '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                }
                onChange={handleChange}
                value={information.location ?? "-"}
                name="location"
                placeholder={errors.location ? "*" : ""}
                autoComplete="off"
                onBlur={handleBlurErrors}
              >
                <option value=""></option>
                {countries.map((country, index) => (
                  <option key={index}>{country}</option>
                ))}
              </select>
            </div>

            <div className="w-fit px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Modalidad")}
              </label>
              <div>
                <select
                  name="modality"
                  className={
                    errors.modality
                      ? '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                      : '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                  }
                  value={information.modality}
                  onChange={handleChange}
                >
                  <option value="">{t("Selecciona")}</option>
                  <option value="remote-local">{t("Remoto (Local)")}</option>
                  <option value="remote-regional">
                    {t("Remoto (Regional)")}
                  </option>
                  <option value="hybrid">{t("Híbrido")}</option>
                  <option value="on-site">{t("Presencial")}</option>
                </select>
              </div>
            </div>

            <div className="w-fit px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Tipo")}
              </label>
              <div>
                <select
                  name="type"
                  className={
                    errors.type
                      ? '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                      : '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                  }
                  onChange={handleChange}
                  value={information.type}
                >
                  <option value="">{t("Selecciona")}</option>
                  <option value="full-time">{t("Tiempo completo")}</option>
                  <option value="part-time">{t("Medio tiempo")}</option>
                  <option value="freelance">{t("Independiente")}</option>
                </select>
              </div>
            </div>

            <div className="w-fit px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Tecnologías")}
              </label>
              {inputClicked && (
                <span className="m-0 text-xs text-linkIt-300">
                  *Enter para agregar más tecnologías*
                </span>
              )}
              <input
                className={
                  errors.stack
                    ? '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                    : '"appearance-none block w-fit bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                }
                type="text"
                name="stack"
                autoComplete="off"
                placeholder={errors.stack ? "*" : ""}
                onChange={handleChange}
                onKeyDown={addToList}
                onBlur={errors.stack ? handleBlurErrors : addToListBlur}
                onClick={handleInputClick}
                list="technology-list"
              />
               <datalist id="technology-list">
                {technologiesNames.map((comp) => (
                  <option value={comp}></option>
                ))}
              </datalist>
              {infoList && infoList.stack && infoList.stack.length > 0 ? (
                <div className="mx-4">
                  <h3 className="text-xs font-bold text-linkIt-200">
                    {t("Tecnologías agregadas")}
                  </h3>
                  <ul className="list-disc">
                    {infoList.stack?.map((t: string) => {
                      return (
                        <div
                          key={t}
                          className="flex items-center space-x-2 space-y-2"
                        >
                          <li className="text-sm">{t}</li>
                          <button
                            onClick={(e) => deleteFromList(e, t, "stack")}
                            className="text-white bg-red-500 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-red-600 hover:bg-red-600"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.414-9.414a1 1 0 011.414 0L10 8.586l1.414-1.414a1 1 0 111.414 1.414L11.414 10l1.414 1.414a1 1 0 11-1.414 1.414L10 11.414l-1.414 1.414a1 1 0 01-1.414-1.414L8.586 10 7.172 8.586a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="w-full px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Descripción")}
              </label>
              <JoditEditor
                ref={editor}
                onChange={(e) => {
                  handleChange(e, "description");
                }}
                value={information.description || ""}
                onBlur={handleBlurErrors}
              />
            </div>

            <div className="w-full px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Acerca de nosotros")}
              </label>
              <JoditEditor
                ref={editor}
                onChange={(e) => {
                  handleChange(e, "aboutUs");
                }}
                value={information.aboutUs || ""}
                onBlur={handleBlurErrors}
              />
            </div>

            <div className="w-full px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Acerca del cliente")}
              </label>
              <JoditEditor
                ref={editor}
                onChange={(e) => {
                  handleChange(e, "aboutClient");
                }}
                value={information.aboutClient || ""}
                onBlur={handleBlurErrors}
              />
            </div>

            <div className="w-full px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Responsabilidades")}
              </label>
              {inputClicked && (
                <span className="m-0 text-xs text-linkIt-300">
                  *Presiona enter para agregar más de una Responsabilidad*
                </span>
              )}
              <JoditEditor
                ref={editor}
                onChange={(e) => {
                  handleChange(e, "responsabilities");
                }}
                value={
                  (information.responsabilities &&
                    information.responsabilities[0]) ||
                  ""
                }
                onBlur={handleBlurErrors}
              />
            </div>

            <div className="w-full px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Requisitos")}
              </label>
              {inputClicked && (
                <span className="m-0 text-xs text-linkIt-300">
                  *Presiona enter para agregar más de un Requisito*
                </span>
              )}
              <JoditEditor
                ref={editor}
                onChange={(e) => {
                  handleChange(e, "requirements");
                }}
                value={
                  (information.requirements && information.requirements[0]) ||
                  ""
                }
                onBlur={handleBlurErrors}
              />
            </div>

            <div className="w-full px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Deseable")}
              </label>
              {inputClicked && (
                <span className="m-0 text-xs text-linkIt-300">
                  *Presiona enter para agregar más de un Deseable*
                </span>
              )}
              <JoditEditor
                ref={editor}
                onChange={(e) => {
                  handleChange(e, "niceToHave");
                }}
                value={
                  (information.niceToHave && information.niceToHave[0]) || ""
                }
                onBlur={handleBlurErrors}
              />
            </div>

            <div className="w-full px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Beneficios")}
              </label>
              {inputClicked && (
                <span className="m-0 text-xs text-linkIt-300">
                  *Presiona enter para agregar más de un beneficio*
                </span>
              )}
              <JoditEditor
                ref={editor}
                onChange={(e) => {
                  handleChange(e, "benefits");
                }}
                value={(information.benefits && information.benefits[0]) || ""}
                onBlur={handleBlurErrors}
              />
            </div>
          </div>
          {errors.code ||
          errors.title ||
          errors.company ||
          errors.location ||
          errors.stack ||
          errors.requirements ||
          errors.description ? (
            <span className="text-red-500">
              {t("Los campos marcados con * son obligatorios")}
            </span>
          ) : null}
          <div className="flex m-4">
            <div className="pr-2">
              <button
                onClick={onClose}
                className={`transparent-background-button`}
              >
                {t("Volver")}
              </button>
            </div>
            <div className="pl-2">
              <button type="submit" className={`background-button`}>
                {editing?.isEditing ? t("Guardar cambios") : t("Publicar")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
