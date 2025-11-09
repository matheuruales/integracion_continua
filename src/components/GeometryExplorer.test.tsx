import { render, screen, fireEvent } from '@testing-library/react';
import GeometryExplorer from './GeometryExplorer';

// Mock three core used by the component
jest.mock('three', () => {
  class Vector3 { x=0; y=0; z=0; constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; } set(x:number,y:number,z:number){ this.x=x; this.y=y; this.z=z; return this; } }
  class Color { constructor(_c?: any) {} }
  class Scene { background:any; add(){/*noop*/} clear(){/*noop*/} }
  class PerspectiveCamera { aspect:number=1; position:any = { set:()=>{}, z:0 }; projectionMatrix = {}; constructor(_fov?:any, aspect?:number){ this.aspect = aspect || 1; } updateProjectionMatrix(){} }
  class WebGLRenderer { domElement: HTMLCanvasElement = global.document.createElement('canvas'); shadowMap: any = { enabled:false, type: 0 }; setSize(){} setPixelRatio(){} render(){} dispose(){} }
  class Mesh { rotation:any = { x:0, y:0, z:0, set:(_x:number,_y:number,_z:number)=>{} }; position:any = { set:()=>{}, x:0,y:0,z:0 }; scale:any = { setScalar:(_v:number)=>{}, set:()=>{} }; castShadow=false; receiveShadow=false; geometry:any; material:any; constructor(geo?:any, mat?:any){ this.geometry = geo; this.material = mat; } }
  class MeshStandardMaterial { color:any; constructor(_opts?:any){ this.color = new Color(); } }
  class AmbientLight { constructor(){} }
  class DirectionalLight { position = new Vector3(); constructor(){} }
  class BoxGeometry { dispose(){} constructor(){} }
  class SphereGeometry { dispose(){} constructor(){} }
  class ConeGeometry { dispose(){} constructor(){} }
  class CylinderGeometry { dispose(){} constructor(){} }
  class PlaneGeometry { dispose(){} constructor(){} }
  class ShadowMaterial { constructor(_opts?:any){} }
  class BufferGeometry { setAttribute(){} setIndex(){} computeVertexNormals(){} dispose(){} }
  class BufferAttribute { constructor(_arr:any,_n:number){} }
  class TextureLoader { load(_url:string, onLoad?:any){ const t = {}; if(onLoad) onLoad(t); return t; } }
  const PCFSoftShadowMap = 1;

  return {
    Vector3, Color, Scene, PerspectiveCamera, WebGLRenderer,
    Mesh, MeshStandardMaterial, AmbientLight, DirectionalLight,
    BoxGeometry, SphereGeometry, ConeGeometry, CylinderGeometry, PlaneGeometry,
    BufferGeometry, BufferAttribute, TextureLoader, ShadowMaterial, PCFSoftShadowMap
  };
});

// Mock OrbitControls used by component
jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: class {
    enableDamping = true; dampingFactor = 0.05; enablePan = false; autoRotate = false; minDistance = 1.5; maxDistance = 20;
    constructor(_c?:any,_d?:any){}
    update(){}
    dispose(){}
    reset(){}
  }
}));

// Force non-zero sizes in JSDOM
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return 800; } });
Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return 600; } });

describe('GeometryExplorer component', () => {
  test('renders UI elements and canvas', () => {
    const { container } = render(<GeometryExplorer />);

    // UI inputs
    expect(screen.getByLabelText('shape-select')).toBeInTheDocument();
    expect(screen.getByLabelText('color-input')).toBeInTheDocument();
    expect(screen.getByLabelText('scale-range')).toBeInTheDocument();
    expect(screen.getByLabelText('reset-button')).toBeInTheDocument();
    expect(screen.getByLabelText('autorotate-toggle')).toBeInTheDocument();

    // Canvas injected by the renderer
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  test('color and scale controls update and reset works', () => {
    render(<GeometryExplorer />);

    const colorInput = screen.getByLabelText('color-input') as HTMLInputElement;
    const scaleRange = screen.getByLabelText('scale-range') as HTMLInputElement;
    const resetBtn = screen.getByLabelText('reset-button');
    const autoBtn = screen.getByLabelText('autorotate-toggle');

    // change color
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    expect((screen.getByLabelText('color-input') as HTMLInputElement).value).toBe('#ff0000');

    // change scale and see textual representation update
    fireEvent.change(scaleRange, { target: { value: '1.5' } });
    expect(screen.getByText('1.50×')).toBeInTheDocument();

    // toggle autorotate
    fireEvent.click(autoBtn);
    expect(autoBtn).toHaveTextContent(/Auto-rotar: On/i);

    // reset
    fireEvent.click(resetBtn);
    expect((screen.getByLabelText('color-input') as HTMLInputElement).value).toBe('#60a5fa');
    expect(screen.getByText('1.00×')).toBeInTheDocument();
    expect((screen.getByLabelText('shape-select') as HTMLSelectElement).value).toBe('Cube');
  });
});
