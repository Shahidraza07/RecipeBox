import axios from 'axios';

const api = axios.create({
  baseURL: 'https://recipebox-backend-zef5.onrender.com',
});

export default api;