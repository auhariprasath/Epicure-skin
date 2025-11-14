import api from './api';

export const upsertPatientProfile = async (payload: { name: string; age?: number; gender?: string; mail_id?: string }) => {
  try {
    const res = await api.post('/api/auth/patient/profile', payload);
    return res.data;
  } catch (error: any) {
    console.error('Error saving patient profile:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

export default { upsertPatientProfile };

export const getPatientProfile = async () => {
  try {
    const res = await api.get('/api/auth/patient/profile');
    return res.data;
  } catch (error: any) {
    console.error('Error fetching patient profile:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};
