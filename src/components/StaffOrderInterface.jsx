import { useState, useEffect } from 'react';
import { useGetCategoriesQuery, useGetMenuItemsQuery } from '../slices/baseApiSlice';
import { useGetRestaurantOrderQuery, useModifyOrderMutation } from '../slices/restaurantSlice';
import MenuList from './MenuList';
import CategoryTab from './CategoryTab';
import StaffCartModal from './StaffCartModal';
import { useBranding } from '../Context/BrandingContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const StaffOrderInterface = () => {
  const [searchParams] = useSearchParams();
  const editOrderId = searchParams.get('editOrder');
  const isEditMode = !!editOrderId;
  const navigate = useNavigate();
  
  const [activeCategory, setActiveCategory] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState([]);
  const [menuType, setMenuType] = useState('REGULAR');
  const { branding } = useBranding();

  // Fetch existing order if in edit mode
  const { data: existingOrderData } = useGetRestaurantOrderQuery(editOrderId, {
    skip: !isEditMode
  });
  const [modifyOrder] = useModifyOrderMutation();

  // Fetch categories and menu items
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: menuData, isLoading: menuLoading } = useGetMenuItemsQuery(activeCategory, {
    skip: !activeCategory || activeCategory === 'undefined'
  });

  const categories = categoriesData?.data || [];
  const menuItems = menuData?.data || [];

  // Load existing order data when in edit mode
  useEffect(() => {
    if (isEditMode && existingOrderData?.data) {
      const order = existingOrderData.data;
      setTableNumber(order.tableNumber);
      setCustomerName(order.customerName || '');
      setCustomerPhone(order.customerPhone || '');
      setCustomerNotes(order.customerNotes || '');
      
      // Convert order items to cart format
      const cartItems = order.items.map(item => ({
        _id: item._id || item.name, // fallback for items without _id
        name: item.name,
        price: item.totalPrice / item.quantity, // calculate unit price
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || ''
      }));
      setCart(cartItems);
      
      // Set menu type based on table number
      const type = order.tableNumber.toUpperCase().startsWith('VIP') ? 'VIP' : 'REGULAR';
      setMenuType(type);
    }
  }, [isEditMode, existingOrderData]);

  // Set first category as active by default
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]._id);
    }
  }, [categories, activeCategory]);

  // Detect menu type based on table number
  const handleTableNumberChange = (value) => {
    setTableNumber(value);
    const type = value.toUpperCase().startsWith('VIP') ? 'VIP' : 'REGULAR';
    setMenuType(type);
  };

  const addToCart = (item, quantity = 1) => {
    // Get correct price based on menu type
    const price = item.menuTypes && item.menuTypes[menuType] 
      ? item.menuTypes[menuType].price 
      : item.price;
    
    const itemWithCorrectPrice = { ...item, price };
    
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { ...itemWithCorrectPrice, quantity }];
    });
  };

  const updateCartItem = (itemId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item._id !== itemId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item._id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderBottomColor: branding.primaryColor }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b mt-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Order' : 'Staff Order Interface'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {isEditMode ? `Editing Order #${existingOrderData?.data?.orderNumber || editOrderId}` : 'Take orders for customers'}
              </p>
            </div>
            
            <button
              onClick={() => setShowCart(true)}
              className="relative text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all w-full sm:w-auto"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
                </svg>
                <span>Cart ({getTotalItems()})</span>
              </div>
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Form */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Number *
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => handleTableNumberChange(e.target.value)}
                placeholder="e.g., 5 or VIP-1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
                style={{ '--tw-ring-color': branding.primaryColor + '33' }}
                onFocus={(e) => e.target.style.borderColor = branding.primaryColor}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                disabled={isEditMode}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
                style={{ '--tw-ring-color': branding.primaryColor + '33' }}
                onFocus={(e) => e.target.style.borderColor = branding.primaryColor}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
                style={{ '--tw-ring-color': branding.primaryColor + '33' }}
                onFocus={(e) => e.target.style.borderColor = branding.primaryColor}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. special requests, instructions, customer description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
                style={{ '--tw-ring-color': branding.primaryColor + '33' }}
                onFocus={(e) => e.target.style.borderColor = branding.primaryColor}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Type Indicator - only shown for VIP tables */}
      {menuType === 'VIP' && tableNumber && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
              <span className="hidden sm:inline">👑 VIP Pricing - Table {tableNumber}</span>
              <span className="sm:hidden">👑 VIP - T{tableNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <CategoryTab
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
      />

      {/* Menu Items */}
      {menuLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2" style={{ borderBottomColor: branding.primaryColor }}></div>
        </div>
      ) : (
        <MenuList 
          category={activeCategory} 
          items={menuItems}
          onAddToCart={addToCart}
          isStaffInterface={true}
          menuType={menuType}
        />
      )}

      {/* Cart Modal */}
      {showCart && (
        <StaffCartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateItem={updateCartItem}
          tableNumber={tableNumber}
          customerName={customerName}
          customerPhone={customerPhone}
          customerNotes={customerNotes}
          totalPrice={getTotalPrice()}
          onClearCart={clearCart}
          isEditMode={isEditMode}
          editOrderId={editOrderId}
          onOrderUpdate={(updatedOrder) => {
            // Handle successful order update
            console.log('Order updated:', updatedOrder);
          }}
        />
      )}
    </div>
  );
};

export default StaffOrderInterface;