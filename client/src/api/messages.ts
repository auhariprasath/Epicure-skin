import api from './api';

export const getConversations = async () => {
  try {
    const response = await api.get('/api/auth/conversations');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

export const getConversationMessages = async (doctorId: string) => {
  try {
    const response = await api.get('/api/auth/messages');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

export const sendMessage = async (data: { doctorId: string; content: string }) => {
  try {
    const response = await api.post('/api/auth/messages/send', data);
    return response.data;
  } catch (error: any) {
    console.error('Error sending message:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

export const getMessages = async () => {
  try {
    const response = await api.get('/api/auth/messages');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};