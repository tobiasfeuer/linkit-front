import { t } from "i18next";
import Swal from "sweetalert2";
import swal from "sweetalert";
import axios from "axios";
import { setJobOffers } from "../../../../../redux/features/JobCardsSlice";
import { useDispatch, useSelector } from "react-redux";

interface ExistingVacanciesOptionsProps {
  setSaveStatus: (status: boolean) => void;
  // editJDS: () => void;
  // editing: boolean;
  // handleSave: (arrayProps: string[]) => void;
  id: string;
  setViewForm: (status: boolean) => void;
  setEditing: (status: { isEditing: boolean; vacancieID?: string }) => void;
  isVisible: boolean;
}

export default function ExistingVacanciesOptions({
  setSaveStatus,
  // editJDS,
  // editing,
  // handleSave,
  id,
  setViewForm,
  setEditing,
  isVisible
}: ExistingVacanciesOptionsProps) {
  const dispatch = useDispatch();

  const token = useSelector((state: any) => state.Authentication.token);

  const showForm = () => {
    Swal.fire({
      title: t("¡Recordatorio importante!"),
      text: t(
        "Recuerda que el código de vacante y nombre de la empresa deben coincidir con la tabla Client Follow Up para la correcta visualización por parte de empresas y/o Talento"
      ),
      icon: "info",
      background: "#ECEEF0",
      allowOutsideClick: true,
      confirmButtonColor: "#01A28B",
      confirmButtonText: t("Continuar"),
    }).then((result) => {
      if (result.isConfirmed) {
        setSaveStatus(false);
        setViewForm(true);
      }
    });
  };
  const updateVacancie = (e: React.MouseEvent) => {
    e.preventDefault()
    setEditing({
      isEditing: true,
      vacancieID: id,
    });
    showForm();
  };

  const hideVacancie = async (e: React.MouseEvent) => {
    e.preventDefault()
    swal({
      title: t("¿Deseas cambiar la vista de la vacante?"),
      icon: "warning",
      buttons: [t("Cancelar"), t("Aceptar")],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const response = await axios.delete(
            `${import.meta.env.VITE_ENDPOINT_URL}/jds/delete/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Accept-Language": sessionStorage.getItem("lang"),
              },
            }
          );
          dispatch(setJobOffers(response.data.reverse()));
          swal(t("Cambio de vista exitoso"), { icon: "success" });
        } catch (error) {
          console.error(
            t("Error al enviar la solicitud:"),
            (error as Error).message
          );
        }
      }
    });
    setSaveStatus(true);
  };

  const deleteVacancie = async (e: React.MouseEvent) => {
    e.preventDefault()
    swal({
      title: t("¿Deseas eliminar la vacante?"),
      icon: "warning",
      buttons: [t("Cancelar"), t("Aceptar")],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const response = await axios.delete(
            `${import.meta.env.VITE_ENDPOINT_URL}/jds/delete/${id}?total=true`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Accept-Language": sessionStorage.getItem("lang"),
              },
            }
          );
          dispatch(setJobOffers(response.data.reverse()));
          swal(t("Vacante eliminada"), { icon: "success" });
        } catch (error) {
          console.error(
            t("Error al enviar la solicitud:"),
            (error as Error).message
          );
        }
      }
    });
    setSaveStatus(true);
  };

  return (
    <div>
      <div
        key={id}
        className="flex flex-row border-b-2 border-linkIt-50 text-xs font-bold"
      >
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white mb-2 mr-2 py-1 px-2 rounded-md"
          onClick={updateVacancie}
        >
          {t("Editar")}
        </button>
        <button
          className={`bg-${isVisible ? 'gray' : 'green'}-500 hover:bg-${isVisible ? 'gray' : 'green'}-700 text-white mb-2 mr-2 py-1 px-2 rounded-md`}
          onClick={hideVacancie}
        >
          {isVisible ? t("Mostrar") : t("Ocultar")}
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white mb-2 mr-2 py-1 px-2 rounded-md"
          onClick={deleteVacancie}
        >
          {t("Eliminar")}
        </button>
      </div>
    </div>
  );


}
