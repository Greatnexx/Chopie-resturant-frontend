import { CheckCircle, Clock, ShoppingBag, Eye, Copy, Download, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency";
import { useState } from "react";

const OrderConfirmationModal = ({ isOpen, orderData, onClose, onPlaceAnother }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !orderData) return null;

  const handleTrackOrder = () => {
    navigate(`/trackorder`);
    onClose();
  };

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderData.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
===========================================
           LaQuinta Club 
           ORDER CONFIRMATION
===========================================

Order Number: ${orderData.orderNumber}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Customer Details:
Name: ${orderData.customerName}
Phone: ${orderData.customerPhone || 'N/A'}
Table: ${orderData.tableNumber}

-------------------------------------------
                ORDER ITEMS
-------------------------------------------
${orderData.items?.map(item => 
  `${item.name} x${item.quantity} - ${formatCurrency(item.totalPrice)}${item.specialInstructions ? `\n  Note: ${item.specialInstructions}` : ''}`
).join('\n')}

-------------------------------------------
TOTAL AMOUNT: ${formatCurrency(orderData.totalAmount)}
-------------------------------------------

Estimated Time: 5-10 minutes

Thank you for choosing LaQuinta Club!
We appreciate your business.

===========================================
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chopie-Receipt-${orderData.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Success Header */}
        <div className="bg-green-50 p-6 rounded-t-2xl text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-green-600">Your order has been sent</p>
        </div>

        {/* Order Details */}
        <div className="p-6">
          {/* Order Number */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Your Order Number</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <p className="text-3xl font-bold text-gray-800">#{orderData.orderNumber}</p>
              <button
                onClick={handleCopyOrderNumber}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Copy order number"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 mb-2">Order number copied!</p>
            )}
            <p className="text-sm text-gray-500">
              Keep this number for order tracking
            </p>
          </div>

          {/* Estimated Time */}
          <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-blue-800">Estimated Time</p>
              <p className="text-sm text-blue-600">5-10 minutes</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Order Summary</h3>
            </div>
            <div className="space-y-2">
              {orderData.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    {item.specialInstructions && (
                      <p className="text-xs text-orange-600 mt-1">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <p className="font-medium text-gray-800">{formatCurrency(item.totalPrice)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg text-gray-800">Total</p>
                <p className="font-bold text-lg text-gray-800">{formatCurrency(orderData.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Delivery Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Table</p>
                <p className="text-sm font-medium text-gray-800">{orderData.tableNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                <p className="text-sm font-medium text-gray-800">{orderData.customerName}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleTrackOrder}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <Eye className="w-4 h-4" />
              Track Order
            </button>
            
            <button
              onClick={handleDownloadReceipt}
              className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
            
            <button
              onClick={onPlaceAnother}
              className="w-full md:col-span-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Place Another Order
            </button>
            
            <button
              onClick={onClose}
              className="w-full md:col-span-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrderConfirmationModal;