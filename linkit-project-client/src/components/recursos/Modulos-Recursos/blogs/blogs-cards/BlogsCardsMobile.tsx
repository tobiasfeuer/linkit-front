import axios from "axios";
import { PostEntity } from "../types.blogs.ts";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BlogsCard from "./BlogsCard.tsx";
import { RootState } from "../../../../../redux/types";
import { useSelector } from "react-redux";

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID

function BlogsCardsMobile() {
  const [currentBlog, setCurrentBlog] = useState(0);
  const [blogs, setBlogs] = useState<PostEntity[]>([]);
  const isDarkMode = useSelector(
    (state: RootState) => state.darkMode);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get<PostEntity[]>(`${import.meta.env.VITE_ENDPOINT_URL}/posts/find?type=blog`, {
          headers: {"Authorization": `Bearer ${SUPERADMN_ID}`,
          'Accept-Language': "es"}
        });
        setBlogs(response.data.filter((item: any) => item.archived === false ));
      } catch (error) {
         throw new Error((error as any).message);
      }
    })();
  }, []);


  const handleNext = () => {
    setCurrentBlog(currentBlog === blogs.length - 1 ? 0 : currentBlog + 1);
  };

  const handlePrev = () => {
    setCurrentBlog(currentBlog === 0 ? blogs.length - 1 : currentBlog - 1);
  };





  return (
    <div className="flex w-full justify-center items-center">
      <button disabled={blogs.length <= 1}>
        <img src={isDarkMode ?"/Vectores/white-arrow.png" : "/Vectores/arrow.png"} onClick={handlePrev} alt="previus-icon" className="rotate-90 w-[20px] justify-self-start ssm:justify-self-center cursor-pointer" />
        </button>
        <div className='grid lg:grid-cols-3 items-end justify-center gap-2 w-full h-full'>
      {blogs.length > 0 && (
          <motion.div
            key={currentBlog}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
          >
            <BlogsCard
              image={blogs[currentBlog].image}
              title={blogs[currentBlog].title}
              description={blogs[currentBlog].description}
              _id={blogs[currentBlog]._id}
              genre={blogs[currentBlog].category}
              createdDate={blogs[currentBlog].createdDate}
            />
          </motion.div>
        )
      }
    </div>
    <button disabled={blogs.length <= 1}>
        <img onClick={handleNext} src={isDarkMode ? "/Vectores/white-arrow.png" : "/Vectores/arrow.png"} alt="next-icon" className="-rotate-90 w-[20px] justify-self-start ssm:justify-self-center cursor-pointer" />
        </button>
    </div>
  );
}

export default BlogsCardsMobile;
