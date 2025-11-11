import api from './api';

// Description: Generate PDF report from prediction
// Endpoint: POST /api/reports/generate
// Request: { predictionId: string }
// Response: { _id: string, predictionId: string, patientName: string, patientAge: number, patientGender: string, disease: string, confidence: number, timestamp: string, pdfUrl: string }
export const generateReport = async (predictionId: string) => {
  try {
    const response = await api.post('/api/auth/reports/generate', { predictionId });
    return response.data;
  } catch (error: any) {
    console.error('Error generating report:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get all reports for current user
// Endpoint: GET /api/reports
// Request: {}
// Response: { reports: Array<{ _id: string, predictionId: string, disease: string, confidence: number, timestamp: string, pdfUrl: string }> }
export const getReports = async () => {
  try {
    const response = await api.get('/api/auth/reports');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Delete a report
// Endpoint: DELETE /api/reports/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteReport = (reportId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Report deleted successfully' });
    }, 500);
  });

  // Uncomment to make actual API call
  // try {
  //   return await api.delete(`/api/reports/${reportId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};