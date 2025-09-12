import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Newsletter from "../../../../../Utils/newsletter/newsletter";
import BlogSidebar from "./blog-sidebar/BlogSidebar";
import BlogInfo from "./blogInfo/BlogInfo";
import BreadcrumbsWithSchema from "../../../../../Utils/Breadcrumbs/Breadcrumbs";

export default function BlogView() {
  const { id, slug } = useParams();
  const [blogData, setBlogData] = useState<any>(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      if (!id) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_ENDPOINT_URL}/posts/find?id=${id}`
        );
        setBlogData(response.data);
      } catch (error) {
        console.error("Error al cargar datos del blog:", error);
      }
    };

    fetchBlogData();
  }, [id]);

  return (
    <div>
      <div className="p-[7%] flex flex-col pt-[17vh] lg:pt-[23vh] dark:bg-linkIt-200">
        {/* Breadcrumbs con Schema.org */}
        <div className="mb-6 pl-14">
          <BreadcrumbsWithSchema
            items={[
              { label: "Recursos", path: "/recursos" },
              { label: "Blog", path: "/recursos?type=blog" },
              {
                label: blogData?.title || "Artículo",
                path: `/blog/${id}/${slug}`,
                active: true,
              },
            ]}
          />
        </div>
        {/* Contenido principal */}
        <div className="flex flex-col lg:flex-row w-full">
          <div className="flex-1">
            <BlogInfo />
          </div>

          <div className="hidden lg:block lg:w-1/3 lg:ml-8">
            <BlogSidebar />
          </div>
        </div>
      </div>

      <Newsletter />
    </div>
  );
}
