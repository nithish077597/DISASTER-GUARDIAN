import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CitizenLayout from './layouts/CitizenLayout';
import { UserProvider } from './context/UserContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Home from './pages/Home';
import CitizenDashboard from './pages/CitizenDashboard';
import LiveMap from './pages/LiveMap';
import ReportEmergency from './pages/ReportEmergency';
import Alerts from './pages/Alerts';
import EmergencyPage from './pages/EmergencyPage';
import SafeEvacuation from './pages/SafeEvacuation';
import WeatherIntelligence from './pages/WeatherIntelligence';
import SafetyGuidesPage from './pages/SafetyGuidesPage';
import NearbyHelpPage from './pages/NearbyHelpPage';
import Dashboard from './pages/Dashboard';
import RiskPage from './pages/RiskPage';
import ReportsPage from './pages/ReportsPage';
import RoadsPage from './pages/RoadsPage';
import PeopleAtRiskPage from './pages/PeopleAtRiskPage';
import GatewayPage from './pages/GatewayPage';
import SettingsPage from './pages/SettingsPage';
import CriticalEmergencyAlertModal from './components/CriticalEmergencyAlertModal';
import CriticalSirenWatcher from './components/CriticalSirenWatcher';
import VoiceCommandBar from './components/VoiceCommandBar';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
      <RealtimeProvider>
        <BrowserRouter>
          {/* SOFTWARE SIREN: opens ONLY at CRITICAL stage */}
          <CriticalSirenWatcher />
          <CriticalEmergencyAlertModal />

          {/* HANDS-FREE VOICE COMMANDS: available on every page */}
          <VoiceCommandBar />
          <Routes>
            {/* Public Dual Entry Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Logins */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Citizen Portal */}
            <Route element={<ProtectedRoute requiredRole="CITIZEN" />}>
              <Route path="/citizen" element={<CitizenDashboard />} />
              <Route path="/home" element={<Home />} />
              <Route path="/map" element={<LiveMap />} />
              <Route path="/report" element={<ReportEmergency />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="/shelters" element={<SafeEvacuation />} />
              <Route path="/weather" element={<WeatherIntelligence />} />
              <Route path="/safety-guides" element={<SafetyGuidesPage />} />
              <Route path="/nearby-help" element={<NearbyHelpPage />} />
            </Route>

            {/* Protected Admin Control Center */}
            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
              <Route element={<CitizenLayout />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/incidents" element={<Dashboard />} />
                <Route path="/admin/reports" element={<ReportsPage />} />
                <Route path="/admin/risk" element={<RiskPage />} />
                <Route path="/admin/alerts" element={<Alerts />} />
                <Route path="/admin/shelters" element={<SafeEvacuation />} />
                <Route path="/admin/roads" element={<RoadsPage />} />
                <Route path="/admin/people" element={<PeopleAtRiskPage />} />
                <Route path="/admin/gateways" element={<GatewayPage />} />
                <Route path="/admin/system" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </RealtimeProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
