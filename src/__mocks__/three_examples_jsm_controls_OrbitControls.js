// Mock para OrbitControls
class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enableDamping = true;
    this.dampingFactor = 0.05;
    this.minDistance = 1.5;
    this.maxDistance = 5;
    this.enablePan = false;
  }

  update() {
    // Mock implementation
  }

  dispose() {
    // Mock implementation
  }

  reset() {
    // Mock implementation
  }
}

module.exports = { OrbitControls };