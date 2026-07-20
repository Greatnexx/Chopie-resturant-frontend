export const getBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
    return 'http://localhost:8000/api/v1';
  }
  const storedURL = localStorage.getItem('RENDER_URL');
  return import.meta.env.VITE_API_URL || storedURL || 'https://backend-chopie-project.onrender.com/api/v1';
};