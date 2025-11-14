import api from './api';

// Description: Get doctor dashboard stats
// Endpoint: GET /api/auth/appointments (computed from appointments)
// Request: {}
// Response: { totalPatients: number, pendingAppointments: number, unreadMessages: number, completedAppointments: number }
export const getDoctorStats = async () => {
  try {
    const response = await api.get('/api/auth/appointments');
    const appointments = response.data.appointments || [];
    const pendingCount = appointments.filter((apt: any) => apt.status === 'pending').length;
    const completedCount = appointments.filter((apt: any) => apt.status === 'completed').length;
    // Get unique patients
    const uniquePatients = new Set(appointments.map((apt: any) => apt.patientName)).size;
    
    return {
      totalPatients: uniquePatients,
      pendingAppointments: pendingCount,
      unreadMessages: 0,
      completedAppointments: completedCount
    };
  } catch (error: any) {
    console.error('Error fetching doctor stats:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get doctor appointments
// Endpoint: GET /api/auth/appointments
// Request: {}
// Response: { appointments: Array<...> }
export const getDoctorAppointments = async () => {
  try {
    const response = await api.get('/api/auth/appointments');
    console.debug('getDoctorAppointments response:', response);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching doctor appointments:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Confirm an appointment
// Endpoint: POST /api/auth/appointments/:id/confirm
export const confirmAppointment = async (appointmentId: string) => {
  try {
    const response = await api.post(`/api/auth/appointments/${appointmentId}/confirm`, {});
    return response.data;
  } catch (error: any) {
    console.error('Error confirming appointment:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Decline an appointment
// Endpoint: DELETE /api/auth/appointments/:id/cancel
export const declineAppointment = async (appointmentId: string, reason: string) => {
  try {
    const response = await api.delete(`/api/auth/appointments/${appointmentId}/cancel`, {
      data: { reason }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error declining appointment:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get doctor patient reports
// Endpoint: GET /api/auth/appointments (mock reports from appointments for now)
export const getDoctorReports = async () => {
  try {
    const response = await api.get('/api/auth/appointments');
    // Convert appointments to report format (mock data)
    const appointments = response.data.appointments || [];
    const reports = appointments.map((apt: any) => ({
      _id: `report_${apt._id}`,
      patientName: apt.patientName,
      disease: apt.disease,
      confidence: apt.confidence,
      timestamp: apt.date,
      status: apt.status === 'completed' ? 'reviewed' : 'pending',
      imageUrl: apt.imageUrl || ''
    }));
    return { reports };
  } catch (error: any) {
    console.error('Error fetching doctor reports:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};