import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setTenant, selectCurrentTenant } from '../slices/tenantSlice';
import TenantMenuPage from './TenantMenuPage';
import { getBaseUrl } from '../utils/apiUtils';

const TenantRouter = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentTenant = useSelector(selectCurrentTenant);

  useEffect(() => {
    identifyTenant();
  }, [location]);

  const identifyTenant = async () => {
    try {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      const search = window.location.search; // Get query parameters
      
      let tenantIdentifier = null;
      let routingType = null;

      // Check for subdomain routing (localhost or production)
      const isLocalSubdomain = hostname.includes('.localhost') && 
                              !hostname.startsWith('localhost') &&
                              !hostname.startsWith('www.');
      
      const isProdSubdomain = (
        hostname.endsWith('.chopie.ng') ||
        hostname.endsWith('.chopie-resturant-frontend.vercel.app')
      ) && !hostname.startsWith('www.');
      
      if (isLocalSubdomain || isProdSubdomain) {
        tenantIdentifier = hostname.split('.')[0];
        routingType = 'subdomain';
      }
      // Check for path-based routing (e.g., chopie.com/r/restaurant1)
      else if (pathname.startsWith('/r/')) {
        tenantIdentifier = pathname.split('/')[2];
        routingType = 'path';
      }

      if (tenantIdentifier) {
        const response = await fetch(`${getBaseUrl()}/tenant/resolve/${tenantIdentifier}`);
        const data = await response.json();

        if (data.status && data.data) {
          dispatch(setTenant(data.data));
          applyTenantBranding(data.data.branding);
        } else {
          navigate('/404');
          return;
        }
      } else {
        dispatch(setTenant(null));
      }
    } catch (error) {
      console.error('Failed to identify tenant:', error);
    } finally {
      setLoading(false);
    }
  };

const applyTenantBranding = (branding) => {
    if (!branding) return;

    const root = document.documentElement;
    
    // Apply CSS custom properties for colors
    root.style.setProperty('--primary-color', branding.primaryColor || '#ef4444');
    root.style.setProperty('--secondary-color', branding.secondaryColor || '#f97316');
    root.style.setProperty('--accent-color', branding.accentColor || '#eab308');
    
    // Apply font family
    if (branding.fontFamily) {
      document.body.style.fontFamily = branding.fontFamily;
    }

    // Update page title
    if (currentTenant?.name) {
      document.title = `${currentTenant.name} - Order Online`;
    }

    // Update favicon if logo exists
    if (branding.logo) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.href = branding.logo;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If we have a tenant and we're on a tenant route, show the tenant menu page
  if (currentTenant && (location.pathname.startsWith('/r/') || 
                       window.location.hostname.endsWith('.chopie.ng') ||
                       window.location.hostname.endsWith('.chopie-resturant-frontend.vercel.app') ||
                       window.location.hostname.includes('.localhost'))) {
    // Check if this is a specific route that should not be handled by TenantMenuPage
    const isSpecificRoute = location.pathname.includes('/trackorder') || 
                           location.pathname.includes('/track') ||
                           location.pathname.includes('/orders');
    
    if (!isSpecificRoute) {
      return <TenantMenuPage />;
    }
  }

  // Otherwise, render the normal app routes
  return children || <Outlet />;
};

export default TenantRouter;