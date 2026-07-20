import { useState } from "react";
import { flushSync } from "react-dom";
import { useSelector } from "react-redux";
import { selectCurrentTenant } from "../slices/tenantSlice";
import CartModal from "../components/CartModal";
import OrderConfirmationModal from "../components/OrderConfirmationModal";
import CartToast from "../components/CartToast";
import { useCart } from "../Context/CartContext";
import { useBranding } from "../Context/BrandingContext";
import { Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { applyTheme, createThemeFromBranding } from "../utils/colorTheme";
import { useEffect } from "react";
import { getBaseUrl } from "../utils/apiUtils";

const Header = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const {cartItems, showToast, toastData, hideToast} = useCart();
  const { branding } = useBranding();
  const currentTenant = useSelector(selectCurrentTenant);
  const location = useLocation();
  const count = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = getBaseUrl().replace('/api/v1', '');
    return `${baseUrl}${logoPath}`;
  };

  // Use tenant branding if available, otherwise use branding context
  const activeBranding = currentTenant ? {
    name: currentTenant.name,
    primaryColor: currentTenant.branding?.primaryColor,
    secondaryColor: currentTenant.branding?.secondaryColor,
    logo: currentTenant.branding?.logo
  } : branding;
  
  // Get restaurant ID for track order link
  const getTrackOrderLink = () => {
    const pathParts = location.pathname.split('/');
    const rIndex = pathParts.indexOf('r');
    if (rIndex !== -1 && pathParts[rIndex + 1]) {
      return `/r/${pathParts[rIndex + 1]}/trackorder`;
    }
    return '/trackorder';
  };

  // Apply theme when branding changes
  useEffect(() => {
    if (activeBranding) {
      const theme = createThemeFromBranding(activeBranding);
      applyTheme(theme);
    }
  }, [activeBranding]);

  const handleOrderSuccess = (orderDetails) => {
    // Force synchronous state updates
    flushSync(() => {
      setOrderData(orderDetails);
      setCartOpen(false);
      setShowConfirmation(true);
    });
  };

  const handlePlaceAnother = () => {
    setOrderData(null);
    setShowConfirmation(false);
    setCartOpen(true);
  };

  const handleCloseConfirmation = () => {
    setOrderData(null);
    setShowConfirmation(false);
  };

  return (
    <>
      <header className="text-white p-3 lg:p-4 sticky top-0 z-50 shadow-lg" style={{ backgroundColor: 'var(--primary-color)' }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link
            to={"/"}
            className="flex items-center space-x-2 cursor-pointer"
          >
            {activeBranding?.logo ? (
              <img 
                src={getLogoUrl(activeBranding.logo)} 
                alt={activeBranding.name} 
                className="w-8 h-8 lg:w-10 lg:h-10 object-cover rounded-full"
              />
            ) : (
              <span className="text-xl lg:text-2xl">🥂</span>
            )}
            <h1 className="text- lg:text-2xl font-bold">{activeBranding?.name || 'My Restaurant'}</h1>
          </Link>
        </div>
      </header>

      {count > 0 && (
        <div>
          {/* CART BUTTON - Enhanced with better UX */}
          <button
            onClick={() => {
              // Don't open cart if confirmation modal is showing
              if (!orderData) {
                setCartOpen(true);
              }
            }}
            className="fixed bottom-4 lg:bottom-8 right-4 bg-accent text-white px-4 lg:px-6 py-3 lg:py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 active:scale-95 flex items-center space-x-2 lg:space-x-3 z-40 border-3 border-white/30 backdrop-blur-sm font-bold group text-sm lg:text-base cart-button-enhanced"
            style={{ 
              backgroundColor: 'var(--accent-color)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 4px rgba(255,255,255,0.1)'
            }}
          >
            {/* Cart Icon with enhanced animation */}
            <span className="text-xl lg:text-2xl animate-bounce group-hover:animate-none filter drop-shadow-sm">🛒</span>
            
            {/* Text with better visibility */}
            <div className="flex flex-col items-start">
              <span className="hidden sm:inline text-sm lg:text-base font-extrabold tracking-wide">
                VIEW CART
              </span>
              <span className="hidden sm:inline text-xs opacity-90">
                {count} item{count !== 1 ? 's' : ''}
              </span>
              <span className="sm:hidden font-extrabold">({count})</span>
            </div>
            
            {/* Enhanced badge with glow effect */}
            <div className="absolute -top-2 -right-2 text-white text-xs font-bold rounded-full w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center animate-ping cart-badge-enhanced" 
                 style={{ 
                   backgroundColor: 'var(--error-color)',
                   boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
                 }}>
              {count}
            </div>
            <div className="absolute -top-2 -right-2 text-white text-xs font-bold rounded-full w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center border-2 border-white cart-badge-enhanced" 
                 style={{ backgroundColor: 'var(--error-color)' }}>
              {count}
            </div>
            
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" 
                 style={{ animationDuration: '2s' }}></div>
          </button>
          
          {/* Click hint tooltip */}
          <div className="fixed bottom-20 lg:bottom-24 right-4 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium z-30 animate-bounce pointer-events-none"
               style={{ 
                 animation: 'bounce 1s infinite, fadeInOut 4s ease-in-out infinite',
                 animationDelay: '1s'
               }}>
            👆 Click to checkout!
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

                {/* Cart Modal */}
          <CartModal 
            isOpen={cartOpen} 
            onClose={() => setCartOpen(false)}
            onOrderSuccess={handleOrderSuccess}
          />
          
          {/* Order Confirmation Modal */}
          {}
          <OrderConfirmationModal
            isOpen={showConfirmation && !!orderData}
            orderData={orderData}
            onClose={handleCloseConfirmation}
            onPlaceAnother={handlePlaceAnother}
            restaurantName={activeBranding?.name}
          />
    </>
  );
}

export default Header;