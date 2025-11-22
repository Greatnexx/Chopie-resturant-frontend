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
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg max-w-sm">
        {/* Image Section */}
        <div className="relative ">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm">
            ⏱️ {item.prepTime} min
          </div>
          {item.nutritionalInfo && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs">
              🔥 {item.nutritionalInfo.calories} cal
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title and Price */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
            <span className="text-2xl font-bold text-red-500">
              {formatCurrency(item.price)}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-3">{item.description}</p>

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="text-xs text-gray-500 mb-3">
              ⚠️ Contains: {item.allergens.join(", ")}
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-full border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="font-semibold text-lg w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                className="w-8 h-8 rounded-full border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-all flex items-center justify-center"
              >
                +
              </button>
            </div>

            <button
              onClick={handleShowModal}
              className="px-6 py-2 rounded-full font-medium transition-all transform bg-red-500 hover:bg-red-600 hover:scale-105 text-white flex items-center space-x-2"
            >
              <span>🛒</span>
              <span>Add to Cart</span>
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
