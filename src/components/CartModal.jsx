import { useState, useEffect } from "react";
import { useCart } from "../Context/CartContext";
import Modal from "../components/Modal";
import { User, Mail, Phone, ShoppingCart, Trash2, Loader2, QrCode } from "lucide-react";
import { useCreateOrderMutation } from "../slices/orderSlice";
import { toast } from "sonner";
import { formatCurrency } from "../utils/formatCurrency";



const CartModal = ({ isOpen, onClose, onOrderSuccess }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");

  const [errors, setErrors] = useState({});
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateOrderInfo, setDuplicateOrderInfo] = useState(null);


  const [createOrder, { isLoading }] = useCreateOrderMutation();

  // Auto-populate customer info from localStorage
  useEffect(() => {
    const savedCustomerInfo = localStorage.getItem('customerInfo');
    if (savedCustomerInfo) {
      const parsedInfo = JSON.parse(savedCustomerInfo);
      setCustomerInfo(parsedInfo);
    }
  }, []);

  // Save customer info to localStorage when it changes
  useEffect(() => {
    if (customerInfo.name || customerInfo.email || customerInfo.phone) {
      localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
    }
  }, [customerInfo]);

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

    if (!paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createOrderData = () => ({
    tableNumber,
    customerName: customerInfo.name,
    customerEmail: customerInfo.email,
    customerPhone: customerInfo.phone || null,
    paymentMethod,
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
      const orderData = {
        ...createOrderData(),
        confirmDuplicate
      };
      
      const result = await createOrder(orderData).unwrap();

      const orderConfirmationData = {
        orderNumber: result.data?.orderNumber || 'N/A',
        customerName: result.data?.customerName || customerInfo.name,
        customerEmail: result.data?.customerEmail || customerInfo.email,
        customerPhone: result.data?.customerPhone || customerInfo.phone,
        tableNumber: result.data?.tableNumber || tableNumber,
        items: result.data?.items || cartItems,
        totalAmount: result.data?.totalAmount || parseFloat(total),
        orderTime: result.data?.orderTime || new Date().toISOString(),
        estimatedTime: result.data?.estimatedTime || "5-10 minutes"
      };

      // ✅ Call onOrderSuccess FIRST
      if (onOrderSuccess) {
        onOrderSuccess(orderConfirmationData);
      }

      // ✅ Close cart modal
      onClose();

      // ✅ Then clear the form data
      clearCart();
      setCustomerInfo({ name: "", email: "", phone: "" });
      setTableNumber("");
      setPaymentMethod("");
      setErrors({});
      setShowDuplicateModal(false);

    } catch (error) {
      console.error('Order creation error:', error);
      
      // Handle duplicate order detection
      if (error.status === 409 && error.data?.isDuplicate) {
        setDuplicateOrderInfo(error.data.existingOrder);
        setShowDuplicateModal(true);
        return;
      }
      
      // Handle other errors
      toast.error(error.data?.message || "Failed to place order. Please try again.");
    }
  }
};


  const { cartItems, removeFromCart, clearCart, tableNumber, setTableNumber } = useCart();

  const total = cartItems
    .reduce((sum, item) => sum + item.totalPrice, 0)
    .toFixed(2);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="bg-white w-full max-w-2xl max-h-[75vh] rounded-xl shadow-2xl flex flex-col relative border border-gray-200 z-10">
        {/* Header - Fixed at top */}
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 border-b border-red-300 p-6 rounded-t-xl z-20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Your Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="p-8">
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
                      className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border border-gray-100"
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
                          {formatCurrency(item.totalPrice)}
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
                      Total: {formatCurrency(total)}
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

                  <div className="grid gap-6">
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
                          placeholder={tableNumber ? `Table ${tableNumber}` : "Table number will appear after scanning QR code"}
                          value={tableNumber ? `Table ${tableNumber}` : ''}
                          readOnly
                          required
                          className={`block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 bg-gray-50 cursor-not-allowed ${
                            errors.tableNumber
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />

                      </div>
                      {errors.tableNumber && (
                        <p className="text-red-600 text-sm">
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
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
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
                          className={`relative z-0 block w-full pl-11 pr-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                            errors.name
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300 bg-white"
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-600 text-sm">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* ⚠️ EMAIL FIELD - THIS WAS MISSING! */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Enter your email"
                          value={customerInfo.email}
                          onChange={handleInputChange}
                          required
                          className={`relative z-0 block w-full pl-11 pr-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                            errors.email
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300 bg-white"
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-600 text-sm">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="Enter phone number"
                          value={customerInfo.phone}
                          onChange={handleInputChange}
                          className="relative z-0 block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Payment Method Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Method *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === 'cash' 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={(e) => {
                              setPaymentMethod(e.target.value);
                              if (errors.paymentMethod) {
                                setErrors((prev) => ({ ...prev, paymentMethod: "" }));
                              }
                            }}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'cash' ? 'border-red-500' : 'border-gray-300'
                            }`}>
                              {paymentMethod === 'cash' && (
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">💵 Cash</p>
                              <p className="text-xs text-gray-500">Pay with cash on delivery</p>
                            </div>
                          </div>
                        </label>
                        
                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === 'transfer' 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="transfer"
                            checked={paymentMethod === 'transfer'}
                            onChange={(e) => {
                              setPaymentMethod(e.target.value);
                              if (errors.paymentMethod) {
                                setErrors((prev) => ({ ...prev, paymentMethod: "" }));
                              }
                            }}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'transfer' ? 'border-red-500' : 'border-gray-300'
                            }`}>
                              {paymentMethod === 'transfer' && (
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">🏦 Transfer</p>
                              <p className="text-xs text-gray-500">Pay via bank transfer</p>
                            </div>
                          </div>
                        </label>
                      </div>
                      {errors.paymentMethod && (
                        <p className="text-red-600 text-sm">
                          {errors.paymentMethod}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <div className="mt-8">
                    <button
                      onClick={() => handlePlaceOrder(false)}
                      disabled={cartItems.length === 0 || isLoading}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-[15px] text-white py-4 px-8 rounded-lg hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-200 focus:outline-none transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                      {isLoading
                        ? "Placing Order..."
                        : cartItems.length === 0
                        ? "Cart is Empty"
                        : `Place Order - ${formatCurrency(total)}`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Footer - Fixed at bottom */}
        <div className="bg-gray-50 px-8 py-4 rounded-b-xl flex-shrink-0 z-20">
          <p className="text-sm text-gray-500 text-center">
            🔒 Your information is secure and protected
          </p>
        </div>
        </div>
      </div>



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