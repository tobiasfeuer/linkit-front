import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../redux/types";
import { ICompany, IUser } from "../../../../../Profiles/types";
import StatisticsCard from "./StatisticsCard";
import {
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Sector,
} from "recharts";
import {
  JdEntity,
  mostCommonJd,
  mostCommonStack,
  mostRepeatedCountry,
  mostRepeatedInterest,
  mostUsedProvider,
  repeatedCompanyData,
  repeatedLocationData,
  repeatedStackData,
  repeatedTypeData,
  returnCountryData,
  returnInterestData,
} from "./Helpers/WebFunctions";
import graphIcon from "../../../../../../assets/graph-create.svg";

export default function StatisticsWeb() {
  const { token } = useSelector((state: RootState) => state.Authentication);

  const [users, setUsers] = useState<IUser[]>([]);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [jds, setJDs] = useState([]);
  const [activeData, setActiveData] = useState<string>("register");
  const [activeData2, setActiveData2] = useState<string>("modality");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const currentDate = new Date();

  //TODO Erase this once is used, only for deployment purposes
  if (!jds) {
    null;
  }

  useEffect(() => {
    const fetchAllData = async () => {
      const allUsers = await axios.get(
        `${import.meta.env.VITE_ENDPOINT_URL}/users/find`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang"),
          },
        }
      );
      const allCompanies = await axios.get(
        `${import.meta.env.VITE_ENDPOINT_URL}/companies/find`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang"),
          },
        }
      );
      const allJds = await axios.get(
        `${import.meta.env.VITE_ENDPOINT_URL}/jds/find`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang"),
          },
        }
      );
      setUsers(allUsers.data);
      setCompanies(allCompanies.data);
      setJDs(allJds.data);
    };
    fetchAllData();
  }, []);

  const registerData = [
    {
      label: "Email",
      A:
        users.filter((user) => user.provider === "email").length +
        companies.filter((company) => company.provider === "email").length,
      fullMark: users.length + companies.length,
    },
    {
      label: "Google",
      A:
        users.filter((user) => user.provider === "google").length +
        companies.filter((company) => company.provider === "google").length,
      fullMark: users.length + companies.length,
    },
    {
      label: "GitHub",
      A:
        users.filter((user) => user.provider === "github").length +
        companies.filter((company) => company.provider === "github").length,
      fullMark: users.length + companies.length,
    },
  ];

  const userCountryData = users && returnCountryData(users);
  const companyCountryData = companies && returnCountryData(companies);
  const companyInterestData = returnInterestData(companies);
  const jdTypeData = repeatedTypeData(jds);
  const jdLocationData = repeatedLocationData(jds);
  const jdStackData = repeatedStackData(jds);
  const jdCompanyData = repeatedCompanyData(jds);

  const pieData = [
    { name: "Usuarios", value: users.length },
    { name: "Emrpesas", value: companies.length },
  ];

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          key={1}
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          key={2}
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
        >{`PV ${value}`}</text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
        >
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  const pieColors = ["#0088FE", "#FFBB28"];

  function setGraph(type: string) {
    if (type === "register")
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={registerData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis />
            <Radar
              name="RegisterType"
              dataKey="A"
              stroke="#8884d8"
              fill="#8884d8"
            />
          </RadarChart>
        </ResponsiveContainer>
      );
    else if (type === "userCountry")
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="80%"
            data={userCountryData}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis />
            <Radar
              name="RegisterType"
              dataKey="A"
              stroke="#8884d8"
              fill="#8884d8"
            />
          </RadarChart>
        </ResponsiveContainer>
      );
    else if (type === "companyCountry")
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="80%"
            data={companyCountryData}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis />
            <Radar
              name="RegisterType"
              dataKey="A"
              stroke="#8884d8"
              fill="#8884d8"
            />
          </RadarChart>
        </ResponsiveContainer>
      );
    else if (type === "interest")
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="80%"
            data={companyInterestData}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis />
            <Radar
              name="RegisterType"
              dataKey="A"
              stroke="#8884d8"
              fill="#8884d8"
            />
          </RadarChart>
        </ResponsiveContainer>
      );
  }

  function setGraph2(type: string) {
    let activeData;
    if (type === "modality") activeData = jdTypeData;
    else if (type === "location") activeData = jdLocationData;
    else if (type === "stack") activeData = jdStackData;
    else if (type === "company") activeData = jdCompanyData;
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="p-10 divide-black">
      <h1 className="ml-10 text-3xl">Usuarios</h1>
      <hr className="mt-2 mb-5 w-[90%] translate-x-10" />
      <div className="flex flex-row ml-10 gap-16">
        <div className="flex flex-col-reverse">
          <StatisticsCard
            color="#95df4a"
            text="Cantidad de usuarios registrados en la web"
            value={users.length + companies.length}
          />
          <StatisticsCard
            color="#FFBB28"
            text="Empresas"
            value={companies.length}
          />
          <StatisticsCard
            color="#0088FE"
            text="Usuarios"
            value={users.length}
          />
          <div>
            <PieChart width={350} height={150}>
              <Pie
                data={pieData}
                dataKey="value"
                cx={180}
                cy={100}
                startAngle={180}
                endAngle={0}
                fill="#8884d8"
                paddingAngle={5}
                innerRadius={60}
                outerRadius={80}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                    name={entry.name}
                  />
                ))}
              </Pie>
            </PieChart>
          </div>
        </div>
        <div className="flex flex-row">
          <div className="flex flex-col justify-center">
            <StatisticsCard
              color="#D6D6D6"
              text="Usuarios registrados el último mes"
              value={
                users.filter(
                  (user) =>
                    new Date(user.createdDate).getMonth() ===
                    currentDate.getMonth()
                ).length
              }
            />
            <StatisticsCard
              color="#D6D6D6"
              text="Empresas registrados el último mes"
              value={
                companies.filter(
                  (company) =>
                    new Date(company.createdDate).getMonth() ===
                    currentDate.getMonth()
                ).length
              }
            />
            <StatisticsCard
              color="#D6D6D6"
              text="Usuarios registrados en el año actual"
              value={
                users.filter(
                  (user) =>
                    new Date(user.createdDate).getFullYear() ===
                    currentDate.getFullYear()
                ).length
              }
            />
            <StatisticsCard
              color="#D6D6D6"
              text="Empresas registrados el año actual"
              value={
                companies.filter(
                  (company) =>
                    new Date(company.createdDate).getFullYear() ===
                    currentDate.getFullYear()
                ).length
              }
            />
          </div>
          <div className="flex flex-col justify-center">
            <StatisticsCard
              color="#D6D6D6"
              text="Tipo de registro mas usado"
              value={mostUsedProvider(users, companies) ?? "..."}
            />
            <StatisticsCard
              color="#D6D6D6"
              text="País con mayor registro de usuarios"
              value={mostRepeatedCountry(users)}
            />
            <StatisticsCard
              color="#D6D6D6"
              text="País con mayor registro de empresas"
              value={mostRepeatedCountry(companies)}
            />
            <StatisticsCard
              color="#D6D6D6"
              text="Interés principal de empresas"
              value={mostRepeatedInterest(companies)}
            />
          </div>
          <div className="flex flex-col w-[50px] justify-around">
            {["register", "userCountry", "companyCountry", "interest"].map(
              (x, idx) => (
                <img
                  key={idx}
                  src={graphIcon}
                  onClick={() => setActiveData(x)}
                  className="hover:cursor-pointer"
                />
              )
            )}
          </div>
        </div>
        <div className="w-[800px]">{setGraph(activeData)}</div>
      </div>
      <h1 className="ml-10 text-3xl pt-8">JDs</h1>
      <hr className="mt-2 mb-5 w-[90%] translate-x-10" />
      <div className="flex flex-row ml-10 gap-7">
        <div className="w-[600px]">{setGraph2(activeData2)}</div>
        <div className="flex flex-row">
          <div className="flex flex-col w-[50px] justify-around">
            {["modality", "location", "stack", "company"].map((x, idx) => (
              <img
                key={idx}
                src={graphIcon}
                onClick={() => setActiveData2(x)}
                className="hover:cursor-pointer"
              />
            ))}
          </div>
          <div>
            {/*GRAPH AND CARD*/}
            {/*Most common in type x3*/}
            <StatisticsCard
              color="#D6D6D6"
              text="Modalidad más común en las JDs"
              value={mostCommonJd(jds, "type")}
            />
            {/*Most common location x5*/}
            <StatisticsCard
              color="#D6D6D6"
              text="Ubicación de la mayoría de JDs"
              value={mostCommonJd(jds, "location")}
            />
            {/*Most common stack x5*/}
            <StatisticsCard
              color="#D6D6D6"
              text="Tecnología más solicitada en JDs"
              value={mostCommonStack(jds)}
            />
            {/*Most common company x5*/}
            <StatisticsCard
              color="#D6D6D6"
              text="Empresa con mayor cantidad de JDs"
              value={mostCommonJd(jds, "company")}
            />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          {/*CARDS*/}
          {/*TOTAL JDS*/}
          <StatisticsCard
            color="#BB8FCE"
            text="Totalidad de JDs"
            value={jds?.length}
          />
          {/*TOTAL JDS created last month*/}
          <StatisticsCard
            color="#82E0AA"
            text="JDs creadas el último mes"
            value={
              jds.filter(
                (jd: any) =>
                  new Date(jd.createdDate).getMonth() === currentDate.getMonth()
              ).length
            }
          />
          {/*TOTAL JDS created this year*/}
          <StatisticsCard
            color="#F1C40F"
            text="JDs creadas el último año"
            value={
              jds.filter(
                (jd: any) =>
                  new Date(jd.createdDate).getFullYear() ===
                  currentDate.getFullYear()
              ).length
            }
          />
        </div>
        <div className="w-[20%] ml-[100px] flex flex-col justify-center">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Modalidad
                </th>
                <th scope="col" className="px-6 py-3">
                  Numero de JDs
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  Remoto
                </th>
                <td className="px-6 py-4">
                  {
                    jds.filter((jd: JdEntity) => jd.modality === "remote")
                      .length
                  }
                </td>
              </tr>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  Remoto limitado
                </th>
                <td className="px-6 py-4">
                  {
                    jds.filter(
                      (jd: JdEntity) => jd.modality === "specific-remote"
                    ).length
                  }
                </td>
              </tr>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  Presencial
                </th>
                <td className="px-6 py-4">
                  {
                    jds.filter((jd: JdEntity) => jd.modality === "on-site")
                      .length
                  }
                </td>
              </tr>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  Híbrido
                </th>
                <td className="px-6 py-4">
                  {
                    jds.filter((jd: JdEntity) => jd.modality === "hybrid")
                      .length
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
