import React, { useState } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorViewPage = () => {
  const [patientId, setPatientId] = useState('');
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Enter a Patient ID to begin.');

  const handleSearch = async () => {
    if (!patientId) {
        setMessage("Please enter a Patient ID.");
        return;
    }
    setIsLoading(true);
    setMessage('');
    setSummary('');
    try {
      const response = await api.getPatientHistory(patientId);
      setHistory(response.data);
      if(response.data.length === 0){
          setMessage("No clinical history found for this patient.");
      }
    } catch (error) {
      setMessage("Failed to fetch patient history.");
      setHistory([]);
    }
    setIsLoading(false);
  };
  
  const handleGenerateSummary = async () => {
    if (history.length === 0) {
        setMessage("No patient history available to summarize.");
        return;
    }
    setIsLoading(true);
    setSummary('');
    const textToSummarize = history.map(event => `${event.title}: ${event.description}`).join('. ');
    try {
        const response = await api.getAiSummary(textToSummarize);
        setSummary(response.data.summary_text);
    } catch (error) {
        setMessage("Failed to generate AI summary. The AI service may be down.");
    }
    setIsLoading(false);
  }

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
  />
  <button onClick={handleSearch} disabled={isLoading}>Search</button>
      </div>

      {isLoading && <p>Loading...</p>}
      {message && !isLoading && <p>{message}</p>}

      <AnimatePresence>
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="summary-box">
              <h3>AI-Powered Summary</h3>
              {summary ? <p>{summary}</p> : <p>Click to generate a clinical summary.</p>}
              <button onClick={handleGenerateSummary} disabled={isLoading} style={{marginTop: '1rem'}}>
                {isLoading && summary === '' ? 'Generating...' : 'Generate Summary'}
              </button>
            </div>

            <VerticalTimeline layout="1-column-left">
              {history.map(event => (
                <VerticalTimelineElement
                  key={event.id}
                  date={event.eventDate}
                  iconStyle={{ background: 'var(--primary-color)', color: '#fff' }}
                >
                  <h3 className="vertical-timeline-element-title">{event.title}</h3>
                  <p>{event.description}</p>
                </VerticalTimelineElement>
              ))}
            </VerticalTimeline>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DoctorViewPage;
