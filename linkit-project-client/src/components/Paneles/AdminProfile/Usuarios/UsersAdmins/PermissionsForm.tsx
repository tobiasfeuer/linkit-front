import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IAdmin } from "../../../../Profiles/types";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/types";
import Swal from "sweetalert2";

interface componentProps {
  admin: string;
  hideFunction: (value: boolean) => void;
}

interface permissionsInt {
  get: string[];
  create: string[];
  update: string[];
  delete: string[];
}

export default function PermissionsForm({
  admin,
  hideFunction,
}: componentProps) {
  const { t } = useTranslation();
  const [activeAdmin, setActiveAdmin] = useState<IAdmin>();
  const [permissions, setPermissions] = useState<permissionsInt>({
    get: [""],
    create: [""],
    update: [""],
    delete: [""],
  });
  const token = useSelector((state: RootState) => state.Authentication.token);

  const permissionsLabels = [
    t("Usuarios"),
    t("Administradores"),
    t("Empresas"),
    t("Posteos"),
    t("Reseñas"),
    "JDs",
  ];
  const permissionValues = [
    "users",
    "admins",
    "companies",
    "posts",
    "reviews",
    "jds",
  ];
  useEffect(() => {
    const fetchAdmin = async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_ENDPOINT_URL}/admins/find?id=${admin}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang"),
          },
        }
      );
      setActiveAdmin(data);
      setPermissions(data.permissions);
    };
    fetchAdmin();
  }, []);

  function handleGetChange(
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) {
    if (type === "create") {
      if (e.target.checked) {
        setPermissions({
          ...permissions,
          create: [...permissions.create, e.target.name],
        });
      } else {
        setPermissions({
          ...permissions,
          create: permissions.create.filter((perm) => perm !== e.target.name),
        });
      }
    } else if (type === "update") {
      if (e.target.checked) {
        setPermissions({
          ...permissions,
          update: [...permissions.update, e.target.name],
        });
      } else {
        setPermissions({
          ...permissions,
          update: permissions.update.filter((perm) => perm !== e.target.name),
        });
      }
    } else if (type === "get") {
      if (e.target.checked) {
        setPermissions({
          ...permissions,
          get: [...permissions.get, e.target.name],
        });
      } else {
        setPermissions({
          ...permissions,
          get: permissions.get.filter((perm) => perm !== e.target.name),
        });
      }
    } else if (type === "delete") {
      if (e.target.checked) {
        setPermissions({
          ...permissions,
          delete: [...permissions.delete, e.target.name],
        });
      } else {
        setPermissions({
          ...permissions,
          delete: permissions.delete.filter((perm) => perm !== e.target.name),
        });
      }
    }
  }

  async function handleSave() {
    try {
       await axios.put(
        `${import.meta.env.VITE_ENDPOINT_URL}/admins/permissions/${admin}`,
        permissions,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang"),
          },
        }
      );
      Swal.fire({
        title: t("Enviado"),
        text: t("Permisos cambiados con éxito"),
        icon: "success",
        allowOutsideClick: true,
        confirmButtonColor: "#01A28B"
      });
      hideFunction(false);
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.response.data,
        icon: "error",
        allowOutsideClick: true
      });
    }
  }

  return (
    <div className="absolute flex w-[100vw] h-[120vh] lg:h-[100vh] bg-black bg-opacity-40 justify-center">
      <div className="flex flex-col self-center w-[80%] lg:w-[50%] bg-white rounded-2xl p-5 md:mt-14">
        <h1 className="text-center my-2">
          {t("Permisos de:")} <b>{activeAdmin?.firstName}</b>
        </h1>
        <div className="flex flex-col md:flex-row mb-5 lg:gap-10 lg:p-5 md:gap-2">
          <div className="flex flex-col">
            <div>
              <h1 className="font-bold text-linkIt-400 text-sm my-2">
                {t("Crear")}
              </h1>
            </div>
            <div className="bg-gray-200 rounded-md p-2 flex flex-wrap gap-x-3">
              {permissionValues.map((value: string, index) => {
                if (
                  value !== "users" &&
                  value !== "admins" &&
                  value !== "companies"
                )
                  return (
                    <label key={index}>
                      {permissionsLabels[index]}
                      <input
                        type="checkbox"
                        name={value}
                        className="ml-1"
                        checked={permissions.create.includes(value)}
                        onChange={(event) => handleGetChange(event, "create")}
                      />
                    </label>
                  );
              })}
            </div>
          </div>
          <div className="flex flex-col">
            <div>
              <h1 className="font-bold text-linkIt-400 text-sm my-2">
                {t("Editar")}
              </h1>
            </div>
            <div className="bg-gray-200 rounded-md p-2 flex flex-wrap gap-x-3">
              {permissionValues.map((value: string, index) => (
                <label key={index}>
                  {permissionsLabels[index]}
                  <input
                    type="checkbox"
                    name={value}
                    className="ml-1"
                    checked={permissions.update.includes(value)}
                    onChange={(event) => handleGetChange(event, "update")}
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <div>
              <h1 className="font-bold text-linkIt-400 text-sm my-2">
                {t("Consultar")}
              </h1>
            </div>
            <div className="bg-gray-200 rounded-md p-2 flex flex-wrap gap-x-3">
              {permissionValues.map((value: string, index) => (
                <label key={index}>
                  {permissionsLabels[index]}
                  <input
                    type="checkbox"
                    name={value}
                    className="ml-1"
                    checked={permissions.get.includes(value)}
                    onChange={(event) => handleGetChange(event, "get")}
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <div>
              <h1 className="font-bold text-linkIt-400 text-sm my-2">
                {t("Eliminar")}
              </h1>
            </div>
            <div className="bg-gray-200 rounded-md p-2 flex flex-wrap gap-x-3">
              {permissionValues.map((value: string, index) => (
                <label key={index}>
                  {permissionsLabels[index]}
                  <input
                    type="checkbox"
                    name={value}
                    className="ml-1"
                    checked={permissions.delete.includes(value)}
                    onChange={(event) => handleGetChange(event, "delete")}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-row self-center mb-4">
          <button
            onClick={() => hideFunction(false)}
            className="transparent-background-button mr-2"
          >
            {t("Volver")}
          </button>
          <button
            type="submit"
            onClick={handleSave}
            className="background-button ml-2"
          >
            {t("Guardar")}
          </button>
        </div>
      </div>
    </div>
  );
}
