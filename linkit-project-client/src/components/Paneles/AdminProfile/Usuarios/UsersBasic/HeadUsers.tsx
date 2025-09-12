import { useState } from "react"
import { ViewColHeadTalent } from "../../../admin.types";
import { useDispatch, useSelector } from "react-redux";
import { searchTalents, setUsersTalent, sortTalents } from "../../../../../redux/features/UsersSlice";
import swal from "sweetalert";
import axios from "axios";
import { useTranslation } from "react-i18next";

interface HeadUsers {
    hideCol: (e: React.ChangeEvent<HTMLInputElement>) => void;
    viewCol: ViewColHeadTalent
    editTalent: () => void
    handleSave: (arrayProps: string[]) => void
    selectedRows: Set<string>;
    editing: boolean
    setSaveStatus: (status: boolean) => void;
}

export default function HeadUsers({ hideCol, viewCol, editTalent, handleSave, selectedRows, editing, setSaveStatus }: HeadUsers) {
    const arraySelectedRows = [...selectedRows]
    const token = useSelector((state: any) => state.Authentication.token);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    //? OPTIONS COLUMNS
    const [options, setOptions] = useState(false)
    const hideOptions = () => {
        setOptions(!options)
    }
    //?

    //?BUSCAR
    const handleSearch = (searchTerm: string): void => {
        dispatch(searchTalents(searchTerm))
    }
    //?

    //?ORDENAR
    const handleSort = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target;
        dispatch(sortTalents(value))
    }
    //?

    const deleteUser = async () => {
        swal({
            title: "¿Deseas eliminar el Usuario?",
            icon: "warning",
            buttons: ["Cancelar", "Aceptar"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    arraySelectedRows.forEach(async (id: string) => {
                        const response = await axios.delete(
                            `${import.meta.env.VITE_ENDPOINT_URL}/users/delete/${id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Accept-Language': sessionStorage.getItem('lang')
                                },
                            }
                        );
                        dispatch(setUsersTalent(response.data));
                        swal("Usuario eliminado", { icon: "success" });
                    })
                } catch (error) {
                    throw new Error(t("Error al enviar la solicitud:" )).message;
                }
            }
        });
        setSaveStatus(true)
    };


    return (
        <div>

            <div>
                <h1 className="text-4xl pl-16 py-6">Talentos</h1>
            </div>
            <div className=' flex flex-row justify-around pb-6'>
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
                                        onClick={editTalent}
                                        className="pl-6 hover:text-linkIt-300"
                                    >
                                        {t("Cancelar")}
                                    </button>
                                </div>
                                :
                                <div>
                                    <button
                                        onClick={editTalent}
                                        className="pl-6 hover:text-linkIt-300"
                                    >
                                        {selectedRows.size && t('Editar')}
                                    </button>
                                </div>
                            }
                            <button
                                onClick={deleteUser}
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
