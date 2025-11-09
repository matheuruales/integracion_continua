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

const planetData: Record<string, PlanetInfo> = {
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

// Texturas locales recomendadas en /public/textures/planets
const planetTextures: Record<string, string> = {
  mercury: '/textures/planets/mercury.jpg',
  venus: '/textures/planets/venus.jpg',
  earth: '/textures/planets/earth.jpg',
  mars: '/textures/planets/mars.jpg',
  jupiter: '/textures/planets/jupiter.jpg',
  saturn: '/textures/planets/saturn.jpg',
  uranus: '/textures/planets/uranus.jpg',
  neptune: '/textures/planets/neptune.jpg'
};

export default function SistemaSolar() {
  const mountRef = useRef<HTMLDivElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const planetMeshesRef = useRef<THREE.Mesh[]>([]);
  const planetGroupsRef = useRef<THREE.Group[]>([]);
  const animationIdRef = useRef<number | null>(null);

  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const [selectedPlanet, setSelectedPlanet] = useState<PlanetInfo | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    mountRef.current.innerHTML = '';
    planetMeshesRef.current = [];
    planetGroupsRef.current = [];
    animationIdRef.current = null;

    // Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    scene.fog = new THREE.Fog(0x000011, 50, 300);
    sceneRef.current = scene;

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      (mountRef.current.clientWidth || window.innerWidth) /
        (mountRef.current.clientHeight || window.innerHeight),
      0.1,
      1000
    );
    camera.position.set(0, 30, 80);
    cameraRef.current = camera;

    // Renderer (+50% brillo con exposición)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const mount = mountRef.current;
    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.domElement.style.display = 'block';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5; // << +50%
    rendererRef.current = renderer;
    renderer.domElement.setAttribute('data-testid', 'solarsystem-canvas');
    mount.appendChild(renderer.domElement);

    // Controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 250;
    controls.maxPolarAngle = Math.PI * 0.9;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // Luces (+50% intensidades)
    scene.add(new THREE.AmbientLight(0x404040, 0.375));
    const sunLight = new THREE.PointLight(0xffffee, 4.5, 500, 2);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.75);
    fillLight.position.set(10, 10, 5);
    scene.add(fillLight);

    // Sol
    const sunGeometry = new THREE.SphereGeometry(4, 64, 64);
    const sunMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 1.5, // +50%
      roughness: 0.8,
      metalness: 0.2
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Glow del sol
    const sunGlowGeometry = new THREE.SphereGeometry(4.5, 32, 32);
    const sunGlowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0xffff00) },
        viewVector: { value: camera.position.clone() }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, 1.0);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    sun.add(sunGlow);

    // Configs planetarias
    const planetConfigs = [
      { name: 'mercury', radius: 0.4, distance: 8, speed: 0.04, rotationSpeed: 0.01 },
      { name: 'venus', radius: 0.7, distance: 12, speed: 0.015, rotationSpeed: 0.005 },
      { name: 'earth', radius: 0.8, distance: 16, speed: 0.01, rotationSpeed: 0.015 },
      { name: 'mars', radius: 0.6, distance: 20, speed: 0.008, rotationSpeed: 0.012 },
      { name: 'jupiter', radius: 2.2, distance: 28, speed: 0.004, rotationSpeed: 0.02 },
      { name: 'saturn', radius: 1.8, distance: 36, speed: 0.003, rotationSpeed: 0.018 },
      { name: 'uranus', radius: 1.2, distance: 44, speed: 0.002, rotationSpeed: 0.01 },
      { name: 'neptune', radius: 1.1, distance: 52, speed: 0.001, rotationSpeed: 0.012 }
    ] as const;

    // Loading Manager
    let finalized = false;
    const manager = new THREE.LoadingManager();
    manager.onProgress = (_url, loaded, total) => {
      setLoadingProgress(Math.round((loaded / total) * 100));
    };
    const finalizeLoading = () => {
      if (finalized) return;
      finalized = true;
      setIsLoaded(true);
    };
    manager.onLoad = () => finalizeLoading();

    const textureLoader = new THREE.TextureLoader(manager);

    // Colores fallback
    const fallbackColors: Record<string, number> = {
      mercury: 0x8c7853,
      venus: 0xffc649,
      earth: 0x6b93d6,
      mars: 0xcd5c5c,
      jupiter: 0xd8ca9d,
      saturn: 0xfad5a5,
      uranus: 0x4fd0e7,
      neptune: 0x4b70dd
    };

    // Crear planetas
    const ringMeshes: THREE.Mesh[] = [];
    const createPlanets = () => {
      planetConfigs.forEach((cfg) => {
        const group = new THREE.Group();
        scene.add(group);
        planetGroupsRef.current.push(group);

        const geometry = new THREE.SphereGeometry(cfg.radius, 64, 64);
        const material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.75,
          metalness: 0.12,
          emissive: 0x222222,
          emissiveIntensity: 0.5
        });

        const url = planetTextures[cfg.name] || '';
        if (url) {
          textureLoader.load(
            url,
            (tex) => {
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
              material.map = tex;
              material.needsUpdate = true;
            },
            undefined,
            () => {
              material.color = new THREE.Color(fallbackColors[cfg.name]);
            }
          );
        } else {
          material.color = new THREE.Color(fallbackColors[cfg.name]);
        }

        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = cfg.distance; // el planeta orbita al rotar el grupo
        planet.castShadow = true;
        planet.receiveShadow = true;
        (planet.userData as any) = { name: cfg.name, config: cfg, originalPosition: planet.position.clone() };
        group.add(planet);
        planetMeshesRef.current.push(planet);

        // Órbita visual
        const orbitGeo = new THREE.RingGeometry(cfg.distance - 0.1, cfg.distance + 0.1, 128);
        const orbitMat = new THREE.MeshBasicMaterial({
          color: 0x7777aa,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.3
        });
        const orbit = new THREE.Mesh(orbitGeo, orbitMat);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
        ringMeshes.push(orbit);

        // === Anillos de Saturno (AHORA SÍ, ALREDEDOR DEL PLANETA) ===
        if (cfg.name === 'saturn') {
          // Creamos los anillos como hijo directo del mesh de Saturno
          // Radios relativos al radio del planeta para que se vean proporcionales
          const inner = cfg.radius * 1.6; // interior ~1.6x el radio del planeta
          const outer = cfg.radius * 2.8; // exterior ~2.8x el radio del planeta
          const saturnRingsGeo = new THREE.RingGeometry(inner, outer, 256);

          // Textura opcional para anillos (si tienes /public/textures/planets/saturn_rings.png)
          const ringsMat = new THREE.MeshStandardMaterial({
            color: 0xfad5a5,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            roughness: 0.75,
            metalness: 0.12,
            emissive: 0x111111,
            emissiveIntensity: 0.4
          });

          const saturnRings = new THREE.Mesh(saturnRingsGeo, ringsMat);
          saturnRings.rotation.x = Math.PI / 2;      // plano de los anillos
          saturnRings.rotation.z = THREE.MathUtils.degToRad(26.7); // inclinación realista
          saturnRings.position.set(0, 0, 0);         // centrado en el planeta
          planet.add(saturnRings);
        }
      });
    };

    createPlanets();

    // Safety finalize por si alguna textura falla y no dispara onLoad
    const safetyTimeout = setTimeout(() => finalizeLoading(), 6000);

    // Interacción: click
    const handleClick = (event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      const intersects = raycasterRef.current.intersectObjects(planetMeshesRef.current);
      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Mesh;
        const planetName = (obj.userData as any).name as string;
        const info = planetData[planetName];
        if (info) {
          setSelectedPlanet(info);
          setShowInfo(true);
          obj.scale.set(1.2, 1.2, 1.2);
          setTimeout(() => obj.scale.set(1, 1, 1), 250);
        }
      } else {
        setShowInfo(false);
        setSelectedPlanet(null);
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // Animación
    const clock = new THREE.Clock();
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      planetGroupsRef.current.forEach((group, i) => {
        const cfg = planetConfigs[i];
        group.rotation.y += cfg.speed * delta * 10;
      });

      planetMeshesRef.current.forEach((mesh, i) => {
        const cfg = planetConfigs[i];
        mesh.rotation.y += cfg.rotationSpeed * delta * 10;
      });

      const t = clock.getElapsedTime();
      sunGlow.scale.setScalar(1 + Math.sin(t * 2) * 0.05);

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current || !mountRef.current) return;
      const w2 = mountRef.current.clientWidth || window.innerWidth;
      const h2 = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w2, h2);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Cleanup
    return () => {
      clearTimeout(safetyTimeout);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);

      controls.dispose();
      renderer.dispose();
      scene.clear();

      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }

      setIsLoaded(false);
      setLoadingProgress(0);
    };
  }, []);

  const resetView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 30, 80);
      controlsRef.current.reset();
    }
    setShowInfo(false);
    setSelectedPlanet(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Panel */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.85)',
          color: '#fff',
          padding: 20,
          borderRadius: 15,
          maxWidth: 320,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <h2 style={{ margin: '0 0 10px', fontSize: 18, color: '#ffff00' }}>🌟 Sistema Solar</h2>
        <p style={{ margin: '0 0 15px', fontSize: 14, opacity: 0.8 }}>
          Haz clic en un planeta para ver su información.
        </p>
        <button
          onClick={resetView}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '12px 15px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            width: '100%',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
        >
          🔄 Reiniciar Vista
        </button>
      </div>

      {/* Info planeta */}
      {showInfo && selectedPlanet && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.92)',
            color: 'white',
            padding: 25,
            borderRadius: 15,
            maxWidth: 350,
            border: '2px solid #4CAF50',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(76,175,80,0.3)'
          }}
        >
          <h3
            style={{
              margin: '0 0 15px',
              fontSize: 22,
              color: '#4CAF50',
              borderBottom: '2px solid #4CAF50',
              paddingBottom: 8
            }}
          >
            🪐 {selectedPlanet.name}
          </h3>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>
            <p><strong>🌞 Distancia al Sol:</strong> {selectedPlanet.distanceFromSun}</p>
            <p><strong>📏 Diámetro:</strong> {selectedPlanet.diameter}</p>
            <p><strong>🕐 Período orbital:</strong> {selectedPlanet.orbitalPeriod}</p>
            <p
              style={{
                marginTop: 15,
                padding: 10,
                backgroundColor: 'rgba(76,175,80,0.1)',
                borderRadius: 8,
                borderLeft: '3px solid #4CAF50'
              }}
            >
              {selectedPlanet.description}
            </p>
          </div>
          <button
            onClick={() => setShowInfo(false)}
            style={{
              position: 'absolute',
              top: 10,
              right: 15,
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              width: 30,
              height: 30,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            ×
          </button>
        </div>
      )}

      {/* Loader */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200,
            color: 'white',
            fontSize: 18,
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 30,
            borderRadius: 15,
            backdropFilter: 'blur(10px)',
            minWidth: 300
          }}
        >
          <div
            style={{
              border: '4px solid rgba(255,255,255,0.3)',
              borderTop: '4px solid #4CAF50',
              borderRadius: '50%',
              width: 50,
              height: 50,
              animation: 'spin 1s linear infinite',
              margin: '0 auto 15px'
            }}
          />
          Cargando sistema solar...
          <p style={{ fontSize: 14, opacity: 0.7, marginTop: 10 }}>
            Descargando texturas: {loadingProgress}%
          </p>
          <div
            style={{
              width: '100%',
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 4,
              marginTop: 10,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${loadingProgress}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                transition: 'width 0.3s ease',
                borderRadius: 4
              }}
            />
          </div>
        </div>
      )}

      {/* Mount */}
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

      {/* CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}
