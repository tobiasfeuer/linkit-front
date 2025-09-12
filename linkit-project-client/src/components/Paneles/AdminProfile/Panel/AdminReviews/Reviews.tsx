import { useDispatch, useSelector } from "react-redux";
import {
  setReviews,
  sortReviews,
} from "../../../../../redux/features/ReviewsSlice";
import HeadReviews from "./HeadReviews";
import { ReviewProps, ViewReviewProps } from "../../../admin.types";
import { IUser } from "../../../../Profiles/types";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

type stateProps = {
  Authentication: { user: IUser };
  reviews: {
    filteredReviews: ReviewProps[];
  };
};

export default function Reviews() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const token = useSelector(
    (state: stateProps) => state.Authentication.user._id
  );
  const data = useSelector(
    (state: stateProps) => state.reviews.filteredReviews
  );


  const [saveStatus, setSaveStatus] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await axios(
          `${import.meta.env.VITE_ENDPOINT_URL}/reviews/find`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Accept-Language": sessionStorage.getItem("lang"),
            },
          }
        );
        dispatch(setReviews(response.data));
        dispatch(sortReviews("recent"));
      } catch (error) {
        console.error(t("Error al cargar las reseñas"), error);
      }
    };
    loadData();
  }, [saveStatus || dispatch]);

  //? PAGINADO
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

  //? COLUMNAS
  const [viewCol, setViewCol] = useState<ViewReviewProps>({
    _id: false,
    name: true,
    country: true,
    detail: true,
    archived: true,
  });
  const hideCol = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name } = e.target;
    setViewCol((prevViewCol) => ({
      ...prevViewCol,
      [name]: !prevViewCol[name as keyof typeof prevViewCol],
    }));
  };
  //?

  //?EDITAR
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<ReviewProps>>({});
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
  const editReview = () => {
    setSaveStatus(false)
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
        const endPoint = `${import.meta.env.VITE_ENDPOINT_URL}/reviews/update/${id}`;
        await axios.put(endPoint, editedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang"),
          },
        });
      });
    } catch (error: any) {
      throw new Error(t("Error al enviar la solicitud:")).message
    }
    setEditing(false);
    setEditedData({});
    setSaveStatus(!saveStatus);
  };
  //?
  
  //?SECCIONES
  const renderSectionSelect = <K extends keyof ReviewProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-80 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: ReviewProps, index) => (
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
  const renderSectionBasicNoEdit = <K extends keyof ReviewProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-80 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: ReviewProps, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
            }
          >
            <p>{String(r[key] === undefined || NaN ? "" : r[key])}</p>
          </div>
        ))}
      </div>
    </div>
  );
  const renderSectionBasic = <K extends keyof ReviewProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-80 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: ReviewProps, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
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
  const renderSectionBasicCap = <K extends keyof ReviewProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-80 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: ReviewProps, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
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
  const renderSectionActive = <K extends keyof ReviewProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-80 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: ReviewProps, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
            }
          >
            <p>{String(r[key] === true ? "Inactivo" : "Activo")}</p>
          </div>
        ))}
      </div>
    </div>
  );
  //?

  return (
    <div className="bg-linkIt-500 mx-12 rounded-[20px] w-auto p-3">
      <HeadReviews
        hideCol={hideCol}
        viewCol={viewCol}
        selectedRows={selectedRows}
        editing={editing}
        editReview={editReview}
        handleSave={handleSave}
        setSaveStatus={setSaveStatus}
      />
      <div className="flex flex-row mx-6 overflow-y-scroll border-2 border-linkIt-200 rounded-lg">
        {viewCol.name && renderSectionSelect("Nombre", "name")}
        {viewCol._id && renderSectionBasicNoEdit("ID", "_id")}
        {viewCol.country && renderSectionBasicCap("País", "country")}
        {viewCol.detail && renderSectionBasic("Detalle", "detail")}
        {viewCol.archived && renderSectionActive("Estado", "archived")}
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
          {t("Página")} {currentPage + 1} de {totalPages}
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
