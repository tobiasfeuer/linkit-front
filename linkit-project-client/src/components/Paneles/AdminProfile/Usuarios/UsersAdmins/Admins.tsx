import { useDispatch, useSelector } from "react-redux";
import HeadAdmins from "./HeadAdmins";
import { useEffect, useState } from "react";
import {
  setUsersAdmins,
  sortUsersAdmins,
} from "../../../../../redux/features/UsersSlice";
import axios from "axios";
import { Admin } from "../../../admin.types";
import { useTranslation } from "react-i18next";

type stateProps = {
  users: {
    filteredAdmins: Admin[];
  };
};

export default function Admins() {
  const { t } = useTranslation();
  const token = useSelector((state: any) => state.Authentication.token);
  const dispatch = useDispatch();
  const data = useSelector((state: stateProps) => state.users.filteredAdmins);
  const [saveStatus, setSaveStatus] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const response = await axios(
          `${import.meta.env.VITE_ENDPOINT_URL}/admins/find`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Accept-Language": sessionStorage.getItem("lang"),
            },
          }
        );
        dispatch(setUsersAdmins(response.data));
        dispatch(sortUsersAdmins("recent"));
      } catch (error) {
        console.error("Error al cargar las información", error);
      }
    };
    loadData();
  }, [saveStatus, dispatch, token]);

  //?COLUMNAS
  const [viewCol, setViewCol] = useState({
    rol: true,
    nombre: true,
    apellido: true,

    correo: true,
    "Fecha de creación": true,

    "Firebase Id": false,
    Estado: true,
  });
  const hideCol = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name } = e.target;
    setViewCol((prevViewCol) => ({
      ...prevViewCol,
      [name]: !prevViewCol[name as keyof typeof prevViewCol],
    }));
  };
  //?

  //?PAGINADO
  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(0);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const dataToShow = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const handleNext = (): void => {
    setCurrentPage(currentPage + 1);
  };
  const handlePrevius = (): void => {
    setCurrentPage(currentPage - 1);
  };
  //?

  //?EDITAR
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Admin>>({});
  const handleEdit = (id: string): void => {
    const updateSelectedRows = new Set(selectedRows);
    if (updateSelectedRows.has(id)) {
      updateSelectedRows.delete(id);
    } else {
      updateSelectedRows.add(id);
    }
    setSelectedRows(updateSelectedRows);
    setEditing(false);
  };
  const editAdmin = () => {
    setSaveStatus(false);
    setEditing(!editing);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      [name]: value,
    });
  };
  const handleSave = async (arrayProps: string[]) => {
    try {
      arrayProps.forEach(async (id: string) => {
        const endPoint = `${import.meta.env.VITE_ENDPOINT_URL}/admins/update/${id}`;
        await axios.put(endPoint, editedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang"),
          },
        });
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
    setEditing(false);
    setEditedData({});
    setSaveStatus(!saveStatus);
  };
  //?

  //?SECCIONES
  const renderSectionSelect = <K extends keyof Admin>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2 w-fit border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: Admin, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "capitalize flex flex-row  pl-3 h-8 pt-1 bg-linkIt-300 whitespace-nowrap"
                : "capitalize flex flex-row  pl-3 h-8 pt-1 border-b-2 border-r-2 border-linkIt-50 overflow-ellipsis overflow-hidden line-clamp-1"
            }
          >
            <input
              type="checkbox"
              name="edit"
              onChange={() => handleEdit(r._id)}
              checked={selectedRows.has(r._id)}
            />
            <p className="pl-2">
              {String(r[key] === undefined || NaN ? "" : r[key])}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
  const renderSectionBasicNoEdit = <K extends keyof Admin>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-fit border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: Admin, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8  line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8  line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
            }
          >
            <p>{String(r[key] === undefined || NaN ? "" : r[key])}</p>
          </div>
        ))}
      </div>
    </div>
  );
  const renderSectionBasic = <K extends keyof Admin>(title: string, key: K) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2 w-full border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: Admin, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8  line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8  line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
            }
          >
            <p>
              {selectedRows.has(r._id) && editing ? (
                <input
                  name={key}
                  type="text"
                  defaultValue={r[key] as any}
                  onChange={handleChange}
                  className="bg-linkIt-500 text-black w-full h-6"
                />
              ) : (
                String(r[key] === undefined || NaN ? "" : r[key])
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
  const renderSectionBasicCap = <K extends keyof Admin>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-fit border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: Admin, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8  line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8  line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
            }
          >
            <p>
              {selectedRows.has(r._id) && editing ? (
                <input
                  name={key}
                  type="text"
                  defaultValue={r[key] as any}
                  onChange={handleChange}
                  className="bg-linkIt-500 text-black w-full h-6"
                />
              ) : (
                String(r[key] === undefined || NaN ? "" : r[key])
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
  const renderSectionActive = <K extends keyof Admin>(
    title: string,
    key: K
  ) => (
    <div className="flex flex-col flex-grow text-center">
      <div className="flex flex-row whitespace-nowrap border-b-2 border-r-2 w-full border-linkIt-200 justify-center items-center">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: Admin, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
            }
          >
            <p>{String(r[key] === true ? "Activo" : "Inactivo")}</p>
          </div>
        ))}
      </div>
    </div>
  );
  //?

  return (
    <div className=" bg-scroll bg-linkIt-500">
      <HeadAdmins
        hideCol={hideCol}
        viewCol={viewCol}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        editing={editing}
        editAdmin={editAdmin}
        handleSave={handleSave}
        setSaveStatus={setSaveStatus}
        selectedUsersStatus={Array.from(selectedRows).map((id) => {
          const user = data.find((u) => u._id === id);
          return user?.active;
        })}
      />
      <div className="flex flex-row mx-6 overflow-y-auto border-2 border-linkIt-200 rounded-lg">
        {viewCol.rol && renderSectionSelect("Rol", "role")}
        {viewCol.nombre && renderSectionBasicCap("Nombre", "firstName")}
        {viewCol.apellido && renderSectionBasicCap("Apellido", "lastName")}
        {/* {viewCol.pais && renderSectionBasicCap("País", "country")} */}
        {viewCol.correo && renderSectionBasic("Correo", "email")}
        {viewCol["Fecha de creación"] &&
          renderSectionBasicNoEdit("Fecha de Creación", "createdDate")}
        {/* {viewCol.imagen && renderSectionBasic("Imagen", "image")} */}
        {viewCol["Firebase Id"] &&
          renderSectionBasicNoEdit("Firebase Id", "firebaseId")}
        {viewCol.Estado && renderSectionActive("Estado", "active")}
      </div>
      <div className="flex flex-row justify-around">
        <button
          className="cursor-pointer hover:text-linkIt-300"
          onClick={handlePrevius}
          disabled={currentPage === 0}
        >
          {t("Anterior")}
        </button>
        <span className="text-center">
          {t("Página")} {currentPage + 1} {t("de")} {totalPages}
        </span>
        <button
          className="cursor-pointer hover:text-linkIt-300"
          onClick={handleNext}
          disabled={endIndex >= data.length}
        >
          {t("Siguiente")}
        </button>
      </div>
    </div>
  );
}

