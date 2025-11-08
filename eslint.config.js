// eslint.config.js – ESLint v9 Flat Config totalmente compatible con React + TS + Hooks

import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import testingLibrary from "eslint-plugin-testing-library";
import jestDom from "eslint-plugin-jest-dom";

export default [

  // Ignorar dirs generados
  {
    ignores: ["dist/**", "build/**", "node_modules/**", "coverage/**"],
  },

  // Reglas base JS recomendadas
  {
    ...js.configs.recommended,
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
  },

  // Reglas TypeScript + Parser TS
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
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
      react: reactPlugin,
      "react-hooks": reactHooks,
    },

    rules: {
      "no-undef": "off",

      // Reemplaza la regla base por la TS
      "no-unused-vars": "off",

      // Ignora variables que empiezan por "_"
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],

      // Reglas de React
      ...reactPlugin.configs.recommended.rules,

      // Reglas de React Hooks (aquí viene el plugin que te faltaba)
      ...reactHooks.configs.recommended.rules,
    },
  },

  // Tests: Jest + Testing Library + Jest-DOM
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "src/setupTests.ts"],
    plugins: {
      "testing-library": testingLibrary,
      "jest-dom": jestDom
    },
    languageOptions: {
      globals: {
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        vi: "readonly",
        window: "readonly",
        document: "readonly",
      },
    },
    rules: {
      "no-undef": "off",
      ...testingLibrary.configs.react.rules,
      ...jestDom.configs.recommended.rules
    },
  },

  // Configs CommonJS
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

  // Configs ESM
  {
    files: ["eslint.config.js", "vite.config.js", "jest.config.js"],
    languageOptions: {
      sourceType: "module",
    },
  }
];