import { useEffect, useState } from "react";
import HeadClientsFollowUp from "./headClientsFollowUp";
import { useDispatch, useSelector } from "react-redux";
import { ClientFollowUpProps } from "../../../admin.types";
import {
  setJobData,
  sortJobData,
} from "../../../../../redux/features/ClientsFollowUpSlice";
import axios from "axios";

type stateProps = {
  jobData: {
    allJobData: ClientFollowUpProps[];
    filteredJobData: ClientFollowUpProps[];
  };
};

export default function ClientsFollowUp() {
  const token = useSelector((state: any) => state.Authentication.token);

  const [viewCol, setViewCol] = useState({
    "1st Client interview": true,
    "1st Offer": true,
    "1st endorsement": true,
    "2nd Client interview": true,
    "Alignment/Start date": true,
    "Año fecha cierre": true,
    "Años de experiencia mínimo": true,
    Area: true,
    BUDGET: true,
    "BUDGET in USD": true,
    "Cantidad de vacantes": true,
    "Cl. Interview time": true,
    Client: true,
    "Contact Name": true,
    "Contact mail": true,
    Comments: true,
    "Closed Rate": true,
    Country: true,
    "Created By": true,
    "Created time Month": true,
    "Created time year": true,
    "Endorsement time": true,
    "English Level": true,
    "Fee acordado": true,
    "Hourly Type": true,
    JD: true,
    "Last Modified": true,
    "Lider de la búsqueda": true,
    "Mes fecha cierre": true,
    "Modalidad de empleo": true,
    "Nombre talento": true,
    "On-site / Remote": true,
    "Prospect type": true,
    "Recruitment role code": true,
    "Reasons closed lost": true,
    Recruiter: true,
    Responsable: true,
    "Role Code": true,
    "Role Name": true,
    "Role Closed date": true,
    "Sales code": true,
    Seniority: true,
    Status: true,
    "Talent Pool Stack": true,
    "Talent Start Date": true,
    "Time to fill": true,
    "Time to offer": true,
    "Tipo de cliente": true,
    "Tipo de oportunidad": true,
    "To today": true,
    "Total candidates endorsed": true,
    created: true,
  });
  const data = useSelector(
    (state: stateProps) => state.jobData.filteredJobData
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const response = await axios(
          `${import.meta.env.VITE_ENDPOINT_URL}/resources/companyjds`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Accept-Language": sessionStorage.getItem("lang"),
            },
          }
        );
        dispatch(setJobData(response.data));
        dispatch(sortJobData("recent"));
      } catch (error) {
        console.error("Error al cargar las información", error);
      }
    };
    loadData();
  }, []);

  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(0);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const dataToShow = data.slice(startIndex, endIndex);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const hideCol = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name } = e.target;
    setViewCol((prevViewCol) => ({
      ...prevViewCol,
      [name]: !prevViewCol[name as keyof typeof prevViewCol],
    }));
  };

  const handleNext = (): void => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevius = (): void => {
    setCurrentPage(currentPage - 1);
  };

  const renderSectionBasic = <K extends keyof ClientFollowUpProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-80 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: ClientFollowUpProps, index) => (
          <p
            key={`${key}-${index}`}
            className="pl-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 border-b-2 border-r-2 border-linkIt-50"
          >
            {String(r[key] === undefined || NaN ? "" : r[key])}
          </p>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="bg-linkIt-500 mx-12 rounded-[20px] w-auto p-3">
        <HeadClientsFollowUp hideCol={hideCol} viewCol={viewCol} />

        <div className="flex flex-row mx-6 overflow-y-scroll border-2 border-linkIt-200 rounded-lg">
          {viewCol["Recruitment role code"] &&
            renderSectionBasic(
              "Recruitment role code",
              "Recruitment role code"
            )}
          {viewCol.Client && renderSectionBasic("Client", "Client")}
          {viewCol["Role Name"] && renderSectionBasic("Role Name", "Role Name")}
          {viewCol["Tipo de cliente"] &&
            renderSectionBasic("Tipo de cliente", "Tipo de cliente")}
          {viewCol["Lider de la búsqueda"] &&
            renderSectionBasic("Lider de la búsqueda", "Lider de la búsqueda")}
          {viewCol.Status && renderSectionBasic("Status", "Status")}
          {viewCol["Tipo de oportunidad"] &&
            renderSectionBasic("Tipo de oportunidad", "Tipo de oportunidad")}
          {viewCol["Role Code"] && renderSectionBasic("Role Code", "Role Code")}
          {viewCol.JD && renderSectionBasic("JD", "JD")}
          {viewCol["Talent Pool Stack"] &&
            renderSectionBasic("Talent Pool Stack", "Talent Pool Stack")}
          {viewCol["Años de experiencia mínimo"] &&
            renderSectionBasic(
              "Años de experiencia mínimo",
              "Años de experiencia mínimo"
            )}
          {viewCol.Seniority && renderSectionBasic("Seniority", "Seniority")}
          {viewCol["Cantidad de vacantes"] &&
            renderSectionBasic("Cantidad de vacantes", "Cantidad de vacantes")}
          {viewCol.Responsable &&
            renderSectionBasic("Responsable", "Responsable")}
          {viewCol["Contact Name"] &&
            renderSectionBasic("Contact Name", "Contact Name")}
          {viewCol.BUDGET && renderSectionBasic("BUDGET", "BUDGET")}
          {viewCol["BUDGET in USD"] &&
            renderSectionBasic("BUDGET in USD", "BUDGET in USD")}
          {viewCol.Country && renderSectionBasic("Country", "Country")}
          {viewCol["English Level"] &&
            renderSectionBasic("English Level", "English Level")}
          {viewCol["Modalidad de empleo"] &&
            renderSectionBasic("Modalidad de empleo", "Modalidad de empleo")}
          {viewCol["On-site / Remote"] &&
            renderSectionBasic("On-site / Remote", "On-site / Remote")}
          {viewCol["Hourly Type"] &&
            renderSectionBasic("Hourly Type", "Hourly Type")}
          {viewCol["Fee acordado"] &&
            renderSectionBasic("Fee acordado", "Fee acordado")}
          {viewCol["Total candidates endorsed"] &&
            renderSectionBasic(
              "Total candidates endorsed",
              "Total candidates endorsed"
            )}
          {viewCol["Alignment/Start date"] &&
            renderSectionBasic("Alignment/Start date", "Alignment/Start date")}
          {viewCol["1st endorsement"] &&
            renderSectionBasic("1st endorsement", "1st endorsement")}
          {viewCol["1st Client interview"] &&
            renderSectionBasic("1st Client interview", "1st Client interview")}
          {viewCol["2nd Client interview"] &&
            renderSectionBasic("2nd Client interview", "2nd Client interview")}
          {viewCol["1st Offer"] && renderSectionBasic("1st Offer", "1st Offer")}
          {viewCol["Talent Start Date"] &&
            renderSectionBasic("Talent Start Date", "Talent Start Date")}
          {viewCol["Role Closed date"] &&
            renderSectionBasic("Role Closed date", "Role Closed date")}
          {viewCol.Area && renderSectionBasic("Area", "Area")}
          {viewCol["Reasons closed lost"] &&
            renderSectionBasic("Reasons closed lost", "Reasons closed lost")}
          {viewCol["Nombre talento"] &&
            renderSectionBasic("Nombre talento", "Nombre talento")}
          {viewCol["Closed Rate"] &&
            renderSectionBasic("Closed Rate", "Closed Rate")}
          {viewCol.Comments && renderSectionBasic("Comments", "Comments")}
          {viewCol["Last Modified"] &&
            renderSectionBasic("Last Modified", "Last Modified")}
          {viewCol["Prospect type"] &&
            renderSectionBasic("Prospect type", "Prospect type")}
          {viewCol["Created By"] &&
            renderSectionBasic("Created By", "Created By")}
          {viewCol.created && renderSectionBasic("Created", "created")}
          {viewCol["Created time Month"] &&
            renderSectionBasic("Created time Month", "Created time Month")}
          {viewCol["Endorsement time"] &&
            renderSectionBasic("Endorsement time", "Endorsement time")}
          {viewCol["Cl. Interview time"] &&
            renderSectionBasic("Cl. Interview time", "Cl. Interview time")}
          {viewCol["Time to offer"] &&
            renderSectionBasic("Time to offer", "Time to offer")}
          {viewCol["Time to fill"] &&
            renderSectionBasic("Time to fill", "Time to fill")}
          {viewCol["Mes fecha cierre"] &&
            renderSectionBasic("Mes fecha cierre", "Mes fecha cierre")}
          {viewCol["Año fecha cierre"] &&
            renderSectionBasic("Año fecha cierre", "Año fecha cierre")}
          {viewCol["Sales code"] &&
            renderSectionBasic("Sales code", "Sales code")}
          {viewCol["To today"] && renderSectionBasic("To today", "To today")}
        </div>
        <div className="flex flex-row justify-around">
          <button
            className="cursor-pointer hover:text-linkIt-300"
            onClick={handlePrevius}
            disabled={currentPage === 0}
          >
            Anterior
          </button>
          <span className="text-center">
            Pagina {currentPage + 1} de {totalPages}
          </span>
          <button
            className="cursor-pointer hover:text-linkIt-300"
            onClick={handleNext}
            disabled={endIndex >= data.length}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
