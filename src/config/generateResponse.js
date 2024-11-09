import axios from 'axios';
const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;

const generateResponse = async (message) => {
  try {
    const response = await axios.post('https://api.gemini.com/v1/generate', {
      prompt: message,
      apiKey: GEMINI_API_KEY,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating response:', error);
    return null;
  }
};

export default generateResponse;