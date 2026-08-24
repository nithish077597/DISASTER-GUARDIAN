import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CitizenLayout from './layouts/CitizenLayout';
import { UserProvider } from './context/UserContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import ReportEmergency from './pages/ReportEmergency';
import ReportDetail from './pages/ReportDetail';
import VerificationResult from './pages/VerificationResult';
import SafeEvacuation from './pages/SafeEvacuation';
import Alerts from './pages/Alerts';
import Login from './pages/Login';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CitizenLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="map" element={<LiveMap />} />
            <Route path="report" element={<ReportEmergency />} />
            <Route path="report/:id" element={<ReportDetail />} />
            <Route path="verification/:id" element={<VerificationResult />} />
	    <Route path="report/:id/verification" element={<VerificationResult />} />
            <Route path="evacuation" element={<SafeEvacuation />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
