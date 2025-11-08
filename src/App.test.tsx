import { render } from "@testing-library/react";
import App from "./App";

// Mock básico para evitar problemas
jest.mock("./routes/AppRoutes", () => {
  return function MockAppRoutes() {
    return <div>Aplicación renderizada</div>;
  };
});

test("renderiza la aplicación sin errores", () => {
  // Este test solo verifica que el componente se puede renderizar sin crash
  expect(() => {
    render(<App />);
  }).not.toThrow();
});