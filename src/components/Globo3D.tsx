import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ContinentInfo {
  name: string;
  area: string;
  population: string;
  position: THREE.Vector3;
}

export default function Globo3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
  const [hoveredContinent, setHoveredContinent] = useState<ContinentInfo | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  const continents: ContinentInfo[] = [
    { name: 'África', area: '30.3 millones km²', population: '1.400 millones', position: new THREE.Vector3(0.5, 0.2, 0.8) },
    { name: 'Asia', area: '44.6 millones km²', population: '4.600 millones', position: new THREE.Vector3(0.8, 0.3, 0.5) },
    { name: 'Europa', area: '10.2 millones km²', population: '750 millones', position: new THREE.Vector3(0.3, 0.5, 0.8) },
    { name: 'América del Norte', area: '24.7 millones km²', population: '580 millones', position: new THREE.Vector3(-0.8, 0.4, 0.4) },
    { name: 'América del Sur', area: '17.8 millones km²', population: '430 millones', position: new THREE.Vector3(-0.6, -0.3, 0.7) },
    { name: 'Oceanía', area: '8.6 millones km²', population: '45 millones', position: new THREE.Vector3(0.7, -0.4, -0.6) },
    { name: 'Antártida', area: '14.2 millones km²', population: '4.000 personas', position: new THREE.Vector3(0, -1, 0) }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear any existing content
    mountRef.current.innerHTML = '';

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000011, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Earth geometry and material
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create a simple earth-like texture using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    // Create gradient for earth-like appearance
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e40af'); // Ocean blue
    gradient.addColorStop(0.3, '#3b82f6'); // Lighter blue
    gradient.addColorStop(0.5, '#22c55e'); // Land green
    gradient.addColorStop(0.7, '#16a34a'); // Darker green
    gradient.addColorStop(1, '#15803d'); // Forest green
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some continent-like shapes
    context.fillStyle = '#22c55e';
    // Africa-like shape
    context.beginPath();
    context.ellipse(150, 120, 40, 60, 0, 0, 2 * Math.PI);
    context.fill();
    
    // Asia-like shape
    context.beginPath();
    context.ellipse(350, 80, 60, 40, 0, 0, 2 * Math.PI);
    context.fill();
    
    // Americas-like shape
    context.beginPath();
    context.ellipse(100, 180, 30, 80, 0, 0, 2 * Math.PI);
    context.fill();
    
    context.beginPath();
    context.ellipse(120, 200, 25, 50, 0, 0, 2 * Math.PI);
    context.fill();

    const texture = new THREE.CanvasTexture(canvas);
    
    const material = new THREE.MeshPhongMaterial({ 
      map: texture,
      shininess: 30
    });
    
    const earth = new THREE.Mesh(geometry, material);
    earth.castShadow = true;
    earth.receiveShadow = true;
    earthRef.current = earth;
    scene.add(earth);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Mouse move handler for continent detection
    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      setMousePosition({ x: event.clientX, y: event.clientY });
      
      let closestContinent = null;
      let minDistance = Infinity;
      
      continents.forEach(continent => {
        const screenPos = continent.position.clone().project(camera);
        const distance = Math.sqrt(
          Math.pow(screenPos.x - x, 2) + Math.pow(screenPos.y - y, 2)
        );
        
        if (distance < 0.3 && distance < minDistance) {
          minDistance = distance;
          closestContinent = continent;
        }
      });
      
      setHoveredContinent(closestContinent);
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Auto-rotate the earth slowly
      if (earthRef.current) {
        earthRef.current.rotation.y += 0.005;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Mark as loaded after a short delay to ensure everything is rendered
    setTimeout(() => setIsLoaded(true), 500);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      
      // Remove renderer's DOM element
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      setIsLoaded(false);
      
      controls.dispose();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, []);

  const resetView = () => {
    if (controlsRef.current && earthRef.current) {
      controlsRef.current.reset();
      earthRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button
          onClick={resetView}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 text-sm font-medium"
        >
          🌍 Volver a vista global
        </button>
        <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-xs">
          <p>🖱️ Click y arrastra para rotar</p>
          <p>🔍 Scroll para hacer zoom</p>
        </div>
      </div>

      {/* Educational Info Panel */}
      <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-xs">
        <h3 className="text-lg font-bold mb-2 text-blue-400">🌍 Explorador del Mundo</h3>
        <p className="text-sm mb-2">Descubre los continentes y aprende sobre nuestro planeta Tierra.</p>
        <div className="text-xs space-y-1">
          <p>📏 Superficie total: 510 millones km²</p>
          <p>👥 Población mundial: 8.000 millones</p>
          <p>🌊 Agua: 71% de la superficie</p>
        </div>
      </div>

      {/* Continent Tooltip */}
      {hoveredContinent && (
        <div 
          className="absolute z-20 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 shadow-lg pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 80,
            transform: 'translate(0, -100%)'
          }}
        >
          <h4 className="font-bold text-gray-800 text-sm">{hoveredContinent.name}</h4>
          <p className="text-xs text-gray-700 mt-1">
            <span className="font-medium">Superficie:</span> {hoveredContinent.area}
          </p>
          <p className="text-xs text-gray-700">
            <span className="font-medium">Población:</span> {hoveredContinent.population}
          </p>
        </div>
      )}

      {/* Three.js Mount Point - Only this should contain the 3D content */}
      <div 
        ref={mountRef} 
        className="w-full h-full rounded-lg overflow-hidden bg-transparent"
        style={{ 
          minHeight: '600px',
          position: 'relative'
        }}
      />
      
      {/* Loading indicator - only show when not loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
            Cargando el globo terráqueo...
          </div>
        </div>
      )}
    </div>
  );
}