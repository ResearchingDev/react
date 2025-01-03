import axios from 'axios';
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Function to fetch the logged-in user's profile
export const fetchUserProfile = async () => {
  const token = localStorage.getItem('access_token'); // Store token securely in production
  const id = sessionStorage.getItem('userId');
  try {
    const response = await axios.get(`${apiBaseURL}/api/profile/`, {
      params: { id: id },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const deleteItem = async (itemId) => {
  try {
    const response = await axios.delete(`${apiBaseURL}/api/delete-item/${itemId}/`);
    return response.data; // Handle success
  } catch (error) {
    console.error(error.response?.data?.error || "An error occurred");
    throw error;
  }
};
