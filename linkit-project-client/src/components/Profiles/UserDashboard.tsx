import { useEffect, useState } from "react";
import InternalNavBar from "../NavBar/InternalNavBar";
import { ICompany, IUser, UserRoleEnum, WebsiteUser } from "./types";
import { useTranslation } from "react-i18next";
import ProfileComponent from "./ProfileComponent";
import MyApps from "./TalentProfile/MyApps/MyApps";
import MyPosts from "./CompanyProfile/MyPosts/MyPosts";
import loadingSpinner from "../../assets/Loading/bouncing-circles.svg";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/types";

interface dashBoardProps {
  role: UserRoleEnum;
}

export default function UserDashboard({ role }: dashBoardProps) {
  const { t } = useTranslation();
  const user: string[] = [t("Mis datos"), t("Mis postulaciones")];
  const company: string[] = [t("Mis datos"), t("Mis vacantes")];
  const [profileVisible, setProfileVisible] = useState(true);
  const [auxVisible, setAuxVisible] = useState(false);
  const [loading, isLoading] = useState(true);
  const loggedUser: WebsiteUser = useSelector(
    (state: RootState) => state.Authentication.user as WebsiteUser
  );

  useEffect(() => {
    if (window.location.toString().split("#")[1]) {
      setProfileVisible(false);
      setAuxVisible(true);
    }
  }, []);

  return (
    <div className="flex flex-col pt-5 md:w-full">
      <h1 className="pl-[50px] md:pl-[100px] pb-10 font-semibold text-6xl">
        {t("Hola")}{" "}
        {role === "user"
          ? (loggedUser as IUser).firstName
          : (loggedUser as ICompany).companyName}
        !
      </h1>
      <InternalNavBar
        items={role === "user" ? user : company}
        statusHandler={[setProfileVisible, setAuxVisible]}
      />
      <div className="pb-5 md:py-6 mb-10 mx-5 py-3 md:mx-10 z-10 h-[80%] rounded-2xl bg-linkIt-500">
        {loading && (
          <img
            className="w-[150px] relative left-[37%] md:left-[45%]"
            src={loadingSpinner}
          />
        )}
        {profileVisible && <ProfileComponent loader={isLoading} />}
        {role === "user" ? (
          <>{auxVisible && <MyApps loader={isLoading} />}</>
        ) : (
          <>{auxVisible && <MyPosts loader={isLoading} />}</>
        )}
      </div>
    </div>
  );
}
