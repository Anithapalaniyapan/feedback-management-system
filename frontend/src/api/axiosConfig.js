import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add token to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Check if token exists and is actually expired
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Decode the JWT token to check its expiration
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const tokenData = JSON.parse(jsonPayload);
            const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            // Only redirect to login if token is actually expired
            if (currentTime >= expirationTime) {
              localStorage.clear();
              window.location.href = '/login';
              return Promise.reject(error);
            }
          } catch (e) {
            console.error('Error decoding token:', e);
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API; 