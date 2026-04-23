import { CustomFlowbiteTheme, Dropdown } from "flowbite-react";
import { useRef, useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../redux/types";
import whiteArrow from "/Vectores/downArrowFilters.svg";
import blackArrow from "/Vectores/blackArrowFilters.svg";

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

interface CountryEntry {
  id: number;
  name: string;
}

interface CountrySelectProps {
  setCountry: (country: OptionType) => void;
  country: OptionType;
}

const useCountryOptions = () => {
  const countryList = useSelector(
    (state: RootState) => state.resources.countries as CountryEntry[]
  );

  return useMemo(
    () =>
      countryList
        .map((item) => ({ value: item.name, label: item.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [countryList]
  );
};

export function SelectCountryEs({ setCountry, country }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const countryOptions = useCountryOptions();

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

  const handleChange = (selectedOption: OptionType | null) => {
    setCountry(selectedOption as OptionType);
  };

  useEffect(() => {
    document.addEventListener("click", closeDropdown);
    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, []);

  return (
    <div>
      <div className="hidden lg:flex ">
        <Dropdown
          label={country ? country.label : "Ubicación"}
          inline
          className="h-28 lg:h-40 overflow-y-scroll font-medium"
          theme={customTheme}
        >
          {countryOptions.map((option) => (
              <a
                key={option.value}
                className="block px-2 cursor-pointer"
                onClick={() => handleChange(option)}
              >
                {option.label}
              </a>
            ))}
        </Dropdown>
      </div>

      <div className="lg:hidden">
        <div className="relative" ref={dropdownRef}>
          <div
            className={`md:w-[14vh] sm:w-[14vh] ssm:w-[16vh] xs:w-full min-[470px]:w-[15vh] min-[585px]:w-[19vh] ${
              country.value === "" ? null : "bg-white"
            } font-semibold py-1 px-4 rounded-full text-sm border-2 flex justify-between items-center cursor-pointer`}
            onClick={toggleDropdown}
          >
            <p
              className={`${
                country.value === "" ? "text-white" : "text-black"
              }  font-montserrat text-[0.7rem] ssm:text-[0.8rem] sm:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] mr-2`}
            >
              Ubicación
            </p>
            <img
              src={country.value === "" ? whiteArrow : blackArrow}
              alt="previous"
              className={`cursor-pointer  h-3 w-3 transform transition-transform ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {isOpen && (
            <div className="absolute bg-white text-black w-full rounded shadow-lg z-10 max-h-40 overflow-y-auto">
              {countryOptions.map((option) => (
                  <a
                    key={option.value}
                    className="block px-2 cursor-pointer font-montserrat"
                    onClick={() => {
                      handleChange(option), toggleDropdown();
                    }}
                  >
                    {option.label}
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SelectCountryEn({ setCountry, country }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const countryOptions = useCountryOptions();

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

  const handleChange = (selectedOption: OptionType | null) => {
    setCountry(selectedOption as OptionType);
    setIsOpen(false);
  };

  useEffect(() => {
    document.addEventListener("click", closeDropdown);
    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, []);

  return (
    <div>
      <div className="hidden lg:flex">
        <Dropdown
          label={country ? country.label : "Location"}
          inline
          className="h-28 lg:h-40 overflow-y-scroll font-medium"
          theme={customTheme}
        >
          {countryOptions.map((option) => (
              <a
                key={option.value}
                className="block px-2 cursor-pointer"
                onClick={() => handleChange(option)}
              >
                {option.label}
              </a>
            ))}
        </Dropdown>
      </div>
      <div className="lg:hidden">
        <div className="relative" ref={dropdownRef}>
          <div
            className={`md:w-[14vh] sm:w-[16vh] xs:w-[12vh] min-[470px]:w-[15vh] ${
              country.value === "" ? null : "bg-white"
            } font-semibold py-1 px-4 rounded-full text-sm border-2 flex justify-between items-center cursor-pointer `}
            onClick={toggleDropdown}
          >
            <p
              className={`${
                country.value === "" ? "text-white" : "text-[#173951]"
              }  font-montserrat text-[0.7rem] ssm:text-[0.8rem] sm:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] mr-2`}
            >
              Location
            </p>
            <img
              src={country.value === "" ? whiteArrow : blackArrow}
              alt="previous"
              className={`cursor-pointer  h-3 w-3 transform transition-transform z-20 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {isOpen && (
            <div className="absolute bg-white text-black w-full rounded shadow-lg z-10 max-h-40 overflow-y-auto ">
              {countryOptions.map((option) => (
                  <a
                    key={option.value}
                    className="block px-2 cursor-pointer font-montserrat"
                    onClick={() => handleChange(option)}
                  >
                    {option.label}
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
