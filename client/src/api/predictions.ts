import api from './api';

// Description: Get prediction results for an uploaded image
// Endpoint: POST /api/predictions
// Request: { imageUrl: string, bodyPart?: string, symptoms?: string, duration?: string }
// Response: { _id: string, disease: string, confidence: number, description: string, characteristics: string[], similarConditions: string[], timestamp: string }
export const submitPrediction = (data: {
  imageUrl: string;
  bodyPart?: string;
  symptoms?: string;
  duration?: string;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        _id: 'pred_' + Date.now(),
        disease: 'Melanoma',
        confidence: 87,
        description: 'Melanoma is a serious type of skin cancer that develops in the cells that produce melanin.',
        characteristics: [
          'Asymmetrical shape',
          'Irregular borders',
          'Multiple colors',
          'Diameter larger than 6mm',
          'Evolving or changing appearance'
        ],
        similarConditions: ['Dysplastic Nevus', 'Basal Cell Carcinoma', 'Squamous Cell Carcinoma'],
        timestamp: new Date().toISOString(),
        imageUrl: data.imageUrl,
        bodyPart: data.bodyPart,
        symptoms: data.symptoms,
        duration: data.duration
      });
    }, 1500);
  });

  // Uncomment to make actual API call
  // try {
  //   return await api.post('/api/predictions', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get prediction history for current user
// Endpoint: GET /api/predictions
// Request: {}
// Response: { predictions: Array<{ _id: string, disease: string, confidence: number, timestamp: string, imageUrl: string }> }
export const getPredictionHistory = async () => {
  try {
    const response = await api.get('/api/auth/predictions');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching predictions:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get single prediction details
// Endpoint: GET /api/predictions/:id
// Request: {}
// Response: { _id: string, disease: string, confidence: number, description: string, characteristics: string[], similarConditions: string[], timestamp: string, imageUrl: string, bodyPart?: string, symptoms?: string, duration?: string }
export const getPredictionById = (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        _id: id,
        disease: 'Melanoma',
        confidence: 87,
        description: 'Melanoma is a serious type of skin cancer that develops in the cells that produce melanin. It can appear on the skin suddenly or develop from an existing mole.',
        characteristics: [
          'Asymmetrical shape',
          'Irregular borders',
          'Multiple colors (brown, black, tan, red)',
          'Diameter larger than 6mm',
          'Evolving or changing appearance',
          'Itching or bleeding'
        ],
        similarConditions: ['Dysplastic Nevus', 'Basal Cell Carcinoma', 'Squamous Cell Carcinoma'],
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=preddetail',
        bodyPart: 'Back',
        symptoms: 'Itching and slight bleeding',
        duration: '3 weeks'
      });
    }, 500);
  });

  // Uncomment to make actual API call
  // try {
  //   return await api.get(`/api/predictions/${id}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};