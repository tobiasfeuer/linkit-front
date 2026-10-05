import { useEffect, useState } from "react";
import CompanyPosts from "./CompanyPosts";
import CompanyClosedPosts from "./CompanyClosedPosts";

export interface ICompanyPost {
  _id: string;
  contactMail: string;
  BUDGET: string;
  EnglishLevel: string;
  "On-site / Remote": string;
  "Cantidad de vacantes": number;
  Country: string;
  "Role Code": string;
  "Mes fecha cierre": string;
  "Time to offer": string;
  "Año fecha cierre": string;
  "Alignment/Start date": string;
  "Time to fill": string;
  "Reasons closed lost": string;
  "Created time year": number;
  "Tipo de oportunidad": string;
  "Fee acordado": number;
  BUDGETinUSD: string;
  "Años de experiencia mínimo": number;
  "Role Name": string;
  "Created time Month": number;
  Responsable: string;
  "Total candidates endorsed": number;
  Area: string;
  "Contact Name": string;
  "Líder de la búsqueda": string[];
  Status: string;
  "Recruitment role code": number;
  "Prospect type": string;
  "Talent Pool Stack": string;
  created: string;
  JD: string;
  "Tipo de cliente": string;
  "Endorsement time": string;
  "Created By": string;
}

interface componentprops {
  loader: (value: boolean) => void;
}

function MyPosts({ loader }: componentprops) {
  const [companyPosts, setCompanyPosts] = useState<ICompanyPost[]>([]);
  const [closedPosts, setClosedPosts] = useState<ICompanyPost[]>([]);
  const [activeSection, setActiveVisible] = useState(true);
  const [closedSection, setClosedVisible] = useState(false);

  useEffect(() => {
    setCompanyPosts([]);
    setClosedPosts([]);
    loader(false);
    return () => loader(true);
  }, []);

  return (
    <div className="flex flex-col left-1/2 top-1/2 mx-3 md:mx-6 p-5 bg-linkIt-500 rounded-[20px] gap-5">
      <div className="flex flex-row gap-5 ml-5">
        <h2
          className={`font-bold mb-2 hover:cursor-pointer ${
            activeSection && "underline"
          }`}
          onClick={() => {
            setActiveVisible(true);
            setClosedVisible(false);
          }}
        >
          Activos
        </h2>
        <h2
          className={`font-bold mb-2 hover:cursor-pointer ${
            closedSection && "underline"
          }`}
          onClick={() => {
            setActiveVisible(false);
            setClosedVisible(true);
          }}
        >
          Cerrados
        </h2>
      </div>
      {activeSection && <CompanyPosts posts={companyPosts} />}
      {closedSection && <CompanyClosedPosts posts={closedPosts} />}
    </div>
  );
}

export default MyPosts;
