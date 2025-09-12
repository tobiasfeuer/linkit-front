import { useState } from "react";
import { ViewColHeadAdmins } from "../../../admin.types";
import Swal from "sweetalert2";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  searchUsersAdmins,
  setUsersAdmins,
  sortUsersAdmins,
} from "../../../../../redux/features/UsersSlice";
import { useTranslation } from "react-i18next";
import PermissionsForm from "./PermissionsForm";
import AdminsForm from "./AdminsForm";

interface HeadAdmins {
  hideCol: (e: React.ChangeEvent<HTMLInputElement>) => void;
  viewCol: ViewColHeadAdmins;
  selectedRows: Set<string>;
  editing: boolean;
  editAdmin: () => void;
  handleSave: (arrayProps: string[]) => void;
  setSaveStatus: (status: boolean) => void;
  selectedUsersStatus: any;
  setSelectedRows: (selectedRows: Set<string>) => void;
}

export default function HeadAdmins({
  hideCol,
  viewCol,
  selectedRows,
  setSelectedRows,
  editing,
  editAdmin,
  handleSave,
  setSaveStatus,
  selectedUsersStatus,
}: HeadAdmins) {
  const arraySelectedRows = [...selectedRows];
  const { t } = useTranslation();
  const token = useSelector((state: any) => state.Authentication.token);
  const dispatch = useDispatch();
  const [loading] = useState(false);

  //? OPTIONS COLUMNS
  const [options, setOptions] = useState(false);
  const [permVisible, isPermVisible] = useState(false);
  const hideOptions = () => {
    setOptions(!options);
  };
  //?

  //?BUSCAR
  const handleSearch = (searchTerm: string): void => {
    dispatch(searchUsersAdmins(searchTerm));
  };
  //?

  //?ORDENAR
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    dispatch(sortUsersAdmins(value));
  };
  //?

  //? FORM
  const [viewForm, setViewForm] = useState(false);
  const showForm = () => {
    setSaveStatus(false);
    setViewForm(true);
  };
  const noShowForm = () => {
    setViewForm(false);
  };
  //?

  const blockOrActiveUser = async () => {
    const action = selectedUsersStatus.every((status: Boolean) => status)
      ? t("bloquear")
      : t("activar");

    Swal.fire({
      title: t(`¿Deseas ${action} el Admin?`),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("Aceptar"),
      cancelButtonText: t("Cancelar"),
      customClass: {
        confirmButton: "background-button",
        cancelButton: "transparent-background-button",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: t("Procesando..."),
          text: t(`Estamos ${action} el Admin, por favor espera.`),
          icon: "info",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          await Promise.all(
            arraySelectedRows.map(async (id: string) => {
              const response = await axios.delete(
                `${import.meta.env.VITE_ENDPOINT_URL}/admins/delete/${id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Accept-Language": sessionStorage.getItem("lang"),
                  },
                }
              );
              dispatch(setUsersAdmins(response.data));
            })
          );

          Swal.fire({
            title: t("¡Éxito!"),
            text: t(`El Admin ha sido ${action} correctamente.`),
            icon: "success",
            confirmButtonText: t("Cerrar"),
            customClass: {
              confirmButton: "background-button",
            },
          });
        } catch (response: any) {
          Swal.fire({
            title: t("Error"),
            text: t(
              `Hubo un problema al ${action} el Admin: ${
                response.response?.data || response.message
              }`
            ),
            icon: "error",
            confirmButtonText: t("Cerrar"),
            customClass: {
              confirmButton: "background-button",
            },
          });
        }
      }
    });

    setSaveStatus(true);
  };

  const deleteUserPermanently = async () => {
    Swal.fire({
      title: t("¿Deseas eliminar permanentemente el Admin?"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("Aceptar"),
      cancelButtonText: t("Cancelar"),
      customClass: {
        confirmButton: "background-button",
        cancelButton: "transparent-background-button",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: t("Procesando..."),
          text: t(
            "Estamos eliminando permanentemente el Admin, por favor espera."
          ),
          icon: "info",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          // Eliminar Admins seleccionados
          await Promise.all(
            arraySelectedRows.map(async (id: string) => {
              const deleteAdmin = await axios.delete(
                `${import.meta.env.VITE_ENDPOINT_URL}/admins/${id}/permanent`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Accept-Language": sessionStorage.getItem("lang"),
                  },
                }
              );
              dispatch(setUsersAdmins(deleteAdmin.data));
            })
          );

          Swal.fire({
            title: t("¡Éxito!"),
            text: t("El Admin ha sido eliminado permanentemente."),
            icon: "success",
            confirmButtonText: t("Cerrar"),
            customClass: {
              confirmButton: "background-button",
            },
          });
          setSelectedRows(new Set([]));
        } catch (response: any) {
          Swal.fire({
            title: t("Error"),
            text: t(
              `Hubo un problema al eliminar el Admin: ${
                response.response?.data || response.message
              }`
            ),
            icon: "error",
            confirmButtonText: t("Cerrar"),
            customClass: {
              confirmButton: "background-button",
            },
          });
        }
      }
    });
  };

  return (
    <div>
      <div>
        <h1 className="text-4xl pl-16 py-6">{t("Administradores")}</h1>
      </div>
      <div className=" flex flex-row justify-around pb-6">
        <div>
          <button
            className="flex items-center border border-linkIt-300 rounded-[7px] p-2 shadow-md hover:border-linkIt-200 transition-all duration-300 ease-in-out mr-5"
            onClick={showForm}
          >
            {t("Nuevo Admin")}
          </button>
        </div>
        <div className="flex flex-row">
          <div>
            <h1>{t("Ordenar: ")}</h1>
          </div>
          <div>
            <select onChange={handleSort} className={`styles-head ml-2`}>
              <option value="recent">{t("Recientes")}</option>
              <option value="old">{t("Antiguos")}</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <div className="flex flex-row">
            <div>
              <button onClick={hideOptions}>{t("Columnas")}</button>
            </div>
          </div>
          {options && (
            <div className="capitalize flex flex-col border-2 border-linkIt-300 rounded-lg mt-6 w-60 pl-2 absolute bg-linkIt-500">
              {Object.entries(viewCol).map(([key, value]) => (
                <label key={key} className="">
                  <input
                    type="checkbox"
                    name={key}
                    checked={value}
                    onChange={hideCol}
                  />
                  {key}
                </label>
              ))}
            </div>
          )}
        </div>
        {viewForm && (
          <AdminsForm onClose={noShowForm} setSaveStatus={setSaveStatus} />
        )}
        <div>
          <input
            type="text"
            placeholder="Buscar"
            onChange={(e) => handleSearch(e.target.value)}
            className={`styles-head`}
          />
        </div>
      </div>

      <div>
        <div className="pl-4">
          <p className="text-lg m-2 bg-linkIt-300 text-white font-semibold p-2 rounded-lg w-1/6 text-center">
            {t("Seleccionados: ")} {selectedRows.size}
          </p>
        </div>
        <span className="flex flex-row pl-8">
          {selectedRows.size > 0 && (
            <div className="flex flex-row space-x-4 pl-4 mb-4">
              {editing ? (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleSave(arraySelectedRows)}
                    className="px-4 py-2 bg-linkIt-300 text-white rounded-md shadow-md hover:bg-linkIt-400 transition-all duration-300"
                  >
                    {t("Guardar")}
                  </button>
                  <button
                    onClick={editAdmin}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md hover:bg-gray-400 transition-all duration-300"
                  >
                    {t("Cancelar")}
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={editAdmin}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-all duration-300"
                  >
                    {selectedRows.size && t("Editar")}
                  </button>
                </div>
              )}
              {selectedRows.size === 1 && (
                <button
                  onClick={() => isPermVisible(true)}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-md shadow-md hover:bg-cyan-600 transition-all duration-300"
                >
                  {t("Asignar Permisos")}
                </button>
              )}
              <button
                onClick={blockOrActiveUser}
                className={`px-4 py-2 ${
                  selectedUsersStatus.every((status: Boolean) => status)
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white rounded-md shadow-md transition-all duration-300`}
                disabled={loading}
              >
                {loading
                  ? t("Cargando...")
                  : selectedUsersStatus.every((status: Boolean) => status)
                  ? t("Bloquear Admin")
                  : t("Activar Admin")}
              </button>

              <button
                onClick={deleteUserPermanently}
                className="px-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition-all duration-300"
                disabled={loading}
              >
                {loading ? t("Cargando...") : t("Eliminar Admin")}
              </button>
            </div>
          )}
        </span>
        {permVisible && (
          <PermissionsForm
            admin={arraySelectedRows[0]}
            hideFunction={isPermVisible}
          />
        )}
      </div>
    </div>
  );
}
