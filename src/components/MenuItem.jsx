import { useState } from "react";
import Modal from "./Modal";
import { toast } from "sonner";
import { useCart } from "../Context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

const MenuItem = ({ item }) => {
  if (!item) {
    console.warn('MenuItem rendered without an item prop');
    return null;
  }
   const [showModal, setShowModal] = useState(false);
   const [quantity, setQuantity] = useState(1);
   const [specialInstructions, setSpecialInstructions] = useState("");
   const { addToCart } = useCart();
   
  console.log("my item is showing please:", item);
  
  // Environment-aware image URL construction
  const getImageUrl = () => {
    if (item.image?.startsWith('http')) {
      return item.image; // Already a full URL
    }
    
    // In development, use proxy (Vite redirects /uploads to backend)
    if (import.meta.env.DEV) {
      return item.image; // Use proxy
    }
    
    // In production, use the deployed backend URL
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    return `${backendUrl}${item.image}`;
  };
  
  const imageUrl = getImageUrl();
  
  
  // Test if backend is reachable
  fetch('http://localhost:8000/test')
    .then(res => res.text())
    .then(data => console.log('Backend test:', data))
    .catch(err => console.log('Backend not reachable:', err));
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
    // This is where you would typically dispatch to your cart context/state
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
 



    // Reset modal state and close
    setShowModal(false);
    setSpecialInstructions("");
    // Optionally reset quantity to 1 after adding to cart 
    // setQuantity(1);
  };

  const totalPrice = (item.price * quantity).toFixed(2);

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 max-w-sm border border-gray-100 hover:border-red-200">
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-48 object-contain object-center transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              console.log('Image failed to load:', imageUrl);
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
            onLoad={() => console.log('Image loaded successfully:', imageUrl)}
          />
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
                {formatCurrency(item.price)}
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
                className="w-9 h-9 rounded-full bg-white border-2 border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-bold"
              >
                −
              </button>
              <span className="font-bold text-lg w-12 text-center text-gray-800">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                className="w-9 h-9 rounded-full bg-white border-2 border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleShowModal}
              className="px-6 py-3 rounded-full font-bold transition-all transform bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 hover:scale-105 text-white flex items-center space-x-2 shadow-lg hover:shadow-xl"
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
              Unit Price: {formatCurrency(item.price)}
            </p>
          </div>

          {/* Special Instructions */}
          <div>
            <h3 className="font-semibold mb-2">Special Instructions</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special instructions?"
              className="w-full outline-none focus:ring-2 focus:ring-red-300 p-3 border rounded-md resize-none"
              rows={3}
            />
          </div>

          {/* Total and Actions */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold">Total:  {formatCurrency(totalPrice)}</span>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
