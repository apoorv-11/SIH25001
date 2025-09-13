import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
// Import CSS
import 'leaflet/dist/leaflet.css';
import 'react-vertical-timeline-component/style.min.css';
import './App.css';

// Import Pages
import CommunityReportPage from './pages/CommunityReportPage';
import DashboardPage from './pages/DashboardPage';
import DoctorViewPage from './pages/DoctorViewPage';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/report" element={<CommunityReportPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/doctor" element={<DoctorViewPage />} />
      </Routes>
    </AnimatePresence>
  );
};
function App() {
  return (
    <Router>
      <header className="app-header">
        <div className="logo">HealthPulse AI</div>
        <nav className="navbar">
          <NavLink to="/report">Community Reporting</NavLink>
          <NavLink to="/dashboard">Surveillance Dashboard</NavLink>
          <NavLink to="/doctor">Clinical View</NavLink>
        </nav>
      </header>
      <main className="container">
        <AnimatedRoutes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/report" element={<CommunityReportPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/doctor" element={<DoctorViewPage />} />
        </AnimatedRoutes>
      </main>
    </Router>
  );
}

export default App;
