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
  // --- Community Reporting ---
  submitCaseReport(report) {
    return apiClient.post('/report/case', report);
  },

  // --- Health Official Dashboard ---
  getHotspots() {
    return apiClient.get('/dashboard/hotspots');
  },
  getWaterData(location) {
    // Assuming you have a '/dashboard/iot-water-data/{location}' endpoint
    return apiClient.get(`/dashboard/iot-water-data/${location}`);
  },

  // --- Doctor's Clinical View ---
  getPatientHistory(patientId) {
    // CORRECTED: The URL now matches the backend endpoint exactly.
    return apiClient.get(`/patient/${patientId}`);
  },
  
  // --- AI Microservice ---
  getAiSummary(textToSummarize) {
    // This calls the separate Python microservice (running on port 8000)
    return axios.post('http://localhost:8000/summarize', { text: textToSummarize });
  },
};
