import axios from 'axios';

// Configure the base URL for your Spring Boot backend
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define all your API calls in one place
export default {
  // Community Reporting
  submitCaseReport(report) {
    return apiClient.post('/report/case', report);
  },

  // Health Official Dashboard
  getHotspots() {
    return apiClient.get('/dashboard/hotspots');
  },
  getWaterData(location) {
    return apiClient.get(`/dashboard/iot-water-data/${location}`);
  },

  // Doctor's Clinical View
  getPatientHistory(patientId) {
    return apiClient.get(`/patient/${patientId}/history`);
  },
  // We need a separate backend for the AI model
  getAiSummary(textToSummarize) {
    // This calls the Python microservice (running on port 8000)
    return axios.post('http://localhost:8000/summarize', { text: textToSummarize });
  },
};
