import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/types";
import axios from "axios";
//import { SUPERADMN_ID } from "../../../../env";
import TalentApps from "./TalentApps";
import { IUser } from "../../types";

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID

interface ITalentApp {}

interface componentProps {
  loader: (value: boolean) => void;
}

function MyApps({ loader }: componentProps) {
  const [talentApps, setTalentApps] = useState<ITalentApp[]>();

  const user = useSelector(
    (state: RootState) => state.Authentication.user
  ) as IUser;

  useEffect(() => {
    const fetchApps = async () => {
      const postulArray: any[] = [];
      for (const postul of user.postulations) {
        const response = await axios.get(
          `${import.meta.env.VITE_ENDPOINT_URL}/resources/companyjds?code=${postul}`,
          {
            headers: {
              Authorization: `Bearer ${SUPERADMN_ID}`,
              "Accept-Language": sessionStorage.getItem("lang"),
            },
          }
        );
        postulArray.push(response.data);
      }
      setTalentApps(postulArray);
      loader(false);
    };
    fetchApps();
    return () => loader(true);
  }, []);

  if (!talentApps) return null;
  return (
    <div className="flex bg-white m-5 p-5 rounded-[20px] md:mx-16 mx-5">
      {user.postulations.length ? (
        <TalentApps apps={talentApps} />
      ) : (
        <h1>No tienes postulaciones </h1>
      )}
    </div>
  );
}

export default MyApps;
