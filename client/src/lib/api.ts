import { apiRequest } from "./queryClient";

// Re-export apiRequest for use in admin pages
export { apiRequest };

// Authentication helpers
export const setAuthToken = (token: string) => {
  localStorage.setItem('adminToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('adminToken');
};

// Configure API client to include auth token
export const authenticatedRequest = async (url: string, method = 'GET', data?: any) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    return await apiRequest(url, method, data, { headers });
  } catch (error: any) {
    // Handle authentication errors
    if (error.message.includes('401')) {
      removeAuthToken();
      // Redirect to login page
      window.location.href = '/admin';
      throw new Error('Your session has expired. Please log in again.');
    }
    throw error;
  }
};

// Admin API functions
export const adminLogin = async (username: string, password: string) => {
  const response = await apiRequest('/api/admin/login', 'POST', { username, password });
  setAuthToken(response.token);
  return response;
};

export const adminLogout = async () => {
  try {
    await authenticatedRequest('/api/admin/logout', 'POST');
  } finally {
    removeAuthToken();
  }
};