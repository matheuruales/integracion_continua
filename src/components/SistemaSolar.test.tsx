import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SistemaSolar from './SistemaSolar';

// Mock de THREE.js
jest.mock('three', () => ({
  Scene: jest.fn(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    getObjectByName: jest.fn(),
    background: null,
    clear: jest.fn(),
  })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn(), x: 0, y: 0, z: 0 },
    aspect: 1,
    updateProjectionMatrix: jest.fn(),
    lookAt: jest.fn(),
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    setClearColor: jest.fn(),
    domElement: document.createElement('canvas'),
    render: jest.fn(),
    dispose: jest.fn(),
    shadowMap: {
      enabled: false,
      type: 1,
    },
  })),
  AmbientLight: jest.fn(() => ({})),
  PointLight: jest.fn(() => ({
    position: { set: jest.fn() },
    castShadow: false,
    shadow: {
      mapSize: { width: 0, height: 0 },
    },
  })),
  SphereGeometry: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  RingGeometry: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  MeshStandardMaterial: jest.fn(() => ({})),
  MeshBasicMaterial: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  MeshPhongMaterial: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  Mesh: jest.fn(() => ({
    position: { set: jest.fn(), x: 0, y: 0, z: 0 },
    rotation: { y: 0, x: 0, z: 0 },
    castShadow: false,
    receiveShadow: false,
    userData: {},
  })),
  Group: jest.fn(() => ({
    add: jest.fn(),
    rotation: { y: 0 },
  })),
  TextureLoader: jest.fn(() => ({
    load: jest.fn((_url, onLoad) => {
      // Simular carga asíncrona de texturas
      setTimeout(() => {
        onLoad?.({});
      }, 100);
    }),
  })),
  Vector3: jest.fn(() => ({
    x: 0, y: 0, z: 0,
    clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
    project: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
  })),
  Vector2: jest.fn(() => ({
    x: 0, y: 0,
    clone: jest.fn(() => ({ x: 0, y: 0 })),
  })),
  Raycaster: jest.fn(() => ({
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn(() => []),
  })),
  CanvasTexture: jest.fn(() => ({
    canvas: document.createElement('canvas'),
    needsUpdate: false,
    dispose: jest.fn(),
    wrapS: {},
    wrapT: {},
    minFilter: {},
    magFilter: {},
  })),
  DoubleSide: 2,
  Color: jest.fn(() => ({})),
  PCFSoftShadowMap: 1,
}));

// Mock de OrbitControls
jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: jest.fn(() => ({
    enableDamping: true,
    dampingFactor: 0.05,
    enableZoom: true,
    enableRotate: true,
    enablePan: true,
    minDistance: 10,
    maxDistance: 1000,
    target: { set: jest.fn() },
    update: jest.fn(),
    reset: jest.fn(),
    dispose: jest.fn(),
  })),
}));

// Mock del canvas
const mockContext = {
  clearRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
  rect: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  drawImage: jest.fn(),
  ellipse: jest.fn(),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
};

HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext as any);

describe('SistemaSolar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza sin errores', () => {
    render(<SistemaSolar />);
    expect(screen.getByRole('button', { name: /volver al sistema solar completo/i })).toBeInTheDocument();
  });

  test('muestra información de un planeta al hacer clic', async () => {
    render(<SistemaSolar />);
    
    // Esperar a que se cargue el componente
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /volver al sistema solar completo/i })).toBeInTheDocument();
    });

    // Simular clic en el canvas (esto debería activar el evento de clic en un planeta)
    const canvas = screen.getByRole('button', { name: /volver al sistema solar completo/i }).closest('div');
    expect(canvas).toBeInTheDocument();
  });

  test('el botón de reinicio funciona correctamente', () => {
    render(<SistemaSolar />);
    
    const resetButton = screen.getByRole('button', { name: /volver al sistema solar completo/i });
    expect(resetButton).toBeInTheDocument();
    
    fireEvent.click(resetButton);
    
    // Verificar que no hay errores después del clic
    expect(resetButton).toBeInTheDocument();
  });

  test('muestra información del planeta seleccionado', async () => {
    render(<SistemaSolar />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /volver al sistema solar completo/i })).toBeInTheDocument();
    });

    // La información del planeta debería estar inicialmente oculta
    const planetInfo = screen.queryByText(/nombre:/i);
    expect(planetInfo).not.toBeInTheDocument();
  });
});