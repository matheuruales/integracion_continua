import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaGlobe, FaLeaf, FaStar, FaTree, FaMountain } from "react-icons/fa";

interface SidebarItem {
  label: string;
  route: string;
  icon?: React.ReactNode;
}

const socialSciences: SidebarItem[] = [
  { label: "🌍 Globo 3D Mágico", route: "/globo3D", icon: <FaGlobe className="text-blue-500" /> },
];

const naturalSciences: SidebarItem[] = [
  { label: "🚀 Viaje Espacial", route: "/sistemasolar", icon: <FaStar className="text-yellow-400" /> },
];

export default function Sidebar() {
  const [openMain, setOpenMain] = useState(false);
  const [openExercises, setOpenExercises] = useState(false);

  const renderNavItem = ({ label, route, icon }: SidebarItem) => (
    <NavLink
      key={route}
      to={route}
      className={({ isActive }) =>
        `w-full text-left flex items-center gap-3 justify-between rounded-2xl px-4 py-3 my-1
         transition-all duration-300 transform hover:scale-105
         border-2 border-transparent
         ${isActive 
           ? "bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-lg border-yellow-300" 
           : "bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 text-slate-700 dark:text-slate-300 hover:border-green-300"}`
      }
    >
      <div className="flex items-center gap-3 text-lg">
        <span className="text-xl">{icon}</span> 
        <span className="font-semibold">{label}</span>
      </div>
      <span className="text-lg">✨</span>
    </NavLink>
  );

  return (
    <aside className="hidden md:block w-full md:w-[260px] border-r-4 border-yellow-200 dark:border-purple-500 
                     bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:to-purple-900 
                     shadow-xl">
      <div className="p-4 space-y-3">
        
        {/* Título divertido */}
        <div className="text-center mb-6 mt-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
            <FaMountain className="text-xl" />
            <h2 className="text-lg font-bold">Aventuras de Saber</h2>
            <FaTree className="text-xl" />
          </div>
        </div>

        {/* Acordeón Ciencias Sociales */}
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-2 shadow-md border-2 border-blue-200 dark:border-blue-700">
          <button
            onClick={() => setOpenMain(!openMain)}
            className="w-full text-left flex items-center justify-between rounded-xl px-4 py-3 
                       bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold
                       hover:from-blue-500 hover:to-purple-600 transition-all duration-300 
                       shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <FaGlobe className="text-xl" />
              <span className="text-lg">Mundo y Sociedad</span>
            </div>
            <span className="text-xl animate-bounce">{openMain ? "👆" : "👇"}</span>
          </button>
          {openMain && (
            <div className="mt-3 space-y-2 animate-slideDown">
              {socialSciences.map(renderNavItem)}
            </div>
          )}
        </div>

        {/* Acordeón Ciencias Naturales */}
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-2 shadow-md border-2 border-green-200 dark:border-green-700">
          <button
            onClick={() => setOpenExercises(!openExercises)}
            className="w-full text-left flex items-center justify-between rounded-xl px-4 py-3 
                       bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold
                       hover:from-green-500 hover:to-teal-600 transition-all duration-300 
                       shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <FaLeaf className="text-xl" />
              <span className="text-lg">Naturaleza y Ciencia</span>
            </div>
            <span className="text-xl animate-bounce">{openExercises ? "👆" : "👇"}</span>
          </button>
          {openExercises && (
            <div className="mt-3 space-y-2 animate-slideDown">
              {naturalSciences.map(renderNavItem)}
            </div>
          )}
        </div>

        {/* Mensaje divertido */}
        <div className="text-center mt-6 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl border-2 border-dashed border-yellow-400">
          <p className="text-sm text-slate-700 dark:text-yellow-200 font-medium">
            🎯 ¡Descubre y aprende jugando!
          </p>
        </div>

      </div>

    </aside>
  );
}