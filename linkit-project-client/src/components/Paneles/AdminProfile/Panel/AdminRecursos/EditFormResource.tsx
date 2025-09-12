import React, { useEffect, useState, useRef } from "react";
import swal from "sweetalert";
import axios from "axios";
import { Header, ResourceProps } from "../../../admin.types";
import { validations } from "./Validation";
import { useSelector } from "react-redux";
import { IUser } from "../../../../Profiles/types";
import CloudinaryUploadWidget from "../../../../Services/cloudinaryWidget";
import JoditEditor from "jodit-react";
import { Textarea } from "flowbite-react";

export type stateProps = {
  Authentication: {
    user: IUser;
  };
  resources: {
    allresources: ResourceProps[];
  };
};

type OnCloseFunction = () => void;

interface FormResourceProps {
  onClose: OnCloseFunction;
  setSaveStatus: (status: boolean) => void;
  resource: ResourceProps | null;
  updateEditedProperties: (updatedProperties: Partial<ResourceProps>) => void;
}

export default function EditFormResource({
  onClose,
  setSaveStatus,
  resource,
  updateEditedProperties,
}: FormResourceProps) {
  const user = useSelector((state: stateProps) => state.Authentication.user);
  //const { t } = useTranslation();
  const [filePublicId, setFilePublicId] = useState("");
  const [filePublicIdSect] = useState("");
  const token = useSelector((state: any) => state.Authentication.token);

  const [originalImageUrl, setOriginalImageUrl] = useState("");

  const [information, setInformation] = useState<Partial<ResourceProps>>({
    title: "",
    description: "",
    link: "",
    type: "",
    image: filePublicId,
    category: "",
    headers: [],
    createdBy: user.firstName.concat(user.lastName),
  });

  const [infoList, setInfoList] = useState<Header>({
    head: "",
    body: "",
    sectionImage: filePublicIdSect,
  });

  useEffect(() => {
    if (resource) {
      setInformation((prevInformation) => ({
        ...prevInformation,
        image: resource.image || "",
      }));
      setOriginalImageUrl(resource.image || "");
    }
  }, [resource]);

  useEffect(() => {
    if (resource) {
      setInformation(resource);
    }
  }, [resource]);

  useEffect(() => {
    setInformation((prevInformation) => ({
      ...prevInformation,
      image: filePublicId,
    }));
  }, [filePublicId]);

  useEffect(() => {
    setInfoList((prevInformation) => ({
      ...prevInformation,
      sectionImage: filePublicIdSect,
    }));
  }, [filePublicIdSect]);

  const addToList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (infoList.head.trim() !== "" || infoList.body.trim() !== "") {
      setInformation((prevInformation: Partial<ResourceProps>) => ({
        ...prevInformation,
        headers: [...(prevInformation.headers || []), infoList],
      }));
      setInfoList({
        head: "",
        body: "",
        sectionImage: "",
      });
    }
  };

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    link: "",
    image: "",
    category: "",
    headers: [],
  });


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setInformation({
      ...information,
      [name]: value,
    });
    // Actualiza los errores de validación
    const validationError = validations({
      ...information,
      [name]: value,
    } as ResourceProps);
    setErrors(validationError);
    updateEditedProperties({
      ...information,
      [name]: value,
    });
  };

  // Manejador para cambios en las secciones adicionales (en caso de que el recurso sea un blog)
  const handleChangeInfoList = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => {
    let name = "";
    let value = "";

    if (typeof e === "string") {
      name = "body";
      value = e;
    } else {
      name = e.target.name;
      value = e.target.value;
    }

    const updatedInfoList = {
      ...infoList,
      [name]: value,
    };

    setInfoList(updatedInfoList);

    const updatedInformation = {
      ...information,
      headers: [...(information.headers || []), updatedInfoList], // Agrega la nueva sección al array de headers
    };

    updateEditedProperties(updatedInformation);
  };

  const handleChangeHeader = (index: number, field: string, value: string) => {
    setInformation((prevInformation) => {
      // Verificar si prevInformation y prevInformation.headers son definidos
      if (!prevInformation || !prevInformation.headers) {
        return prevInformation; // Retornar el estado previo si headers no está definido
      }

      // Crear una copia actualizada de las headers sin mutar el estado previo
      const updatedHeaders = prevInformation.headers.map((header, idx) => {
        if (idx === index) {
          return {
            ...header,
            [field]: value,
          };
        }
        return header;
      });

      // Retornar un nuevo objeto de estado con las headers actualizadas
      const updatedInformation = {
        ...prevInformation,
        headers: updatedHeaders,
      };

      // Actualizar el estado global con las headers actualizadas
      updateEditedProperties(updatedInformation);

      return updatedInformation;
    });
  };

  const setFileName = () => {
    information.title?.concat("image");
    
  };
  const [isUpdate, setIsUpdate] = useState(false);

  const setInformationImage = (newImage: string) => {
    const updatedInformation = {
      ...information,
      image: newImage,
    };
    updateEditedProperties(updatedInformation);
  };

  const updateLink = (newLink: string) => {
    setInformation((prevInformation) => ({
      ...prevInformation,
      link: newLink,
    }));
    setIsUpdate(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const endPoint = `${import.meta.env.VITE_ENDPOINT_URL}/posts/update/${information?._id}`;
      const importantInformation = {
        title: information.title,
        description: information.description,
        headers: information.headers,
        image: filePublicId || originalImageUrl,
        link: information.link,
        type: information.type,
        category: information.category,
      };
      const response = await axios.put(endPoint, importantInformation, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": sessionStorage.getItem("lang"),
        },
      });
      if (response.status === 200) {
        setSaveStatus(true);
        swal(
          "¡Guardado!",
          "Los cambios se han guardado exitosamente",
          "success"
        );
      } else {
        swal("¡Error!", "Hubo un problema al guardar los cambios", "error");
        
      }
    } catch (error: any) {
      if (error.response) {
        console.error(error.response.data);
      } else {
        console.error("Error al enviar la solicitud: ", error.message);
      }
    }
  };


  //Rich Text Area WYSIWYG Jodit
  const editor = useRef(null);


  return (
    <div className=" p-26 top-0 left-0 w-full z-50 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center"
        action=""
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Título
          </label>
          <input
            className={
              errors.description
                ? '"appearance-none block  xl:w-[750px] md:w-[550px] bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                : '"appearance-none block xl:w-[750px] md:w-[550px] bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
            }
            type="text"
            name="title"
            value={information.title || ""}
            onChange={handleChange}
          />
          <span className="text-red-500 text-sm">{errors.title}</span>
        </div>
        <div>
          <label>Descripción</label>
          <textarea
            className={
              errors.description
                ? '"appearance-none block xl:w-[750px] md:w-[550px] bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                : '"appearance-none block xl:w-[750px] md:w-[550px] bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
            }
            name="description"
            value={information.description || ""}
            onChange={handleChange}
          ></textarea>
          <span>{errors.description}</span>
        </div>
        {information.type === "social" ? (
          <div>
            <label>Enlace</label>
            <input
              className={
                errors.description
                  ? '"appearance-none block xl:w-[750px] md:w-[550px] bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                  : '"appearance-none block xl:w-[750px] md:w-[550px] bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
              }
              type="text"
              name="link"
              value={information.link || ""}
              onChange={handleChange}
            />
            <span>{errors.link}</span>
          </div>
        ) : null}
        {information.type === "ebook" ? (
          <div className="">
            <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
              REEMPLAZAR PDF
            </label>
            <div
              className={
                "flex items-center appearance-none w-full h-[50px] border rounded py-3 px-4 mb-3 focus:outline-none "
              }
            >
              <input
                className="w-full h-full border-none"
                type="text"
                name="link"
                placeholder={isUpdate ? "Pdf cargado" : information.link}
                autoComplete="off"
                onChange={handleChange}
                disabled
              />
              <CloudinaryUploadWidget
                setFileName={setFileName}
                setFilePublicId={setFilePublicId}
                updateLink={updateLink}
                className="ml-2"
              >
                <img
                  className="w-10"
                  src="/Vectores/upload-circle.svg"
                  alt="Upload image"
                />
              </CloudinaryUploadWidget>
            </div>
          </div>
        ) : null}

        <div>
          <label>Tipo</label>
          <select
            className={
              errors.description
                ? '"appearance-none block xl:w-[750px] md:w-[550px] bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                : '"appearance-none block xl:w-[750px] md:w-[550px] bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
            }
            name="type"
            onChange={handleChange}
          >
            <option value="">Selecciona</option>
            <option value="blog">Blog</option>
            <option value="ebook">Ebook</option>
            <option value="social">Evento</option>
          </select>
        </div>
        <div>
          <label>Imagen</label>
          <CloudinaryUploadWidget
            setInformationImage={setInformationImage}
            setFileName={setFileName}
            setFilePublicId={setFilePublicId}
            updateLink={updateLink}
          >
            <img
              className="w-10"
              src="/Vectores/upload-circle.svg"
              alt="Upload image"
            />
          </CloudinaryUploadWidget>

          <span>{errors.image}</span>
        </div>
        <div>
          <label>Categoría</label>
          <input
            className={
              errors.description
                ? '"appearance-none block xl:w-[750px] md:w-[550px] bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                : '"appearance-none block xl:w-[750px] md:w-[550px] bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
            }
            type="text"
            name="category"
            value={information.category || ""}
            onChange={handleChange}
          />
          <span>{errors.category}</span>
        </div>
        {information.type === "blog" && (
          <div className="">
            <label className="md:ml-2">Encabezado</label>
            <input
              className={
                errors.description
                  ? '"appearance-none block xl:w-[750px] md:w-[550px] md:ml-3 bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                  : '"appearance-none block xl:w-[750px] md:w-[550px] md:ml-3 bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
              }
              type="text"
              name="head"
              value={infoList.head || ""}
              onChange={handleChangeInfoList}
            />
            <label className="md:ml-2">Imagen de sección</label>
            <CloudinaryUploadWidget
              setFileName={setFileName}
              setFilePublicId={setFilePublicId}
              updateLink={updateLink}
            >
              {/* Aquí pasa la imagen como hijo */}
              <img
                className="w-10 md:ml-2"
                src="/Vectores/upload-circle.svg"
                alt="Upload image"
              />
            </CloudinaryUploadWidget>

            <label className="md:ml-2">Cuerpo</label>
            <JoditEditor
              ref={editor}
              value={infoList.body}
              onBlur={handleChangeInfoList}
            />
            <button
              onClick={addToList}
              className="px-2 py-2 my-2 mx-2 bg-linkIt-50 rounded-xl md:ml-4"
            >
              Agregar otra sección
            </button>
            {/* darle funcion de onChange y guardar los cambios */}

            <ul>
              <h2 className="mt-0 md:ml-2">Contenido del BLOG</h2>
              {information.headers?.map((header, index) => (
                <li key={index}>
                  {header.head ? (
                    <div className="mt-0 md:ml-2">
                      <p className="mt-0 md:ml-2">Encabezado</p>
                      <Textarea
                        value={header.head}
                        onChange={(e) =>
                          handleChangeHeader(index, "head", e.target.value)
                        }
                      />
                    </div>
                  ) : null}
                 <p className="text-xs -mb-2 md:ml-4">Contenido (no modificar texto entre "&lt;&gt;" "&lt;/&gt;" para mantener estilos)</p>

                  <Textarea
                    value={(header.body)}
                    className="py-2 px-2 mx-2 my-2"
                    onChange={(e) =>
                      handleChangeHeader(index, "body", e.target.value)
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="my-2">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 mx-4 my-4 rounded focus:outline-none focus:shadow-outline"
          >
            Volver
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-4 my-4 rounded focus:outline-none focus:shadow-outline"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
