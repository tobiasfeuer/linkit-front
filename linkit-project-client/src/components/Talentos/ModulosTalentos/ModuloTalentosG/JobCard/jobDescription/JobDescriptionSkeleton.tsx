import { motion } from "framer-motion";

const JobDescriptionSkeleton = ({lang}: {lang: string}) => {
  return (
    <div className="font-montserrat text-linkIt-400 dark:bg-linkIt-200 flex flex-col relative p-[7%] pt-[17vh] lg:pt-[23vh]">
      {/* Mensaje informativo */}
      <div className="mb-6 text-center">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-linkIt-300 text-white rounded-lg"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium">{lang === 'es' ? 'Obteniendo información...' : 'Gathering information...'}</span>
        </motion.div>
      </div>
      {/* Breadcrumbs skeleton */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <motion.div
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
          <span className="text-gray-300 dark:text-gray-500">/</span>
          <motion.div
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.3, ease: "easeInOut" }}
          />
          <span className="text-gray-300 dark:text-gray-500">/</span>
          <motion.div
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="lg:flex grid relative mb-[10%] w-full">
        <div className="w-full">
          {/* Header skeleton */}
          <header className="mb-[3%]">
            {/* Back button skeleton */}
            <motion.div
              className="flex items-center gap-2 mb-[5%]"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </motion.div>

            {/* Code skeleton */}
            <motion.div
              className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-[3%]"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.4, ease: "easeInOut" }}
            />

            {/* Title skeleton */}
            <motion.div
              className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: "easeInOut" }}
            />

            {/* Job metadata skeleton */}
            <div className="flex flex-wrap gap-2 mt-3">
              <motion.div
                className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.8, ease: "easeInOut" }}
              />
              <motion.div
                className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1.0, ease: "easeInOut" }}
              />
            </div>
          </header>

          {/* Content sections skeleton */}
          {[1, 2, 3, 4, 5].map((section) => (
            <section key={section} className="mb-[3%]">
              {/* Section title skeleton */}
              <motion.div
                className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-[1%]"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, delay: section * 0.3, ease: "easeInOut" }}
              />
              
              {/* Section content skeleton */}
              <div className="space-y-2">
                <motion.div
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2, delay: section * 0.3 + 0.2, ease: "easeInOut" }}
                />
                <motion.div
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2, delay: section * 0.3 + 0.4, ease: "easeInOut" }}
                />
                <motion.div
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2, delay: section * 0.3 + 0.6, ease: "easeInOut" }}
                />
              </div>

              {/* List items skeleton for some sections */}
              {section === 3 || section === 4 ? (
                <div className="mt-3 space-y-2">
                  {[1, 2, 3].map((item) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-2"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2, delay: section * 0.3 + item * 0.2, ease: "easeInOut" }}
                    >
                      <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </section>
          ))}

          {/* Call to action skeleton */}
          <section className="mt-[10%] lg:flex grid content-center items-center justify-items-center lg:max-w-[70%]">
            <motion.div
              className="flex items-center gap-4"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1.5, ease: "easeInOut" }}
            >
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded hidden lg:block" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64" />
            </motion.div>
          </section>
        </div>

        {/* Right sidebar skeleton */}
        <section className="lg:w-[50%] flex flex-col justify-items-center items-center gap-[1rem]">
          {/* Logo skeleton */}
          <motion.div
            className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded mb-[20%] hidden lg:block"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1.0, ease: "easeInOut" }}
          />
          
          {/* Apply button skeleton */}
          <motion.div
            className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-48"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1.2, ease: "easeInOut" }}
          />
        </section>
      </div>
    </div>
  );
};

export default JobDescriptionSkeleton; 