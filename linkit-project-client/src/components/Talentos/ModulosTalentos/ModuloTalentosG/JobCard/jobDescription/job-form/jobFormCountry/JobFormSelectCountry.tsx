import Select from "react-select";
import countries from "i18n-iso-countries";
import english from "i18n-iso-countries/langs/en.json";
import espanish from "i18n-iso-countries/langs/es.json";
import { components } from "react-select";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../redux/types";

interface OptionType {
  value: string;
  label: string;
}

countries.registerLocale(english);
countries.registerLocale(espanish);

const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <img
        src="/Vectores/dropdown.png"
        alt="dropdown-arrow"
        className={`w-[1.1rem] ml-[30%] mr-[-10%]`}
      />
    </components.DropdownIndicator>
  );
};

const customStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "#fff",
    border: "1.5px solid #CBDAE8",
    borderRadius: "12px",
    minHeight: "2.9rem",
    height: "2.9rem",
    boxShadow: "none",
    width: "100%",
  }),

  container: (provided: any) => ({
    ...provided,
    height: "2.9rem",
    width: "100%",
  }),

  valueContainer: (provided: any) => ({
    ...provided,
    height: "2.9rem",
    padding: "0 3rem 0 0.5rem",
    maxWidth: "100%",
    overflow: "hidden",
  }),

  input: (provided: any) => ({
    ...provided,
    margin: "0px",
    color: "#173951",
    caretColor: "#173951",
    maxWidth: "100%",
    overflow: "hidden",
  }),

  indicatorsContainer: (provided: any) => ({
    ...provided,
    height: "2.9rem",
  }),
  menu: (provided: any) => ({
    ...provided,
    fontFamily: "Montserrat",
    width: "100%",
    maxWidth: "100%",
    marginLeft: "",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: "#2E2D2C",
    position: "relative",
    left: "1.5rem",
    top: "0.2rem",
  }),
};

export function SelectCountryFormEs({
  setCountry,
  country,
  setUser,
  isSearchable = true,
}: any) {
  const { t, i18n } = useTranslation();
  const countryList = useSelector(
    (state: RootState) => state.resources.countries
  );
  const currentLang = i18n.language?.startsWith("en") ? "en" : "es";

  const legacyEnglishOverrides: Record<string, string> = {
    USA: "United States",
    "Costa rica": "Costa Rica",
    Mexico: "Mexico",
    Peru: "Peru",
    Panama: "Panama",
    Lithuania: "Lithuania",
    Philippines: "Philippines",
    "South Africa": "South Africa",
    Canada: "Canada",
    "Emiratos Arabes": "United Arab Emirates",
    "Islas Malvinas": "Malvinas Islands",
  };

  const getCountryLabel = (countryName: string) => {
    if (currentLang === "es") return countryName;
    if (legacyEnglishOverrides[countryName]) return legacyEnglishOverrides[countryName];

    const alpha2FromEs = countries.getAlpha2Code(countryName, "es");
    if (alpha2FromEs) {
      return countries.getName(alpha2FromEs, "en", { select: "official" }) || countryName;
    }

    const alpha2FromEn = countries.getAlpha2Code(countryName, "en");
    if (alpha2FromEn) {
      return countries.getName(alpha2FromEn, "en", { select: "official" }) || countryName;
    }

    return countryName;
  };

  const countryOptionsEs: OptionType[] = useMemo(
    () =>
      countryList.map((country: { id: number; name: string }) => ({
        label: getCountryLabel(country.name),
        // value se mantiene en español/legacy para que Airtable reciba lo esperado.
        value: country.name,
      })),
    [countryList, currentLang]
  );

  const handleChange = (selectedOption: OptionType | null) => {
    const countryValue = selectedOption || null;
    setCountry(countryValue);
    setUser((prevUser: any) => ({
      ...prevUser,
      country: selectedOption?.value || "",
    }));
  };

  return (
    <Select
      options={countryOptionsEs?.sort((a, b) => a.label.localeCompare(b.label))}
      value={country}
      styles={customStyles}
      placeholder={t("Ubicación")}
      onChange={handleChange}
      components={{ DropdownIndicator }}
      isClearable={false}
      isSearchable={isSearchable}
    />
  );
}
