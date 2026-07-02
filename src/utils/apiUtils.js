export const getBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api/v1';
  }
  // On subdomains like mama.localhost or production
  const hostname = window.location.hostname;
  if (hostname.includes('localhost')) {
    return 'http://localhost:8000/api/v1';
  }
  const storedURL = localStorage.getItem('RENDER_URL');
  return import.meta.env.VITE_API_URL || storedURL || 'https://backend-chopie-project.onrender.com/api/v1';
};