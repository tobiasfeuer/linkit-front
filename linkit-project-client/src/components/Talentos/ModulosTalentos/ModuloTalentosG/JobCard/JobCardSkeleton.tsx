import { motion } from "framer-motion";

interface JobCardSkeletonProps {
  count?: number;
}

const JobCardSkeleton = ({ count = 6 }: JobCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={`skeleton-${index}`}
          className="relative hidden lg:block w-full h-[250px] bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 rounded-lg p-5 font-montserrat shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: index * 0.1,
          }}
        >
          {/* Imagen de fondo skeleton */}
          <div className="absolute inset-0 bg-gray-700 opacity-10" />

          <div className="relative w-full h-full flex flex-col">
            {/* Título skeleton */}
            <div className="h-[100px]">
              <motion.div
                className="h-8 bg-gray-700 rounded mb-3"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
              />
              
              {/* Ubicación, tipo y modalidad skeleton */}
              <div className="flex items-center mt-2 space-x-2">
                <motion.div
                  className="h-4 bg-gray-700 rounded w-20"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: index * 0.1 + 0.2,
                    ease: "easeInOut",
                  }}
                />
                <span className="text-gray-600">•</span>
                <motion.div
                  className="h-4 bg-gray-700 rounded w-16"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: index * 0.1 + 0.4,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="h-5 bg-gray-700 rounded w-24"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: index * 0.1 + 0.6,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>

            {/* Stack skeleton */}
            <div className="flex-grow">
              <div className="h-[90px] w-full overflow-hidden mt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {[1, 2, 3, 4].map((tagIndex) => (
                    <motion.div
                      key={`tag-${tagIndex}`}
                      className="h-6 bg-gray-700 rounded-full w-16"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        delay: index * 0.1 + tagIndex * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Botón skeleton */}
            <div className="absolute bottom-4 left-0 w-full flex justify-center">
              <motion.div
                className="h-8 bg-gray-700 rounded-md w-32"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: index * 0.1 + 1,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export const JobCardSkeletonMobile = ({ count = 3 }: JobCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={`skeleton-mobile-${index}`}
          className="lg:hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-md mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: index * 0.1,
          }}
        >
          <div className="relative p-4 border-b border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {/* Título skeleton */}
                <motion.div
                  className="h-6 bg-gray-700 rounded mb-2 w-3/4"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                />
                {/* Ubicación skeleton */}
                <motion.div
                  className="h-4 bg-gray-700 rounded w-1/2"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: index * 0.1 + 0.2,
                    ease: "easeInOut",
                  }}
                />
              </div>
              {/* Botón circular skeleton */}
              <motion.div
                className="h-12 w-12 bg-gray-700 rounded-full"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: index * 0.1 + 0.4,
                  ease: "easeInOut",
                }}
              />
            </div>
            {/* Stack skeleton */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3].map((tagIndex) => (
                <motion.div
                  key={`mobile-tag-${tagIndex}`}
                  className="h-5 bg-gray-700 rounded-full w-14"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: index * 0.1 + tagIndex * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="relative p-3 bg-gray-800 flex justify-between items-center">
            <motion.div
              className="h-5 bg-gray-700 rounded w-24"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: index * 0.1 + 0.8,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default JobCardSkeleton;

