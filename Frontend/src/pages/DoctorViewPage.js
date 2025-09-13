import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import api from '../services/api';

const DoctorViewPage = () => {
  const [patientId, setPatientId] = useState('');
  const [patientData, setPatientData] = useState(null); // To store the fetched patient data
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Enter a Patient ID to begin.');

  const handleSearch = async () => {
    if (!patientId) {
      setMessage("Please enter a Patient ID.");
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    setPatientData(null); // Clear previous results

    try {
      // This is the API call that was missing
      const response = await api.getPatientHistory(patientId);
      setPatientData(response.data); // Save the found patient data to state
      
      // If no data is returned, set a message
      if (!response.data) {
          setMessage("No clinical history found for this patient.");
      }

    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage(`Patient with ID "${patientId}" was not found.`);
      } else {
        setMessage("An error occurred while fetching data. Is the backend running?");
      }
      console.error("Search failed:", error);
    }
    setIsLoading(false);
  };

  // ... (handleGenerateSummary function would go here)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Clinical Support View</h1>
      <p className="page-subtitle">Access unified patient records and AI-powered insights.</p>
      
      <div className="search-container">
        <input
          type="text"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Enter Patient ID (e.g., PAT101)"
          onKeyPress={(event) => event.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Display feedback messages */}
      {isLoading && <p>Loading patient data...</p>}
      {message && !isLoading && <p>{message}</p>}

      {/* --- This is where the output is rendered --- */}
      <AnimatePresence>
        {patientData && (
          <motion.div
            className="patient-details-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h2>Patient Record: {patientData.name}</h2>
            <div className="summary-box">
              <h3>Clinical History</h3>
              <p>{patientData.medicalHistory}</p>
            </div>
            {/* The VerticalTimeline would go here if you had structured history events */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DoctorViewPage;
