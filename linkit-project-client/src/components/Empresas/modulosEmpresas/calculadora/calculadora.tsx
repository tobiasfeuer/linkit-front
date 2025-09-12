import { useState, useEffect, useRef } from "react";
import { CustomFlowbiteTheme, Dropdown } from "flowbite-react";
import axios from "axios";
import "./calculadora.css";
import { useTranslation } from "react-i18next";
import whiteArrow from "/Vectores/downArrowFilters.svg";
import blackArrow from "/Vectores/blackArrowFilters.svg";
import Swal from "sweetalert2";

interface VacancyFirstState {
  [key: string]: string;
  positionV: string;
  englishLevel: string;
  seniorityV: string;
}

interface VacancySecondState {
  technologies: string[];
  frameworks: string[];
  others: string[];
}

function Calculadora() {
  const [filtersToSelect, setFiltersToSelect] = useState({
    filterPosition: false,
    filterEnglishLevel: false,
    filterSeniority: false,
    filterTechnologies: false,
    filterFrameworks: false,
    filterOthers: false,
  });

  const customThemeP: CustomFlowbiteTheme["dropdown"] = {
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
        auto: "border dark:border-none",
      },
      target:
        "bg-transparent border border-white w-full justify-start text-left focus:outline-none text-[0.4rem] ssm:text-[1.3rem] md:text-[1.6rem] lg:text-[1.4rem] xl:text-[1.6rem] 2xl:text-[2rem]",
    },
    inlineWrapper: filtersToSelect.filterPosition
      ? "flex items-center w-full h-fit text-red-600 rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]"
      : "flex items-center w-full h-fit rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
  };

  const customThemeE: CustomFlowbiteTheme["dropdown"] = {
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
        auto: "border dark:border-none",
      },
      target:
        "bg-transparent border border-white w-full justify-start text-left focus:outline-none text-[0.4rem] ssm:text-[1.3rem] md:text-[1.6rem] lg:text-[1.4rem] xl:text-[1.6rem] 2xl:text-[2rem]",
    },
    inlineWrapper: filtersToSelect.filterEnglishLevel
      ? "flex items-center w-full h-fit text-red-600 rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]"
      : "flex items-center w-full h-fit rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
  };

  const customThemeT: CustomFlowbiteTheme["dropdown"] = {
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
        auto: "border dark:border-none",
      },
      target:
        "bg-transparent border border-white w-full justify-start text-left focus:outline-none text-[0.4rem] ssm:text-[1.3rem] md:text-[1.6rem] lg:text-[1.4rem] xl:text-[1.6rem] 2xl:text-[2rem]",
    },
    inlineWrapper: filtersToSelect.filterTechnologies
      ? "flex items-center w-full h-fit text-red-600 rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]"
      : "flex items-center w-full h-fit rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
  };

  const customThemeF: CustomFlowbiteTheme["dropdown"] = {
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
        auto: "border dark:border-none",
      },
      target:
        "bg-transparent border border-white w-full justify-start text-left focus:outline-none text-[0.4rem] ssm:text-[1.3rem] md:text-[1.6rem] lg:text-[1.4rem] xl:text-[1.6rem] 2xl:text-[2rem]",
    },
    inlineWrapper: filtersToSelect.filterFrameworks
      ? "flex items-center w-full h-fit text-red-600 rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]"
      : "flex items-center w-full h-fit rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
  };

  const customThemeS: CustomFlowbiteTheme["dropdown"] = {
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
        auto: "border dark:border-none",
      },
      target:
        "bg-transparent border border-white w-full justify-start text-left focus:outline-none text-[0.4rem] ssm:text-[1.3rem] md:text-[1.6rem] lg:text-[1.4rem] xl:text-[1.6rem] 2xl:text-[2rem]",
    },
    inlineWrapper: filtersToSelect.filterSeniority
      ? "flex items-center w-full h-fit text-red-600 rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]"
      : "flex items-center w-full h-fit rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
  };

  const customThemeO: CustomFlowbiteTheme["dropdown"] = {
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
        auto: "border dark:border-none",
      },
      target:
        "bg-transparent border border-white w-full justify-start text-left focus:outline-none text-[0.4rem] ssm:text-[1.3rem] md:text-[1.6rem] lg:text-[1.4rem] xl:text-[1.6rem] 2xl:text-[2rem]",
    },
    inlineWrapper: filtersToSelect.filterOthers
      ? "flex items-center w-full h-fit text-red-600 rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]"
      : "flex items-center w-full h-fit rounded-md border border-white p-3 ssm:p-2.5 sm:p-2 lg:p-2.5 xl:p-2 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
  };

  const { t } = useTranslation();

  const [renderedFilters, setRenderedFilters] = useState(Object);

  const [vacancyFirst, setVacancyFirst] = useState<VacancyFirstState>({
    positionV: "",
    englishLevel: "",
    seniorityV: "",
  });

  const [vacancySecond, setVacancySecond] = useState<VacancySecondState>({
    technologies: [],
    frameworks: [],
    others: [],
  });

  const [price, setPrice] = useState({
    min: "$0",
    max: "$0",
  });

  const handleResetFilters = () => {
    setVacancyFirst({ positionV: "", englishLevel: "", seniorityV: "" });
    setVacancySecond({ technologies: [], frameworks: [], others: [] });
    setPrice({ min: "$0", max: "$0" });
  }


  const [isDisabled, setIsDisabled] = useState(true);

  const handleFiltersSelected = () => {
    if (vacancyFirst.positionV === "") {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterPosition: true,
      }));
    } else {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterPosition: false,
      }));
    }

    if (vacancyFirst.englishLevel === "") {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterEnglishLevel: true,
      }));
    } else {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterEnglishLevel: false,
      }));
    }

    if (vacancyFirst.seniorityV === "") {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterSeniority: true,
      }));
    } else {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterSeniority: false,
      }));
    }

    if (vacancySecond.technologies.length === 0) {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterTechnologies: true, // Cambiar a rojo si está vacío
      }));
    } else {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterTechnologies: false,
      }));
    }

    if (vacancySecond.frameworks.length === 0) {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterFrameworks: true, // Cambiar a rojo si está vacío
      }));
    } else {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterFrameworks: false,
      }));
    }

    if (vacancySecond.others.length === 0) {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterOthers: false,
      }));
    } else {
      setFiltersToSelect((prevFiltersToSelect) => ({
        ...prevFiltersToSelect,
        filterOthers: false,
      }));
    }
  };

  const [buttonPressed, setButtonPressed] = useState(false);

  useEffect(() => {
    if (buttonPressed) {
      handleFiltersSelected();
    }
  }, [vacancyFirst, buttonPressed]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    if (name === "positionV") {
      const checkboxes = document.querySelectorAll<HTMLInputElement>(
        'input[name="positionV"]'
      );

      checkboxes.forEach((checkbox) => {
        if (checkbox.value !== value) {
          checkbox.checked = false;
        }
      });
    }
    if (name === "englishLevel") {
      const checkboxes = document.querySelectorAll<HTMLInputElement>(
        'input[name="englishLevel"]'
      );

      checkboxes.forEach((checkbox) => {
        if (checkbox.value !== value) {
          checkbox.checked = false;
        }
      });
    }
    if (name === "seniorityV") {
      const checkboxes = document.querySelectorAll<HTMLInputElement>(
        'input[name="seniorityV"]'
      );

      checkboxes.forEach((checkbox) => {
        if (checkbox.value !== value) {
          checkbox.checked = false;
        }
      });
    }
    if (vacancyFirst.hasOwnProperty(name)) {
      if (!checked) {
        setVacancyFirst((prevVacancyFirst) => {
          const updatedVacancyFirst = { ...prevVacancyFirst };
          updatedVacancyFirst[name] = "";
          return updatedVacancyFirst;
        });
      } else {
        setVacancyFirst((prevVacancyFirst) => ({
          ...prevVacancyFirst,
          [name]: value,
        }));
      }
    } else {
      setVacancySecond((prevVacancySecond) => ({
        ...prevVacancySecond,
        [name]: vacancySecond[name as keyof VacancySecondState].includes(value)
          ? vacancySecond[name as keyof VacancySecondState].filter(
              (item) => item !== value
            )
          : [...vacancySecond[name as keyof VacancySecondState], value],
      }));
    }
  };

  useEffect(() => {
    setIsDisabled(Object.values(vacancyFirst).some((value) => value === ""));
  }, [vacancyFirst]);

  const CalculatePrice = async () => {
    // Validar que los campos requeridos estén completos
    if (
      isDisabled || // Validar los campos de vacancyFirst
      vacancySecond.technologies.length === 0 || // Validar Tecnologías
      vacancySecond.frameworks.length === 0 // Validar Frameworks
    ) {
      // Mostrar mensaje de error si faltan campos
      Swal.fire({
        title: t("Error"),
        text: t(
          "Por favor completa todos los campos obligatorios, incluyendo Tecnologías y Frameworks."
        ),
        icon: "error",
        confirmButtonText: t("Cerrar"),
        customClass: {
          confirmButton: "background-button",
        },
      });
      return; // Detener la ejecución si faltan campos
    }

    try {
      let techsValue = ["No techs"];
      let frameworksValue = ["No frameworks"];
      let othersValue = ["No others"];

      if (vacancySecond.technologies.length > 0) {
        techsValue = vacancySecond.technologies;
      }
      if (vacancySecond.frameworks.length > 0) {
        frameworksValue = vacancySecond.frameworks;
      }
      if (vacancySecond.others.length > 0) {
        othersValue = vacancySecond.others;
      }
      setVacancySecond({
        technologies: techsValue,
        frameworks: frameworksValue,
        others: othersValue,
      });

      const response = await axios.post(
        `${import.meta.env.VITE_ENDPOINT_URL}/resources/googleSheet/filter?position=${vacancyFirst.positionV}&englishLevel=${vacancyFirst.englishLevel}&seniority=${vacancyFirst.seniorityV}`,
        {
          technologies: techsValue,
          frameworks: frameworksValue,
          others: othersValue,
        }
      );

      if (response.status === 200) {
        const data = response.data;
        setPrice(data);
      }
    } catch (error) {
      throw new Error((error as any).message);
    }
  };

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_ENDPOINT_URL}/resources/googleSheet/DinamicTitles`
      )
      .then((response) => {
        const filtersData = response.data;
        setRenderedFilters(filtersData);
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }, []);

  let tech1 = [];
  let tech2 = [];
  let frameworksToRender = [];
  let othersToRender = [];
  let positionsToRender = [];

  for (const key in renderedFilters) {
    switch (key) {
      case "techTier1":
        tech1 = renderedFilters[key];
        break;
      case "techTier2":
        tech2 = renderedFilters[key];
        break;
      case "frameworksTier1":
        frameworksToRender = renderedFilters[key];
        break;
      case "othersTier1":
        othersToRender = renderedFilters[key];
        break;
      case "allPositions":
        positionsToRender = renderedFilters[key];
        break;

      default:
        break;
    }
  }
  const tech: [] = tech1.concat(tech2);

  const rows = vacancySecond.technologies.reduce<string[][]>(
    (acc, tech, index) => {
      const rowIndex = Math.floor(index / 2);
      if (!acc[rowIndex]) {
        acc[rowIndex] = [];
      }
      acc[rowIndex].push(tech);
      return acc;
    },
    []
  );

  const frameworksRows = vacancySecond.frameworks.reduce<string[][]>(
    (acc, tech, index) => {
      const rowIndex = Math.floor(index / 2);
      if (!acc[rowIndex]) {
        acc[rowIndex] = [];
      }
      acc[rowIndex].push(tech);
      return acc;
    },
    []
  );

  const othersRows = vacancySecond.others.reduce<string[][]>(
    (acc, tech, index) => {
      const rowIndex = Math.floor(index / 2);
      if (!acc[rowIndex]) {
        acc[rowIndex] = [];
      }
      acc[rowIndex].push(tech);
      return acc;
    },
    []
  );

  //new mobile versión
  interface DropdownButtonProps {
    label: string;
    options: string[];
    handleSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedOption: string | boolean | any;
    name: string;
  }

  function DropdownButton({
    label,
    options,
    handleSelect,
    selectedOption,
    name,
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
        label === "Tecnologías" ||
        label === "Frameworks" ||
        label === "Technologies"
      ) {
        return "md:w-[16vh] sm:w-[16vh] ssm:w-full xs:w-full";
      }else if (label === "Posición" ){
        return "md:w-[13vh] sm:w-[12vh] ssm:w-full xs:w-full xs:px-2 xs:ml-0.5";
      }else if(label === "Position"){
        return "md:w-[12vh] sm:w-[12vh] ssm:w-full ssm:px-4 xs:w-full xs:px-2 xs:ml-0.5";
      }else if ( label === "Others") {
        return "md:w-[14vh] sm:w-[12vh] ssm:w-full xs:w-full xs:ml-0.5";
      } else if ( label === "Nivel de Inglés" || label === "English Level") {
        return "md:w-[18vh] sm:w-[18vh] ssm:w-full xs:w-full xs:ml-0.5";
      }else if ( label === "Seniority"  ){
        return "md:w-[15vh] sm:w-[14vh] ssm:w-full ssm:px-2 xs:w-full xs:px-2";
      }else if (label === "Otros" ) {
        return "md:w-[14vh] sm:w-[12vh] ssm:w-full ssm:px-4 xs:w-full xs:px-5";

      }
       else {
        return "md:w-[14vh] sm:w-[10vh] ssm:w-[12vh] xs-w-full";
      }
    };

    const handleOptionClick = (option: string) => {
      const event = {
        target: {
          name: name,
          value: option,
          checked: true,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      handleSelect(event);
      setIsOpen(false);
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className={`${getWidthClass(label)} ${
            selectedOption && selectedOption.length !== 0
              ? "bg-[#173951]"
              : "bg-white"
          } py-2 px-2 xs:px-1 ssm:p-2 rounded-full text-sm border-2 flex justify-between items-center cursor-pointer`}
          onClick={toggleDropdown}
        >
          <p
            className={`${
              selectedOption && selectedOption.length !== 0
                ? "text-white"
                : "text-[#2E2D2C]"
            } mr-2 sm:mr-2 ssm:mr-2 xs:mr-1 font-montserrat font-semibold text-[0.7rem] ssm:text-sm sm:text-[0.8rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] tracking-tight
`}
          >
            {label}
          </p>
          <img
            src={
              selectedOption && selectedOption.length !== 0
                ? whiteArrow
                : blackArrow
            }
            alt="previous"
            className={`cursor-pointer h-2 w-3 ssm:w-3 xs:w-2 transform transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute bg-white text-black rounded shadow-lg z-10 max-h-40 overflow-y-auto">
            <label className="flex items-center px-4 py-2 text-black font-semibold font-montserrat cursor-default">
              {label}
            </label>
            <hr />
            {options.map((option, index) => (
              <label
                key={index}
                className="flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer font-semibold font-montserrat"
                onClick={() => handleOptionClick(option)}
              >
                <input
                  type="checkbox"
                  className="mr-2 rounded-full"
                  checked={
                    selectedOption === option || selectedOption.includes(option)
                  }
                  readOnly
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-linkIt-500 grid justify-center p-[7%] dark:bg-linkIt-200">
      <h3 className="text-black titles-size font-manrope font-bold text-center dark:text-white">
        {t("Calculadora")}
      </h3>
      <span className="text-black subtitles-size font-montserrat font-medium text-center sm:text-2xl xs:text-[17px] dark:text-white mb-[3%]">
        {t("Por favor rellena todos los campos para poder cotizar.")}
      </span>

      <div className="hidden lg:block">
        <div className="flex bg-white rounded-[7px] p-4 my-7  items-center whitespace-nowrap ">
          <div className="grid grid-cols-6 w-full font-montserrat font-semibold justify-items-center">
            <div>
              <Dropdown
                label={t("Posición")}
                inline
                theme={customThemeP}
                className="h-40 overflow-y-scroll font-medium "
              >
                {positionsToRender
                  ?.filter(
                    (items: string | null) => items !== null && items !== ""
                  )
                  .map((position: string, index: number) => (
                    <li key={index}>
                      <input
                        className="checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0 cursor-pointer font-normal"
                        type="checkbox"
                        name="positionV"
                        value={position}
                        id={position}
                        onChange={handleChange}
                        checked={vacancyFirst.positionV === position}
                      />
                      <label
                        htmlFor={position}
                        className="cursor-pointer w-full"
                      >
                        {position}
                      </label>
                    </li>
                  ))}
              </Dropdown>
              <p className="2xl:text-[1.1rem] xl:text-[0.8rem] lg:text-[0-7rem] md:text-[0.7rem]">
                {vacancyFirst.positionV}
              </p>
            </div>

            <div>
              <Dropdown
                label={t("Inglés")}
                inline
                theme={customThemeE}
                className="overflow-y-auto font-medium"
              >
                <li className="">
                  <input
                    className="checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0 cursor-pointer"
                    type="checkbox"
                    name="englishLevel"
                    value="Basico"
                    id="Basico"
                    onChange={handleChange}
                    checked={vacancyFirst.englishLevel === "Basico"}
                  />
                  <label htmlFor="Basico" className="cursor-pointer w-full">
                    {t("Básico")}
                  </label>
                </li>

                <li className="pr-3">
                  <input
                    className="checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0 cursor-pointer"
                    type="checkbox"
                    name="englishLevel"
                    value="Intermedio"
                    id="Intermedio"
                    onChange={handleChange}
                    checked={vacancyFirst.englishLevel === "Intermedio"}
                  />
                  <label htmlFor="Intermedio" className="cursor-pointer w-full">
                    {t("Intermedio")}
                  </label>
                </li>

                <li className="">
                  <input
                    className="checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0 cursor-pointer"
                    type="checkbox"
                    name="englishLevel"
                    value="Avanzado"
                    id="Avanzado"
                    onChange={handleChange}
                    checked={vacancyFirst.englishLevel === "Avanzado"}
                  />
                  <label htmlFor="Avanzado" className="cursor-pointer w-full">
                    {t("Avanzado")}
                  </label>
                </li>
              </Dropdown>
              <p className="2xl:text-[1.1rem] xl:text-[0.8rem] lg:text-[0-7rem] md:text-[0.7rem]">
                {vacancyFirst.englishLevel}
              </p>
            </div>

            <div className="xl:mr-12">
              <Dropdown
                label="Seniority"
                inline
                theme={customThemeS}
                className=" overflow-y-auto z-20 font-medium pr-2"
              >
                <li className="">
                  <input
                    className="checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0"
                    type="checkbox"
                    name="seniorityV"
                    value="Junior"
                    id="Junior"
                    onChange={handleChange}
                    checked={vacancyFirst.seniorityV === "Junior"}
                  />
                  <label htmlFor="Junior" className="cursor-pointer w-full">
                    Junior
                  </label>
                </li>

                <li className="">
                  <input
                    className="checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0"
                    type="checkbox"
                    name="seniorityV"
                    value="Semi-senior"
                    id="Semi-senior"
                    onChange={handleChange}
                    checked={vacancyFirst.seniorityV === "Semi-senior"}
                  />
                  <label
                    htmlFor="Semi-senior"
                    className="cursor-pointer w-full"
                  >
                    Semi-senior
                  </label>
                </li>

                <li className="pr-3">
                  <input
                    className="checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0"
                    type="checkbox"
                    name="seniorityV"
                    value="Senior Advance"
                    id="Senior Advance"
                    onChange={handleChange}
                    checked={vacancyFirst.seniorityV === "Senior Advance"}
                  />
                  <label
                    htmlFor="Senior Advance"
                    className="cursor-pointer w-full"
                  >
                    Senior Advance
                  </label>
                </li>

                <li className="">
                  <input
                    className="checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0"
                    type="checkbox"
                    name="seniorityV"
                    value="Manager/Lead"
                    id="Manager/Lead"
                    onChange={handleChange}
                    checked={vacancyFirst.seniorityV === "Manager/Lead"}
                  />
                  <label
                    htmlFor="Manager/Lead"
                    className="cursor-pointer w-full"
                  >
                    Manager/Lead
                  </label>
                </li>
              </Dropdown>
              <p className="2xl:text-[1.1rem] xl:text-[0.8rem] lg:text-[0-7rem] md:text-[0.7rem]">
                {vacancyFirst.seniorityV}
              </p>
            </div>
            <div className="xl:mr-20">
              <Dropdown
                label={t("Tecnologías")}
                inline
                theme={customThemeT}
                className=" h-40 overflow-y-scroll font-medium"
              >
                {tech
                  ?.filter(
                    (items: string | null) => items !== null && items !== ""
                  )
                  .map((techs: string, index: number) => (
                    <li key={index} className="">
                      <input
                        className="checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0"
                        type="checkbox"
                        name="technologies"
                        value={techs}
                        id={techs}
                        onChange={handleChange}
                        checked={vacancySecond?.technologies?.some(
                          (tech) => tech === techs
                        )}
                      />
                      <label htmlFor={techs} className="cursor-pointer w-full">
                        {techs}
                      </label>
                    </li>
                  ))}
              </Dropdown>
              <div>
                {rows.map((row, rowIndex) => (
                  <p
                    className="2xl:text-[1.1rem] xl:text-[0.8rem] lg:text-[0-7rem] md:text-[0.7rem]"
                    key={rowIndex}
                  >
                    {row.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="inline-flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 32 27"
                          className="ml-1"
                        >
                          <path
                            fill="#1bbb86"
                            d="M26.99 0L10.13 17.17l-5.44-5.54L0 16.41L10.4 27l4.65-4.73l.04.04L32 5.1z"
                          />
                        </svg>
                        {tech}

                        {techIndex < row.length - 1 && ", "}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
            <div className="xl:mr-14 md:-mr-8">
              <Dropdown
                label="Frameworks"
                inline
                theme={customThemeF}
                className=" h-40 overflow-y-scroll font-medium"
              >
                {frameworksToRender
                  ?.filter(
                    (items: string | null) => items !== null && items !== ""
                  )
                  .map((frameworks: string, index: number) => (
                    <li key={index} className="">
                      <input
                        className=" checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0"
                        type="checkbox"
                        name="frameworks"
                        value={frameworks}
                        id={frameworks}
                        onChange={handleChange}
                        checked={vacancySecond?.frameworks?.some(
                          (item) => item === frameworks
                        )}
                      />
                      <label
                        htmlFor={frameworks}
                        className="cursor-pointer w-full"
                      >
                        {frameworks}
                      </label>
                    </li>
                  ))}
              </Dropdown>
              <div>
                {frameworksRows.map((row, rowIndex) => (
                  <p
                    className="2xl:text-[1.1rem] xl:text-[0.8rem] lg:text-[0-7rem] md:text-[0.7rem]"
                    key={rowIndex}
                  >
                    {row.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="inline-flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 32 27"
                          className="ml-1"
                        >
                          <path
                            fill="#1bbb86"
                            d="M26.99 0L10.13 17.17l-5.44-5.54L0 16.41L10.4 27l4.65-4.73l.04.04L32 5.1z"
                          />
                        </svg>
                        {tech}

                        {techIndex < row.length - 1 && ", "}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <Dropdown
                label={t("Otros")}
                inline
                theme={customThemeO}
                className=" h-40 overflow-y-scroll font-medium"
              >
                {othersToRender
                  ?.filter(
                    (items: string | null) => items !== null && items !== ""
                  )
                  .map((others: string, index: number) => (
                    <li key={index} className="">
                      <input
                        className="checked:bg-linkIt-300 rounded-sm mx-2 focus:ring-0"
                        type="checkbox"
                        name="others"
                        value={others}
                        id={others}
                        onChange={handleChange}
                        checked={vacancySecond?.others?.some(
                          (item) => item === others
                        )}
                      />
                      <label htmlFor={others} className="cursor-pointer ">
                        {others}
                      </label>
                    </li>
                  ))}
              </Dropdown>
              <div>
                {othersRows.map((row, rowIndex) => (
                  <p
                    className="2xl:text-[1.1rem] xl:text-[0.8rem] lg:text-[0-7rem] md:text-[0.7rem]"
                    key={rowIndex}
                  >
                    {row.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="inline-flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 32 27"
                          className="ml-1"
                        >
                          <path
                            fill="#1bbb86"
                            d="M26.99 0L10.13 17.17l-5.44-5.54L0 16.41L10.4 27l4.65-4.73l.04.04L32 5.1z"
                          />
                        </svg>
                        {tech}

                        {techIndex < row.length - 1 && ", "}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <button
            className={`${
              isDisabled ? "opacity-40 background-button" : "background-button"
            }`}
            onClick={() => {
              CalculatePrice();
              setButtonPressed(true);
            }}
          >
            {t("Calcular")}
          </button>
        </div>
      </div>


      <div className="lg:hidden  space-y-2">
      <div className="flex flex-wrap">
  <div className="w-full space-x-2 ">
    <div className="flex relative w-full justify-between items-center ">
      <div className="flex flex-grow space-x-2 ssm:space-x-2 xs:space-x-1 ssm:items-start ssm:justify-start">
        <DropdownButton
          label={t("Posición")}
          options={positionsToRender.filter(
            (items: any) => items !== null && items !== ""
          )}
          handleSelect={handleChange}
          selectedOption={vacancyFirst.positionV}
          name="positionV"
        />
        <DropdownButton
          label={t("Nivel de Inglés")}
          options={["Básico", "Intermedio", "Avanzado"]}
          handleSelect={handleChange}
          selectedOption={vacancyFirst.englishLevel}
          name="englishLevel"
        />
        <DropdownButton
          label="Seniority"
          options={[
            "Junior",
            "Semi-senior",
            "Senior Advance",
            "Manager/Lead",
          ]}
          handleSelect={handleChange}
          selectedOption={vacancyFirst.seniorityV}
          name="seniorityV"
        />
      </div>
      <div className=" ssm:flex h-full justify-end">
        <button onClick={handleResetFilters} className="bg-linkIt-300  text-white rounded-full py-[.6rem] px-[.7rem] border-[2px] border-linkIt-300 transition-all duration-300 ease-in-out font-montserrat hover:scale-105">
          <img
            src="/Vectores/reset.svg"
            alt="reset-filters"
            className="w-[14px] h-[14px] hover:rotate-180 transition-all duration-300 ease-in-out"

          />
        </button>
      </div>
    </div>
  </div>
</div>

<div className="flex flex-wrap">
  <div className="w-full space-x-2">
    <div className="flex w-full justify-between items-center">
      <div className="flex flex-grow space-x-2 xs:space-x-1 ssm:space-x-2  ssm:items-start ssm:justify-start">
        <DropdownButton
          label={t("Tecnologías")}
          options={tech.filter(
            (items: any) => items !== null && items !== ""
          )}
          handleSelect={handleChange}
          selectedOption={vacancySecond.technologies}
          name="technologies"
        />
        <DropdownButton
          label="Frameworks"
          options={frameworksToRender.filter(
            (items: any) => items !== null && items !== ""
          )}
          handleSelect={handleChange}
          selectedOption={vacancySecond.frameworks}
          name="frameworks"
        />
        <DropdownButton
          label={t("Otros")}
          options={othersToRender.filter(
            (items: any) => items !== null && items !== ""
          )}
          handleSelect={handleChange}
          selectedOption={vacancySecond.others}
          name="others"
        />
      </div>
      <div className="justify-end ssm:flex">
        <button
          className={`${
            isDisabled ? "opacity-40 bg-[#00A489]" : "bg-[#00A489]"
          } rounded-full ssm:w-24 h-10 xs:w-14`}
          onClick={() => {
            CalculatePrice();
            setButtonPressed(true);
          }}
        >
          <p className="font-montserrat text-sm  ssm:text-sm sm:text-[0.6rem] xs:text-[0.6rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] text-white font-semibold">
            {t("Calcular")}
          </p>
        </button>
      </div>
    </div>
  </div>
</div>

      </div>

      <div className="grid grid-cols-2 items-end dark:text-white mt-[10vh]">
        <span className="subtitles-size font-montserrat font-semibold pl-[2%]">
          Pricing
        </span>
        <div className="flex justify-end gap-[5%] mx-[1%] pr-[2%] subtitles-size">
          <p className="font-bold font-manrope text-end whitespace-nowrap">
            <span className=" font-medium text-linkIt-700 dark:text-white text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem] xl:text-[1rem] font-montserrat mr-[2%]">
              {t(`Mínimo`)} USD
            </span>
            {price.min}
          </p>
          <p className="font-bold font-manrope text-end whitespace-nowrap">
            <span className="font-medium text-linkIt-700 dark:text-white text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem] xl:text-[1rem] font-montserrat mr-[2%]">
              {t("Máximo")} USD
            </span>
            {price.max}
          </p>
        </div>
        <hr className="bg-black h-[2px] lg:h-[3px] col-span-full mt-[1%] dark:bg-white" />
        <p
          className={`lg:col-start-2 col-span-2 font-medium mt-3 font-manrope text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem] xl:text-[1rem] justify-self-end ${
            price.min === "$0" && price.max === "$0"
              ? "opacity-0"
              : "opacity-100"
          }`}
        >
          {t(
            "Los presupuestos dependerán de todos los requerimientos exactos de la búsqueda, beneficios, planes de desarrollo definidos entre otros, contáctanos para concretarlo."
          )}
        </p>
      </div>
    </div>
  );
}

export default Calculadora;
