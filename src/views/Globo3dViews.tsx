import { useState } from "react";
import Globo3D from "../components/Globo3D";

export default function Globo3dViews() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">🌍 Explorador del Mundo 3D</h1>
          <p className="text-blue-100 text-lg">
            Descubre nuestro planeta Tierra de forma interactiva. Aprende sobre los continentes, 
            océanos y características geográficas en esta experiencia educativa 3D diseñada 
            especialmente para estudiantes de 4° y 5° grado.
          </p>
        </div>
      </section>

      {/* Main 3D Globe Section */}
      <section className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              🌐 Globo Terráqueo Interactivo
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Explora el planeta Tierra con controles intuitivos. ¡Pasa el cursor sobre los continentes 
              para descubrir información fascinante!
            </p>
          </div>
          
          <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
            <Globo3D />
          </div>
        </div>
      </section>

      {/* Educational Information Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            📚 ¿Qué aprenderás hoy?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🌍 Continentes</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Descubre los 7 continentes del mundo, sus tamaños y poblaciones.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">🌊 Océanos</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Aprende sobre los 5 océanos que cubren el 71% de la superficie terrestre.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🗺️ Geografía</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Comprende cómo se distribuye la tierra y el agua en nuestro planeta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions Section */}
      <section className="bg-amber-50 dark:bg-amber-900 rounded-xl border border-amber-200 dark:border-amber-700">
        <div className="container mx-auto px-4 py-6">
          <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-4">
            🎮 ¿Cómo usar el explorador?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="flex items-center text-amber-700 dark:text-amber-300">
                <span className="mr-2">🖱️</span>
                <strong>Rotar:</strong> Click y arrastra con el mouse
              </p>
              <p className="flex items-center text-amber-700 dark:text-amber-300">
                <span className="mr-2">🔍</span>
                <strong>Zoom:</strong> Usa la rueda del mouse
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center text-amber-700 dark:text-amber-300">
                <span className="mr-2">👆</span>
                <strong>Continentes:</strong> Pasa el cursor para ver información
              </p>
              <p className="flex items-center text-amber-700 dark:text-amber-300">
                <span className="mr-2">🔄</span>
                <strong>Reiniciar:</strong> Usa el botón "Volver a vista global"
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}