import api from './api';

// Description: Get all appointments for current user
// Endpoint: GET /api/appointments
// Request: {}
// Response: { appointments: Array<{ _id: string, doctorId: string, doctorName: string, doctorAvatar: string, date: string, time: string, status: string, disease: string, confidence: number }> }
export const getAppointments = async () => {
  try {
    const response = await api.get('/api/auth/appointments');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

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

// Description: Cancel an appointment
// Endpoint: DELETE /api/appointments/:id
// Request: {}
// Response: { success: boolean, message: string }
export const cancelAppointment = (appointmentId: string) => {
  try {
    return api.delete(`/api/auth/appointments/${appointmentId}/cancel`);
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Confirm an appointment (doctor only)
// Endpoint: POST /api/appointments/:id/confirm
// Request: {}
// Response: { success: boolean, message: string, status: string }
export const confirmAppointment = (appointmentId: string) => {
  try {
    return api.post(`/api/auth/appointments/${appointmentId}/confirm`, {});
  } catch (error: any) {
    console.error('Error confirming appointment:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update appointment status
// Endpoint: POST /api/appointments/:id/status
// Request: { status: 'confirmed' | 'completed' | 'cancelled' }
// Response: { success: boolean, message: string, status: string, _id: string }
export const updateAppointmentStatus = (appointmentId: string, status: string) => {
  try {
    return api.post(`/api/auth/appointments/${appointmentId}/status`, { status });
  } catch (error: any) {
    console.error('Error updating appointment status:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};