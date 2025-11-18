import { useState } from "react";
import { useCart } from "../Context/CartContext";
import Modal from "../components/Modal";
import { User, Mail, Phone, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { useCreateOrderMutation } from "../slices/orderSlice";
import { toast } from "sonner";


const CartModal = ({ isOpen, onClose }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [tableNumber, setTableNumber] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateOrderInfo, setDuplicateOrderInfo] = useState(null);

  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({
      ...customerInfo,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!tableNumber.trim()) {
      newErrors.tableNumber = "Table number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createOrderData = () => ({
    tableNumber,
    customerName: customerInfo.name,
    customerEmail: customerInfo.email,
    customerPhone: customerInfo.phone || null,
    items: cartItems.map(item => ({
      productId: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions || null,
      totalPrice: item.totalPrice,
    })),
    totalAmount: parseFloat(total),
  });

  const handlePlaceOrder = async (confirmDuplicate = false) => {
    if (validateForm() && cartItems.length > 0) {
      try {
        const orderData = { ...createOrderData(), confirmDuplicate };
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const result = await Promise.race([
          createOrder(orderData).unwrap(),
          timeoutPromise
        ]);
        
        toast.success("Order placed successfully!", {
          description: `Order #${result.data.orderNumber} has been sent to the kitchen. You can track your order status anytime.`,
          duration: 4000,
        });
        
        clearCart();
        setCustomerInfo({ name: "", email: "", phone: "" });
        setTableNumber("");
        setErrors({});
        setShowDuplicateModal(false);
        onClose();
      } catch (error) {
        if (error?.data?.isDuplicate) {
          setDuplicateOrderInfo(error.data.existingOrder);
          setShowDuplicateModal(true);
        } else {
          const errorMessage = error.message === 'Request timeout' 
            ? "Order is taking longer than expected. Please check your connection and try again."
            : error?.data?.message || "Something went wrong. Please try again.";
          
          toast.error("Failed to place order", {
            description: errorMessage,
            duration: 6000,
          });
        }
      }
    }
  };



  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems
    .reduce((sum, item) => sum + item.totalPrice, 0)
    .toFixed(2);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col relative border border-gray-200">
        {/* Header - Fixed at top */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="p-6">
            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">
                  Add some items to get started
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item, cardId) => (
                    <div
                      key={item.cartId}
                      className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {item.name} × {item.quantity}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Note:</span>{" "}
                            {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-800">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(cardId)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">
                      Total: ${total}
                    </span>
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Cart
                    </button>
                  </div>
                </div>

                {/* Customer Information Form */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Customer Information
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Please fill in your details to complete the order
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Table Number Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="tableNumber"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Table Number *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="tableNumber"
                          name="tableNumber"
                          placeholder="Enter your table number"
                          value={tableNumber}
                          onChange={(e) => {
                            setTableNumber(e.target.value);
                            if (errors.tableNumber) {
                              setErrors((prev) => ({ ...prev, tableNumber: "" }));
                            }
                          }}
                          required
                          className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                            errors.tableNumber
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300 bg-white"
                          }`}
                        />
                      </div>
                      {errors.tableNumber && (
                        <p className="text-red-600 text-xs flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                          {errors.tableNumber}
                        </p>
                      )}
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Enter your full name"
                          value={customerInfo.name}
                          onChange={handleInputChange}
                          required
                          className={`relative z-0 block w-full pl-9 pr-3 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                            errors.name
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300 bg-white"
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-600 text-xs flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Enter your email address"
                          value={customerInfo.email}
                          onChange={handleInputChange}
                          required
                          className={`relative z-0 block w-full pl-9 pr-3 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                            errors.email
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300 bg-white"
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-600 text-xs flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone Field - Full Width */}
                    <div className="space-y-2 md:col-span-2">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="Enter your phone number"
                          value={customerInfo.phone}
                          onChange={handleInputChange}
                          className="relative z-0 block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors text-sm"
                        />
                      </div>
                      <p className="text-gray-500 text-xs">
                        Optional - for order updates and support
                      </p>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <div className="mt-8">
                    <button
                      onClick={() => handlePlaceOrder(false)}
                      disabled={cartItems.length === 0 || isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 focus:outline-none transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                      {isLoading
                        ? "Placing Order..."
                        : cartItems.length === 0
                        ? "Cart is Empty"
                        : `Place Order - $${total}`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex-shrink-0 z-20">
          <p className="text-xs text-gray-500 text-center">
            Your information is secure and will never be shared with third
            parties.
          </p>
        </div>
      </Modal>

      {/* Duplicate Order Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Duplicate Order Detected</h3>
            <p className="text-gray-600 mb-4">
              You already have a similar order (#{duplicateOrderInfo?.orderNumber}) placed recently. 
              Do you want to proceed with this new order?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePlaceOrder(true)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? "Placing..." : "Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}
      

    </>
  );
};

export default CartModal;
