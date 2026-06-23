import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import FarmListPage from './pages/FarmListPage';
import FarmsMapPage from './pages/FarmsMapPage';
import FarmDetailPage from './pages/FarmDetailPage';
import CreateFarmPage from './pages/CreateFarmPage';
import EditFarmPage from './pages/EditFarmPage';
import WorkerProfilePage from './pages/WorkerProfilePage';
import PeoplePage from './pages/PeoplePage';
import PersonProfilePage from './pages/PersonProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Fish Farms */}
        <Route path="/" element={<FarmListPage />} />
        <Route path="/map" element={<FarmsMapPage />} />
        <Route path="/farms/new" element={<CreateFarmPage />} />
        <Route path="/farms/:id" element={<FarmDetailPage />} />
        <Route path="/farms/:id/edit" element={<EditFarmPage />} />

        {/* People */}
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/people/:personId" element={<PersonProfilePage />} />

        
        <Route path="/farms/:farmId/workers/:workerId" element={<WorkerProfilePage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}
