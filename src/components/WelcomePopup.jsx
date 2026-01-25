import { useState, useEffect } from 'react';
import { X, ShoppingBag, Clock, Star } from 'lucide-react';

const WelcomePopup = ({ isOpen, onClose, restaurant, branding }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Full screen overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Full screen popup content */}
      <div className={`relative w-full h-full flex items-center justify-center p-4 transition-transform duration-300 ${
        isVisible ? 'scale-100' : 'scale-95'
      }`}>
        <div 
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden relative"
          style={{ maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header with restaurant branding */}
          <div 
            className="relative px-8 py-12 text-center text-white"
            style={{ 
              background: `linear-gradient(135deg, ${branding?.primaryColor || '#ef4444'} 0%, ${branding?.secondaryColor || '#dc2626'} 100%)` 
            }}
          >
            {/* Restaurant logo */}
            {branding?.logo && (
              <div className="mb-6">
                <img 
                  src={branding.logo} 
                  alt={restaurant?.name} 
                  className="w-20 h-20 mx-auto rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
            )}

            {/* Welcome message */}
            <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: branding?.fontFamily || 'Inter' }}>
              Welcome to {restaurant?.name}!
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Ready to place your order?
            </p>

            {/* Restaurant info */}
            <div className="flex flex-wrap justify-center gap-4 text-sm opacity-80">
              {restaurant?.phone && (
                <span className="flex items-center gap-1">
                  📞 {restaurant.phone}
                </span>
              )}
              {restaurant?.address && (
                <span className="flex items-center gap-1">
                  📍 {restaurant.address}
                </span>
              )}
            </div>
          </div>

          {/* Content body */}
          <div className="px-8 py-8">
            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${branding?.primaryColor || '#ef4444'}20` }}
                >
                  <ShoppingBag 
                    className="w-8 h-8" 
                    style={{ color: branding?.primaryColor || '#ef4444' }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy Ordering</h3>
                <p className="text-sm text-gray-600">Browse our menu and add items to your cart with just a tap</p>
              </div>

              <div className="text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${branding?.primaryColor || '#ef4444'}20` }}
                >
                  <Clock 
                    className="w-8 h-8" 
                    style={{ color: branding?.primaryColor || '#ef4444' }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quick Service</h3>
                <p className="text-sm text-gray-600">Fast preparation and delivery right to your table</p>
              </div>

              <div className="text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${branding?.primaryColor || '#ef4444'}20` }}
                >
                  <Star 
                    className="w-8 h-8" 
                    style={{ color: branding?.primaryColor || '#ef4444' }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Food</h3>
                <p className="text-sm text-gray-600">Fresh ingredients and expertly prepared dishes</p>
              </div>
            </div>

            {/* Table info if available */}
            {(() => {
              const urlParams = new URLSearchParams(window.location.search);
              const tableNumber = urlParams.get('table');
              const menuType = tableNumber?.toUpperCase().startsWith('VIP') ? 'VIP' : 'REGULAR';
              
              return tableNumber && (
                <div className="mb-8">
                  <div className={`p-4 rounded-2xl text-center ${
                    menuType === 'VIP' 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200' 
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200'
                  }`}>
                    <div className="text-2xl mb-2">
                      {menuType === 'VIP' ? '👑' : '🍽️'}
                    </div>
                    <h3 className={`font-bold text-lg mb-1 ${
                      menuType === 'VIP' ? 'text-orange-800' : 'text-blue-800'
                    }`}>
                      {menuType === 'VIP' ? 'VIP Experience' : 'Welcome to Table ' + tableNumber}
                    </h3>
                    <p className={`text-sm ${
                      menuType === 'VIP' ? 'text-orange-700' : 'text-blue-700'
                    }`}>
                      {menuType === 'VIP' 
                        ? 'Enjoy our premium menu with exclusive dishes and priority service' 
                        : 'Browse our delicious menu and place your order'}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Call to action */}
            <div className="text-center">
              <button
                onClick={handleClose}
                className="w-full py-4 px-8 rounded-2xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                style={{ 
                  background: `linear-gradient(135deg, ${branding?.primaryColor || '#ef4444'} 0%, ${branding?.secondaryColor || '#dc2626'} 100%)` 
                }}
              >
                Start Ordering Now
              </button>
              
              <p className="text-xs text-gray-500 mt-4">
                Tap anywhere outside this popup or the X button to close
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;