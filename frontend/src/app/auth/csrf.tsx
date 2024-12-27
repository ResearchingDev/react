import axios from 'axios';
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
/**
 * Fetch CSRF token from the Django backend
 * @returns {Promise<string>} CSRF token
 */
export const getCsrfToken = async () => {
  try {
    const response = await axios.get(`${apiBaseURL}/csrf-token/`); // Your Django backend endpoint
    return response.data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error; // Rethrow or handle as necessary
  }
};
