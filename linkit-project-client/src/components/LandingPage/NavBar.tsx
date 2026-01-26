import {motion} from "framer-motion"
import { useTranslation } from "react-i18next";
import i18n from "../../i18";

const Navbar = () => {
  const { i18n: i18nHook } = useTranslation();

  const handleLanguageChange = (lang: 'es' | 'en') => {
    i18n.changeLanguage(lang);
    sessionStorage.setItem('lang', lang);
    sessionStorage.setItem('i18nextLng', lang);
  };

  return (
    <nav className="bg-[#173951] text-white py-4">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center py-2"
        >
          <img src="/Linkit-logo/linkit-logo-2024-white.svg" alt="LinkIT Logo" className="h-8 md:h-8 w-auto" />
        </motion.div>

        <motion.div
          className="flex gap-2 font-bold font-montserrat text-xl cursor-pointer"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => handleLanguageChange('en')}
            className={`transition-colors ${
              i18nHook.language === 'en' 
                ? 'text-linkIt-300' 
                : 'text-white hover:text-linkIt-300'
            }`}
          >
            EN
          </button>
          <span>|</span>
          <button
            onClick={() => handleLanguageChange('es')}
            className={`transition-colors ${
              i18nHook.language === 'es' 
                ? 'text-linkIt-300' 
                : 'text-white hover:text-linkIt-300'
            }`}
          >
            ES
          </button>
        </motion.div>
      </div>
    </nav>
  )
}

export default Navbar;