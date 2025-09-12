import { useEffect, useState } from "react";
import HeadResources from "./HeadResources";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setResources,
  sortResource,
} from "../../../../../redux/features/ResourcesSlice";
import { ResourceProps, ViewResourceProps } from "../../../admin.types";
import CloudinaryUploadWidget from "../../../../Services/cloudinaryWidget";
import ModalEditResources from "./ModalEditResources";

export type stateProps = {
  resources: {
    filteredResources: ResourceProps[];
  };
};

export default function Resources() {
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.Authentication.token);
  const data = useSelector(
    (state: stateProps) => state.resources.filteredResources
  );
  const [saveStatus, setSaveStatus] = useState<boolean>(false);
  const loadData = async (): Promise<void> => {
    try {
      const response = await axios(
          `${import.meta.env.VITE_ENDPOINT_URL}/posts/find`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang"),
          },
        }
      );
      dispatch(setResources(response.data));
      dispatch(sortResource("recent"));
    } catch (error: any) {
      console.error("Error al cargar la información", error.response?.data);
    }
  };
  useEffect(() => {
    loadData();
  }, [saveStatus || dispatch]);

  //?COLUMNS
  const [viewCol, setViewCol] = useState<ViewResourceProps>({
    _id: false,
    title: true,
    description: true,
    link: true,
    type: true,
    createdDate: true,
    image: true,
    category: true,
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

  //? PAGINADO
  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(0);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const dataToShow = data?.slice(startIndex, endIndex);
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
  const [editedData, setEditedData] = useState<Partial<ResourceProps>>({});
  const [filePublicId, setFilePublicId] = useState("");
  const handleEdit = (id: string): void => {
    if (selectedRows.has(id)) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set([id]));
    }
    setEditing(false);
  };

  const editResource = () => {
    setSaveStatus(false);

    if (selectedRows.size === 1) {
      const id = Array.from(selectedRows)[0];
      const selectedResource = data.find((resource) => resource._id === id);
      if (selectedResource) {
        handleOpenModal(selectedResource);
      }
    }
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setSaveStatus(false);

    setEditedData({
      ...editedData,
      [name]: value,
    });
  };
  const handleSave = async (arrayProps: string | string[]) => {
    try {
      const propsArray = Array.isArray(arrayProps) ? arrayProps : [arrayProps];
      propsArray.forEach(async (id: string) => {
        const endPoint = `${import.meta.env.VITE_ENDPOINT_URL}/posts/update/${id}`;
        await axios.put(endPoint, editedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang"),
          },
        });
      });
    } catch (error: any) {
      if (error.response) {
        console.error(error.response.data);
      } else {
        console.error("Error al enviar la solicitud: ", error.message);
      }
    }

    setEditing(false);
    setSaveStatus(!saveStatus);
    setEditedData({});
  };

  const setFileName = () => {
    editedData.title?.concat("image");
  };
  //?

  const handleCloudinaryChange = (newFilePublicId: string) => {
    setFilePublicId(newFilePublicId);

    setEditedData({
      ...editedData,
      image: newFilePublicId,
    });
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [selectedResource, setSelectedResource] =
    useState<ResourceProps | null>(null);

  const handleOpenModal = (resource: ResourceProps): void => {
    setSelectedResource(resource);
    setModalOpen(true);
    setIsEditing(true);
    setEditing(true);
  };

  const handleCloseModal = (): void => {
    loadData();
    setModalOpen(false);
    setIsEditing(false);
    setEditing(false);
    setSelectedResource(null);
  };
  //?SECCIONES
  const renderSectionSelect = <K extends keyof ResourceProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-80 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow?.map((r: ResourceProps, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "capitalize flex flex-row  pl-3 h-8 pt-1 bg-linkIt-300 whitespace-nowrap w-80"
                : "capitalize flex flex-row  pl-3 h-8 pt-1 border-b-2 border-r-2 border-linkIt-50 overflow-ellipsis  overflow-hidden line-clamp-1"
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

  const formatDate = (dateString: string): string => {
    const formattedDate = dateString.slice(0, -5).replace("T", " ");
    return formattedDate;
  };

  const renderSectionBasicNoEdit = <K extends keyof ResourceProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-80 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow?.map((r: ResourceProps, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
            }
          >
            <p>
              {String(
                r[key] === undefined || r[key] === null
                  ? ""
                  : key === "createdDate"
                  ? formatDate(r[key] as string)
                  : r[key]
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
  const renderSectionBasicNoEditCap = <K extends keyof ResourceProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-10 border-b-2 border-r-2  w-40 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow?.map((r: ResourceProps, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "capitalize pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-40 line-clamp-1 bg-linkIt-300 justify-center items-center"
                : " capitalize pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-40 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
            }
          >
            <p>
              {String(
                r[key] === undefined || NaN
                  ? ""
                  : r[key] && r[key] === "social"
                  ? "evento"
                  : r[key]
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
  const renderSectionBasic = <K extends keyof ResourceProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row justify-center whitespace-nowrap px-20 border-b-2 border-r-2  w-80 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow?.map((r: ResourceProps, index) => (
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
  const renderSectionImg = <K extends keyof ResourceProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row justify-center whitespace-nowrap px-20 border-b-2 border-r-2  w-80 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow?.map((r: ResourceProps, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-80 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
            }
          >
            {key === "image" && selectedRows.has(r._id) && editing ? (
              <div className="flex justify-center">
                <input
                  name={key}
                  type="text"
                  value={filePublicId}
                  onChange={handleChange}
                  className="bg-linkIt-500 text-black w-full h-6"
                />
                <CloudinaryUploadWidget
                  setFileName={setFileName}
                  setFilePublicId={handleCloudinaryChange}
                  className="ml-2"
                >
                  <img
                    className="w-6"
                    src="/Vectores/upload-circle.svg"
                    alt="Upload image"
                  />
                </CloudinaryUploadWidget>
              </div>
            ) : (
              String(r[key] === undefined || NaN ? "" : r[key])
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSectionBasicCap = <K extends keyof ResourceProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-10 border-b-2 border-r-2  w-40 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow?.map((r: ResourceProps, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "capitalize pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-40 line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "capitalize pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-40 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
            }
          >
            <p>
              {selectedRows.has(r._id) && editing ? (
                <input
                  name={key}
                  type="text"
                  defaultValue={
                    r[key] === "social" ? "evento" : (r[key] as any)
                  }
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
  const renderSectionActive = <K extends keyof ResourceProps>(
    title: string,
    key: K
  ) => (
    <div>
      <div className="flex flex-row whitespace-nowrap px-10 border-b-2 border-r-2  w-36 border-linkIt-200">
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow?.map((r: ResourceProps, index) => (
          <div
            key={`${key}-${index}`}
            className={
              selectedRows.has(r._id)
                ? "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-36 line-clamp-1 bg-linkIt-300 justify-center items-center"
                : "pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 w-36 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center"
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
      <HeadResources
        hideCol={hideCol}
        viewCol={viewCol}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        editing={editing}
        editResource={editResource}
        handleSave={handleSave}
        setSaveStatus={setSaveStatus}
      />
      <div className="flex flex-row mx-6 overflow-y-scroll border-2 border-linkIt-200 rounded-lg">
        {viewCol.title && renderSectionSelect("Título", "title")}
        {viewCol._id && renderSectionBasicNoEdit("ID", "_id")}
        {viewCol.link && renderSectionBasic("Link", "link")}
        {viewCol.type && renderSectionBasicNoEditCap("Tipo", "type")}
        {viewCol.createdDate &&
          renderSectionBasicNoEdit("Fecha de Creación", "createdDate")}
        {viewCol.image && renderSectionImg("Imagen", "image")}
        {viewCol.category && renderSectionBasicCap("Categoría", "category")}
        {viewCol.archived && renderSectionActive("Estado", "archived")}
      </div>
      <div className="flex flex-row justify-around">
        <button
          className="cursor-pointer hover:text-linkIt-300"
          onClick={handlePrevius}
          disabled={currentPage === 0}
        >
          Anterior
        </button>
        <span className="text-center">
          Pagina {currentPage + 1} de {totalPages}
        </span>
        <button
          className="cursor-pointer hover:text-linkIt-300"
          onClick={handleNext}
          disabled={endIndex >= data.length}
        >
          Siguiente
        </button>
      </div>
      <ModalEditResources
        isOpen={modalOpen}
        onClose={handleCloseModal}
        resource={selectedResource}
        isEditing={isEditing}
      />
    </div>
  );
}
