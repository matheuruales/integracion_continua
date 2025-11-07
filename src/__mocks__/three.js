// Mock para Three.js
const Scene = jest.fn().mockImplementation(() => ({
  background: null,
  add: jest.fn(),
  remove: jest.fn(),
}));

const PerspectiveCamera = jest.fn().mockImplementation(() => ({
  position: { x: 0, y: 0, z: 0 },
  aspect: 1,
  updateProjectionMatrix: jest.fn(),
}));

const WebGLRenderer = jest.fn().mockImplementation(() => ({
  setSize: jest.fn(),
  setClearColor: jest.fn(),
  shadowMap: { enabled: false, type: null },
  domElement: document.createElement('canvas'),
  render: jest.fn(),
  dispose: jest.fn(),
}));

const SphereGeometry = jest.fn().mockImplementation(() => ({
  dispose: jest.fn(),
}));

const MeshPhongMaterial = jest.fn().mockImplementation(() => ({
  dispose: jest.fn(),
}));

const Mesh = jest.fn().mockImplementation(() => ({
  castShadow: false,
  receiveShadow: false,
  rotation: { x: 0, y: 0, z: 0 },
  position: { x: 0, y: 0, z: 0 },
}));

const AmbientLight = jest.fn().mockImplementation(() => ({}));
const DirectionalLight = jest.fn().mockImplementation(() => ({
  position: { set: jest.fn() },
  castShadow: false,
}));

const CanvasTexture = jest.fn().mockImplementation((canvas) => ({
  canvas: canvas,
  needsUpdate: true,
  dispose: jest.fn(),
  wrapS: 1001,
  wrapT: 1001,
  minFilter: 1006,
  magFilter: 1006,
}));

const Color = jest.fn().mockImplementation(() => ({}));
const PCFSoftShadowMap = 'PCFSoftShadowMap';

// Agregar Vector3 para las posiciones de continentes
const Vector3 = jest.fn().mockImplementation((x, y, z) => ({
  x: x || 0,
  y: y || 0,
  z: z || 0,
  clone: jest.fn(function() { return this; }),
  project: jest.fn(function() { return this; }),
}));

module.exports = {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  SphereGeometry,
  MeshPhongMaterial,
  Mesh,
  AmbientLight,
  DirectionalLight,
  CanvasTexture,
  Color,
  PCFSoftShadowMap,
  Vector3,
};