import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentTenant, selectTenantBranding } from '../slices/tenantSlice';
import { useGetRestaurantPublicInfoQuery } from '../slices/apiSlice';
import MenuList from './MenuList';
import CartModal from './CartModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import SimpleLiveChat from './SimpleLiveChat';
import EventImagePopup from './EventImagePopup';
import { useCart } from '../Context/CartContext';
import { MessageCircle, Search, Clock } from 'lucide-react';
import { getBaseUrl } from '../utils/apiUtils';

const TenantMenuPage = () => {
  const currentTenant = useSelector(selectCurrentTenant);
  const branding = useSelector(selectTenantBranding);
  const { data: restaurantInfo } = useGetRestaurantPublicInfoQuery(currentTenant?.subdomain, {
    skip: !currentTenant?.subdomain
  });
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [orderConfirmationData, setOrderConfirmationData] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showEventPopup, setShowEventPopup] = useState(false);
  
  const { cartItems } = useCart();

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseUrl = getBaseUrl().replace('/api/v1', '');
    return `${baseUrl}${logoPath}`;
  };

  const isRestaurantClosed = restaurantInfo?.data?.isOpen === false;

  useEffect(() => {
    if (currentTenant) {
      fetchMenuData();
      // Show event popup immediately when tenant is loaded
      setShowEventPopup(true);
    }
  }, [currentTenant]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const categoriesResponse = await fetch(`${getBaseUrl()}/tenant/${currentTenant.subdomain}/categories`);
      const categoriesData = await categoriesResponse.json();

      if (categoriesData.status) {
        setCategories([{ _id: 'all', name: 'All Items' }, ...categoriesData.data]);
        
        // Check if we have a table number for VIP/Regular specific menu
        const urlParams = new URLSearchParams(window.location.search);
        const tableNumber = urlParams.get('table');
        
        if (tableNumber && categoriesData.data.length > 0) {
          // Fetch table-specific menu for all categories
          const allMenuItems = [];
          
          for (const category of categoriesData.data) {
            try {
              const menuResponse = await fetch(`${getBaseUrl()}/menus/${category._id}/table/${tableNumber}`, {
                headers: {
                  'X-Tenant-Subdomain': currentTenant.subdomain
                }
              });
              const menuData = await menuResponse.json();
              
              if (menuData.success && menuData.data?.menus) {

                allMenuItems.push(...menuData.data.menus);
              }
            } catch (error) {
              console.error(`Error fetching menu for category ${category.name}:`, error);
            }
          }
          
          setMenuItems(allMenuItems);

        } else {
          // Fallback to regular menu fetch
          const menuResponse = await fetch(`${getBaseUrl()}/tenant/${currentTenant.subdomain}/menu`);
          const menuData = await menuResponse.json();

          if (menuData.status) {
            setMenuItems(menuData.data);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSuccess = (orderData) => {
    setOrderConfirmationData(orderData);
    setShowOrderConfirmation(true);
    setShowCart(false);
  };

  const handlePlaceAnotherOrder = () => {
    setShowOrderConfirmation(false);
    setOrderConfirmationData(null);
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => {
        // Handle both populated category objects and category IDs
        const categoryId = typeof item.category === 'object' ? item.category._id : item.category;
        return categoryId === selectedCategory;
      });

  if (!currentTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" 
             style={{ borderColor: branding?.primaryColor || '#ef4444' }}></div>
      </div>
    );
  }

  // Show closed message if restaurant is closed
  if (isRestaurantClosed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: branding?.fontFamily || 'Inter' }}>
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6">
            {branding?.logo && (
              <img 
                src={getLogoUrl(branding.logo)} 
                alt={currentTenant.name} 
                className="h-16 w-16 mx-auto object-cover rounded-lg mb-4"
              />
            )}
            <h1 className="text-2xl font-bold mb-2" style={{ color: branding?.primaryColor || '#ef4444' }}>
              {currentTenant.name}
            </h1>
          </div>
          <div className="text-center">
            <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">We're Currently Closed</h2>
            <p className="text-gray-600 mb-4">Sorry, we're not taking orders right now. Please check back during our operating hours.</p>
            {restaurantInfo?.data?.operatingHours && (
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-2">Operating Hours:</p>
                <div className="space-y-1">
                  {Object.entries(restaurantInfo.data.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize">{day}:</span>
                      <span>{hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: branding?.fontFamily || 'Inter' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4" 
              style={{ borderBottomColor: branding?.primaryColor || '#ef4444' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              {branding?.logo && (
                <img 
                  src={getLogoUrl(branding.logo)} 
                  alt={currentTenant.name} 
                  className="h-6 w-6 sm:h-10 sm:w-10 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold truncate" 
                    style={{ color: branding?.primaryColor || '#ef4444' }}>
                  {currentTenant.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Order Online</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                onClick={() => window.open(`/r/${currentTenant.subdomain}/track`, '_blank')}
                className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-full text-white hover:opacity-80 transition-opacity flex items-center space-x-1 sm:space-x-2"
                style={{ backgroundColor: branding?.primaryColor || '#ef4444' }}
                title="Track Order"
              >
                <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Track Order</span>
                <span className="text-xs font-medium sm:hidden">Track</span>
              </button>
              
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 sm:p-2.5 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-white/20"
                style={{ backgroundColor: branding?.primaryColor || '#ef4444' }}
                title="View Cart"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
                </svg>
                {cartItems.length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                      {cartItems.length}
                    </span>
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Type Indicator */}
      {(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tableNumber = urlParams.get('table');
        const menuType = tableNumber?.toUpperCase().startsWith('VIP') ? 'VIP' : 'REGULAR';
        
        return tableNumber && (
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                menuType === 'VIP' 
                  ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-300' 
                  : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-300'
              }`}>
                {menuType === 'VIP' ? '👑 VIP Menu - Premium Pricing' : '🍽️ Regular Menu'} - Table {tableNumber}
                <span className="ml-2 text-xs opacity-75">
                  
                </span>
              </div>
            </div>
          </div>
        );
      })()}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{currentTenant.name}</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-4">{currentTenant.address}</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
              <span>📞 {currentTenant.phone}</span>
              <span>📧 {currentTenant.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  selectedCategory === category._id
                    ? 'border-current text-current'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  color: selectedCategory === category._id 
                    ? branding?.primaryColor || '#ef4444' 
                    : undefined,
                  borderBottomColor: selectedCategory === category._id 
                    ? branding?.primaryColor || '#ef4444' 
                    : undefined
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MenuList 
          items={filteredItems} 
          tenantBranding={branding}
          restaurantId={currentTenant._id}
        />
      </main>

      {/* Cart Modal */}
      {showCart && (
        <CartModal 
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Order Confirmation Modal */}
      {showOrderConfirmation && (
        <OrderConfirmationModal
          isOpen={showOrderConfirmation}
          orderData={orderConfirmationData}
          onClose={() => setShowOrderConfirmation(false)}
          onPlaceAnother={handlePlaceAnotherOrder}
        />
      )}

      {/* Live Chat */}
      {showChat && (
        <SimpleLiveChat
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          customerName={`Customer-${Date.now()}`}
          customerEmail={''}
          orderNumber={''}
          restaurantId={currentTenant?._id || currentTenant?.id || window.location.pathname.split('/')[2]}
        />
      )}

      {/* Event Image Popup */}
      <EventImagePopup
        isOpen={showEventPopup}
        onClose={() => setShowEventPopup(false)}
        restaurantId={currentTenant._id}
        branding={branding}
      />
    </div>
  );
};

export default TenantMenuPage;