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
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Appointment cancelled successfully' });
    }, 500);
  });

  // Uncomment to make actual API call
  // try {
  //   return await api.delete(`/api/appointments/${appointmentId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};