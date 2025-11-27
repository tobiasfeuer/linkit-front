import { useState, useEffect } from "react"
import axios from "axios"
import RecomendedCard from "./RecomendedCard"
import { useParams } from "react-router-dom"

interface Header {
    title: string,
    description: string
}

type Blog = {
    _id: string
    title: string
    description: string
    type: string
    image: string
    headers: Header[]
    category: string
    createdDate: string 
}

interface RecomendedProps {
  maxBlogsDesktop?: number;  
  maxBlogsTablet?: number;  
  maxBlogsMobile?: number;
  showViewMore?: boolean;
  className?: string;
  filterByCategory?: boolean;
}

function Recomended({
  maxBlogsDesktop = 3,
  maxBlogsTablet = 2,
  maxBlogsMobile = 1,
  showViewMore = true,
  className = "",
  filterByCategory = true
}: RecomendedProps) {
    const [blogs, setBlogs] = useState<Blog[] | null>(null)
    const [visibleBlogs, setVisibleBlogs] = useState<Blog[] | null>(null)
    const [currentBlog, setCurrentBlog] = useState<Blog | null>(null)
    const [showAll, setShowAll] = useState(false)
    const [maxBlogs, setMaxBlogs] = useState(maxBlogsDesktop)
    const { id } = useParams();

    // Detectar el tamaño de la pantalla y ajustar maxBlogs
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setMaxBlogs(maxBlogsMobile);
            } else if (window.innerWidth < 1024) {
                setMaxBlogs(maxBlogsTablet);
            } else {
                setMaxBlogs(maxBlogsDesktop);
            }
        };
        handleResize();

        // Añadir listener para cambios de tamaño
        window.addEventListener('resize', handleResize);

        // Limpiar listener al desmontar
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [maxBlogsDesktop, maxBlogsTablet, maxBlogsMobile]);

    // Obtener todos los blogs
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_ENDPOINT_URL}/posts/find?type=blog`)
                setBlogs(response.data)
            } catch (error) {
                console.error("Error al cargar los blogs recomendados:", error)
            }
        }
        fetchBlogs()
    }, [])

    // Obtener el blog actual para filtrar por categoría si es necesario
    useEffect(() => {
        if (filterByCategory && id) {
            const fetchCurrentBlog = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_ENDPOINT_URL}/posts/find?id=${id}`)
                    setCurrentBlog(response.data)
                } catch (error) {
                    console.error("Error al cargar el blog actual:", error)
                }
            }
            fetchCurrentBlog()
        }
    }, [id, filterByCategory])

    // Filtrar y limitar los blogs recomendados
    useEffect(() => {
        if (!blogs) return;

        let filtered = blogs.filter(blog => blog._id !== id);
        
        // Si filterByCategory está activado y tenemos el blog actual, filtrar por la misma categoría
        if (filterByCategory && currentBlog) {
            const categoryFiltered = filtered.filter(blog => blog.category === currentBlog.category);
            
            // Si hay suficientes blogs de la misma categoría, usar esos
            if (categoryFiltered.length >= 2) {
                filtered = categoryFiltered;
            }
        }
        
        // Ordenar por fecha de creación (más recientes primero)
        filtered = [...filtered].sort((a, b) => {

            const dateA = new Date(a.createdDate || 0).getTime();
            const dateB = new Date(b.createdDate || 0).getTime();
            return dateB - dateA;
        });
        
        setVisibleBlogs(showAll ? filtered : filtered.slice(0, maxBlogs));
    }, [blogs, id, currentBlog, showAll, maxBlogs, filterByCategory]);

    // Función para mostrar todos los blogs
    const handleViewMore = () => {
        setShowAll(true);
    };

    // Función para mostrar menos blogs
    const handleViewLess = () => {
        setShowAll(false);
        window.scrollTo({
            top: document.getElementById('recommended-blogs')?.offsetTop || 0,
            behavior: 'smooth'
        });
    };

    if (!visibleBlogs || visibleBlogs.length === 0) {
        return null;
    }

    return (
        <div id="recommended-blogs" className={`recommended-blogs-container ${className}`}>
            <div className="space-y-4">
                {visibleBlogs.map((blog) => (
                    <RecomendedCard
                        key={blog._id}
                        title={blog.title}
                        description={blog.description}
                        image={blog.image}
                        genre={blog.category}
                        _id={blog._id}
                    />
                ))}
            </div>
            
            {/* Botones Ver más/Ver menos */}
            {showViewMore && blogs && blogs.filter(blog => blog._id !== id).length > maxBlogs && (
                <div className="mt-4 text-center">
                    {showAll ? (
                        <button 
                            onClick={handleViewLess}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            Ver menos
                        </button>
                    ) : (
                        <button 
                            onClick={handleViewMore}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            Ver más recomendaciones
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default Recomended