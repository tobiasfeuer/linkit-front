import { FunctionComponent, useEffect, useState } from "react";
import { ICompany } from "../types";
import { editCompany } from "../api";
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/features/AuthSlice";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import axios from "axios";
import Loading from "../../Loading/Loading";

interface IComponentProps {
  company: ICompany;
}

const CompanyForm: FunctionComponent<IComponentProps> = ({ company }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [country, setCountry] = useState(company.country);
  const [repName, setRepName] = useState(company.repName);
  const [companyName, setCompanyName] = useState(company.companyName);
  const [interested, setInterests] = useState(company.interested);
  const [linkedin, setLinkedin] = useState(company.linkedin);
  const [countries, setCountries] = useState([]);
  const [loading, isLoading] = useState(false);

  useEffect(() => {
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
    try {
      e.preventDefault();

      const newCompany = {
        ...company,
        companyName,
        repName,
        linkedin,
        interested,
        country,
      };
      isLoading(true);
      const updatedCompany = await editCompany(newCompany);
      dispatch(setUser(updatedCompany));
      Swal.fire({
        title: t("Datos actualizados"),
        icon: "success",
        confirmButtonColor: "#01A28B",
      });
      isLoading(false);
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.response.data,
        icon: "error",
      });
      isLoading(false);
    }
  };

  function handleDiscard() {
    window.location.reload();
  }

  return (
    <div className="bg-white mx-5 my-5 p-10 rounded-[20px] md:mx-10 md:p-10">
      {loading && <Loading text={t("Enviando los cambios")} />}
      <form action="" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5 md:flex-row md:flex-wrap">
          <div className="flex flex-col">
            <label htmlFor="" className="ml-2">
              {t("Nombre y apellido")}
            </label>
            <input
              defaultValue={company.repName}
              onChange={(event) => setRepName(event.target.value)}
              type="text"
              className="placeholder:font-[500] placeholder:text-opacity-80 placeholder:text-linkIt-400 bg-transparent pl-[1rem] border-[.125rem] border-linkIt-400 md:w-[24rem] h-[2.75rem] rounded-[10px]"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="" className="ml-2">
              {t("Empresa")}
            </label>
            <input
              defaultValue={company.companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              type="text"
              className="bg-transparent pl-[1rem] border-[.125rem] border-linkIt-400 md:w-[24rem] h-[2.75rem] rounded-[10px] text-linkIt-400 text-opacity-80 hover:cursor-not-allowed"
              title={t(
                "Si deseas cambiar el nombre de la empresa contáctanos para ayudarte"
              )}
              disabled
            />
          </div>

          <div className="flex flex-col">
            <label className="ml-2">{t("País")}</label>
            <select
              onChange={(event) => setCountry(event.target.value)}
              value={country ?? "-"}
              className="border-[.125rem] border-linkIt-400 bg-transparent pl-[1rem] md:w-[24rem] h-[2.75rem] rounded-[10px]"
            >
              <option value=""></option>
              {countries.map((country, index) => (
                <option key={index}>{country}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="" className="ml-2">
              {t("Email corporativo")}
            </label>
            <input
              defaultValue={company.email}
              className="bg-transparent pl-[1rem] border-[.125rem] border-linkIt-400 md:w-[24rem] h-[2.75rem] rounded-[10px] text-linkIt-400 text-opacity-80 hover:cursor-not-allowed"
              type="text"
              disabled
            />
          </div>

          <div className="flex flex-col">
            <label className="ml-2">{t("Interés principal")}</label>
            <select
              onChange={(event) => setInterests(event.target.value)}
              defaultValue={company.interested}
              className="border-[.125rem] border-linkIt-400 bg-transparent pl-[1rem] md:w-[24rem] h-[2.75rem] rounded-[10px]"
            >
              <option value="-"></option>
              <option value="payroll">{t("Nómina/Pagos")}</option>
              <option value="recruiting">{t("Contratación directa")}</option>
              <option value="staff-aug">
                {t("Contratación intermediada")}
              </option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="" className="ml-2">
              Linkedin
            </label>
            <input
              defaultValue={company.linkedin}
              onChange={(event) => setLinkedin(event.target.value)}
              className="placeholder:font-[500] placeholder:text-opacity-80 placeholder:text-linkIt-400 bg-transparent pl-[1rem] border-[.125rem] border-linkIt-400 md:w-[24rem] h-[2.75rem] rounded-[10px]"
              type="text"
              placeholder={t("Linkedin")}
            />
          </div>
        </div>

        <div className="flex flex-row justify-center mt-8 gap-5">
          <button
            className="text-linkIt-400 border-[.125rem] border-linkIt-300 bg-white font-montserrat font-[500] hover:border-linkIt-200 w-[11.75rem] h-[2.75rem] rounded-[10px] border-solid"
            type="button"
            onClick={handleDiscard}
          >
            {t("Descartar")}
          </button>
          <button
            type="submit"
            className="text-white border-[.125rem] border-linkIt-300 bg-linkIt-300 font-montserrat font-[500] hover:border-linkIt-200 w-[11.75rem] h-[2.75rem] rounded-[10px] border-solid"
          >
            {t("Guardar")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
