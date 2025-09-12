import { useEffect, useRef, useState } from "react";
import {
  SelectCountryEs,
  SelectCountryEn,
} from "./selectCountry/SelectCountry";
import { JobCardProps } from "../JobCard/JobCard";
import "./JobFilter.css";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { applyFilters } from "../../../../../redux/features/JobCardsSlice";
import { CustomFlowbiteTheme, Dropdown } from "flowbite-react";
import whiteArrow from "/Vectores/downArrowFilters.svg";
import blackArrow from "/Vectores/blackArrowFilters.svg";

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID;

const customTheme: CustomFlowbiteTheme["dropdown"] = {
  arrowIcon: "ml-2 h-4 w-4",
  content:
    "py-1 focus:outline-none text-[0.6rem]  ssm:text-[0.9rem] md:text-[1rem] bg-white text-black lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
  floating: {
    animation: "transition-opacity",
    arrow: {
      base: "absolute z-10 h-2 w-2 rotate-45",
      style: {
        dark: "bg-gray-900 dark:bg-gray-700",
        light: "bg-white",
        auto: "bg-white dark:bg-gray-700",
      },
      placement: "-4px",
    },
    base: "z-10 w-fit rounded divide-y divide-gray-200 focus:outline-none text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
    content:
      "py-1 text-sm text-gray-700 dark:text-gray-200 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
    divider: "my-1 h-px",
    header:
      "block py-2 px-4 text-sm text-gray-700 dark:text-gray-200 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
    hidden: "invisible opacity-0",
    item: {
      container:
        " text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
      base: " text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem] flex items-center justify-start py-2 px-4 text-sm text-gray-700 cursor-pointer w-full hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none dark:hover:text-white dark:focus:bg-gray-600 dark:focus:text-white",
      icon: "mr-2 h-4 w-4",
    },
    style: {
      dark: "",
      light: "border",
      auto: "border text-gray-900 dark:border-none",
    },
    target:
      "bg-transparent w-full justify-start text-left focus:outline-none text-[0.4rem] ssm:text-[1.3rem] md:text-[1.6rem] lg:text-[1.4rem] xl:text-[1.6rem] 2xl:text-[2rem]",
  },
  inlineWrapper:
    " flex items-center w-full h-fit rounded-md p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
};
interface OptionType {
  value: string;
  label: string;
}
interface Technology {
  name: string;
}

const JobFilters = () => {
  const { t } = useTranslation();

  const allJobOffers = useSelector(
    (state: any) => state.jobCard.allJobOffers as JobCardProps[]
  );

  const allStackTechnologies = useSelector(
    (state: any) => state.resources.stackTechnologies as Technology[]
  );
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { language } = i18n;
  const [stack, setStack] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [modality, setModality] = useState<string>("");

  const [stackValue, setStackValue] = useState<string[]>([]);
  const [typeValue, setTypeValue] = useState<string>("");
  const [modalityValue, setModalityValue] = useState<string>("");

  const [country, setCountry] = useState<OptionType>({ value: "", label: "" });

  const handleFilters = async () => {
    const url = `${import.meta.env.VITE_ENDPOINT_URL}/jds/find?${
      stackValue.length >= 1
        ? `stack=${stackValue.map((tech) => `${tech}`)}`
        : ""
    }${
      language === "en"
        ? `${type !== "Type" ? `&type=${typeValue.toLocaleLowerCase()}` : ``}`
        : `${type !== "Tipo" ? `&type=${typeValue.toLocaleLowerCase()}` : ``}`
    }${
      language === "en"
        ? `${
            modality !== "Modality"
              ? `&modality=${modalityValue.toLocaleLowerCase()}`
              : ``
          }`
        : `${
            modality !== "Modalidad"
              ? `&modality=${modalityValue.toLocaleLowerCase()}`
              : ``
          }`
    }${country.value !== "" ? `&location=${country.value}` : ""}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${SUPERADMN_ID}`,
          "Accept-Language": sessionStorage.getItem("lang"),
        },
      });
      dispatch(applyFilters(response.data));
    } catch (error) {
      throw new Error((error as any).message);
    }
  };

  const handleStack = (stack: string) => {
    if (stackValue.includes(stack)) {
      setStackValue(stackValue.filter((item) => item !== stack));
    } else {
      setStackValue([...stackValue, stack]);
    }
  };

  useEffect(() => {
    setType(language === "en" ? "Type" : "Tipo");
    setStack(language === "en" ? "Stack" : "Stack");
    setModality(language === "en" ? "Modality" : "Modalidad");
    setCountry(
      language === "en"
        ? { value: "", label: "Location" }
        : { value: "", label: "Ubicación" }
    );
  }, [language]);

  //mobile filters

  interface DropdownButtonProps {
    label: string;
    options: string[];
    handleSelect: (selectedOption: string) => void;
    selectedOption: string;
  }

  function DropdownButton({
    label,
    options,
    handleSelect,
    selectedOption,
  }: DropdownButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };

    const closeDropdown = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    useEffect(() => {
      document.addEventListener("click", closeDropdown);
      return () => {
        document.removeEventListener("click", closeDropdown);
      };
    }, []);

    const getWidthClass = (label: string) => {
      if (
        label === "Ubicación" ||
        label === "Modalidad" ||
        label === "Location" ||
        label === "Modality"
      ) {
        return "md:w-full sm:w-full ssm:w-[16vh] xs:w-full  ";
      } else {
        return "md:w-full sm:w-full ssm:w-[16vh] xs:w-[9vh] min-[470px]:w-[13vh] min-[515px]:w-[14vh] min-[410px]:w-[11vh] min-[440px]:w-[12vh] min-[585px]:w-[16vh]";
      }
    };

    return (
      <div className="relative " ref={dropdownRef}>
        <div
          className={`${getWidthClass(label)} ${
            selectedOption ? "bg-white" : null
          }  py-1 px-[2vh] rounded-full text-sm border-2 flex justify-between items-center cursor-pointer`}
          onClick={toggleDropdown}
        >
          <p
            className={`${
              selectedOption ? "text-black" : "text-white"
            } mr-2 font-montserrat font-semibold text-[0.7rem] ssm:text-[0.8rem] sm:text-[1rem] lg:text-[0.8rem] xl:text-[1rem]`}
          >
            {label}
          </p>
          <img
            src={selectedOption ? blackArrow : whiteArrow}
            alt="previous"
            className={`cursor-pointer h-3 w-3 transform transition-transform  ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute bg-white text-black  rounded shadow-lg z-10 max-h-40 overflow-y-auto">
            <label className="flex items-center px-4 py-2 text-black font-semibold font-montserrat cursor-default">
              {label}
            </label>
            <hr />
            {options.map((option, index) => {
              return (
                <label
                  key={index}
                  className="flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer font-semibold font-montserrat"
                  onClick={() => {
                    handleSelect(option.toLocaleLowerCase());
                    setIsOpen(false);
                  }}
                >
                  <input
                    type="checkbox"
                    className="mr-2 rounded-full z-10"
                    checked={
                      selectedOption.includes(option.toLocaleLowerCase()) ||
                      modality.includes(option.toLocaleLowerCase())
                    }
                    readOnly
                  />
                  {option}
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const handleResetFilters = () => {
    dispatch(applyFilters(allJobOffers));
    setStackValue([]);
    setTypeValue("");
    setModalityValue("");
    setStack("Stack"),
      setType(language === "en" ? "Type" : "Tipo"),
      setModality(language === "en" ? "Modality" : "Modalidad"),
      setCountry(
        language === "en"
          ? { value: "", label: "Location" }
          : { value: "", label: "Ubicación" }
      );
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      handleFilters();
    }
  }, [stackValue, typeValue, modalityValue, country, isMobile]);

  return (
    <div className="w-full">
      <div className="hidden lg:flex rounded-[7px] p-4 my-[5%] h-[4rem] items-center font-montserrat whitespace-nowrap bg-white text-linkIt-400">
        <div className="grid grid-cols-4 w-full font-montserrat font-semibold justify-items-center items-center">
          <div>
            <Dropdown
              label={stack}
              inline
              theme={customTheme}
              className="h-40 overflow-y-scroll font-medium "
            >
              {allStackTechnologies?.map((stack: any, index: number) => {
                return (
                  <li key={index}>
                    <input
                      className="checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0 cursor-pointer font-normal"
                      id={`ch-${index}`}
                      type="checkbox"
                      checked={stackValue.includes(stack.name)}
                      onChange={() => handleStack(stack.name)}
                    />
                    <label
                      htmlFor={`ch-${index}`}
                      className="cursor-pointer w-full"
                    >
                      {stack.name}
                    </label>
                  </li>
                );
              })}
            </Dropdown>
          </div>
          <div>
            <Dropdown
              label={type}
              inline
              theme={customTheme}
              className=" font-medium"
            >
              <li
                onClick={() => {
                  setType("Part-time"), setTypeValue("part-time");
                }}
                className="cursor-pointer w-full px-2"
              >
                Part-time
              </li>
              <li
                onClick={() => {
                  setType("Full-time"), setTypeValue("full-time");
                }}
                className="cursor-pointer w-full px-2"
              >
                Full-time
              </li>
              <li
                onClick={() => {
                  setType("Freelance"), setTypeValue("freelance");
                }}
                className="cursor-pointer w-full px-2"
              >
                Freelance
              </li>
            </Dropdown>
          </div>

          <section>
            {language === "en" ? (
              <SelectCountryEn setCountry={setCountry} country={country} />
            ) : (
              <SelectCountryEs setCountry={setCountry} country={country} />
            )}
          </section>

          <div>
            <Dropdown
              label={modality}
              inline
              theme={customTheme}
              className="font-medium"
            >
              {language === "en" ? (
                <li
                  onClick={() => {
                    setModality("Remote (Local)"),
                      setModalityValue("remote-local");
                  }}
                  className="cursor-pointer w-full px-2"
                >
                  Remote (Local)
                </li>
              ) : (
                <li
                  onClick={() => {
                    setModality("Remoto (Local)"),
                      setModalityValue("remote-local");
                  }}
                  className="cursor-pointer w-full px-2"
                >
                  Remoto (Local)
                </li>
              )}
              {language === "en" ? (
                <li
                  onClick={() => {
                    setModality("Remote (Regional)"),
                      setModalityValue("remote-regional");
                  }}
                  className="cursor-pointer w-full px-2"
                >
                  Remote (Regional)
                </li>
              ) : (
                <li
                  onClick={() => {
                    setModality("Remoto (Regional)"),
                      setModalityValue("remote-regional");
                  }}
                  className="cursor-pointer w-full px-2"
                >
                  Remoto (Regional)
                </li>
              )}
              {language === "en" ? (
                <li
                  onClick={() => {
                    setModality("Hybrid"), setModalityValue("hybrid");
                  }}
                  className="cursor-pointer w-full px-2"
                >
                  Hybrid
                </li>
              ) : (
                <li
                  onClick={() => {
                    setModality("Híbrido"), setModalityValue("hybrid");
                  }}
                  className="cursor-pointer w-full px-2"
                >
                  Híbrido
                </li>
              )}
              {language === "en" ? (
                <li
                  onClick={() => {
                    setModality("on-site"), setModalityValue("on-site");
                  }}
                  className="cursor-pointer w-full px-2"
                >
                  On-site
                </li>
              ) : (
                <li
                  onClick={() => {
                    setModality("Presencial"), setModalityValue("on-site");
                  }}
                  className="cursor-pointer w-full px-2"
                >
                  Presencial
                </li>
              )}
            </Dropdown>
          </div>
        </div>
        <button
          className="background-button whitespace-nowrap mr-3"
          onClick={() => handleFilters()}
        >
          {t("Encontrar vacante")}
        </button>
        <button
          className="bg-linkIt-300 text-white rounded-full py-[.4rem] px-[.4rem] border-[2px] border-linkIt-300  transition-all duration-300 ease-in-out font-montserrat font-[500] hover:scale-105"
          onClick={() => {
            dispatch(applyFilters(allJobOffers)),
              setStack("Stack"),
              setType(language === "en" ? "Type" : "Tipo"),
              setModality(language === "en" ? "Modality" : "Modalidad"),
              setCountry(
                language === "en"
                  ? { value: "", label: "Location" }
                  : { value: "", label: "Ubicación" }
              );
          }}
        >
          <img
            src="/Vectores/reset.svg"
            alt="reset-filters"
            className="w-[1.2rem] p-0.5 hover:rotate-180 transition-all duration-300 ease-in-out"
          />
        </button>
      </div>

      {/*mobile version */}

      <div className="lg:hidden xs:justify-center xs:items-center xs:pl-[1vh] ">
        <div className="flex flex-wrap items-center justify-center sm:items-center sm:justify-center xs:items-start xs:justify-start ">
          <div className="w-full xs:w-auto flex justify-center m-1">
            <DropdownButton
              label="Stack"
              options={allStackTechnologies.map((tech) => tech.name)}
              handleSelect={handleStack}
              selectedOption={stackValue.join(", ")}
            />
          </div>
          <div className="w-full xs:w-auto flex justify-center m-1">
            <DropdownButton
              label={language === "en" ? "Type" : "Tipo"}
              options={["Part-time", "Full-time", "Freelance"]}
              handleSelect={(selectedOption) => {
                setType(selectedOption);
                setTypeValue(selectedOption.toLowerCase());
              }}
              selectedOption={typeValue}
            />
          </div>
          <div className="w-full xs:w-auto flex justify-center m-1">
            {language === "en" ? (
              <SelectCountryEn setCountry={setCountry} country={country} />
            ) : (
              <SelectCountryEs setCountry={setCountry} country={country} />
            )}
          </div>
          <div className="w-full xs:w-auto flex m-1">
            {language === "en" ? (
              <DropdownButton
                label="Modality"
                options={[
                  "Remote (Local)",
                  "Remote (Regional)",
                  "Hybrid",
                  "On-Site",
                ]}
                handleSelect={(selectedOption) => {
                  if (selectedOption === "remote (local)") {
                    setModality("remote (local)");
                    setModalityValue("remote-local");
                  } else if (selectedOption === "remote (regional)") {
                    setModality("remote (regional)");
                    setModalityValue("remote-regional");
                  } else if (selectedOption === "hybrid") {
                    setModality("hybrid");
                    setModalityValue("hybrid");
                  } else if (selectedOption === "on-site") {
                    setModality("presential");
                    setModalityValue("on-site");
                  }
                }}
                selectedOption={modalityValue}
              />
            ) : (
              <DropdownButton
                label="Modalidad"
                options={[
                  "Remoto (Local)",
                  "Remoto (Regional)",
                  "Híbrido",
                  "Presencial",
                ]}
                handleSelect={(selectedOption) => {
                  if (selectedOption === "remoto (local)") {
                    setModality("remoto (local)");
                    setModalityValue("remote-local");
                  } else if (selectedOption == "remoto (regional)") {
                    setModality("remoto (regional)");
                    setModalityValue("remote-regional");
                  } else if (selectedOption === "híbrido") {
                    setModality("híbrido");
                    setModalityValue("hybrid");
                  } else if (selectedOption === "presencial") {
                    setModality("presencial");
                    setModalityValue("on-site");
                  }
                }}
                selectedOption={modalityValue}
              />
            )}
          </div>
          <div className="w-full xs:w-auto flex justify-center m-1">
            <button
              className="bg-linkIt-300 text-white rounded-full py-[.4rem] px-[.4rem] border-[2px] border-linkIt-300 transition-all duration-300 ease-in-out font-montserrat hover:scale-105"
              onClick={handleResetFilters}
            >
              <img
                src="/Vectores/reset.svg"
                alt="reset-filters"
                className="w-4 h-4 hover:rotate-180 transition-all duration-300 ease-in-out"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
