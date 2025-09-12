import { useState } from "react";
import axios from "axios";
import type { ResourceProps, Header } from "../../../../admin.types";
import JoditEditor from "jodit-react";
import { validateResource } from "./Validations";
import { ResourcePreview } from "./ResourcePreview";
import CloudinaryWidget from "./CloudinaryWidget";
import { useSelector } from "react-redux";
import { stateProps } from "../FormResource";
import Swal from "sweetalert2"


interface ResourceFormProps {
  initialResource: Partial<ResourceProps>;
  onResourceChange: (resource: Partial<ResourceProps>) => void;
}

export function ResourceForm({
  initialResource,
  onResourceChange,
}: ResourceFormProps) {
  const [resource, setResource] =
    useState<Partial<ResourceProps>>(initialResource);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const token = useSelector(
    (state: stateProps) => state.Authentication.user._id
  );

  // Estado para la sección actual que se está editando
  const [currentSection, setCurrentSection] = useState<Header>({
    head: "",
    body: "",
    sectionImage: "",
  });

  // Estado para nombres de archivos (para mostrar al usuario)
  const [mainImageName, setMainImageName] = useState("");
  const [sectionImageName, setSectionImageName] = useState("");
  const [pdfName, setPdfName] = useState("");




  // Función para actualizar el recurso y propagar los cambios
  const updateResource = (updates: Partial<ResourceProps>) => {
    const updatedResource = { ...resource, ...updates };
    setResource(updatedResource);
    onResourceChange(updatedResource);


    // Validar después de cada cambio
    const validationErrors = validateResource(updatedResource as ResourceProps);
    setErrors(validationErrors);
  };

  // Manejador para cambios en los campos principales
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    updateResource({ [name]: value });
  };

  // Manejador para cambios en la sección actual
  const handleSectionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentSection({ ...currentSection, [name]: value });
  };

  // Manejador para cambios en el editor de texto enriquecido
  const handleRichTextChange = (value: string) => {
    setCurrentSection({ ...currentSection, body: value });
  };

  // Función para agregar una nueva sección
  const addSection = () => {
    if (
      currentSection.head.trim() !== "" ||
      currentSection.body.trim() !== ""
    ) {
      const updatedHeaders = [
        ...(resource.headers || []),
        { ...currentSection },
      ];
      updateResource({ headers: updatedHeaders });

      // Limpiar la sección actual
      setCurrentSection({
        head: "",
        body: "",
        sectionImage: "",
      });
      setSectionImageName("");
    }
  };

  // Función para eliminar una sección
  const removeSection = (index: number) => {
    const updatedHeaders = [...(resource.headers || [])];
    updatedHeaders.splice(index, 1);
    updateResource({ headers: updatedHeaders });
  };
const devLog = (..._args: any[]) => {};
  // Función para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    devLog(pdfName, mainImageName, sectionImageName)
    // Validación final antes de enviar
    const validationErrors = validateResource(resource as ResourceProps)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Por favor, corrige los errores en el formulario",
        confirmButtonColor: "#3085d6",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error de autenticación",
          text: "No se pudo obtener el token de autenticación",
          confirmButtonColor: "#3085d6",
        })
        return null
      }

      const response = await axios.post(`${import.meta.env.VITE_ENDPOINT_URL}/posts/create`, resource, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": sessionStorage.getItem("lang") || "es",
        },
      })

      // Verificar el status de la respuesta
      if (response.status === 201 || response.status === 200) {
        // Extraer información útil de la respuesta
        const createdResource = response.data
        Swal.fire({
          icon: "success",
          title: "¡Recurso creado exitosamente!",
          text: createdResource._id ? `ID del recurso: ${createdResource._id}` : "",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Ver todos los recursos",
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirigir a la lista de recursos
            window.location.href = "/AdminDashboard/resources"
          } else {
            // Por defecto, redirigir a la lista de recursos
            window.location.href = "/AdminDashboard/resources"
          }
        })
      } else {
        // Si el status no es el esperado pero no lanzó excepción
        Swal.fire({
          icon: "warning",
          title: "Respuesta inesperada",
          text: `Respuesta inesperada del servidor (Status: ${response.status})`,
          confirmButtonColor: "#3085d6",
        })
      }
    } catch (error: any) {
      console.error("Error al crear el recurso:", error)

      // Manejo detallado de errores
      if (error.response) {
        // La solicitud fue realizada y el servidor respondió con un código de estado
        // que no está en el rango 2xx
        const statusCode = error.response.status
        const errorData = error.response.data

        let errorMessage = "Error al crear el recurso"

        if (typeof errorData === "string") {
          errorMessage = errorData
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }

        Swal.fire({
          icon: "error",
          title: `Error (${statusCode})`,
          text: errorMessage,
          confirmButtonColor: "#3085d6",
        })
      } else if (error.request) {
        // La solicitud fue realizada pero no se recibió respuesta
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se recibió respuesta del servidor. Verifica tu conexión a internet.",
          confirmButtonColor: "#3085d6",
        })
      } else {
        // Ocurrió un error al configurar la solicitud
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error desconocido",
          confirmButtonColor: "#3085d6",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-montserrat">
      <div className="space-y-6">
        {/* Tabs para móvil */}
        <div className="w-full lg:hidden">
          <div className="flex border-b border-linkIt-300">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === "edit"
                  ? "border-b-2 border-linkIt-300 text-linkIt-300"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("edit")}
            >
              Editar
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === "preview"
                  ? "border-b-2 border-linkIt-300 text-linkIt-300"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("preview")}
            >
              Vista Previa
            </button>
          </div>
        </div>

        {/* Formulario de edición */}
        <div
          className={`${
            activeTab === "edit" ||
            (activeTab === "edit" && window.innerWidth >= 1024)
              ? "block"
              : "hidden lg:block"
          }`}
        >
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de recurso */}
              <div className="space-y-2">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tipo de Recurso
                </label>
                <select
                  id="type"
                  name="type"
                  value={resource.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-linkIt-300 focus:border-linkIt-300"
                >
                  <option value="">Selecciona el tipo de recurso</option>
                  <option value="blog">Blog</option>
                  <option value="ebook">Ebook</option>
                  <option value="social">Evento</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {resource.type && (
                <>
                  {/* Título */}
                  <div className="space-y-2">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Título
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={resource.title}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-linkIt-300 focus:border-linkIt-300 ${
                        errors.title ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Categoría */}
                  <div className="space-y-2">
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Categoría
                    </label>
                    <input
                      id="category"
                      name="category"
                      type="text"
                      value={resource.category}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-linkIt-300 focus:border-linkIt-300 ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.category && (
                      <p className="text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Descripción
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={resource.description}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-linkIt-300 focus:border-linkIt-300 ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    ></textarea>
                    {errors.description && (
                      <p className="text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Imagen principal */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Imagen Principal
                    </label>
                    <div className="flex items-center gap-4">
                      <CloudinaryWidget
                        setFilePublicId={(publicId) =>
                          updateResource({ image: publicId })
                        }
                        setFileName={setMainImageName}
                        className="flex"
                      >
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkIt-300 ${
                            resource.image
                              ? "border border-green-500 text-green-500 bg-white"
                              : "bg-linkIt-300 text-white hover:bg-linkIt-400"
                          }`}
                        >
                          {resource.image ? (
                            <span className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Imagen cargada
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3-4a1 1 0 011-1h12a1 1 0 110 2H7a1 1 0 01-1-1zm0-4a1 1 0 011-1h12a1 1 0 110 2H7a1 1 0 01-1-1zm4-4a1 1 0 011-1h6a1 1 0 110 2H11a1 1 0 01-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Subir imagen
                            </span>
                          )}
                        </button>
                      </CloudinaryWidget>
                      {resource.image && (
                        <p className="text-sm text-green-600">
                          Imagen cargada correctamente
                        </p>
                      )}
                    </div>
                    {errors.image && (
                      <p className="text-sm text-red-600">{errors.image}</p>
                    )}
                  </div>

                  {/* Link o PDF (para ebook o social) */}
                  {(resource.type === "ebook" ||
                    resource.type === "social") && (
                    <div className="space-y-2">
                      <label
                        htmlFor="link"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {resource.type === "ebook" ? "PDF" : "Link del Evento"}
                      </label>
                      {resource.type === "ebook" ? (
                        <div className="flex items-center gap-4">
                          <CloudinaryWidget
                            updateLink={(url) => updateResource({ link: url })}
                            setFileName={setPdfName}
                            className="flex"
                          >
                            <button
                              type="button"
                              className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkIt-300 ${
                                resource.link
                                  ? "border border-green-500 text-green-500 bg-white"
                                  : "bg-linkIt-300 text-white hover:bg-linkIt-400"
                              }`}
                            >
                              {resource.link ? (
                                <span className="flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  PDF cargado
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3-4a1 1 0 011-1h12a1 1 0 110 2H7a1 1 0 01-1-1zm0-4a1 1 0 011-1h12a1 1 0 110 2H7a1 1 0 01-1-1zm4-4a1 1 0 011-1h6a1 1 0 110 2H11a1 1 0 01-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Subir PDF
                                </span>
                              )}
                            </button>
                          </CloudinaryWidget>
                          {resource.link && (
                            <p className="text-sm text-green-600">
                              PDF cargado correctamente
                            </p>
                          )}
                        </div>
                      ) : (
                        <input
                          id="link"
                          name="link"
                          type="text"
                          value={resource.link}
                          onChange={handleChange}
                          placeholder="https://..."
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-linkIt-300 focus:border-linkIt-300 ${
                            errors.link ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      )}
                      {errors.link && (
                        <p className="text-sm text-red-600">{errors.link}</p>
                      )}
                    </div>
                  )}

                  {/* Secciones (solo para blogs) */}
                  {resource.type === "blog" && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-medium text-linkIt-300">
                        Secciones
                      </h3>

                      {/* Lista de secciones existentes */}
                      {resource.headers && resource.headers.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-500">
                            Secciones Agregadas
                          </h4>
                          {resource.headers.map((header, index) => (
                            <div
                              key={index}
                              className="p-4 border rounded-md relative"
                            >
                              <button
                                type="button"
                                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                                onClick={() => removeSection(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <h5 className="font-medium">{header.head}</h5>
                              <div className="text-sm text-gray-600 mt-1">
                                {header.body.length > 100
                                  ? `${header.body.substring(0, 100)}...`
                                  : header.body}
                              </div>
                              {header.sectionImage && (
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">
                                    Imagen incluida
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Formulario para agregar nueva sección */}
                      <div className="space-y-4 border p-4 rounded-md">
                        <h4 className="text-sm font-medium">
                          Agregar Nueva Sección
                        </h4>

                        <div className="space-y-2">
                          <label
                            htmlFor="head"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Encabezado
                          </label>
                          <input
                            id="head"
                            name="head"
                            type="text"
                            value={currentSection.head}
                            onChange={handleSectionChange}
                            placeholder="Título de la sección"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-linkIt-300 focus:border-linkIt-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="body"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Contenido
                          </label>
                          <JoditEditor
                            value={currentSection.body}
                            onChange={handleRichTextChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Imagen de Sección (opcional)
                          </label>
                          <CloudinaryWidget
                            setFilePublicId={(publicId) =>
                              setCurrentSection({
                                ...currentSection,
                                sectionImage: publicId,
                              })
                            }
                            setFileName={setSectionImageName}
                            className="flex"
                          >
                            <button
                              type="button"
                              className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkIt-300 ${
                                currentSection.sectionImage
                                  ? "border border-green-500 text-green-500 bg-white"
                                  : "bg-linkIt-300 text-white hover:bg-linkIt-400"
                              }`}
                            >
                              {currentSection.sectionImage ? (
                                <span className="flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Imagen cargada
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3-4a1 1 0 011-1h12a1 1 0 110 2H7a1 1 0 01-1-1zm0-4a1 1 0 011-1h12a1 1 0 110 2H7a1 1 0 01-1-1zm4-4a1 1 0 011-1h6a1 1 0 110 2H11a1 1 0 01-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Subir imagen
                                </span>
                              )}
                            </button>
                          </CloudinaryWidget>
                          {currentSection.sectionImage && (
                            <p className="text-sm text-green-600">
                              Imagen de sección cargada
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={addSection}
                          className="w-full bg-linkIt-300 text-white py-2 px-4 rounded-md hover:bg-linkIt-400 focus:outline-none focus:ring-2 focus:ring-linkIt-300 focus:ring-offset-2 flex items-center justify-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Agregar Sección
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Errores generales */}
                  {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            Por favor, corrige los errores antes de continuar.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => window.history.back()}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkIt-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || Object.keys(errors).length > 0}
                      className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkIt-300 ${
                        isSubmitting || Object.keys(errors).length > 0
                          ? "bg-linkIt-200 cursor-not-allowed"
                          : "bg-linkIt-300 hover:bg-linkIt-400"
                      }`}
                    >
                      {isSubmitting ? "Guardando..." : "Guardar Recurso"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Vista previa en móvil */}
        <div
          className={`lg:hidden ${
            activeTab === "preview" ? "block" : "hidden"
          }`}
        >
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-medium mb-4 text-linkIt-300">
              Vista Previa
            </h3>
            <ResourcePreview resource={resource as ResourceProps} />
          </div>
        </div>
      </div>

      {/* Vista previa siempre visible en pantallas grandes */}
      <div className="hidden lg:block sticky top-24 h-fit">
        <div className="bg-white rounded-lg mt-6 shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-4 text-linkIt-300 text-center">
            Vista Previa
          </h3>
          <ResourcePreview resource={resource as ResourceProps} />
        </div>
      </div>
    </div>
  );
}
