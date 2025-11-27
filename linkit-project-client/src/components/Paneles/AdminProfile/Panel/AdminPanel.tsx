import { Route, Routes, useNavigate } from "react-router-dom";
import NavPanelAdmin from "./NavPanelAdmin";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Vacancies2 from "./AdminVacantes/Vacancies2";
import ClientsFollowUp from "./ClientsFollowUp/ClientsFollowUp";
import { IAdmin } from "../../../Profiles/types";
import Statistics from "./AdminStatistics/Statistics";
import UsersAdmin2 from "../Usuarios/UsersAdmin2";
import Resources from "./AdminRecursos/Resources";
import Reviews from "./AdminReviews/Reviews";
import SuperAdminProfileForm from "../../../Profiles/SuperAdminProfile/SuperAdminProfileForm";
import CreateResourcePage from "./AdminRecursos/NewCreate/CreateResourcePage";
// import SuperAdminProfile from "../../../Profiles/SuperAdminProfile/SuperAdminProfile";

export default function AdminPanel() {
  const { t } = useTranslation();
  const token = useSelector((state: any) => state.Authentication.token);

  const [userData, setUserData] = useState<IAdmin>();
  const nav = useNavigate();

  useEffect(() => {
    const infoUser = async () => {
      try {
        if (!token) {
          nav("/unauthorized");
          return;
        }
        const response = await axios(
          `${import.meta.env.VITE_ENDPOINT_URL}/admins/find?id=${token}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Accept-Language": sessionStorage.getItem("lang"),
            },
          }
        );
        if (!response.data) {
          nav("/unauthorized");
          return;
        }
        setUserData(response.data as IAdmin);
      } catch (error) {
        nav("/unauthorized");
      }
    };
    infoUser();
  }, []);

  return (
    <div className="pt-32 font-montserrat">
      <h1 className="mt-[40px] text-5xl pt-6 pl-16 font-bold">
        {t("Hola")} {userData?.firstName}!
      </h1 >
      <NavPanelAdmin />
      <Routes>
        <Route path="/*" element={<Statistics />} />
        <Route path="vacantes" element={<Vacancies2 />} />
        <Route path="clientsfollowup" element={<ClientsFollowUp />} />
        <Route path="recursos" element={<Resources />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="users/*" element={<UsersAdmin2 />} />
        <Route path="mis-datos" element={<SuperAdminProfileForm />} />
        <Route path="/crear-recurso" element={<CreateResourcePage />} />
        
      </Routes>
      <br />
    </div>
  );
}
