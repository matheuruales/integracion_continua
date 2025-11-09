// src/components/SistemaSolar.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SistemaSolar from './SistemaSolar';

// ==== RAF (animación) ====
beforeAll(() => {
  // @ts-ignore
  global.requestAnimationFrame = (cb: any) => setTimeout(() => cb(Date.now()), 16) as unknown as number;
  // @ts-ignore
  global.cancelAnimationFrame = (id: number) => clearTimeout(id as unknown as number);
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});

// ==== Mock Canvas con firmas compatibles ====
const mock2d = {
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
  createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
};

const mockBitmapRenderer = { transferFromImageBitmap: jest.fn() };
const mockWebGL: any = {}; // no necesitamos nada específico

// Tipado flexible para evitar el error de ImageBitmapRenderingContext
// @ts-ignore
HTMLCanvasElement.prototype.getContext = jest
  .fn()
  .mockImplementation((contextId: string) => {
    if (contextId === '2d') return mock2d as unknown as CanvasRenderingContext2D;
    if (contextId === 'bitmaprenderer') return mockBitmapRenderer as unknown as ImageBitmapRenderingContext;
    if (contextId === 'webgl' || contextId === 'experimental-webgl') return mockWebGL as WebGLRenderingContext;
    return mockWebGL;
  });

// ==== Mocks compartidos para THREE ====
type Intersects = Array<{ object: any }>;
const intersectObjectsMock: jest.Mock<Intersects, any> = jest.fn(() => []);
const getMaxAnisotropyMock = jest.fn(() => 1);

// ==== Mock de THREE (todo lo que requiere el componente) ====
jest.mock('three', () => {
  const domCanvas = document.createElement('canvas');
  (domCanvas as any).addEventListener = jest.fn();
  (domCanvas as any).removeEventListener = jest.fn();
  (domCanvas as any).getBoundingClientRect = () => ({
    left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {},
  });

  class FakeScene {
    background: any = null;
    fog: any = null;
    add = jest.fn();
    remove = jest.fn();
    clear = jest.fn();
  }

  class FakeVector3 {
    x = 0; y = 0; z = 0;
    set = jest.fn((x: number, y: number, z: number) => { this.x = x; this.y = y; this.z = z; });
    clone = () => {
      const v = new FakeVector3();
      v.x = this.x; v.y = this.y; v.z = this.z;
      return v;
    };
  }

  class FakeVector2 {
    x = 0; y = 0;
    clone = () => ({ x: this.x, y: this.y });
  }

  class FakePerspectiveCamera {
    aspect = 1;
    position = new FakeVector3();
    updateProjectionMatrix = jest.fn();
  }

  class FakeWebGLRenderer {
    domElement = domCanvas;
    shadowMap = { enabled: false, type: 1 };
    capabilities = { getMaxAnisotropy: getMaxAnisotropyMock };
    toneMapping: number = 0;
    toneMappingExposure: number = 1;
    setSize = jest.fn();
    setPixelRatio = jest.fn();
    render = jest.fn();
    dispose = jest.fn();
  }

  class FakeGeometry { dispose = jest.fn(); }
  class FakeSphereGeometry extends FakeGeometry { constructor(..._a: any[]) { super(); } }
  class FakeRingGeometry extends FakeGeometry { constructor(..._a: any[]) { super(); } }

  class FakeMaterial {
    dispose = jest.fn();
    needsUpdate = false;
    map: any = null;
    color: any = null;
    constructor(..._a: any[]) {}
  }
  class FakeMeshStandardMaterial extends FakeMaterial {}
  class FakeMeshBasicMaterial extends FakeMaterial {}
  class FakeShaderMaterial extends FakeMaterial {
    uniforms: any;
    side: any;
    blending: any;
    transparent: boolean = false;
    constructor(opts: any) {
      super();
      this.uniforms = opts?.uniforms ?? {};
      this.side = opts?.side;
      this.blending = opts?.blending;
      this.transparent = !!opts?.transparent;
    }
  }

  class FakeMesh {
    position = new FakeVector3();
    rotation = { x: 0, y: 0, z: 0 };
    scale = { set: jest.fn(), setScalar: jest.fn() };
    castShadow = false;
    receiveShadow = false;
    userData: Record<string, any> = {};
    add = jest.fn();
    constructor(_geo?: any, _mat?: any) {}
  }

  class FakeGroup {
    rotation = { y: 0 };
    add = jest.fn();
  }

  class FakeRaycaster {
    setFromCamera = jest.fn();
    // Evitar error de spread: aceptar lo que sea y pasarlo directo al mock
    intersectObjects = (objs: any) => intersectObjectsMock(objs);
  }

  class FakeTexture {
    wrapS: any; wrapT: any; anisotropy: any;
  }

  class FakeLoadingManager {
    onLoad: ((...a: any[]) => void) | null = null;
    onProgress: ((...a: any[]) => void) | null = null;
    onError: ((...a: any[]) => void) | null = null;
  }

  class FakeTextureLoader {
    constructor(_mgr?: any) {}
    load(_url: string, onLoad?: (t: any) => void, _onProg?: any, _onErr?: any) {
      setTimeout(() => onLoad?.(new FakeTexture()), 10);
    }
  }

  class FakeClock {
    private start = Date.now();
    getDelta() { return 0.016; }
    getElapsedTime() { return (Date.now() - this.start) / 1000; }
  }

  class FakeAmbientLight { constructor(..._a: any[]) {} }
  class FakePointLight {
    position = { set: jest.fn() };
    castShadow = false;
    shadow = { mapSize: { width: 0, height: 0 }, camera: { near: 0, far: 0 } };
    constructor(..._a: any[]) {}
  }
  class FakeDirectionalLight { position = { set: jest.fn() }; constructor(..._a: any[]) {} }
  class FakeFog { constructor(..._a: any[]) {} }
  class FakeColor { constructor(..._a: any[]) {} }

  const MathUtils = {
    degToRad: (deg: number) => (deg * Math.PI) / 180,
  };

  return {
    // clases usadas
    Scene: FakeScene,
    PerspectiveCamera: FakePerspectiveCamera,
    WebGLRenderer: FakeWebGLRenderer,
    SphereGeometry: FakeSphereGeometry,
    RingGeometry: FakeRingGeometry,
    MeshStandardMaterial: FakeMeshStandardMaterial,
    MeshBasicMaterial: FakeMeshBasicMaterial,
    ShaderMaterial: FakeShaderMaterial,
    Mesh: FakeMesh,
    Group: FakeGroup,
    Vector2: FakeVector2,
    Vector3: FakeVector3,
    Raycaster: FakeRaycaster,
    TextureLoader: FakeTextureLoader,
    LoadingManager: FakeLoadingManager,
    Clock: FakeClock,
    AmbientLight: FakeAmbientLight,
    PointLight: FakePointLight,
    DirectionalLight: FakeDirectionalLight,
    Fog: FakeFog,
    Color: FakeColor,

    // utilidades/constantes usadas por el componente
    RepeatWrapping: 1000,
    AdditiveBlending: 2,
    BackSide: 1,
    DoubleSide: 2,
    PCFSoftShadowMap: 1,
    ACESFilmicToneMapping: 3,
    MathUtils,
  };
});

// ==== Mock de OrbitControls ====
jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: jest.fn().mockImplementation(() => ({
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 10,
    maxDistance: 250,
    maxPolarAngle: Math.PI * 0.9,
    target: { set: jest.fn() },
    update: jest.fn(),
    reset: jest.fn(),
    dispose: jest.fn(),
  })),
}));

describe('SistemaSolar', () => {
  test('renderiza y muestra el botón "Reiniciar Vista"', async () => {
    render(<SistemaSolar />);
    await act(async () => {
      jest.advanceTimersByTime(6100); // safety timeout + cargas
    });
    const btn = await screen.findByRole('button', { name: /Reiniciar Vista/i });
    expect(btn).toBeInTheDocument();
  });

  test('click en "Reiniciar Vista" no genera errores', async () => {
    render(<SistemaSolar />);
    await act(async () => {
      jest.advanceTimersByTime(6100);
    });
    const btn = await screen.findByRole('button', { name: /Reiniciar Vista/i });
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  test('al hacer clic sobre un planeta se muestra su información', async () => {
    render(<SistemaSolar />);

    await act(async () => {
      jest.advanceTimersByTime(6100);
    });

    // Esperar a que el componente esté cargado
    const btn = await screen.findByRole('button', { name: /Reiniciar Vista/i });
    expect(btn).toBeInTheDocument();

    // La próxima intersección debe devolver un planeta "earth"
    intersectObjectsMock.mockReturnValueOnce([
      {
        object: {
          userData: { name: 'earth' },
          scale: { set: jest.fn() },
        },
      },
    ] as Intersects);

    const canvas = screen.getByTestId('solarsystem-canvas') as HTMLCanvasElement;

    // Recuperar el handler real registrado en el canvas mockeado y dispararlo manualmente.
    const clickHandler = (canvas.addEventListener as unknown as jest.Mock)
      .mock.calls
      .find(([eventName]) => eventName === 'click')?.[1] as (event: MouseEvent) => void;

    expect(clickHandler).toBeDefined();

    await act(async () => {
      clickHandler(new MouseEvent('click', { clientX: 100, clientY: 100 }));
    });

    // Avanzar los timers para que se procese el setState
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    // Buscar el texto "Tierra" que debe aparecer en el panel de información
    expect(screen.getByText('🪐 Tierra')).toBeInTheDocument();
  });

  test('inicialmente muestra loader y luego desaparece', async () => {
    render(<SistemaSolar />);
    // Loader visible
    expect(screen.getByText(/Cargando sistema solar/i)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(6100);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Cargando sistema solar/i)).not.toBeInTheDocument();
    });
  });
});
