import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUsersTalent, sortTalents } from "../../../../../redux/features/UsersSlice";
import axios from "axios";
import HeadUsers from "./HeadUsers";
import { TalentProps } from "../../../admin.types";
import PDFViewer from "./PDFViewer";
import { useTranslation } from "react-i18next";

type stateProps = {
  users: {
    filteredTalents: TalentProps[];
  };
};

export default function Users() {
  const token = useSelector((state: any) => state.Authentication.token);
  const dispatch = useDispatch()
  const data = useSelector((state: stateProps) => state.users.filteredTalents)
  const [saveStatus, setSaveStatus] = useState<boolean>(false);
  const { t } = useTranslation()

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const response = await axios(
          `${import.meta.env.VITE_ENDPOINT_URL}/users/find`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Accept-Language': sessionStorage.getItem('lang')
            }
          }
        );
        dispatch(setUsersTalent(response.data));
        dispatch(sortTalents('recent'))
      } catch (error) {
        throw new Error(t("Error al enviar la solicitud:")).message
      }
    };
    loadData();
  }, [saveStatus])

  //? COLUMNAS
  const [viewCol, setViewCol] = useState({
    rol: true,
    nombre: true,
    apellido: true,
    pais: true,
    correo: true,
    curriculum: true,
    linkedin: true,
    tecnologías: true,
    'Fecha de creación': true,
    postulaciones: true,
    'Nivel de inglés': true,
    imagen: true,
    estado: true,
  })
  const hideCol = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name } = e.target
    setViewCol((prevViewCol) => ({
      ...prevViewCol,
      [name]: !prevViewCol[name as keyof typeof prevViewCol],
    }))
  }
  //?

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



  //?EDITAR
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<TalentProps>>({});
  const handleEdit = (id: string): void => {
    const updateSelectedRows = new Set(selectedRows);
    if (updateSelectedRows.has(id)) {
      updateSelectedRows.delete(id)
    } else {
      updateSelectedRows.add(id)
    }
    setSelectedRows(updateSelectedRows)
    setEditing(false)
  }
  const editTalent = () => {
    setSaveStatus(false)
    setEditing(!editing)
  }
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
        const endPoint = `${import.meta.env.VITE_ENDPOINT_URL}/users/update/${id}`;
        await axios.put(endPoint, editedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': sessionStorage.getItem('lang')
          },
        });
      })
    } catch (error: any) {
      throw new Error(t("Error al enviar la solicitud:")).message
    }
    setEditing(false);
    setEditedData({});
    setSaveStatus(!saveStatus);
  };
  //?

  //? SECCIONES
  const renderSectionSelect = <K extends keyof TalentProps>(title: string, key: K,) => (
    <div>
      <div className='flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-fit border-linkIt-200'>
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: TalentProps, index) => (
          <div
            key={`${key}-${index}`}
            className={selectedRows.has(r._id) 
              ? 'capitalize flex flex-row  pl-3 h-8 pt-1 bg-linkIt-300 whitespace-nowrap' 
              : 'capitalize flex flex-row  pl-3 h-8 pt-1 border-b-2 border-r-2 border-linkIt-50 overflow-ellipsis overflow-hidden line-clamp-1'}
          >
            <input type="checkbox" name="edit" onChange={() => handleEdit(r._id)} checked={selectedRows.has(r._id)} />
            <p>{String(r[key] === undefined || NaN ? '' : r[key])}</p>

          </div>
        ))}
      </div>
    </div >
  )
  const renderSectionBasicNoEdit = <K extends keyof TalentProps>(title: string, key: K,) => (
    <div>
      <div className='flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-fit border-linkIt-200'>
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: TalentProps, index) => (
          <div
            key={`${key}-${index}`}
            className={selectedRows.has(r._id) 
              ? 'pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 line-clamp-1 bg-linkIt-300 justify-center items-center' 
              : 'pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center'}
          >
            <p>{String(r[key] === undefined || NaN ? '' : r[key])}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSectionBasicCV = <K extends keyof TalentProps>(title: string, key: K,) => (
    <div>
      <div className='flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-fit border-linkIt-200'>
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: TalentProps, index) => (
          <div
            key={`${key}-${index}`}
            className={selectedRows.has(r._id) 
              ? 'pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 line-clamp-1 bg-linkIt-300 justify-center items-center' 
              : 'pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center'}
          >
            {key === 'cv' && r[key] !== "" && Object.values(r[key]).some((value) => value !== "") ? (
              <PDFViewer cv={r[key] as any} />
            ) : (
              <p>{selectedRows.has(r._id) && editing ? (
                <input
                  name={key}
                  type="text"
                  defaultValue={r[key] as any}
                  onChange={handleChange}
                  className="bg-linkIt-500 text-black w-full h-6"
                />
              ) : String(r[key] === undefined || isNaN(r[key] as any) ? '' : r[key])}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
  const renderSectionBasicCap = <K extends keyof TalentProps>(title: string, key: K,) => (
    <div>
      <div className='flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-fit border-linkIt-200'>
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: TalentProps, index) => (
          <div
            key={`${key}-${index}`}
            className={selectedRows.has(r._id) 
              ? 'capitalize pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 line-clamp-1 bg-linkIt-300 justify-center items-center' 
              : 'capitalize pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center'}
          >
            <p>{selectedRows.has(r._id) && editing ?
              <input
                name={key}
                type="text"
                defaultValue={r[key] as any}
                onChange={handleChange}
                className="bg-linkIt-500 text-black w-full h-6"
              />
              : String(r[key] === undefined || NaN ? '' : r[key])}</p>
          </div>
        ))}
      </div>
    </div>
  )
  const renderSectionBasic = <K extends keyof TalentProps>(title: string, key: K,) => (
    <div>
      <div className='flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-full border-linkIt-200'>
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: TalentProps, index) => (
          <div
            key={`${key}-${index}`}
            className={selectedRows.has(r._id) 
              ? 'pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis w-80 h-8 line-clamp-1 bg-linkIt-300 justify-center items-center' 
              : 'pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis w-80 h-8 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center'}
          >
            <p>{selectedRows.has(r._id) && editing ?
              <input
                name={key}
                type="text"
                defaultValue={r[key] as any}
                onChange={handleChange}
                className="bg-linkIt-500 text-black w-full h-6"
              />
              : String(r[key] === undefined || NaN ? '' : r[key])}</p>
          </div>
        ))}
      </div>
    </div>
  )
  const renderSectionActive = <K extends keyof TalentProps>(title: string, key: K,) => (
    <div>
      <div className='flex flex-row whitespace-nowrap px-20 border-b-2 border-r-2  w-fit border-linkIt-200'>
        <h1>{title}</h1>
      </div>
      <div>
        {dataToShow.map((r: TalentProps, index) => (
          <div
            key={`${key}-${index}`}
            className={selectedRows.has(r._id) 
              ? 'pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 line-clamp-1 bg-linkIt-300 justify-center items-center' 
              : 'pl-3 pr-3 pt-1 overflow-hidden overflow-ellipsis h-8 line-clamp-1 border-b-2 border-r-2 border-linkIt-50 justify-center items-center'}
          >
            <p>{String(r[key] === true ? 'Activo' : 'Inactivo')}</p>
          </div>
        ))}
      </div>
    </div>
  )
  //?

  return (
    <div className=' bg-scroll bg-linkIt-500'>
      <HeadUsers
        hideCol={hideCol}
        viewCol={viewCol}
        editTalent={editTalent}
        handleSave={handleSave}
        selectedRows={selectedRows}
        editing={editing}
        setSaveStatus={setSaveStatus}
      />
      <div className='flex flex-row mx-6 overflow-y-scroll border-2 border-linkIt-200 rounded-lg'>
        {viewCol.rol && renderSectionSelect("Rol", "role")}
        {viewCol.nombre && renderSectionBasicCap("Nombre", "firstName")}
        {viewCol.apellido && renderSectionBasicCap("Apellido", "lastName")}
        {viewCol.pais && renderSectionBasicCap("País", "country")}
        {viewCol.correo && renderSectionBasic("Correo", "email")}
        {viewCol.curriculum && renderSectionBasicCV("Curriculum", "cv")}
        {viewCol.linkedin && renderSectionBasic("LinkedIn", "linkedin")}
        {viewCol.tecnologías && renderSectionBasicNoEdit("Tecnologías", "technologies")}
        {viewCol["Fecha de creación"] && renderSectionBasicNoEdit("Fecha de creación", "createdDate")}
        {viewCol.postulaciones && renderSectionBasicNoEdit("Postulaciones", "postulations")}
        {viewCol["Nivel de inglés"] && renderSectionBasicNoEdit("Nivel de inglés", "englishLevel")}
        {viewCol.imagen && renderSectionBasic("Imagen", "image")}
        {viewCol.estado && renderSectionActive("Estado", "active")}
      </div>
      <div className="flex flex-row justify-around">
        <button
          className="cursor-pointer hover:text-linkIt-300"
          onClick={handlePrevius}
          disabled={currentPage === 0}
        >
          {t("Anterior")}
        </button>
        <span className='text-center'>
          {t("Pagina")} {currentPage + 1} de {totalPages}
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
  )
}
