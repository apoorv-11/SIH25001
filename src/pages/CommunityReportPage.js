// This file's code can remain the same as before.
// The new styles in App.css will automatically make the form look better.
// For reference, here is the component with updated title/subtitle.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

const CommunityReportPage = () => {
  const [formState, setFormState] = useState({
    disease: '',
    location: '',
    caseCount: '',
  });
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleVoiceReport = () => {
    setIsListening(true);
    setMessage('Listening...');
    setTimeout(() => {
      setFormState({
        disease: 'Cholera',
        location: 'Kamrup',
        caseCount: '5',
      });
      setIsListening(false);
      setMessage('Voice report transcribed successfully.');
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formState.caseCount) < 0) {
    setMessage('Number of cases cannot be negative.');
    return; // This stops the submission
  }
    if (!formState.disease || !formState.location || !formState.caseCount) {
        setMessage('Please fill all fields.');
        return;
    }
    try {
        await api.submitCaseReport({
            ...formState,
            caseCount: parseInt(formState.caseCount, 10),
        });
        setMessage('Report submitted successfully!');
        setFormState({ disease: '', location: '', caseCount: '' });
    } catch (error) {
        setMessage('Failed to submit report. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Field Data Collection</h1>
      <p className="page-subtitle">Submit a new case report from a field operative or community health worker.</p>
      <div className="panel">
        <form onSubmit={handleSubmit}>
          <select name="disease" value={formState.disease} onChange={handleChange} required>
            <option value="">-- Select Disease --</option>
            <option value="Cholera">Cholera</option>
            <option value="Typhoid">Typhoid</option>
            <option value="Dengue">Dengue</option>
            <option value="Malaria">Malaria</option>
          </select>
          <input
            type="text"
            name="location"
            placeholder="Location (e.g., District, Village)"
            value={formState.location}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="caseCount"
            placeholder="Number of Cases"
            value={formState.caseCount}
            onChange={handleChange}
            required
            min="1"
          />
          <div style={{display: 'flex', gap: '1rem'}}>
             <button type="submit" disabled={isListening}>Submit Report</button>
             <button type="button" className="secondary-button" onClick={handleVoiceReport} disabled={isListening}>
                {isListening ? 'Listening...' : 'Record with Voice (Simulated)'}
             </button>
          </div>
          {message && <p>{message}</p>}
        </form>
      </div>
    </motion.div>
  );
};

export default CommunityReportPage;
