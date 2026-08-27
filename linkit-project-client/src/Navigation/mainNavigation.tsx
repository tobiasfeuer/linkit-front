import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, ChevronDown, User, Briefcase, BookOpen, Users } from "lucide-react"
import { useTranslation } from "react-i18next"

// Oculta temporalmente los accesos de autenticación.
const SHOW_AUTH_UI = false

export default function MainNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const { i18n } = useTranslation()
  const currentLanguage = i18n.language
  const isSpanish = currentLanguage.startsWith("es")

  // Detectar scroll para cambiar estilos
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Definir las rutas principales que quieres que aparezcan como sitelinks
  const mainRoutes = [
    {
      name: isSpanish ? "Para Empresas" : "For Companies",
      path: "/SoyEmpresa",
      icon: Briefcase,
      description: isSpanish
        ? "Contrata talento IT de forma rápida y eficiente"
        : "Hire IT talent quickly and efficiently",
      submenu: [
        { name: isSpanish ? "Servicios" : "Services", path: "/SoyEmpresa#serviciosE" },
        { name: isSpanish ? "Casos de éxito" : "Success Stories", path: "/soyEmpresa#casosDeExitoE" },
        { name: isSpanish ? "Proceso" : "Process", path: "/SoyEmpresa#procesoE" },
        { name: isSpanish ? "Calculadora" : "Calculator", path: "/SoyEmpresa#calculadora" },
      ],
    },
    {
      name: isSpanish ? "Para Talento" : "For Talent",
      path: "/soyTalento",
      icon: User,
      description: isSpanish
        ? "Encuentra las mejores oportunidades en el sector IT"
        : "Find the best opportunities in the IT sector",
      submenu: [
        { name: isSpanish ? "Ofertas de trabajo" : "Job Offers", path: "/soyTalento#vacantes" },
        { name: isSpanish ? "Servicios" : "Services", path: "/soyTalento#serviciosT" },
        { name: isSpanish ? "Proceso" : "Process", path: "/soyTalento#procesoT" },
      ],
    },
    {
      name: isSpanish ? "Recursos" : "Resources",
      path: "/recursos",
      icon: BookOpen,
      description: isSpanish
        ? "Artículos, ebooks y eventos para el sector IT"
        : "Articles, ebooks and events for the IT sector",
      submenu: [
        { name: "Blog", path: "/recursos?type=blog" },
        { name: isSpanish ? "Librería" : "Library", path: "/recursos/libreria" },
        { name: isSpanish ? "Eventos" : "Events", path: "/recursos?type=event" },
      ],
    },
    {
      name: isSpanish ? "Quiénes Somos" : "About Us",
      path: "/quienesSomos",
      icon: Users,
      description: isSpanish ? "Conoce más sobre LinkIT y nuestro equipo" : "Learn more about LinkIT and our team",
    },
  ]

  return (
    <header
      className={`fixed hidden top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md dark:bg-linkIt-200 dark:shadow-gray-800" : "bg-transparent"
      }`}
      role="banner"
      itemScope
      itemType="https://schema.org/WPHeader"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo con texto descriptivo para SEO */}
          <Link to="/" className="flex-shrink-0" aria-label="LinkIT - Inicio" itemProp="url">
            <img
              src="/Linkit-logo/linkit-logo-2024-blue.svg"
              alt="LinkIT - Conectamos talento IT con las mejores empresas"
              className="h-8 md:h-10"
              width="120"
              height="40"
              itemProp="logo"
            />
          </Link>

          {/* Navegación de escritorio con roles ARIA */}
          <nav
            className="hidden md:flex space-x-1 lg:space-x-4"
            role="navigation"
            aria-label="Navegación principal"
            itemScope
            itemType="https://schema.org/SiteNavigationElement"
          >
            {mainRoutes.map((route) => (
              <div key={route.path} className="relative group">
                <Link
                  to={route.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === route.path
                      ? "bg-linkIt-300 text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-linkIt-300/10"
                  }`}
                  aria-label={route.description}
                  aria-current={location.pathname === route.path ? "page" : undefined}
                  itemProp="url"
                >
                  <span itemProp="name">{route.name}</span>
                  {route.submenu && <ChevronDown className="inline-block ml-1 h-4 w-4" aria-hidden="true" />}
                </Link>

                {/* Submenú con roles ARIA */}
                {route.submenu && (
                  <div
                    className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-linkIt-200 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby={`${route.name}-menu`}
                  >
                    <div className="py-1">
                      {route.submenu.map((subitem) => (
                        <Link
                          key={subitem.path}
                          to={subitem.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-linkIt-300/10"
                          role="menuitem"
                          itemProp="url"
                        >
                          <span itemProp="name">{subitem.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Botones de acción */}
          <div className="hidden md:flex items-center space-x-4">
            {SHOW_AUTH_UI && (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-linkIt-300 dark:text-gray-200"
              >
                {isSpanish ? "Iniciar sesión" : "Login"}
              </Link>
            )}
            <Link
              to="/contrata-talento-it"
              className="px-4 py-2 rounded-md bg-linkIt-300 text-white text-sm font-medium hover:bg-linkIt-400 transition-colors"
            >
              {isSpanish ? "Contrata talento" : "Hire talent"}
            </Link>
          </div>

          {/* Botón de menú móvil con roles ARIA */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-linkIt-300 hover:bg-gray-100 dark:text-gray-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Abrir menú principal"
          >
            <span className="sr-only">Abrir menú principal</span>
            {isMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Menú móvil con roles ARIA */}
      {isMenuOpen && (
        <div
          className="md:hidden bg-white dark:bg-linkIt-200 shadow-lg"
          id="mobile-menu"
          role="navigation"
          aria-label="Menú móvil"
          itemScope
          itemType="https://schema.org/SiteNavigationElement"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {mainRoutes.map((route) => (
              <div key={route.path} itemProp="url">
                <Link
                  to={route.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === route.path
                      ? "bg-linkIt-300 text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-linkIt-300/10"
                  }`}
                  aria-current={location.pathname === route.path ? "page" : undefined}
                >
                  <route.icon className="mr-2 h-5 w-5" />
                  <span itemProp="name">{route.name}</span>
                </Link>

                {/* Submenú móvil */}
                {route.submenu && (
                  <div className="pl-4 space-y-1 mt-1">
                    {route.submenu.map((subitem) => (
                      <Link
                        key={subitem.path}
                        to={subitem.path}
                        className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-linkIt-300/10"
                        itemProp="url"
                      >
                        <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                        <span itemProp="name">{subitem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-4">
              {SHOW_AUTH_UI && (
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-linkIt-300/10"
                >
                  {isSpanish ? "Iniciar sesión" : "Login"}
                </Link>
              )}
              <Link
                to="/contrata-talento-it"
                className="px-4 py-2 rounded-md bg-linkIt-300 text-white text-sm font-medium hover:bg-linkIt-400 transition-colors"
              >
                {isSpanish ? "Contrata talento" : "Hire talent"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

