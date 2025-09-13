import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import api from '../services/api';
import L from 'leaflet'; // <-- Import the Leaflet library

// --- Define the custom red icon ---
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const DashboardPage = () => {
  const [hotspots, setHotspots] = useState({});
  const [alerts, setAlerts] = useState([]);

  // --- Add all possible locations from your backend data ---
  const locations = {
    Kamrup: [26.14, 91.73],
    Nagaon: [26.35, 92.68],
    Jorhat: [26.75, 94.22],
    "Sector 14, Rewari": [28.19, 76.64],
    "Model Town, Rewari": [28.20, 76.62],
  };
  
  const waterChartData = [
    { name: 'pH Level', uv: 7.2, fill: '#8884d8' },
    { name: 'Turbidity', uv: 3.5, fill: '#83a6ed' },
    { name: 'Contaminants', uv: 15, fill: '#8dd1e1' },
  ];

  useEffect(() => {
    api.getHotspots().then(response => {
      setHotspots(response.data);
      const newAlerts = Object.entries(response.data)
        .filter(([, count]) => count > 5)
        .map(([location, count]) => `High Alert: ${count} cases reported in ${location}.`);
      setAlerts(newAlerts);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Surveillance Dashboard</h1>
      <p className="page-subtitle">Real-time public health monitoring and outbreak detection.</p>
      
      <motion.div 
        className="dashboard-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="panel dashboard-map-area" variants={itemVariants}>
          <h3>Disease Hotspot Map</h3>
          <MapContainer center={[27.5, 82.0]} zoom={6} className="map-container">
            {/* CORRECTED: Using a standard, light-colored map tile layer */}
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; OpenStreetMap contributors'
    />
            {Object.entries(hotspots).map(([location, count]) => {
              const position = locations[location];
              if (!position) return null; // Important: Don't render a marker if the location is unknown
              
              return (
                // --- Apply the custom icon to the Marker ---
                <Marker key={location} position={position} icon={redIcon}>
                  <Popup>{`${location}: ${count} cases reported`}</Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </motion.div>

        <div className="dashboard-right-panel">
          <motion.div className="panel" variants={itemVariants}>
            <h3>System Alerts</h3>
            {alerts.length > 0 ? (
              <ul className="alerts-list">
                {alerts.map((alert, index) => <li key={index}>{alert}</li>)}
              </ul>
            ) : <p>No high-risk alerts.</p>}
            <button onClick={() => alert('Simulated alerts dispatched!')} disabled={alerts.length === 0} style={{marginTop: '1rem'}}>
              Dispatch Alerts
            </button>
          </motion.div>

          <motion.div className="panel" variants={itemVariants}>
            <h3>Live Water Quality (Kamrup)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart innerRadius="20%" outerRadius="80%" data={waterChartData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={15} background clockWise dataKey="uv" />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
              </RadialBarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default DashboardPage;
