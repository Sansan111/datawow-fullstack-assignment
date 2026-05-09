import axios from 'axios';

const axiosInstance = axios.create({
  // point to backend
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 5000, 
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosInstance;