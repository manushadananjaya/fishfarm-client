import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import FarmListPage from './pages/FarmListPage';
import FarmDetailPage from './pages/FarmDetailPage';
import CreateFarmPage from './pages/CreateFarmPage';
import EditFarmPage from './pages/EditFarmPage';
import WorkerProfilePage from './pages/WorkerProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<FarmListPage />} />
        <Route path="/farms/new" element={<CreateFarmPage />} />
        <Route path="/farms/:id" element={<FarmDetailPage />} />
        <Route path="/farms/:id/edit" element={<EditFarmPage />} />
        <Route path="/farms/:farmId/workers/:workerId" element={<WorkerProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}
