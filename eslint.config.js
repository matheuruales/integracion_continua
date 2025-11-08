// eslint.config.js — ESLint v9 Flat Config
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import testingLibrary from "eslint-plugin-testing-library";
import jestDom from "eslint-plugin-jest-dom";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Ignorar salidas de build/coverage/node_modules
  {
    ignores: ["dist/**", "build/**", "coverage/**", "node_modules/**"],
  },

  // Reglas base recomendadas de ESLint para JS
  {
    ...js.configs.recommended,
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
  },

  // TypeScript / TSX
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        // Si NO usas project refs/tsconfig para lint, deja false:
        project: false,
      },
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        console: "readonly",
        CustomEvent: "readonly",
        requestAnimationFrame: "readonly",
        ResizeObserver: "readonly",
        HTMLInputElement: "readonly",
        HTMLDivElement: "readonly",
        SpeechSynthesisVoice: "readonly",
        SpeechSynthesisUtterance: "readonly",
        React: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      // Usa la versión de TS del rule y apaga la base:
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          // Esto permite prefijo "_" para marcar intencionalmente no usados
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          args: "all",
          ignoreRestSiblings: true,
        },
      ],

      // Reglas de hooks (soluciona tu error "Definition for rule ... not found")
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn", // o "error" si quieres ser estricto

      // En TS, deja a TypeScript gestionar "no-undef"
      "no-undef": "off",
    },
  },

  // Tests: habilita globals y reglas útiles
  {
    files: ["**/*.test.{ts,tsx}", "src/setupTests.ts"],
    languageOptions: {
      globals: {
        // Jest/Vitest + RTL
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        vi: "readonly",
        window: "readonly",
        document: "readonly",
      },
    },
    plugins: {
      "testing-library": testingLibrary,
      "jest-dom": jestDom,
    },
    // Activa recomendaciones básicas
    rules: {
      // Ejemplos de reglas útiles:
      "testing-library/no-node-access": "warn",
      "jest-dom/prefer-in-document": "warn",

      // En tests suele haber muchos argumentos no usados en mocks;
      // mantenemos la misma política de ignorar prefijo "_"
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          args: "all",
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // Archivos CJS puntuales (si tienes alguno)
  {
    files: ["postcss.config.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
        exports: "readonly",
      },
    },
  },

  // Configs ESM (si existen)
  {
    files: ["eslint.config.js", "jest.config.js"],
    languageOptions: {
      sourceType: "module",
    },
  },
];