export const getBaseUrl = () => {
  const useRemote = localStorage.getItem('USE_REMOTE_SERVER');
  if (useRemote === 'true') {
    return 'https://backend-chopie-project.onrender.com/api/v1';
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api/v1';
  }
  const storedURL = localStorage.getItem('RENDER_URL');
  return import.meta.env.VITE_API_URL || storedURL || 'https://backend-chopie-project.onrender.com/api/v1';
};