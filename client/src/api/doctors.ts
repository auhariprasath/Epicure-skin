import api from './api';

// Description: Get list of available dermatologists
// Endpoint: GET /api/doctors
// Request: {}
// Response: { doctors: Array<{ _id: string, name: string, specialization: string, bio: string, qualifications: string[], responseTime: string, isAvailable: boolean, avatar: string, rating: number }> }
export const getDoctors = async () => {
  try {
    const response = await api.get('/api/auth/doctors');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get doctor profile details
// Endpoint: GET /api/doctors/:id
// Request: {}
// Response: { _id: string, name: string, specialization: string, bio: string, qualifications: string[], responseTime: string, isAvailable: boolean, avatar: string, rating: number, reviewCount: number, experience: number }
export const getDoctorById = async (doctorId: string) => {
  try {
    const response = await api.get(`/api/auth/doctors/${doctorId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching doctor:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Send report to doctor and request appointment
// Endpoint: POST /api/appointments/request
// Request: { doctorId: string, reportId: string, message?: string, preferredDate?: string, preferredTime?: string }
// Response: { _id: string, status: string, message: string }
export const requestAppointment = async (data: {
  doctorId: string;
  reportId: string;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
}) => {
  try {
    const response = await api.post('/api/auth/appointments/request', data);
    return response.data;
  } catch (error: any) {
    console.error('Error requesting appointment:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};