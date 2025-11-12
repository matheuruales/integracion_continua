import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type ShapeType = 'Cube' | 'Sphere' | 'Pyramid' | 'Prism' | 'Cylinder' | 'Dodecahedron' | 'Torus' | 'Mobius';

type ShapeDetail = {
  title: string;
  description: string;
  examples: string;
  fact: string;
  emoji: string;
  accent: string;
};

const SHAPE_DETAILS: Record<ShapeType, ShapeDetail> = {
  Cube: {
    title: 'Cubo Inventor',
    description: 'La figura perfecta para construir dados, cajas y edificios futuristas con líneas definidas.',
    examples: 'Dados, cubos de Rubik, bloques de construcción',
    fact: 'Sus 6 caras gemelas permiten apilarlo con facilidad en cualquier dirección.',
    emoji: '🔷',
    accent: '#60a5fa'
  },
  Sphere: {
    title: 'Esfera Galáctica',
    description: 'Super suave y aerodinámica, ideal para planetas, burbujas y mundos flotantes.',
    examples: 'Planetas, pelotas deportivas, gotas de agua',
    fact: 'Cada punto de la superficie está a la misma distancia del centro, por eso rueda tan bien.',
    emoji: '🌐',
    accent: '#a855f7'
  },
  Pyramid: {
    title: 'Pirámide Ancestral',
    description: 'Estable y elegante, perfecta para construir templos o esculturas con energía misteriosa.',
    examples: 'Pirámides egipcias, kioscos modernos, cristales',
    fact: 'Con una base cuadrada y un ápice puntiagudo, concentra la fuerza en la cima.',
    emoji: '🛕',
    accent: '#f97316'
  },
  Prism: {
    title: 'Prisma Creativo',
    description: 'Gran compañero para dividir la luz y crear estructuras dinámicas y futuristas.',
    examples: 'Prismas de luz, refugios minimalistas, esculturas',
    fact: 'Sus caras rectangulares conectan dos triángulos gemelos, creando volumen con pocos vértices.',
    emoji: '🔺',
    accent: '#10b981'
  },
  Cylinder: {
    title: 'Cilindro Futurista',
    description: 'Combina círculos y rectas, ideal para cohetes, columnas y robots simpáticos.',
    examples: 'Latas, torres, motores, columnas',
    fact: 'Si cortas el cilindro a lo largo obtienes un rectángulo perfecto: magia geométrica.',
    emoji: '🛸',
    accent: '#f472b6'
  }
  ,
  Dodecahedron: {
    title: 'Dodecaedro Místico',
    description: 'Una figura platónica con caras pentagonales — elegante y compleja, perfecta para arte y puzzles.',
    examples: 'Cristales geométricos, rompecabezas, diseños ornamentales',
    fact: 'Tiene 12 caras pentagonales, 20 vértices y 30 aristas; su simetría inspira arquitectura y diseño.',
    emoji: '🔷',
    accent: '#8b5cf6'
  }
  ,
  Torus: {
    title: 'Torus Hipnótico',
    description: 'Un anillo perfecto: ideal para simulaciones, anillos y geometría topológica divertida.',
    examples: 'Anillos, neumáticos, diseños procedurales',
    fact: 'Un torus es una superficie con un agujero; su volumen depende del radio mayor y menor.',
    emoji: '⭕',
    accent: '#06b6d4'
  }
  ,
  Mobius: {
    title: 'Mobius Enigmático',
    description: 'Una tira con una sola cara y un solo borde — perfecta para demostraciones topológicas y arte cinético.',
    examples: 'Esculturas, demostraciones matemáticas, efectos visuales',
    fact: 'El anillo de Möbius es una superficie no orientable con sólo un lado; no contiene un volumen bien definido.',
    emoji: '➰',
    accent: '#f59e0b'
  }
};

const DEFAULT_COLOR = '#60a5fa';
const DEFAULT_SCALE = 1;

// Small helper: compute simple topology numbers and approximate volume
function getShapeInfo(type: ShapeType, size: number) {
  // size refers to a base sizing unit (e.g. cube side, sphere radius, etc.)
  switch (type) {
    case 'Cube': {
      const side = size;
      return {
        faces: 6,
        vertices: 8,
        edges: 12,
        volume: side * side * side
      };
    }
    case 'Sphere': {
      const r = size;
      return {
        faces: 0, // not meaningful for smooth sphere
        vertices: 0,
        edges: 0,
        volume: (4 / 3) * Math.PI * Math.pow(r, 3)
      };
    }
    case 'Pyramid': {
      // we'll use a square pyramid: base side = size, height = size
      const base = size;
      const height = size;
      return {
        faces: 5,
        vertices: 5,
        edges: 8,
        volume: (1 / 3) * base * base * height
      };
    }
    case 'Prism': {
      // triangular prism: equilateral triangle base side = size, height = size
      const a = size;
      const baseArea = (Math.sqrt(3) / 4) * a * a;
      const height = size;
      return {
        faces: 5,
        vertices: 6,
        edges: 9,
        volume: baseArea * height
      };
    }
    case 'Cylinder': {
      const r = size;
      const h = size * 1.5;
      return {
        faces: 3, // top, bottom, side (conceptual)
        vertices: 0,
        edges: 2,
        volume: Math.PI * r * r * h
      };
    }
    case 'Dodecahedron': {
      // assume `size` as a base scale for the geometry (approximate side-related volume)
      // exact volume for a regular dodecahedron with side length a is ((15+7*sqrt(5))/4) * a^3
      const a = size;
      const coeff = (15 + 7 * Math.sqrt(5)) / 4; // ≈ 7.66311896
      return {
        faces: 12,
        vertices: 20,
        edges: 30,
        volume: coeff * Math.pow(a, 3)
      };
    }
    case 'Torus': {
      // approximate using major radius R = size and minor radius r = size * 0.35
      const R = size;
      const r = size * 0.35;
      // Volume of torus: V = 2 * pi^2 * R * r^2
      const volume = 2 * Math.PI * Math.PI * R * r * r;
      return {
        faces: 0,
        vertices: 0,
        edges: 0,
        volume
      };
    }
    case 'Mobius': {
      // Mobius has no well-defined faces/vertices in this UI context — present conceptual info
      return {
        faces: 0,
        vertices: 0,
        edges: 1,
        volume: 0
      };
    }
    default:
      return { faces: 0, vertices: 0, edges: 0, volume: 0 };
  }
}

export default function GeometryExplorer() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const [shape, setShape] = useState<ShapeType>('Cube');
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [scale, setScale] = useState<number>(DEFAULT_SCALE);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Exposed UI-friendly info for tests/labels
  const info = getShapeInfo(shape, 1 * scale);

  // Parametric Mobius strip generator returning a BufferGeometry.
  // If `thickness` > 0 it produces a thickened band (3D solid-like) by offsetting along normals
  function createMobiusGeometry(segmentsU = 128, segmentsV = 24, radius = 0.9, width = 0.25, thickness = 0.08) {
    const uCount = segmentsU + 1;
    const vCount = segmentsV + 1;

    // Build center surface positions and indices
    const centerPositions = new Float32Array(uCount * vCount * 3);
    const uStep = (Math.PI * 2) / segmentsU;
    const vMin = -width;
    const vMax = width;
    let idx = 0;

    for (let i = 0; i < uCount; i++) {
      const u = i * uStep;
      const cu = Math.cos(u);
      const su = Math.sin(u);
      const halfu = u / 2;
      const chu = Math.cos(halfu);
      const shu = Math.sin(halfu);

      for (let j = 0; j < vCount; j++) {
        const v = vMin + (j / segmentsV) * (vMax - vMin);
        const x = (radius + v * chu) * cu;
        const y = (radius + v * chu) * su;
        const z = v * shu;

        centerPositions[idx * 3 + 0] = x;
        centerPositions[idx * 3 + 1] = y;
        centerPositions[idx * 3 + 2] = z;
        idx++;
      }
    }

    const centerIndices: number[] = [];
    for (let i = 0; i < segmentsU; i++) {
      for (let j = 0; j < segmentsV; j++) {
        const a = i * vCount + j;
        const b = (i + 1) * vCount + j;
        const c = (i + 1) * vCount + (j + 1);
        const d = i * vCount + (j + 1);
        centerIndices.push(a, b, d);
        centerIndices.push(b, c, d);
      }
    }

    // If no thickness requested, return a simple surface geometry
    if (!thickness || thickness <= 0) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(centerPositions, 3));
      geom.setIndex(new THREE.BufferAttribute(new (Uint32Array as any)(centerIndices), 1));
      geom.computeVertexNormals();
      return geom;
    }

    // Create temporary geometry to compute normals
    const tmp = new THREE.BufferGeometry();
    tmp.setAttribute('position', new THREE.BufferAttribute(centerPositions.slice(), 3));
    tmp.setIndex(new THREE.BufferAttribute(new (Uint32Array as any)(centerIndices.slice()), 1));
    tmp.computeVertexNormals();
    const tmpNormals = (tmp.getAttribute('normal') as THREE.BufferAttribute).array as Float32Array;

    // Build thick geometry: two layers offset along normals
    const nVertices = uCount * vCount;
    const positions = new Float32Array(nVertices * 2 * 3);
    const normals = new Float32Array(nVertices * 2 * 3);
    const half = thickness / 2;

    for (let i = 0; i < nVertices; i++) {
      const cx = centerPositions[i * 3 + 0];
      const cy = centerPositions[i * 3 + 1];
      const cz = centerPositions[i * 3 + 2];
      const nx = tmpNormals[i * 3 + 0] || 0;
      const ny = tmpNormals[i * 3 + 1] || 0;
      const nz = tmpNormals[i * 3 + 2] || 0;

      // outer vertex (along normal)
      positions[i * 3 + 0] = cx + nx * half;
      positions[i * 3 + 1] = cy + ny * half;
      positions[i * 3 + 2] = cz + nz * half;
      normals[i * 3 + 0] = nx;
      normals[i * 3 + 1] = ny;
      normals[i * 3 + 2] = nz;

      // inner vertex (opposite normal)
      const offset = nVertices * 3 + i * 3;
      positions[offset + 0] = cx - nx * half;
      positions[offset + 1] = cy - ny * half;
      positions[offset + 2] = cz - nz * half;
      normals[offset + 0] = -nx;
      normals[offset + 1] = -ny;
      normals[offset + 2] = -nz;
    }

    // Build indices: outer surface, inner surface (reversed), and side faces along v boundaries
    const indices: number[] = [];

    // outer surface: same as centerIndices
    indices.push(...centerIndices);

    // inner surface: same triangles but offset and reversed winding
    for (let k = 0; k < centerIndices.length; k += 3) {
      const a = centerIndices[k] + nVertices;
      const b = centerIndices[k + 1] + nVertices;
      const c = centerIndices[k + 2] + nVertices;
      // reverse winding
      indices.push(a, c, b);
    }

    // side faces along v = 0 and v = segmentsV (j = 0 and j = vCount-1)
    for (let i = 0; i < segmentsU; i++) {
      const iNext = i + 1;
      // v = 0 edge
      const a = i * vCount + 0;
      const b = iNext * vCount + 0;
      indices.push(a, b, b + nVertices);
      indices.push(a, b + nVertices, a + nVertices);

      // v = segmentsV edge
      const c = i * vCount + (vCount - 1);
      const d = iNext * vCount + (vCount - 1);
      indices.push(d, c, c + nVertices);
      indices.push(d, c + nVertices, d + nVertices);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geom.setIndex(new THREE.BufferAttribute(new (Uint32Array as any)(indices), 1));
    geom.computeVertexNormals();
    return geom;
  }

  // Create or update mesh whenever shape/color/scale change
  useEffect(() => {
    if (!mountRef.current) return;

    // Basic three setup on first mount
    const mount = mountRef.current;
    mount.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    renderer.domElement.setAttribute('data-testid', 'geometry-canvas');
    mount.appendChild(renderer.domElement);

    // Enhanced lighting
    const ambient = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambient);
    
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dir1.position.set(5, 10, 7.5);
    dir1.castShadow = true;
    dir1.shadow.mapSize.width = 2048;
    dir1.shadow.mapSize.height = 2048;
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x6688ff, 0.3);
    dir2.position.set(-5, -5, -5);
    scene.add(dir2);

    // Add subtle point lights for better depth
    const pointLight1 = new THREE.PointLight(0x4466ff, 0.4, 20);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff4466, 0.2, 20);
    pointLight2.position.set(-3, -3, -3);
    scene.add(pointLight2);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    // Create initial mesh
    const material = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color), 
      roughness: 0.3,
      metalness: 0.2,
      emissive: new THREE.Color(color).multiplyScalar(0.1)
    });

    function makeGeometry(t: ShapeType) {
      switch (t) {
        case 'Cube':
          return new THREE.BoxGeometry(1, 1, 1);
        case 'Sphere':
          return new THREE.SphereGeometry(0.9, 32, 24);
        case 'Pyramid':
          return new THREE.ConeGeometry(1, 1.2, 4);
        case 'Dodecahedron':
          // use a radius that visually matches other shapes
          return new (THREE as any).DodecahedronGeometry(0.9);
        case 'Torus':
          // major radius 0.9, tube radius 0.3 to match visual scale
          return new (THREE as any).TorusGeometry(0.9, 0.3, 24, 64);
        case 'Mobius':
          return createMobiusGeometry(128, 24, 0.9, 0.25);
        case 'Prism': {
          const geom = new THREE.BufferGeometry();
          const a = 0.9;
          const vertices = new Float32Array([
            -a / 2, -0.4, -0.5,
            a / 2, -0.4, -0.5,
            0, -0.4, 0.5,
            -a / 2, 0.4, -0.5,
            a / 2, 0.4, -0.5,
            0, 0.4, 0.5
          ]);
          const indices = new Uint16Array([
            0, 1, 2,
            3, 5, 4,
            0, 3, 1, 3, 4, 1,
            1, 4, 2, 4, 5, 2,
            2, 5, 0, 5, 3, 0
          ]);
          geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          geom.setIndex(new THREE.BufferAttribute(indices, 1));
          geom.computeVertexNormals();
          return geom;
        }
        case 'Cylinder':
          return new THREE.CylinderGeometry(0.6, 0.6, 1.4, 32);
        default:
          return new THREE.BoxGeometry(1, 1, 1);
      }
    }

    // Parametric Mobius strip generator returning a BufferGeometry
    // (moved to component scope)

    const geometry = makeGeometry(shape);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.scale.setScalar(scale);
    meshRef.current = mesh;
    scene.add(mesh);

    // Enhanced ground plane with gradient
    const planeGeo = new THREE.PlaneGeometry(8, 8);
    const planeMat = new THREE.ShadowMaterial({ 
      opacity: 0.15,
      transparent: true
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;
    scene.add(plane);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (meshRef.current) {
        if (autoRotate && controlsRef.current) {
          meshRef.current.rotation.y += 0.01;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    setIsLoaded(true);

    // Resize handling
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || 800;
      const h = mountRef.current.clientHeight || 600;
      cameraRef.current!.aspect = w / h;
      cameraRef.current!.updateProjectionMatrix();
      rendererRef.current!.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      scene.clear();
      if (renderer.domElement && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      setIsLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update mesh when shape/color/scale/autoRotate change
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const oldGeo = mesh.geometry;
    let newGeo: THREE.BufferGeometry | undefined;
    
    switch (shape) {
      case 'Cube':
        newGeo = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'Sphere':
        newGeo = new THREE.SphereGeometry(0.9, 32, 24);
        break;
      case 'Pyramid':
        newGeo = new THREE.ConeGeometry(1, 1.2, 4);
        break;
      case 'Dodecahedron':
        newGeo = new (THREE as any).DodecahedronGeometry(0.9);
        break;
      case 'Torus':
        newGeo = new (THREE as any).TorusGeometry(0.9, 0.3, 24, 64);
        break;
      case 'Mobius':
        newGeo = createMobiusGeometry(128, 24, 0.9, 0.25);
        break;
      case 'Prism': {
        const geom = new THREE.BufferGeometry();
        const a = 0.9;
        const vertices = new Float32Array([
          -a / 2, -0.4, -0.5,
          a / 2, -0.4, -0.5,
          0, -0.4, 0.5,
          -a / 2, 0.4, -0.5,
          a / 2, 0.4, -0.5,
          0, 0.4, 0.5
        ]);
        const indices = new Uint16Array([
          0, 1, 2,
          3, 5, 4,
          0, 3, 1, 3, 4, 1,
          1, 4, 2, 4, 5, 2,
          2, 5, 0, 5, 3, 0
        ]);
        geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geom.setIndex(new THREE.BufferAttribute(indices, 1));
        geom.computeVertexNormals();
        newGeo = geom;
        break;
      }
      case 'Cylinder':
        newGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.4, 32);
        break;
    }

    if (newGeo) {
      mesh.geometry = newGeo as THREE.BufferGeometry;
      try { (oldGeo as any).dispose && (oldGeo as any).dispose(); } catch (_err) { /* ignore */ }
    }

    // Update material with enhanced properties
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.color = new THREE.Color(color);
    mat.emissive = new THREE.Color(color).multiplyScalar(0.1);

    // Update scale
    mesh.scale.setScalar(scale);

    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [shape, color, scale, autoRotate]);

  const reset = () => {
    setColor(DEFAULT_COLOR);
    setScale(DEFAULT_SCALE);
    setShape('Cube');
    setAutoRotate(false);
    if (meshRef.current) {
      meshRef.current.position.set(0, 0, 0);
      meshRef.current.rotation.set(0, 0, 0);
      meshRef.current.scale.setScalar(DEFAULT_SCALE);
    }
    if (controlsRef.current) controlsRef.current.reset();
  };

  const shapeDetail = SHAPE_DETAILS[shape];
  const statBadges = [
    { label: 'Caras', value: info.faces },
    { label: 'Vértices', value: info.vertices },
    { label: 'Bordes', value: info.edges },
    { label: 'Volumen ≈', value: info.volume.toFixed(2) }
  ];

  return (
    <div className="relative w-full h-full min-h-[640px] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-950 to-indigo-950 text-white shadow-2xl border border-gray-800">
      {/* Enhanced background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-6 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl animate-pulse-slow" />
        <div className="absolute right-0 bottom-0 h-72 w-72 translate-x-1/3 rounded-full bg-purple-600/15 blur-[150px] animate-pulse-slower" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(120,119,198,0.15),_transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950/80" />
      </div>

      {/* Left Control Panel */}
      <div className="absolute top-6 left-6 z-20 w-[300px] space-y-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-6 text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Panel creativo</p>
              <h3 className="text-2xl font-black text-white mt-1">Diseña tu figura</h3>
            </div>
          </div>
          
          <p className="text-sm text-slate-300 mb-6">Cambia la forma, color y tamaño en tiempo real como si fuera plastilina digital.</p>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300 mb-3 block">Forma</label>
              <select
                aria-label="shape-select"
                value={shape}
                onChange={(e) => setShape(e.target.value as ShapeType)}
                className="w-full rounded-2xl border border-gray-700 bg-slate-800/50 px-4 py-3 text-sm font-semibold text-white shadow-inner focus:border-blue-500 focus:outline-none transition-all duration-200 hover:bg-slate-800/70"
              >
                <option>Cube</option>
                <option>Sphere</option>
                <option>Pyramid</option>
                <option>Prism</option>
                <option>Dodecahedron</option>
                <option>Torus</option>
                <option>Mobius</option>
                <option>Cylinder</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300 mb-3 block">Color</label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-700 bg-slate-800/50 px-4 py-3 transition-all duration-200 hover:bg-slate-800/70">
                <input
                  aria-label="color-input"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-12 w-16 cursor-pointer rounded-xl border border-gray-600 bg-transparent p-0 transition-transform hover:scale-105"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-slate-200">{color.toUpperCase()}</span>
                  <div className="h-2 rounded-full bg-gradient-to-r from-transparent via-current to-transparent mt-1 opacity-50"></div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300 mb-3 block">Escala</label>
              <div>
                <input
                  aria-label="scale-range"
                  type="range"
                  min={0.4}
                  max={2}
                  step={0.01}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-blue-500 hover:accent-blue-400 transition-all"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-400">Pequeño</span>
                  <span className="text-sm font-bold text-white" data-testid="scale-indicator">{scale.toFixed(2)}×</span>
                  <span className="text-xs text-slate-400">Grande</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                aria-label="reset-button"
                onClick={reset}
                className="rounded-2xl border border-yellow-500/30 bg-yellow-600/20 px-4 py-3 text-sm font-bold text-yellow-100 transition-all duration-200 hover:bg-yellow-500/30 hover:border-yellow-400/50 active:scale-95"
              >
                Reiniciar
              </button>

              <button
                aria-label="autorotate-toggle"
                onClick={() => setAutoRotate((v) => !v)}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-95 ${
                  autoRotate 
                    ? 'border-green-500/50 bg-green-600/20 text-green-100 hover:bg-green-500/30' 
                    : 'border-gray-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {autoRotate ? '🔄 Activada' : '⏸️ Detenida'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-800/40 to-slate-900/60 p-4 text-sm text-white backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">Consejo pro</p>
          </div>
          <p className="text-slate-200">Pulsa y arrastra el modelo para explorar cada cara como si fueras un astronauta miniatura.</p>
        </div>
      </div>

      {/* Right Info Panel */}
      <div className="absolute top-6 right-6 z-20 w-[340px] space-y-4">
        <div
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-6 text-white backdrop-blur-xl shadow-2xl"
          data-testid="shape-detail-card"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl drop-shadow-lg" aria-hidden="true">{shapeDetail.emoji}</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">Ficha creativa</span>
            </div>
          </div>
          
          <h4
            data-testid="shape-detail-title"
            className="text-2xl font-black text-white mb-3"
          >
            {shapeDetail.title}
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">{shapeDetail.description}</p>

          <div
            data-testid="shape-detail-examples"
            className="mt-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 p-4 border border-white/10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300 mb-2">Ejemplos reales</p>
            <p className="text-sm font-semibold text-white">{shapeDetail.examples}</p>
          </div>
        </div>

        <div
          className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-5 backdrop-blur-xl"
          style={{ 
            boxShadow: `0 8px 32px ${shapeDetail.accent}20, inset 0 1px 0 ${shapeDetail.accent}10` 
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-300">Dato curioso</p>
          </div>
          <p className="text-white leading-relaxed" data-testid="shape-fact">{shapeDetail.fact}</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        ref={mountRef}
        className="relative z-10 w-full rounded-3xl"
        style={{ minHeight: 640 }}
      />

      {/* Stats Bar */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3 px-6">
        {statBadges.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/20 bg-gradient-to-b from-white/15 to-white/10 px-5 py-3 text-center backdrop-blur-xl shadow-lg transition-all duration-200 hover:scale-105"
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/70 mb-1">{stat.label}</p>
            <p className="text-lg font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Loading Screen */}
      {!isLoaded && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">📐</span>
              </div>
            </div>
            <p className="text-xl font-black text-white mb-2">Cargando geometría...</p>
            <p className="text-sm text-slate-400">Preparando materiales 3D súper brillantes</p>
          </div>
        </div>
      )}
    </div>
  );
}
