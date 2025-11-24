import { useState } from "react";
import { flushSync } from "react-dom";
import CartModal from "../components/CartModal";
import OrderConfirmationModal from "../components/OrderConfirmationModal";
import { useCart } from "../Context/CartContext";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const {cartItems} = useCart();
  const count = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleOrderSuccess = (orderDetails) => {
    console.log('🎯 Order success triggered!', orderDetails);
    
    // Force synchronous state updates
    flushSync(() => {
      setOrderData(orderDetails);
      setCartOpen(false);
      setShowConfirmation(true);
    });
    
    console.log('States set synchronously - modal should show now');
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
      <header className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link
            to={"/"}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <span className="text-2xl">🍽️</span>
            <h1 className="text-2xl font-bold">Chopie</h1>
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/trackorder"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <Search className="w-4 h-4" />
              Track Order
            </Link>
           
            <Link
              to="/restaurant/login"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              👨‍🍳 Restaurant
            </Link>
          </div>
        </div>
      </header>

      {count > 0 && (
        <div>
          {/* CART BUTTON */}
          <button
            onClick={() => {
              // Don't open cart if confirmation modal is showing
              if (!orderData) {
                setCartOpen(true);
              }
            }}
            className="fixed bottom-20 right-4 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center space-x-3 z-40"
          >
            🛒 View Cart {count}
          </button>
          
          {/* Cart Modal */}
          <CartModal 
            isOpen={cartOpen} 
            onClose={() => setCartOpen(false)}
            onOrderSuccess={handleOrderSuccess}
          />
          
          {/* Order Confirmation Modal */}
          {console.log('Rendering OrderConfirmationModal - showConfirmation:', showConfirmation, 'orderData:', orderData)}
          <OrderConfirmationModal
            isOpen={showConfirmation && !!orderData}
            orderData={orderData}
            onClose={handleCloseConfirmation}
            onPlaceAnother={handlePlaceAnother}
          />
        </div>
      )}
    </>
  );
}

export default Header;