import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HTMLReactParser from "html-react-parser";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import CallToAction from "../../../../../../Utils/Buttons/CTA/callToAction";

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID;

interface Header {
  head: string;
  body: string;
  sectionImage: string;
  _id: string;
}

interface Blog {
  _id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  headers: Header[];
  createdDate: string; 
  createdBy: string; 
  type: string;
  link: string;
}

function BlogInfo() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_ENDPOINT_URL}/posts/find?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${SUPERADMN_ID}`,
              "Accept-Language": sessionStorage.getItem("lang"),
            },
          }
        );
        setBlog(data);
      } catch (error) {
        console.error("Error al cargar el blog:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (blog) {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [blog]);

  const handleImageLoad = () => {
    if(imagesLoaded < 0) {
      setImagesLoaded((prev) => prev + 1);
    }
  };

  // Formatear la fecha para mostrarla de manera amigable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Crear el esquema JSON-LD para Schema.org
  const generateSchemaMarkup = () => {
    if (!blog) return null;

    // Extraer el texto plano del contenido HTML para articleBody
    const getTextFromHTML = (html: string) => {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    };

    // Construir el esquema de BlogPosting
    const blogSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "description": blog.description,
      "image": blog.image ? `https://res.cloudinary.com/dquhriqz3/image/upload/${blog.image}` : "",
      "articleBody": blog.headers?.map(header => 
        `${header.head} ${getTextFromHTML(header.body)}`
      ).join(" "),
      "author": {
        "@type": "Person",
        "name": blog.createdBy || "LinkIt"
      },
      "publisher": {
        "@type": "Organization",
        "name": "LinkIt",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.linkit-hr.com/Linkit-logo/linkit-logo-2024-blue.svg"
        }
      },
      "datePublished": blog.createdDate,
      "dateModified": blog.createdDate, 
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "keywords": [blog.category],
      "articleSection": blog.category
    };

    return JSON.stringify(blogSchema);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50 px-4">
        <motion.img
          src="/Linkit-logo/linkit-logo-blue.svg"
          alt="Linkit Logo"
          className="w-24 h-24"
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
        <motion.h1
          className="text-lg font-semibold text-gray-700"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          Cargando contenido...
        </motion.h1>
      </div>
    );
  }

  return (
    <>
      {/* Implementación de Schema.org con Helmet */}
      {blog && (
        <Helmet>
          <title>{blog.title} | LinkIt</title>
          <meta name="description" content={blog.description} />
          <script type="application/ld+json">
            {generateSchemaMarkup()}
          </script>
        </Helmet>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-montserrat w-full px-4 md:px-10 lg:px-16"
      >
        <span className="border-2 text-sm border-linkIt-300 rounded-lg px-3 py-1 font-bold dark:border-blue-400 dark:bg-white">
          {blog?.category}
        </span>
        <motion.h1
          className="text-3xl font-semibold my-4 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {blog?.title}
        </motion.h1>
        
        {/* Añadir información de autor y fecha */}
        {blog && (
          <div className="flex items-center text-sm text-gray-500 mb-4 dark:text-gray-300">
            <span>Por {blog.createdBy}</span>
            <span className="mx-2">•</span>
            <time dateTime={blog.createdDate}>{formatDate(blog.createdDate)}</time>
          </div>
        )}
        
        <p className="text-lg text-gray-600 dark:text-white">
          {blog?.description}
        </p>
        {blog?.image && (
          <motion.img
            src={`https://res.cloudinary.com/dquhriqz3/image/upload/${blog.image}`}
            alt={blog.title}
            className="w-full lg:w-4/5 aspect-video rounded-xl my-6 object-cover mx-auto" // Centrar imagen
            onLoad={handleImageLoad}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        )}
        {blog?.headers && blog.headers.length > 0 && (
          <ul className="flex flex-col w-full gap-5">
            {blog.headers.map((header: Header, index: number) => {
              let headerIndex = index + 1
              const headerWithHead = blog.headers.filter((h) => h.head !== "")
              const headerWithHeadIndex = headerWithHead.findIndex((h) => h === header)
              if (headerWithHeadIndex !== -1) {
                headerIndex = headerWithHeadIndex + 1
              }
              return (
                <li className="flex flex-col w-full mb-[3%]" key={header._id || index}>
                  <div className="flex items-center mb-1">
                    {header.head !== "" && (
                      <div className="font-bold bg-linkIt-300 text-white flex items-center justify-center subtitles-size h-fit rounded-full px-2 ssm:px-3 aspect-square mr-2">
                        {headerIndex}
                      </div>
                    )}
                    {header.head !== "" && (
                      <span className="text-linkIt-300 font-[600] subtitles-size ml-[1%]">{header.head}</span>
                    )}
                  </div>
                  <div className="text-linkIt-400 text-size dark:text-white ml-[5%]">
                    {typeof header.body === "string" && header.body.trim() !== "" ? HTMLReactParser(header.body) : null}
                  </div>
                  <div className="flex justify-center items-center">
                    {header?.sectionImage && (
                      <img
                        className="h-[8rem] xs:h-[10rem] ssm:h-[15rem] md:h-[24rem] lg:h-[24rem] xl:h-[26rem] 2xl:h-[30rem] w-full xl:w-[80%] rounded-xl my-[5%]"
                        src={`https://res.cloudinary.com/dquhriqz3/image/upload/${header.sectionImage}`}
                        alt={header.head.concat("image")}
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <div className="mt-12">
            <CallToAction 
              variant="default"
              customTitle="¿Te interesó este artículo?"
              buttonStyle="filled"
            />
          </div>
      </motion.div>
    </>
  );
}

export default BlogInfo;