import { useEffect, useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import BlogSidebar from "../../blogs/blogs-view/blog-sidebar/BlogSidebar"
import Newsletter from "../../../../../Utils/newsletter/newsletter"
import EbookInfo from "./EbookInfo"
import axios from "axios"
import BreadcrumbsWithSchema from "../../../../../Utils/Breadcrumbs/Breadcrumbs"

interface EbookData {
  pdfUrl: string
  title: string
  description: string
  category: string
  image?: string
}

export default function EbookView() {
  const location = useLocation()
  const { slug } = useParams()
  const [ebookData, setEbookData] = useState<EbookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEbookData = async () => {
      try {
        if (location.state) {
          setEbookData({
            pdfUrl: location.state.pdfUrl,
            title: location.state.title,
            description: location.state.description,
            category: location.state.category,
            image: location.state.image,
          })
          setLoading(false)
          return
        }

        const savedData = sessionStorage.getItem("ebookData")
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          if (parsedData.slug === slug) {
            setEbookData({
              pdfUrl: parsedData.link,
              title: parsedData.title,
              description: parsedData.description,
              category: parsedData.category,
              image: parsedData.image,
            })
            setLoading(false)
            return
          }
        }
        const response = await axios.get(`${import.meta.env.VITE_ENDPOINT_URL}/posts/ebook/${slug}`)
        if (!response) throw new Error("Ebook not found")

        setEbookData({
          pdfUrl: response.data.link,
          title: response.data.title,
          description: response.data.description,
          category: response.data.category,
          image: response.data.image,
        })
        setLoading(false)
      } catch (error) {
        console.error("Error fetching ebook:", error)
        setError("No se encontró el PDF.")
        setLoading(false)
      }
    }

    fetchEbookData()
  }, [location.state, slug])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (error || !ebookData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500 font-semibold">Error: {error || "No se encontró el PDF."}</p>
      </div>
    )
  }

  // Schema.org para Ebook
  const bookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: ebookData.title,
    description: ebookData.description,
    image: ebookData.image,
    url: window.location.href,
    publisher: {
      "@type": "Organization",
      name: "LinkIT",
      logo: {
        "@type": "ImageObject",
        url: "https://www.linkit-hr.com/Linkit-logo/linkit-logo-2024-blue.svg",
      },
    },
    inLanguage: "es",
    genre: ebookData.category,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url: window.location.href,
    },
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden dark:bg-linkIt-200 ">
      <div className="w-full pt-[17vh] lg:pt-[23vh]">
        <div className="container mx-auto px-4 sm:px-6 xs:px-0">
          <BreadcrumbsWithSchema
            items={[
              { label: "Recursos", path: "/recursos" },
              { label: "Librería", path: "/recursos/libreria" },
              {
                label: ebookData?.title || "Ebook",
                path: `/ebook/${slug}`,
                active: true,
              },
            ]}
          />
        </div>
      </div>

      <div className=" xs:w-[90%] sm:w-[80%] mx-auto px-4 sm:px-6 xs:px-0 py-6">
        <div className="w-full">
          <div className="mx-auto w-full lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
            <div className="space-y-4 max-w-full">
              <EbookInfo pdfUrl={ebookData.pdfUrl} />
            </div>
            <div className="hidden lg:block">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Schema.org para Ebook */}
      <script type="application/ld+json">{JSON.stringify(bookSchema)}</script>

      <Newsletter />
    </div>
  )
}

