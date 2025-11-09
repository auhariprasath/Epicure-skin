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
export const getDoctorById = (doctorId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        _id: doctorId,
        name: 'Dr. Sarah Johnson',
        specialization: 'Dermatology',
        bio: 'Board-certified dermatologist with 15 years of experience in skin cancer diagnosis and treatment. Specializes in melanoma detection and treatment.',
        qualifications: ['MD from Harvard Medical School', 'Board Certified Dermatologist', 'Fellowship in Mohs Surgery'],
        responseTime: '2-4 hours',
        isAvailable: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        rating: 4.8,
        reviewCount: 247,
        experience: 15
      });
    }, 500);
  });

  // Uncomment to make actual API call
  // try {
  //   return await api.get(`/api/doctors/${doctorId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Send report to doctor and request appointment
// Endpoint: POST /api/appointments/request
// Request: { doctorId: string, reportId: string, message?: string, preferredDate?: string, preferredTime?: string }
// Response: { _id: string, status: string, message: string }
export const requestAppointment = (data: {
  doctorId: string;
  reportId: string;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        _id: 'apt_' + Date.now(),
        status: 'pending',
        message: 'Appointment request sent successfully. The doctor will respond within 24 hours.'
      });
    }, 1000);
  });

  // Uncomment to make actual API call
  // try {
  //   return await api.post('/api/appointments/request', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};