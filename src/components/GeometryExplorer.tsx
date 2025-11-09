import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type ShapeType = 'Cube' | 'Sphere' | 'Pyramid' | 'Prism' | 'Cylinder';

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

  // Create or update mesh whenever shape/color/scale change
  useEffect(() => {
    if (!mountRef.current) return;

    // Basic three setup on first mount
    const mount = mountRef.current;
    mount.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    // Create initial mesh
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.5 });

    function makeGeometry(t: ShapeType) {
      switch (t) {
        case 'Cube':
          return new THREE.BoxGeometry(1, 1, 1);
        case 'Sphere':
          return new THREE.SphereGeometry(0.9, 32, 24);
        case 'Pyramid':
          // square pyramid: use ConeGeometry with 4 radial segments
          return new THREE.ConeGeometry(1, 1.2, 4);
        case 'Prism': {
          // triangular prism - custom geometry
          const geom = new THREE.BufferGeometry();
          // 6 vertices, two triangles for each rectangular face etc. We'll create a simple triangular prism
          const a = 0.9; // base triangle size
          // triangular prism dimensions
          // front triangle, back triangle (offset in y)
          const vertices = new Float32Array([
            // front triangle
            -a / 2, -0.4, -0.5,
            a / 2, -0.4, -0.5,
            0, -0.4, 0.5,
            // back triangle
            -a / 2, 0.4, -0.5,
            a / 2, 0.4, -0.5,
            0, 0.4, 0.5
          ]);
          // indices - two triangles per triangular face + rectangular faces
          const indices = new Uint16Array([
            0, 1, 2, // front
            3, 5, 4, // back
            0, 3, 1, 3, 4, 1, // side 1
            1, 4, 2, 4, 5, 2, // side 2
            2, 5, 0, 5, 3, 0 // side 3
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

    const geometry = makeGeometry(shape);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.scale.setScalar(scale);
    meshRef.current = mesh;
    scene.add(mesh);

    // Ground shadow plane (subtle)
    const planeGeo = new THREE.PlaneGeometry(6, 6);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.9;
    plane.receiveShadow = true;
    scene.add(plane);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (meshRef.current) {
        if (autoRotate && controlsRef.current) {
          // small continuous rotation when autoRotate is on
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
    // only mount once; refresh of mesh handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update mesh when shape/color/scale/autoRotate change
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Replace geometry
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
      try { (oldGeo as any).dispose && (oldGeo as any).dispose(); } catch (e) { /* ignore */ }
    }

    // Update material color
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.color = new THREE.Color(color);

    // Update scale
    mesh.scale.setScalar(scale);

    // autoRotate toggled on controls
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

  return (
    <div className="w-full h-full min-h-[520px] bg-white rounded-lg shadow-md relative overflow-hidden">
      <div className="absolute top-4 left-4 z-20 space-y-3">
        <div className="bg-white bg-opacity-95 px-3 py-2 rounded-2xl shadow text-sm">
          <label className="block font-bold text-slate-700 mb-2">Forma</label>
          <select
            aria-label="shape-select"
            value={shape}
            onChange={(e) => setShape(e.target.value as ShapeType)}
            className="w-40 rounded-lg p-2 border-2 border-slate-200"
          >
            <option>Cube</option>
            <option>Sphere</option>
            <option>Pyramid</option>
            <option>Prism</option>
            <option>Cylinder</option>
          </select>

          <div className="mt-3">
            <label className="block font-bold text-slate-700 mb-2">Color</label>
            <input
              aria-label="color-input"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-20 h-10 p-0 border-0"
            />
          </div>

          <div className="mt-3">
            <label className="block font-bold text-slate-700 mb-2">Escala</label>
            <input
              aria-label="scale-range"
              type="range"
              min={0.4}
              max={2}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-40"
            />
            <div className="text-xs text-slate-500">{scale.toFixed(2)}×</div>
          </div>

          <div className="mt-3 flex space-x-2">
            <button
              aria-label="reset-button"
              onClick={reset}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3 py-2 rounded-lg text-sm font-bold"
            >
              Reiniciar
            </button>

            <button
              aria-label="autorotate-toggle"
              onClick={() => setAutoRotate((v) => !v)}
              className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold"
            >
              Auto-rotar: {autoRotate ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 bg-white bg-opacity-95 px-4 py-3 rounded-2xl shadow text-sm max-w-xs">
        <h4 className="font-bold text-slate-700">Datos</h4>
        <div className="mt-2 text-xs text-slate-600">
          <div>Forma: <span className="font-medium">{shape}</span></div>
          <div>Caras: <span className="font-medium">{info.faces}</span></div>
          <div>Vértices: <span className="font-medium">{info.vertices}</span></div>
          <div>Bordes: <span className="font-medium">{info.edges}</span></div>
          <div>Volumen ≈ <span className="font-medium">{info.volume.toFixed(2)}</span></div>
        </div>
      </div>

      <div ref={mountRef} className="w-full h-full rounded-lg overflow-hidden bg-transparent" style={{ minHeight: 520 }} />

      {/* small loading indicator for tests */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow">Cargando geometría...</div>
        </div>
      )}
    </div>
  );
}
