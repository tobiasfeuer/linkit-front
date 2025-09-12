import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import swal from "sweetalert";
import { Header, ResourceProps } from "../../../admin.types";
import { useTranslation } from "react-i18next";
import { validations } from "./Validation";
import { useSelector } from "react-redux";
import { IUser } from "../../../../Profiles/types";
import CloudinaryUploadWidget from "../../../../Services/cloudinaryWidget";
import JoditEditor from "jodit-react";
import HTMLReactParser from "html-react-parser";
import Swal from "sweetalert2";


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
}

export default function FormResource({
  onClose,
  setSaveStatus,
}: FormResourceProps) {
  const token = useSelector(
    (state: stateProps) => state.Authentication.user._id
  );
  const user = useSelector((state: stateProps) => state.Authentication.user);
  const { t } = useTranslation();
  const [filePublicId, setFilePublicId] = useState("");
  const [filePublicIdSect, setFilePublicIdSect] = useState("");

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
    if (infoList.head.trim() !== " " || infoList.body.trim() !== " ") {
      setInformation(
        (prevInformation: Partial<ResourceProps>): Partial<ResourceProps> => ({
          ...prevInformation,
          headers: [...(prevInformation.headers || []), infoList],
        })
      );
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

    setInfoList((previusInfoList) => ({
      ...previusInfoList,
      [name]: value,
    }));
  };

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
    const validationError = validations(information as ResourceProps);
    setErrors(validationError);
  };

  const handleBlurErrors = () => {
    const validationError = validations(information as ResourceProps);
    setErrors(validationError);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validations(information as ResourceProps);
    setErrors(validationError);

    try {
      const endPoint = `${import.meta.env.VITE_ENDPOINT_URL}/posts/create`;
      const response = await axios.post(endPoint, information, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": sessionStorage.getItem("lang"),
        },
      });

      swal(t("El post fue creado con éxito"));
      setInformation({
        title: "",
        description: "",
        link: "",
        type: "",
        image: "",
        category: "",
      });
      onClose();
      setSaveStatus(true);
      return response.data;
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.response.data,
        icon: "error",
        background: "#ECEEF0",
        confirmButtonColor: "#01A28B",
        confirmButtonText: t("Continuar"),
      });
      throw new Error(t("Error al enviar la solicitud:")).message;
    }
  };

  const setFileName = () => {
    information.title?.concat("image");
  };
  const setFileNameSect = () => {
    infoList.sectionImage?.concat("image");
  };

  const [isUpdate, setIsUpdate] = useState(false);
  const updateLink = (newLink: string) => {
    setInformation((prevInformation) => ({
      ...prevInformation,
      link: newLink,
    }));
    setIsUpdate(true);
  };

  //Rich Text Area WYSIWYG Jodit
  const editor = useRef(null);

  return (
    <div className="fixed flex justify-center p-24 top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className=" flex flex-col justify-center items-center bg-linkIt-500 w-fit h-fit rounded-[7px] border-[3px] border-linkIt-300  p-8">
        <div className="flex w-full justify-end ">
          <button className={`background-button m-2`} onClick={onClose}>
            X
          </button>
        </div>
        <div>
          <h1 className="text-3xl mb-6">
            {t(
              `Nuevo recurso ${
                information.type === "social" ? "evento" : information.type
              }`
            )}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center"
          action=""
        >
          <div className="flex flex-col">
            <div className="w-fit">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Tipo")}
              </label>
              <div>
                <select
                  name="type"
                  className="appearance-none block w-fit bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"
                  onChange={handleChange}
                >
                  <option value="">{t("Selecciona")}</option>
                  <option value="blog">Blog</option>
                  <option value="ebook">Ebook</option>
                  <option value="social">Event</option>
                </select>
              </div>
            </div>
            {information.type === "social" || information.type === "ebook" ? (
              <div className="flex flex-row flex-wrap w-[110vh]">
                <div className="w-fit mb-6">
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                    {t("Título")}
                  </label>
                  <input
                    className={
                      errors.title
                        ? '"appearance-none block w-fit bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                        : '"appearance-none block w-fit bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                    }
                    type="text"
                    name="title"
                    placeholder={errors.title ? "*" : ""}
                    autoComplete="off"
                    onChange={handleChange}
                    onBlur={handleBlurErrors}
                  />
                </div>
                {information.type === `social` ? (
                  <div className="w-fit px-3 mb-6">
                    <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                      Link
                    </label>
                    <input
                      className={
                        errors.link
                          ? '"appearance-none block w-fit bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                          : '"appearance-none block w-fit bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                      }
                      type="text"
                      name="link"
                      placeholder={errors.link ? "*" : ""}
                      autoComplete="off"
                      onChange={handleChange}
                      onBlur={handleBlurErrors}
                    />
                  </div>
                ) : (
                  <div className="w-fit px-3 mb-6">
                    <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                      Cargar PDF
                    </label>
                    <div
                      className={
                        "flex items-center appearance-none w-60 h-[50px] border rounded py-3 px-4 mb-3 focus:outline-none " +
                        (isUpdate ? "border-linkIt-300" : "border-red-500")
                      }
                    >
                      <input
                        className="w-full h-full border-none"
                        type="text"
                        name="link"
                        placeholder={isUpdate ? "Pdf cargado" : "*"}
                        autoComplete="off"
                        onChange={handleChange}
                        onBlur={handleBlurErrors}
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
                )}

                <div className="w-fit px-3 mb-6">
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                    {t("Imagen")}
                  </label>
                  <div
                    className={
                      "flex items-center appearance-none w-60 h-[50px] border rounded py-3 px-4 mb-3 focus:outline-none " +
                      (errors.image ? "border-red-500" : "border-linkIt-300")
                    }
                  >
                    <input
                      className="w-full h-full border-none"
                      type="text"
                      name="image"
                      placeholder={
                        filePublicId.length > 0
                          ? "Imagen cargada"
                          : "Cargar imagen"
                      }
                      autoComplete="off"
                      onChange={handleChange}
                      disabled
                    />

                    <CloudinaryUploadWidget
                      setFileName={setFileName}
                      setFilePublicId={setFilePublicId}
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

                <div className="w-fit px-3 mb-6">
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                    {t("Categoría")}
                  </label>
                  <input
                    className={
                      errors.category
                        ? '"appearance-none block w-fit bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                        : '"appearance-none block w-fit bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                    }
                    type="text"
                    name="category"
                    placeholder={errors.category ? "*" : ""}
                    autoComplete="off"
                    onChange={handleChange}
                    onBlur={handleBlurErrors}
                  />
                </div>

                <div className="w-full mb-6">
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                    {t("Descripción")}
                  </label>
                  <textarea
                    className={
                      errors.description
                        ? '"appearance-none block w-full bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                        : '"appearance-none block w-full bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                    }
                    name="description"
                    autoComplete="off"
                    placeholder={errors.description ? "*" : ""}
                    onChange={handleChange}
                    onBlur={handleBlurErrors}
                  ></textarea>
                  <span className="text-xs text-red-600">
                    {errors.description}
                  </span>
                </div>
                <div className="flex border-2 w-full justify-center">
                  {errors.title ||
                  errors.description ||
                  errors.link ||
                  errors.image ||
                  errors.category ? (
                    <span className="text-red-500">
                      {t("Los campos marcados con * son obligatorios")}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : information.type === "blog" ? (
              <div className="flex flex-row flex-wrap w-[110vh]">
                <div className="w-fit mb-6">
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                    {t("Título")}
                  </label>
                  <input
                    className={
                      errors.title
                        ? '"appearance-none block w-fit bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                        : '"appearance-none block w-fit bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                    }
                    type="text"
                    name="title"
                    placeholder={errors.title ? "*" : ""}
                    autoComplete="off"
                    onChange={handleChange}
                    onBlur={handleBlurErrors}
                  />
                </div>

                <div className="w-fit px-3 mb-6">
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                    {t("Imagen")}
                  </label>
                  <div>
                    <CloudinaryUploadWidget
                      setFileName={setFileName}
                      setFilePublicId={setFilePublicId}
                      className="ml-2"
                    >
                      <img
                        className="w-10"
                        src="/Vectores/upload-circle.svg"
                        alt=""
                      />
                    </CloudinaryUploadWidget>
                  </div>
                </div>

                <div className="w-fit px-3 mb-6">
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                    {t("Categoría")}
                  </label>
                  <input
                    className={
                      errors.category
                        ? '"appearance-none block w-fit bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                        : '"appearance-none block w-fit bg-linkIt-500 text-black border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                    }
                    type="text"
                    name="category"
                    placeholder={errors.category ? "*" : ""}
                    autoComplete="off"
                    onChange={handleChange}
                    onBlur={handleBlurErrors}
                  />
                </div>

                <div className="w-full mb-6">
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                    {t("Descripción")}
                  </label>
                  <textarea
                    className={
                      errors.description
                        ? '"appearance-none block w-full bg-linkIt-500 text-black border border-red-500 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white text-red-500"'
                        : '"appearance-none block w-full bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"'
                    }
                    name="description"
                    autoComplete="off"
                    placeholder={errors.description ? "*" : ""}
                    onChange={handleChange}
                    onBlur={handleBlurErrors}
                  ></textarea>
                  <span className="text-xs text-red-600">
                    {errors.description}
                  </span>
                </div>

                <span className="flex w-full justify-center text-xl text-linkIt-300">
                  {t("Secciones")}
                </span>

                <div className="w-full mb-6">
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                    {t("Encabezado")}
                  </label>
                  <input
                    className="appearance-none block w-full bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"
                    type="text"
                    name="head"
                    placeholder={
                      "Agrega un encabezado para el blog, puedes agregar varios"
                    }
                    autoComplete="off"
                    onChange={handleChangeInfoList}
                    value={infoList.head}
                  />
                </div>

                <div className="w-full mb-6">
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                    {t("Imagen")}
                  </label>
                  <CloudinaryUploadWidget
                    setFileName={setFileNameSect}
                    setFilePublicId={setFilePublicIdSect}
                    className="ml-2"
                  >
                    <img
                      className="w-10"
                      src="/Vectores/upload-circle.svg"
                      alt=""
                    />
                  </CloudinaryUploadWidget>
                </div>

                <div className="w-full mb-6">
                  <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                    {t("Cuerpo")}
                  </label>

                  <JoditEditor
                    ref={editor}
                    value={infoList.body}
                    //config={config} // tabIndex of textarea
                    onBlur={handleChangeInfoList} // preferred to use only this option to update the content for performance reasons
                  />
                  {/* <textarea
                    className="appearance-none block w-full bg-linkIt-500 text-blackk border border-linkIt-300 rounded py-3 px-4 mb-3 focus:outline-none focus:bg-white"
                    name="body"
                    autoComplete="off"
                    placeholder={"Agrega la descripcion del encabezado"}
                    onChange={handleChangeInfoList}
                    value={infoList.body}
                  ></textarea> */}
                  <div className="flex w-full justify-center">
                    <button className="background-button" onClick={addToList}>
                      {t("Agregar otra sección")}
                    </button>
                  </div>
                  <div>
                    <h3 className="ml-6 text-md font-bold text-linkIt-200"></h3>
                    {information.headers?.map((header, index) => (
                      <div key={index} className="ml-10">
                        <ul className="list-disc">
                          <li>{header.head}</li>
                          <div>{HTMLReactParser(header.body)}</div>
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex border-2 w-full justify-center">
                  {errors.title || errors.image || errors.category ? (
                    <span className="text-red-500">
                      {t("Los campos marcados con * son obligatorios")}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : (
              <span>{t("Selecciona el tipo de recurso")}</span>
            )}
          </div>

          <div className="flex m-4">
            <button
              onClick={onClose}
              className={`transparent-background-button mr-2`}
            >
              {t("Volver")}
            </button>
            {information.type && (
              <button type="submit" className={`background-button ml-2`}>
                {t("Publicar")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
