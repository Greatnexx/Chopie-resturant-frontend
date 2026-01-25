import { useState } from 'react';
import { toast } from 'sonner';
import { useBranding } from '../Context/BrandingContext';

const StaffCartModal = ({ 
  cart, 
  onClose, 
  onUpdateItem, 
  tableNumber, 
  customerName, 
  customerNotes, 
  paymentMethod,
  totalPrice,
  onClearCart
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { branding } = useBranding();

  const handleSubmitOrder = async () => {
    if (!tableNumber.trim()) {
      toast.error('Please enter a table number');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user info
      const restaurantUser = JSON.parse(sessionStorage.getItem('restaurantUser'));
      const token = restaurantUser?.data?.token;
      const userId = restaurantUser?.data?.user?._id || restaurantUser?.data?._id;
      const restaurantId = restaurantUser?.data?.user?.restaurantId || restaurantUser?.data?.restaurantId;
      
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || '',
          totalPrice: item.price * item.quantity,
          image: item.image
        })),
        tableNumber: tableNumber.trim(),
        customerName: customerName.trim() || 'Walk-in Customer',
        notes: customerNotes.trim(),
        orderSource: 'staff',
        createdBy: userId,
        totalAmount: totalPrice,
        paymentMethod: paymentMethod
      };

      // Submit order
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

      const response = await fetch(`${apiUrl}/staff-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Restaurant-ID': restaurantId
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const orderData = await response.json();
        toast.success('Order submitted successfully!', {
          description: `Order #${orderData.data?.orderNumber} for Table ${tableNumber}`
        });
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          // Use same-tab navigation to avoid popup blockers
          window.location.href = '/restaurant/dashboard';
        }, 3000);
        
        onClearCart && onClearCart();
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Order submission failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Server error: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit order', {
        description: 'Please try again or contact support'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Order Summary</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Order Details */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Table:</span> {tableNumber || 'Not specified'}
            </div>
            <div>
              <span className="font-medium">Customer:</span> {customerName || 'Walk-in Customer'}
            </div>
            <div>
              <span className="font-medium">Payment:</span> {paymentMethod === 'cash' ? '💵 Cash' : '🏦 Transfer'}
            </div>
            {customerNotes && (
              <div className="col-span-2">
                <span className="font-medium">Notes:</span> {customerNotes}
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {cart.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Cart is empty
            </div>
          ) : (
            <div className="p-6">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">₦{item.price.toFixed(2)} each</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateItem(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateItem(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right min-w-[80px]">
                      <p className="font-medium">₦{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    
                    <button
                      onClick={() => onUpdateItem(item._id, 0)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold">Total: ₦{totalPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || cart.length === 0 || !tableNumber.trim()}
              className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: branding.primaryColor }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCartModal;