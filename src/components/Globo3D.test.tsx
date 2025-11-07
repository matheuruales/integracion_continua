import { render, screen } from '@testing-library/react';
import Globo3D from './Globo3D';

// Mock para HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  canvas: { width: 1024, height: 512 },
  fillStyle: '',
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  ellipse: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  getContextAttributes: jest.fn(() => ({ alpha: true })),
  createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  quadraticCurveTo: jest.fn(),
  bezierCurveTo: jest.fn(),
})) as any;

describe('Globo3D Component', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<Globo3D />);
    
    // Verificar que el componente se renderiza
    expect(screen.getByText('🌍 Volver a vista global')).toBeInTheDocument();
    expect(screen.getByText('🌍 Explorador del Mundo')).toBeInTheDocument();
    expect(screen.getByText('🖱️ Click y arrastra para rotar')).toBeInTheDocument();
  });

  test('displays educational information', () => {
    render(<Globo3D />);
    
    expect(screen.getByText('📏 Superficie total: 510 millones km²')).toBeInTheDocument();
    expect(screen.getByText('👥 Población mundial: 8.000 millones')).toBeInTheDocument();
    expect(screen.getByText('🌊 Agua: 71% de la superficie')).toBeInTheDocument();
  });

  test('displays control instructions', () => {
    render(<Globo3D />);
    
    expect(screen.getByText('🔍 Scroll para hacer zoom')).toBeInTheDocument();
  });

  test('reset button is clickable', () => {
    render(<Globo3D />);
    
    const resetButton = screen.getByText('🌍 Volver a vista global');
    expect(resetButton).toBeEnabled();
  });
});