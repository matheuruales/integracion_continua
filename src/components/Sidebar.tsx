import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaGlobe, FaCalculator, FaRuler, FaKey, FaMouse, FaList } from "react-icons/fa";

interface SidebarItem {
  label: string;
  route: string;
  icon?: React.ReactNode;
}

const socialSciences: SidebarItem[] = [
  { label: "Globo3D", route: "/globo3D", icon: <FaGlobe /> },
];

const exerciseItems: SidebarItem[] = [
  { label: "Tablas de Multiplicar", route: "/tablasmul", icon: <FaCalculator /> },
  { label: "Conversor de Unidades", route: "/conversorunid", icon: <FaRuler /> },
  { label: "Validadador de Contraseñas", route: "/validcontrasena", icon: <FaKey /> },
  { label: "Contador de Clics con Almacenamiento", route: "/contadorclics", icon: <FaMouse /> },
  { label: "Lista de Tareas", route: "/listareas", icon: <FaList /> },
];

export default function Sidebar() {
  const [openMain, setOpenMain] = useState(false);
  const [openExercises, setOpenExercises] = useState(false);

  const renderNavItem = ({ label, route, icon }: SidebarItem) => (
    <NavLink
      key={route}
      to={route}
      className={({ isActive }) =>
        `w-full text-left flex items-center gap-2 justify-between rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 
         hover:bg-slate-50 dark:hover:bg-slate-800 
         ${isActive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : ""}`
      }
    >
      <div className="flex items-center gap-2">{icon} {label}</div>
    </NavLink>
  );

  return (
    <aside className="hidden md:block w-full md:w-[240px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="p-3 space-y-1">

        {/* Acordeón Ciencias Naturales */}
        <button
          onClick={() => setOpenMain(!openMain)}
          className="w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 
                     hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
        >
          Ciencias Sociales
          <span>{openMain ? "▲" : "▼"}</span>
        </button>
        {openMain && <div className="pl-4 space-y-1">{socialSciences.map(renderNavItem)}</div>}

        {/* Acordeón Exercises */}
        <button
          onClick={() => setOpenExercises(!openExercises)}
          className="w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 
                     hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
        >
          Ejercicios - Jtest
          <span>{openExercises ? "▲" : "▼"}</span>
        </button>
        {openExercises && <div className="pl-4 space-y-1">{exerciseItems.map(renderNavItem)}</div>}

      </div>
    </aside>
  );
}
