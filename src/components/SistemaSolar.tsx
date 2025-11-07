import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface PlanetInfo {
  name: string;
  distanceFromSun: string;
  diameter: string;
  orbitalPeriod: string;
  description: string;
}

const planetData: { [key: string]: PlanetInfo } = {
  mercury: {
    name: 'Mercurio',
    distanceFromSun: '57.9 millones km',
    diameter: '4,879 km',
    orbitalPeriod: '88 días',
    description: 'El planeta más cercano al Sol y el más pequeño del sistema solar.'
  },
  venus: {
    name: 'Venus',
    distanceFromSun: '108.2 millones km',
    diameter: '12,104 km',
    orbitalPeriod: '225 días',
    description: 'El planeta más caliente del sistema solar debido a su efecto invernadero.'
  },
  earth: {
    name: 'Tierra',
    distanceFromSun: '149.6 millones km',
    diameter: '12,756 km',
    orbitalPeriod: '365 días',
    description: 'Nuestro planeta, el único conocido que alberga vida.'
  },
  mars: {
    name: 'Marte',
    distanceFromSun: '227.9 millones km',
    diameter: '6,792 km',
    orbitalPeriod: '687 días',
    description: 'El planeta rojo, conocido por sus casquetes polares y posibilidad de agua.'
  },
  jupiter: {
    name: 'Júpiter',
    distanceFromSun: '778.5 millones km',
    diameter: '142,984 km',
    orbitalPeriod: '12 años',
    description: 'El planeta más grande del sistema solar, una gigante gaseoso.'
  },
  saturn: {
    name: 'Saturno',
    distanceFromSun: '1,434 millones km',
    diameter: '120,536 km',
    orbitalPeriod: '29 años',
    description: 'Famoso por sus anillos espectaculares, compuestos de hielo y roca.'
  },
  uranus: {
    name: 'Urano',
    distanceFromSun: '2,871 millones km',
    diameter: '51,118 km',
    orbitalPeriod: '84 años',
    description: 'Un gigante helado que gira de lado, con anillos tenues.'
  },
  neptune: {
    name: 'Neptuno',
    distanceFromSun: '4,495 millones km',
    diameter: '49,528 km',
    orbitalPeriod: '165 años',
    description: 'El planeta más lejano, conocido por sus vientos más rápidos del sistema solar.'
  }
};

export default function SistemaSolar() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetsRef = useRef<THREE.Mesh[]>([]);
  const planetGroupsRef = useRef<THREE.Group[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const [selectedPlanet, setSelectedPlanet] = useState<PlanetInfo | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Limpiar contenido existente
    mountRef.current.innerHTML = '';

    // Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    sceneRef.current = scene;

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 50);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 200;
    controlsRef.current = controls;

    // Luces
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 2, 0, 2);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Crear Sol
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Datos de planetas [radio, distancia, velocidad orbital, color]
    const planetConfigs = [
      { name: 'mercury', radius: 0.4, distance: 8, speed: 0.04, color: 0x8c7853 },
      { name: 'venus', radius: 0.7, distance: 12, speed: 0.03, color: 0xffc649 },
      { name: 'earth', radius: 0.8, distance: 16, speed: 0.02, color: 0x6b93d6 },
      { name: 'mars', radius: 0.6, distance: 20, speed: 0.015, color: 0xcd5c5c },
      { name: 'jupiter', radius: 2.2, distance: 28, speed: 0.008, color: 0xd8ca9d },
      { name: 'saturn', radius: 1.8, distance: 36, speed: 0.006, color: 0xfad5a5 },
      { name: 'uranus', radius: 1.2, distance: 44, speed: 0.004, color: 0x4fd0e7 },
      { name: 'neptune', radius: 1.1, distance: 52, speed: 0.003, color: 0x4b70dd }
    ];

    // Crear planetas
    planetConfigs.forEach((config) => {
      // Grupo para el planeta y su órbita
      const planetGroup = new THREE.Group();
      scene.add(planetGroup);
      planetGroupsRef.current.push(planetGroup);

      // Geometría y material del planeta
      const geometry = new THREE.SphereGeometry(config.radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: config.color,
        shininess: 30
      });
      
      const planet = new THREE.Mesh(geometry, material);
      planet.position.x = config.distance;
      planet.castShadow = true;
      planet.receiveShadow = true;
      planet.userData = { name: config.name, config };
      
      planetGroup.add(planet);
      planetsRef.current.push(planet);

      // Crear órbita visible
      const orbitGeometry = new THREE.RingGeometry(config.distance - 0.1, config.distance + 0.1, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x444444, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);
    });

    // Evento de clic para seleccionar planetas
    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(planetsRef.current);

      if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        const planetName = clickedPlanet.userData.name;
        if (planetData[planetName]) {
          setSelectedPlanet(planetData[planetName]);
          setShowInfo(true);
        }
      } else {
        setShowInfo(false);
        setSelectedPlanet(null);
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // Animación
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Rotar planetas alrededor del sol
      planetGroupsRef.current.forEach((group, index) => {
        const config = planetConfigs[index];
        group.rotation.y += config.speed;
      });

      // Rotar planetas sobre su propio eje
      planetsRef.current.forEach((planet) => {
        planet.rotation.y += 0.01;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    // Handler de redimensionamiento
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Iniciar animación con delay para asegurar carga
    setTimeout(() => {
      animate();
      setIsLoaded(true);
    }, 500);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      
      if (mountRef.current && renderer.domElement) {
        if (renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      
      // Limpiar recursos de Three.js
      scene.clear();
      renderer.dispose();
      controls.dispose();
      
      setIsLoaded(false);
    };
  }, []);

  const resetView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 20, 50);
      controlsRef.current.reset();
    }
    setShowInfo(false);
    setSelectedPlanet(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Panel de control */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '300px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>🌟 Sistema Solar Interactivo</h2>
        <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
          Explora nuestro sistema solar. Haz clic en los planetas para aprender más sobre ellos.
        </p>
        <button
          onClick={resetView}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            width: '100%'
          }}
        >
          🔄 Volver al Sistema Solar completo
        </button>
      </div>

      {/* Información del planeta seleccionado */}
      {showInfo && selectedPlanet && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '300px',
          border: '2px solid #4CAF50'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#4CAF50' }}>
            {selectedPlanet.name}
          </h3>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <p><strong>Distancia al Sol:</strong> {selectedPlanet.distanceFromSun}</p>
            <p><strong>Diámetro:</strong> {selectedPlanet.diameter}</p>
            <p><strong>Período orbital:</strong> {selectedPlanet.orbitalPeriod}</p>
            <p style={{ marginTop: '10px' }}>{selectedPlanet.description}</p>
          </div>
          <button
            onClick={() => setShowInfo(false)}
            style={{
              position: 'absolute',
              top: '5px',
              right: '10px',
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Instrucciones de control */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0 0 5px 0' }}><strong>🎮 Controles:</strong></p>
        <p style={{ margin: '0' }}>• Arrastra para rotar la cámara</p>
        <p style={{ margin: '0' }}>• Scroll para hacer zoom</p>
        <p style={{ margin: '0' }}>• Haz clic en un planeta para ver su información</p>
      </div>

      {/* Indicador de carga */}
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 200,
          color: 'white',
          fontSize: '18px',
          textAlign: 'center'
        }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4CAF50',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px'
          }} />
          Cargando el sistema solar...
        </div>
      )}

      {/* Mount point de Three.js */}
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'transparent'
        }} 
      />

      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
