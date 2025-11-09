import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Variants } from "framer-motion";

export default function HomePage() {
  // Animaciones reutilizables con tipos correctos
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  const floatingAnimation: Variants = {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 1, -1, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  // Manejo de error de imagen corregido
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%230ea5e9' opacity='0.7'/%3E%3C/svg%3E";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full"
      >
        {/* Header con ilustración */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center mb-10"
        >
          <motion.div
            variants={floatingAnimation}
            animate="animate"
            className="relative mb-8"
          >
            <div className="w-40 h-40 md:w-48 md:h-48 relative">
              <img
                src="/textures/earthmap.jpg"
                alt="Planeta Tierra representando el conocimiento global"
                className="w-full h-full rounded-full shadow-2xl object-cover border-4 border-sky-400/30"
                loading="eager"
                onError={handleImageError}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400/20 to-blue-400/20 animate-pulse" />
            </div>
            
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full blur-sm opacity-60" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-400 rounded-full blur-sm opacity-60" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
            Plataforma Educativa
            <span className="block text-2xl md:text-3xl text-amber-300 mt-2">
              Colegio Mentes Creativas 🌟
            </span>
          </h1>
        </motion.div>

        {/* Descripción principal */}
        <motion.div variants={itemVariants} className="mb-12">
          <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed font-light max-w-3xl mx-auto">
            Bienvenido a un <span className="font-semibold text-amber-300">espacio de aprendizaje interactivo</span> 
            donde podrás explorar el universo, descubrir maravillas naturales y desarrollar 
            habilidades matemáticas a través de experiencias visuales inmersivas.
          </p>

          {/* Características destacadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-10">
            {[
              { 
                icon: "☀️", 
                title: "Sistema Solar", 
                desc: "Viaja por el cosmos",
                color: "from-yellow-500 to-orange-500"
              },
              { 
                icon: "🌍", 
                title: "Planeta Tierra", 
                desc: "Descubre nuestro hogar",
                color: "from-green-500 to-emerald-500"
              },
              { 
                icon: "🔷", 
                title: "Simetría", 
                desc: "Aprende patrones",
                color: "from-blue-500 to-indigo-500"
              }
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                className={`bg-gradient-to-br ${feature.color} p-0.5 rounded-2xl shadow-lg`}
              >
                <div className="bg-slate-900/90 rounded-2xl p-4 h-full backdrop-blur-sm">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="font-bold text-white text-lg mb-1">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Botones de navegación mejorados */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
        >
          {[
            { 
              to: "/sistemasolar", 
              label: "Explorar el Sistema Solar", 
              icon: "☀️",
              color: "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600",
              emoji: "🚀"
            },
            { 
              to: "/globo3D", 
              label: "Conocer la Tierra", 
              icon: "🌍",
              color: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
              emoji: "🗺️"
            },
            { 
              to: "/simetria", 
              label: "Aprender Simetría", 
              icon: "🔷",
              color: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
              emoji: "✨"
            }
          ].map((button) => (
            <motion.div
              key={button.to}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={button.to} className="block">
                <button 
                  className={`${button.color} text-white font-bold px-8 py-4 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 min-w-[200px] group`}
                >
                  <span className="text-lg">{button.icon}</span>
                  <span>{button.label}</span>
                  <span className="opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300">
                    {button.emoji}
                  </span>
                </button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Pie de página mejorado */}
        <motion.footer
          variants={itemVariants}
          className="border-t border-gray-700/50 pt-8 mt-8"
        >
          <p className="text-gray-400 text-sm mb-2">
            Proyecto pedagógico interdisciplinario
          </p>
          <p className="text-gray-500 text-xs">
            Colegio Mentes Creativas • Ciencias Sociales y Naturales • Matemáticas • {new Date().getFullYear()}
          </p>
        </motion.footer>
      </motion.div>
    </div>
  );
}