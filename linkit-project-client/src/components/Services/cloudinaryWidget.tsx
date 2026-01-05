import { createContext, useEffect, useState } from "react";
import { Curriculum } from "../Profiles/types";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface IComponentProps {
  children: React.ReactNode;
  setFilePublicId?: (value: string) => void;
  setFileName: (value: string) => void;
  updateLink?: (value: string) => void;
  setCv?: (value: Curriculum) => void;
  onUploadSuccess?: (value: string) => void;
  setReload?: (value: boolean) => void;
  className?: string;
  setInformationImage?: any;
  isAPostulation?: true | undefined | null;
}

const CloudinaryScriptContext = createContext({});

function CloudinaryUploadWidget({
  children,
  setFilePublicId,
  setCv,
  updateLink,
  setFileName,
  className,
  setReload,
  setInformationImage,
  isAPostulation,
}: IComponentProps) {
  const [loaded, setLoaded] = useState(false);
  const { t } = useTranslation();

  const [uwConfig] = useState({
    cloudName: "dquhriqz3",
    uploadPreset: "new-preset",
    sources: ["local", "camera"],
    multiple: false,
    maxFiles: 1,
    cropping: false,
    resourceType: "auto",
  });

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const openCloudinaryWidget = () => {
    if (loaded) {
      const myWidget = window.cloudinary.createUploadWidget(
        uwConfig,
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            if (updateLink) updateLink(result.info.secure_url);
            setCv &&
              setCv({
                fileName: `${result.info.original_filename}.${result.info.format}`,
                cloudinaryId: result.info.public_id,
              });
            setFilePublicId && setFilePublicId(result.info.public_id);
            isAPostulation !== true &&
              setInformationImage &&
              setInformationImage(result.info.public_id);
            setFileName(
              `${result.info.original_filename}.${result.info.format}`
            );
            setReload && setReload(true);
            myWidget.close();
          } else if (result.event === "close") {
            // Opcional: feedback visual
          }
        }
      );
      myWidget.open();
    }
  };

  useEffect(() => {
    if (!loaded) {
      const uwScript = document.getElementById("uw");
      if (!uwScript) {
        const script = document.createElement("script");
        script.setAttribute("async", "");
        script.setAttribute("id", "uw");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.addEventListener("load", () => setLoaded(true));
        document.body.appendChild(script);
      } else {
        setLoaded(true);
      }
    }
  }, [loaded]);

  // Handler para input nativo en mobile
  const handleMobileFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      Swal.fire({
        icon: "error",
        title: t("Tipo de archivo no válido"),
        text: t("Por favor sube un archivo PDF, imagen (JPG, PNG) o documento Word (DOC, DOCX)."),
        confirmButtonColor: "#01A28B",
      });
      return;
    }

    // Validación de tamaño (10 MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10 MB en bytes
    if (file.size > maxSize) {
      Swal.fire({
        icon: "error",
        title: t("Archivo demasiado grande"),
        text: t("El archivo no puede ser mayor a 10 MB. Por favor comprime el archivo o sube uno más pequeño."),
        confirmButtonColor: "#01A28B",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "new-preset");
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dquhriqz3/auto/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      setFilePublicId && setFilePublicId(data.public_id);
      setFileName && setFileName(data.original_filename + "." + data.format);
      setReload && setReload(true);
      setCv &&
        setCv({
          fileName: data.original_filename + "." + data.format,
          cloudinaryId: data.public_id,
        });
      Swal.fire({
        icon: "success",
        title: t("Enviado"),
        timer: 1000,
        showConfirmButton: false,
        showLoaderOnConfirm: true,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: t("Error al subir archivo"),
        text: t("Intenta nuevamente o usa otro archivo."),
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <CloudinaryScriptContext.Provider value={{ loaded }}>
      <script
        src="https://media-editor.cloudinary.com/all.js"
        type="text/javascript"
      ></script>
     {isMobile || isAPostulation ? (
  <label className={className} style={{ width: "100%", cursor: "pointer" }}>
    <input
      type="file"
      accept="application/pdf,image/*"
      style={{ display: "none" }}
      onChange={handleMobileFile}
    />
    <span>{children}</span>
  </label>
) : (
  <div
    className={className}
    onClick={openCloudinaryWidget}
    id="upload_widget"
    style={{ cursor: "pointer" }}
  >
    {children}
  </div>
)}
    </CloudinaryScriptContext.Provider>
  );
}

export default CloudinaryUploadWidget;
export { CloudinaryScriptContext };