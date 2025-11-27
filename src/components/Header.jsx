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
      <header className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-3 lg:p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link
            to={"/"}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <span className="text-xl lg:text-2xl">🍽️</span>
            <h1 className="text-xl lg:text-2xl font-bold">Chopie</h1>
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Link
              to="/trackorder"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-medium flex items-center justify-center gap-1 lg:gap-2 transition-all duration-200 hover:scale-105 whitespace-nowrap"
            >
              <Search className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Track Order</span>
              <span className="sm:hidden">Track</span>
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
            className="fixed bottom-4 lg:bottom-8 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-1 lg:space-x-2 z-40 animate-pulse hover:animate-none border-2 border-white/20 backdrop-blur-sm font-bold group text-sm lg:text-base"
          >
            <span className="text-lg lg:text-xl animate-bounce group-hover:animate-none">🛒</span>
            <span className="hidden sm:inline">View Cart ({count})</span>
            <span className="sm:hidden">({count})</span>
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center animate-ping">
              {count}
            </div>
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
              {count}
            </div>
          </button>
        </div>
      )}

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
    </>
  );
}

export default Header;