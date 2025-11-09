import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

// Views
import HomePage from "../views/HomePage";
import ThreeDemoView from "../views/ThreeDemoView";
import LayoutsView from "../views/LayoutsView";
import SpeechDemoView from "../views/SpeechDemoView";
import GeometryExplorer from "../components/GeometryExplorer";
import SettingsView from "../views/SettingsView";
import Globo3dViews from "../views/Globo3dViews"; 
import SistemaSolarView from "../views/SistemaSolarView";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="three" element={<ThreeDemoView />} />
        <Route path="layouts" element={<LayoutsView />} />
        <Route path="tts" element={<SpeechDemoView />} />
        <Route path="geometry" element={<GeometryExplorer />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="globo3D" element={<Globo3dViews />} />
        <Route path="sistemasolar" element={<SistemaSolarView />} />
      </Route>
    </Routes>
  );
}