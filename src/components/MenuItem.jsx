import { useState } from "react";
import Modal from "./Modal";
import { toast } from "sonner";
import { useCart } from "../Context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";
import { getBaseUrl } from "../utils/apiUtils";

const MenuItem = ({ item, tenantBranding, restaurantId, onAddToCart, isStaffInterface = false, menuType = 'REGULAR' }) => {
  if (!item) {
    console.warn('MenuItem rendered without an item prop');
    return null;
  }
  
   const [showModal, setShowModal] = useState(false);
   const [quantity, setQuantity] = useState(1);
   const [specialInstructions, setSpecialInstructions] = useState("");
   const { addToCart } = useCart();
   
   // Update CSS variables if tenant branding is provided
   if (tenantBranding?.primaryColor) {
     document.documentElement.style.setProperty('--primary-color', tenantBranding.primaryColor);
   }
   if (tenantBranding?.secondaryColor) {
     document.documentElement.style.setProperty('--secondary-color', tenantBranding.secondaryColor);
   }

  // Get correct price based on menu type for staff interface
  const getDisplayPrice = () => {
    if (isStaffInterface && item.menuTypes && item.menuTypes[menuType]) {
      return item.menuTypes[menuType].price;
    }
    return item.price;
  };

  const displayPrice = getDisplayPrice();

  // Environment-aware image URL construction
  const getImageUrl = () => {
    if (!item.image) return null;
    if (item.image.startsWith('http')) {
      return item.image; // Already a full URL
    }
    
    const baseUrl = getBaseUrl().replace('/api/v1', '');
    const fullUrl = `${baseUrl}${item.image}`;
    console.log('MenuItem Image URL:', fullUrl, 'Original path:', item.image);
    return fullUrl;
  };
  
  const imageUrl = getImageUrl();

  // Test if backend is reachable (removed for production)
  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (isStaffInterface && onAddToCart) {
      // Staff interface - use callback
      onAddToCart(item, quantity);
      toast.success("Added to cart", {
        description: `${quantity} x ${item.name} added successfully.`,
      });
    } else {
      // Customer interface - use cart context
      const cartItem = {
        ...item,
        quantity,
        specialInstructions: specialInstructions.trim(),
        totalPrice: item.price * quantity,
      };

      addToCart(cartItem);
      toast.success("Added to cart", {
        description: `${quantity} x ${item.name} added successfully.`,
      });
    }

    // Reset modal state and close
    setShowModal(false);
    setSpecialInstructions("");
  };

  const totalPrice = (item.price * quantity).toFixed(2);

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 max-w-sm border border-gray-100 hover:border-primary/30 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={imageUrl || '/placeholder-food.jpg'}
            alt={item.name}
            className="w-full h-48 object-contain object-center transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              // Use a simple colored div as fallback instead of external placeholder
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          {/* Fallback div when image fails */}
          <div 
            className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 font-medium" 
            style={{ display: 'none' }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <div>No Image</div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          {item.nutritionalInfo && (
            <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white font-medium shadow-lg">
              🔥 {item.nutritionalInfo.calories} cal
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 bg-gradient-to-b from-white to-gray-50/50">
          {/* Title and Price */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-800 leading-tight">{item.name}</h3>
            <div className="bg-black text-white px-3 py-1 rounded-lg shadow-md">
              <span className="text-lg font-bold">
                {formatCurrency(displayPrice)}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="text-xs text-gray-500 mb-3">
              ⚠️ Contains: {item.allergens.join(", ")}
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-9 h-9 rounded-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white focus:bg-primary focus:text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                −
              </button>
              <span className="font-bold text-lg w-12 text-center text-gray-800">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                className="w-9 h-9 rounded-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white focus:bg-primary focus:text-white transition-all flex items-center justify-center shadow-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                +
              </button>
            </div>

            <button
              onClick={handleShowModal}
              className="px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 focus:scale-105 text-white flex items-center space-x-2 shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <span className="text-lg">🛒</span>
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Customize Your Order"
      >
        <div className="space-y-4">
          {/* Item Details */}
          <div className="border-b pb-4">
            <p className="font-bold text-lg mb-2">{item.name}</p>
            <p className="text-gray-600 mb-2">Quantity: {quantity}</p>
            <p className="text-gray-600">
              Unit Price: {formatCurrency(displayPrice)}
            </p>
          </div>

          {/* Special Instructions */}
          <div>
            <h3 className="font-semibold mb-2">Special Instructions</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special instructions?"
              className="w-full outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary p-3 border border-gray-300 rounded-md resize-none transition-colors"
              rows={3}
            />
          </div>

          {/* Total and Actions */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold">Total:  {formatCurrency(displayPrice * quantity)}</span>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MenuItem;
