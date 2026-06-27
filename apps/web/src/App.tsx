import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { NotFoundPage } from "./pages/NotFound/NotFoundPage";
import { AsesoriaDetailPage } from "./pages/AsesoriaDetail/AsesoriaDetailPage";
import { AsesoriasListPage } from "./pages/AsesoriaList/AsesoriasListPage";
import { NetworkDashboardPage } from "./pages/NetworkDashboard/NetworkDashboardPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/asesorias" replace />} />
        <Route path="/asesorias" element={<AsesoriasListPage />} />
        <Route path="/asesorias/:id" element={<AsesoriaDetailPage />} />
        <Route path="/red" element={<NetworkDashboardPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
