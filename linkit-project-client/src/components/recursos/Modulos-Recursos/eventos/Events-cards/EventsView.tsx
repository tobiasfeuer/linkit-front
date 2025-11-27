import { useEffect, useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import axios from "axios"
import BlogSidebar from "../../blogs/blogs-view/blog-sidebar/BlogSidebar"
import Newsletter from "../../../../../Utils/newsletter/newsletter"
import { EventsInfo } from "./EventsInfo"

interface EventData {
  videoUrl: string
  title: string
  description: string
  category: string
  image?: string
  videoId?: string
  createdData?:string
  createdBy?:string
}

export default function EventsView() {
  const location = useLocation()
  const { slug } = useParams()
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (location.state) {
          setEventData(location.state)
          setLoading(false)
          return
        }
        const savedData = sessionStorage.getItem("eventData")
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          if (parsedData.slug === slug) {
            setEventData({
              videoUrl: parsedData.videoUrl,
              title: parsedData.title,
              description: parsedData.description,
              category: parsedData.category,
              image: parsedData.image,
              videoId: parsedData.videoId,
              createdData: parsedData.createdDate,
              createdBy: parsedData.createdBy
            })
            setLoading(false)
            return
          }
        }
        const response = await axios.get(`${import.meta.env.VITE_ENDPOINT_URL}/posts/events/${slug}`)
        const data = response.data

        if (!data) throw new Error("Event not found")


        setEventData({
          videoUrl: data.link,
          title: data.title,
          description: data.description,
          category: data.category,
          image: data.image,
          videoId: data.link.includes("v=") ? data.link.split("v=")[1] : data.link.split("youtu.be/")[1],
        })
        setLoading(false)
      } catch (error) {
        console.error("Error fetching event:", error)
        setError("Video no encontrado")
        setLoading(false)
      }
    }

    fetchEventData()
  }, [location.state, slug])

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (error || !eventData) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-red-500 font-semibold">Error: {error || "Video no encontrado"}</p>
      </div>
    )
  }

 
  return (
    <div className="min-h-screen w-full dark:bg-linkIt-200">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="w-full">
          <div className="mx-auto w-full lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
            <div className="space-y-4 max-w-full">
              <EventsInfo
                videoUrl={eventData.videoUrl}
                title={eventData.title}
                description={eventData.description}
                category={eventData.category}
                image={eventData.image}
                createdDate={eventData.createdData}
                createdBy={eventData.createdBy}
              />
            </div>
            <div className="hidden lg:block">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </div>

      <Newsletter />
    </div>
  )
}

