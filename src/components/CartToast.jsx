import { useState, useEffect } from 'react';
import { CheckCircle, ShoppingCart, X } from 'lucide-react';

const CartToast = ({ show, onClose, itemName, itemCount }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed top-24 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-2xl p-4 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Added to Cart!
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {itemName} {itemCount > 1 && `(${itemCount})`}
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <ShoppingCart className="h-4 w-4 mr-1" />
              <span className="font-medium">Click cart button to checkout</span>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartToast;