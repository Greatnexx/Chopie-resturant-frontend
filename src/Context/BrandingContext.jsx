import { createContext, useContext, useEffect, useState } from 'react';

const BrandingContext = createContext();

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    name: '',
    logo: null,
    primaryColor: '#ef4444',
    secondaryColor: '#f97316',
    accentColor: '#eab308',
    fontFamily: 'Inter'
  });

  const fetchBranding = async () => {
    try {
      const userData = sessionStorage.getItem('restaurantUser');
      const user = userData ? JSON.parse(userData) : null;
      const token = user?.data?.token || user?.token;
      
      if (!token) {
        // Reset to default branding if no token
        const defaultBranding = {
          name: '',
          logo: null,
          primaryColor: '#ef4444',
          secondaryColor: '#f97316',
          accentColor: '#eab308',
          fontFamily: 'Inter'
        };
        setBranding(defaultBranding);
        applyBranding(defaultBranding);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'https://backend-chopie-project.onrender.com/api/v1';
      const response = await fetch(`${apiUrl}/restaurant/branding`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.status && data.data.branding) {
        const newBranding = {
          name: data.data.branding.name || '',
          logo: data.data.branding.logo || null,
          primaryColor: data.data.branding.primaryColor || '#ef4444',
          secondaryColor: data.data.branding.secondaryColor || '#f97316',
          accentColor: data.data.branding.accentColor || '#eab308',
          fontFamily: data.data.branding.fontFamily || 'Inter'
        };
        setBranding(newBranding);
        applyBranding(newBranding);
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    }
  };

  const applyBranding = (brandingData) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', brandingData.primaryColor);
    root.style.setProperty('--secondary-color', brandingData.secondaryColor);
    root.style.setProperty('--accent-color', brandingData.accentColor);
    root.style.setProperty('--font-family', `'${brandingData.fontFamily}'`);
    
    // Also apply to body for immediate effect
    document.body.style.fontFamily = `'${brandingData.fontFamily}', sans-serif`;
  };

  useEffect(() => {
    fetchBranding();
    
    // Listen for storage changes to refetch branding when user logs in/out
    const handleStorageChange = (e) => {
      if (e.key === 'restaurantUser') {
        fetchBranding();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when sessionStorage is updated programmatically
    const handleUserChange = () => {
      fetchBranding();
    };
    
    window.addEventListener('userChanged', handleUserChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, setBranding, fetchBranding, applyBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

// Helper function to trigger branding refresh
export const triggerBrandingRefresh = () => {
  window.dispatchEvent(new Event('userChanged'));
};