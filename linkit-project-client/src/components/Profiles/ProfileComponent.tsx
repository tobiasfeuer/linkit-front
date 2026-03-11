import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import CloudinaryUploadWidget from "../Services/cloudinaryWidget";
import { editWebUserImage } from "./api";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/features/AuthSlice";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ProfileFormComponent from "./ProfileFormComponent";
import { WebsiteUser } from "./types";
import ResetPassword from "../../Utils/ResetPassword/ResetPassword";

interface componentProps {
  loader: (value: boolean) => void;
}

export default function ProfileComponent({ loader }: componentProps) {
  useEffect(() => {
    loader(false);
  }, [loader]);
  const { t } = useTranslation();
  const [filePublicId, setFilePublicId] = useState("");
  const [fileName, setFileName] = useState("");
  const [reload, setReload] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user: WebsiteUser = useSelector(
    (state: any) => state.Authentication.user
  );

  const resetPasswordHandler = () => {
    setShowResetPassword(true);
    setTimeout(() => {
      setShowResetPassword(false);
    }, 100);
  };

  // UseEffect for validate auth
  useEffect(() => {
    if (!user) navigate("/unauthorized");
  }, []);

const updateUserImage = async () => {
  try {
    const updatedUser = await editWebUserImage(user, filePublicId);
    dispatch(setUser(updatedUser));
    Swal.fire({
      title: t("Imagen actualizada"),
      text: fileName,
      icon: "success",
      confirmButtonText: "Ok",
      confirmButtonColor: "#01A28B",
    });
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      text: error.response?.data || error.message,
      icon: "error",
      confirmButtonText: "Ok",
      confirmButtonColor: "#01A28B",
    });
  } finally {
    loader(false);
  }
};

useEffect(() => {
  if (reload) {
    updateUserImage();
    setReload(false);
  }
  return () => loader(true);
}, [reload]);



  return (
    <div className="flex flex-col w-full pt-5 justify-center">
      <div className="flex p-3 flex-col md:flex-row w-full">
        <div className="flex flex-col md:flex-row w-full pt-10 md:justify-evenly md:pt-0">
          <div className="relative w-full flex justify-center md:w-[50%]">
            <div className="relative left-[7%]">
        <CloudinaryUploadWidget
  setFilePublicId={(id) => {
    setFilePublicId(id);
  }}
  setFileName={(name) => {
    setFileName(name);
  }}
  setReload={setReload}
  className="background-button"
>
  {t("Imagen de perfil")}
</CloudinaryUploadWidget>
              </div>
            <div
              className={`relative rounded-full w-[250px] h-[250px] bg-gray-300 ${
                user?.image
                  ? "flex flex-col justify-center items-center content-center"
                  : ""
              }`}
            >
              {user?.image && (
                <img
                  src={`https://res.cloudinary.com/dquhriqz3/image/upload/${user?.image}`}
                  alt=""
                  className="rounded-full absolute h-full w-full object-cover"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col pt-5 gap-3 self-center place-self-center">
            {user.role === "company" && <a className="background-button"href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3qmMK1h4c08Aw_b5gFiF-vLjHYunVGIWvt6RyOJvaaQOVd8qQm9syzfgwV03LXDEnL7R_CHXbi" target="_blank" >{t("Crear una vacante")}</a>}
            {user?.provider === "email" && (
              <button
                className="text-white border-[.125rem] border-linkIt-300 bg-linkIt-300 w-[11.75rem] h-[2.75rem] rounded-[10px] border-solid"
                onClick={resetPasswordHandler}
              >
                {t("Cambiar contraseña")}
              </button>
            )}
            {showResetPassword && <ResetPassword user={user} />}

          </div>
        </div>
      </div>
      <ProfileFormComponent user={user} />
    </div>
  );
}
