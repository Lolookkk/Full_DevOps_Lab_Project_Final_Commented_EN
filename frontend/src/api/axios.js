import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Matches your backend URL
});

// Automatically add token to headers if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // or just 'token' if your backend expects that
  }
  return config;
});

export default api;