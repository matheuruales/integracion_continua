// src/components/Globo3D.test.tsx
import { render, screen, act } from '@testing-library/react';
import Globo3D from './Globo3D';

// ===== Mock TOTAL de three (stubs seguros para Jest/JSDOM) =====
jest.mock('three', () => {
  class Vector3 {
    x: number; y: number; z: number;
    constructor(x=0, y=0, z=0) { this.x=x; this.y=y; this.z=z; }
    set(x:number,y:number,z:number){ this.x=x; this.y=y; this.z=z; return this; }
    copy(v: Vector3){ this.set(v.x,v.y,v.z); return this; }
  }
  class Color {
    // no creamos propiedad para evitar "unused"
    constructor(_hex?: any) {}
  }
  class Scene {
    background: any;
    add(){/* no-op */}
  }
  class PerspectiveCamera {
    aspect: number; position = { z: 0 }; projectionMatrix = {};
    constructor(_fov:number, aspect:number){ this.aspect = aspect; }
    updateProjectionMatrix(){/* no-op */}
  }
  class WebGLRenderer {
    domElement: HTMLCanvasElement = global.document.createElement('canvas');
    shadowMap: any = { enabled:false, type: 0 };
    setSize(){/* no-op */}
    setClearColor(){/* no-op */}
    render(){/* no-op */}
    dispose(){/* no-op */}
  }
  class SphereGeometry {
    dispose(){/* no-op */}
    constructor(..._args:any[]){}
  }
  class BufferGeometry {
    setAttribute(){/* no-op */}
    dispose(){/* no-op */}
  }
  class Float32BufferAttribute {
    constructor(_array:any,_itemSize:number){}
  }
  class Material { dispose(){/* no-op */} }
  class MeshPhongMaterial extends Material { constructor(_opts?:any){ super(); } }
  class MeshStandardMaterial extends Material { constructor(_opts?:any){ super(); } }
  class PointsMaterial extends Material { constructor(_opts?:any){ super(); } }
  class Mesh {
    rotation = { x:0, y:0, z:0 };
    castShadow = false; receiveShadow = false;
    position = {
      x:0, y:0, z:0,
      set(x:number,y:number,z:number){ this.x=x; this.y=y; this.z=z; },
      copy(v:Vector3){ this.set(v.x,v.y,v.z); }
    };
    constructor(_geo?:any,_mat?:any){}
  }
  class Points {
    rotation = { x:0, y:0 };
    constructor(_geo:any,_mat:any){}
  }
  class AmbientLight { constructor(_c:any,_i?:number){} }
  class DirectionalLight {
    position = new Vector3();
    shadow:any = { mapSize: { width: 0, height: 0 } };
    castShadow = false;
    constructor(_c:any,_i?:number){}
  }
  class PointLight {
    position = new Vector3();
    constructor(_c:any,_i?:number,_d?:number){}
  }
  class Texture { dispose(){/* no-op */} }
  class TextureLoader {
    // Nota: nombramos el parámetro del callback sin usar con "_" para evitar "unused"
    load(_url:string, onLoad?: (_texture:any)=>void){
      const tex = new Texture();
      if (onLoad) onLoad(tex); // carga inmediata
      return tex;
    }
  }
  const PCFSoftShadowMap = 1;

  return {
    Vector3, Color, Scene, PerspectiveCamera, WebGLRenderer,
    SphereGeometry, BufferGeometry, Float32BufferAttribute,
    MeshPhongMaterial, MeshStandardMaterial, PointsMaterial,
    Mesh, Points, AmbientLight, DirectionalLight, PointLight,
    TextureLoader, Texture,
    PCFSoftShadowMap,
  };
});

// ===== Mock de OrbitControls =====
jest.mock('three/examples/jsm/controls/OrbitControls', () => {
  return {
    OrbitControls: class {
      enableDamping = true; dampingFactor = 0.05;
      minDistance = 1.5; maxDistance = 8;
      enablePan = false; autoRotate = false;
      constructor(_camera?:any,_dom?:any){}
      update(){/* no-op */}
      dispose(){/* no-op */}
      reset(){/* no-op */}
    },
  };
});

// ===== Forzar tamaños en JSDOM para evitar 0x0 =====
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return 800; } });
Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return 600; } });

// ===== Timers falsos para el loader =====
beforeAll(() => { jest.useFakeTimers(); });
afterAll(() => { jest.useRealTimers(); });

describe('Globo3D (básico que pasa sí o sí)', () => {
  test('renderiza los botones principales y el panel "Cómo Jugar"', () => {
    render(<Globo3D />);
    expect(screen.getByRole('button', { name: /Volver al Inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sin Nubes|Con Nubes/i })).toBeInTheDocument();
    expect(screen.getByText('🎮 Cómo Jugar:')).toBeInTheDocument();
    expect(screen.getByText('Toca los continentes')).toBeInTheDocument();
    expect(screen.getByText('Gira el globo')).toBeInTheDocument();
    expect(screen.getByText('Acerca para ver mejor')).toBeInTheDocument();
    expect(screen.getByText('Continentes del Mundo')).toBeInTheDocument();
  });

  test('muestra loader y luego el indicador de textura cargada', () => {
    render(<Globo3D />);
    // Loader visible inicialmente
    expect(screen.getByText(/Cargando la Tierra real/i)).toBeInTheDocument();
    expect(screen.getByText(/Usando imágenes de la NASA/i)).toBeInTheDocument();

    // Avanzamos el timeout interno de 1000ms del componente
    act(() => { jest.advanceTimersByTime(1100); });

    // El TextureLoader mock llama onLoad inmediatamente, debe aparecer el “cargada”
    expect(screen.getByText(/✅ Tierra real cargada/i)).toBeInTheDocument();
  });
});