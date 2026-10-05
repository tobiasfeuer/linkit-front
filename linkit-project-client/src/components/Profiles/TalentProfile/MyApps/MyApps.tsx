import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/types";
import TalentApps from "./TalentApps";
import { IUser } from "../../types";

interface ITalentApp {}

interface componentProps {
  loader: (value: boolean) => void;
}

function MyApps({ loader }: componentProps) {
  const [talentApps, setTalentApps] = useState<ITalentApp[]>([]);

  const user = useSelector(
    (state: RootState) => state.Authentication.user
  ) as IUser;

  useEffect(() => {
    setTalentApps([]);
    loader(false);
    return () => loader(true);
  }, []);

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
