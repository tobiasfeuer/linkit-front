import { Dispatch, SetStateAction, useState } from "react";
import { ResourceProps, ViewResourceProps } from "../../../admin.types";
import FormResource from "./FormResource";
import { useDispatch, useSelector } from "react-redux";
import swal from "sweetalert";
import axios from "axios";
import { searchResource, setResources, sortResource } from "../../../../../redux/features/ResourcesSlice";
import { useTranslation } from "react-i18next";
import { stateProps } from "./Resources";
import { useNavigate } from "react-router-dom";

interface HeadResources {
    hideCol: (e: React.ChangeEvent<HTMLInputElement>) => void;
    viewCol: ViewResourceProps
    selectedRows: Set<string>;
    setSelectedRows: Dispatch<SetStateAction<Set<string>>>;
    editing: boolean
    editResource: () => void
    handleSave: (arrayProps: string[]) => void
    setSaveStatus: (status: boolean) => void;
}

export default function HeadResources({ hideCol, viewCol, selectedRows, setSelectedRows, editing, editResource, handleSave, setSaveStatus }: HeadResources) {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const token = useSelector((state: any) => state.Authentication.token);
    const arraySelectedRows = [...selectedRows]

    const resources = useSelector(
        (state: stateProps) => state.resources.filteredResources
    );
    const allResourcesArchived = arraySelectedRows.every((reviewId: string) => {
        const review = resources.find((r: ResourceProps) => r._id === reviewId);
        return review && review.archived;
    });

    //?OPTIONS COLUMNS
    const [options, setOptions] = useState(false)
    const hideOptions = () => {
        setOptions(!options)
    }
    //? 

    //?BUSCAR
    const handleSearch = (searchTerm: string): void => {
        dispatch(searchResource(searchTerm))
    }
    //?

    //?ORDENAR
    const handleSort = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target;
        dispatch(sortResource(value))
    }
    //?
    const navigate = useNavigate();
    //? FORM
    const [viewForm, setViewForm] = useState(false);
    const showForm = () => {
        // setSaveStatus(false)
        // setViewForm(true);
        navigate("/AdminDashboard/crear-recurso")
        
    };
    const noShowForm = () => {
        setViewForm(false);
    };
    //?

    const hideReview = async () => {
        swal({
            title: t("¿Deseas ocultar el Recurso?"),
            icon: "warning",
            buttons: ["Cancelar", "Aceptar"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    arraySelectedRows.forEach(async (id: string) => {
                        const response = await axios.delete(
                            `${import.meta.env.VITE_ENDPOINT_URL}/posts/delete/${id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Accept-Language': sessionStorage.getItem('lang')
                                },
                            }
                        );
                        dispatch(setResources(response.data));
                        swal(t("Recurso ocultado"), { icon: "success" });
                    })
                } catch (error) {
                    throw new Error(t("Error al enviar la solicitud:")).message
                }
            }
        });
        setSaveStatus(true)
    };

    const deleteReview = async () => {
        swal({
            title: t("¿Deseas eliminar el recurso?"),
            icon: "warning",
            buttons: [t("Cancelar"), t("Aceptar")],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    arraySelectedRows.forEach(async (id: string) => {
                        const response = await axios.delete(
                            `${import.meta.env.VITE_ENDPOINT_URL}/posts/delete/${id}?total=true`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Accept-Language': sessionStorage.getItem('lang')
                                },
                            }
                        );
                        dispatch(setResources(response.data));
                        setSelectedRows(new Set<string>())
                        swal("Recurso eliminado", { icon: "success" });
                    })
                } catch (error) {
                    throw new Error(t("Error al enviar la solicitud:")).message
                }
            }
        });
        setSaveStatus(true)
    };

    return (
        <div>
            <div>
                <h1 className="text-4xl pl-16 py-6">{t("Gestión de recursos")}</h1>
            </div>
            <div className=' flex flex-row justify-around pb-6'>
                <div>
                    <button
                        className="flex items-center border border-linkIt-300 rounded-[7px] p-2 shadow-md hover:border-linkIt-200 transition-all duration-300 ease-in-out mr-5"
                        onClick={showForm}
                    >
                        {t("Crear recurso")}
                    </button>
                   
                </div>
                <div className="flex flex-row">
                    <div>
                        <h1>{t("Ordenar: ")}</h1>
                    </div>
                    <div>
                        <select
                            onChange={handleSort}
                            className={`styles-head ml-2`}
                        >
                            <option value="recent">{t("Recientes")}</option>
                            <option value="old">{t("Antiguos")}</option>
                        </select>
                    </div>
                </div>

                <div className="relative">
                    <div className="flex flex-row">
                        <div>
                            <button
                                onClick={hideOptions}
                            >{t("Columnas")}</button>
                        </div>
                    </div>
                    {options && (
                        <div className="capitalize flex flex-col border-2 border-linkIt-300 rounded-lg mt-6 w-60 pl-2 absolute bg-linkIt-500">
                            {Object.entries(viewCol).map(([key, value]) => (
                                <label key={key}>
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
                <div>
                    <input
                        type="text"
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value)}
                        className={`styles-head`}
                    />
                </div>
                {viewForm && <FormResource
                    onClose={noShowForm}
                    setSaveStatus={setSaveStatus}
                />}
            </div>
            <div>
                <span className="flex flex-row pl-8">{t("Seleccionados: ")} {selectedRows.size}
                    {selectedRows.size > 0 &&
                        <div className="flex flex-row">
                            {editing ?
                                <div>
                                    <button
                                        onClick={() => handleSave(arraySelectedRows)}
                                        className="pl-6 hover:text-linkIt-300"
                                    >
                                        {t("Guardar")}
                                    </button>
                                    <button
                                        onClick={editResource}
                                        className="pl-6 hover:text-linkIt-300"
                                    >
                                        {t("Cancelar")}
                                    </button>
                                </div>
                                :
                                <div>
                                    <button
                                        onClick={editResource}
                                        className="pl-6 hover:text-linkIt-300"
                                    >
                                        {selectedRows.size && t('Editar')}
                                    </button>
                                </div>
                            }
                            <button
                                onClick={hideReview}
                                className={allResourcesArchived ? "pl-6 hover:text-linkIt-300" : "pl-6 hover:text-red-600"}
                            >
                                {allResourcesArchived ? t("Mostrar") : t("Ocultar")}
                            </button>
                            <button
                                onClick={deleteReview}
                                className="pl-6 hover:text-red-600"
                            >
                                {selectedRows.size && t('Eliminar')}
                            </button>
                        </div>
                    }
                </span>
            </div>
        </div>
    )
}
