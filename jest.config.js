export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^.+\\.(css|scss|sass|less)$": "identity-obj-proxy",
    "^three$": "<rootDir>/src/__mocks__/three.js",
    "^three/examples/jsm/controls/OrbitControls$": "<rootDir>/src/__mocks__/three_examples_jsm_controls_OrbitControls.js",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true }],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transformIgnorePatterns: [
    "node_modules/(?!(three)/)"
  ],
};