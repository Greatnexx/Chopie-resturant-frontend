import { CheckCircle, Clock, ShoppingBag, Eye, Copy, Download, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency";
import { useState } from "react";
import jsPDF from "jspdf";

const OrderConfirmationModal = ({ isOpen, orderData, onClose, onPlaceAnother, restaurantName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !orderData) return null;

  // Extract restaurant ID from current URL
  const getRestaurantId = () => {
    const pathParts = location.pathname.split('/');
    const rIndex = pathParts.indexOf('r');
    return rIndex !== -1 && pathParts[rIndex + 1] ? pathParts[rIndex + 1] : null;
  };

  const handleTrackOrder = () => {
    const restaurantId = getRestaurantId();
    const base = restaurantId ? `/r/${restaurantId}/trackorder` : `/trackorder`;
    navigate(`${base}?order=${orderData.orderNumber}`);
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
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const fmt = (amount) => `N${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentW = pageW - margin * 2;
    let y = 16;

    const line = () => { doc.setDrawColor(220, 220, 220); doc.line(margin, y, pageW - margin, y); y += 5; };
    const text = (str, x, size = 10, style = 'normal', color = [40, 40, 40]) => {
      doc.setFontSize(size); doc.setFont('helvetica', style); doc.setTextColor(...color);
      doc.text(str, x, y);
    };

    // Header
    doc.setFillColor(239, 68, 68);
    doc.roundedRect(margin, y - 6, contentW, 18, 3, 3, 'F');
    doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text(restaurantName || 'Chopie', pageW / 2, y + 4, { align: 'center' });
    y += 18;

    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
    doc.text('Order Confirmation Receipt', pageW / 2, y, { align: 'center' });
    y += 8;

    line();

    // Order meta
    text(`Order #${orderData.orderNumber}`, margin, 11, 'bold', [30, 30, 30]);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
    doc.text(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageW - margin, y, { align: 'right' });
    y += 8;

    // Customer info
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, y, contentW, 18, 2, 2, 'F');
    y += 5;
    text(`Customer: ${orderData.customerName}`, margin + 3, 9, 'normal', [60, 60, 60]);
    y += 5;
    text(`Table: ${orderData.tableNumber}`, margin + 3, 9, 'normal', [60, 60, 60]);
    if (orderData.customerPhone) { y += 5; text(`Phone: ${orderData.customerPhone}`, margin + 3, 9, 'normal', [60, 60, 60]); }
    y += 8;

    line();

    // Items header
    text('Item', margin, 9, 'bold', [100, 100, 100]);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 100, 100);
    doc.text('Qty', pageW - margin - 28, y, { align: 'right' });
    doc.text('Price', pageW - margin, y, { align: 'right' });
    y += 6;

    // Items
    orderData.items?.forEach(item => {
      const nameLines = doc.splitTextToSize(item.name, contentW - 40);
      text(nameLines[0], margin, 10, 'normal', [30, 30, 30]);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
      doc.text(`x${item.quantity}`, pageW - margin - 28, y, { align: 'right' });
      doc.text(fmt(item.totalPrice), pageW - margin, y, { align: 'right' });
      y += 5;
      if (item.specialInstructions) {
        doc.setFontSize(8); doc.setTextColor(180, 100, 0);
        doc.text(`Note: ${item.specialInstructions}`, margin + 3, y);
        y += 4;
      }
    });

    y += 2;
    line();

    // Total
    text('Total Amount', margin, 12, 'bold', [30, 30, 30]);
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(239, 68, 68);
    doc.text(fmt(orderData.totalAmount), pageW - margin, y, { align: 'right' });
    y += 10;

    // Estimated time
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
    y += 6;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(59, 130, 246);
    doc.text(' Estimated Time: 5-10 minutes', pageW / 2, y, { align: 'center' });
    y += 12;

    // Footer
    doc.setFontSize(9); doc.setFont('helvetica', 'italic'); doc.setTextColor(150, 150, 150);
    doc.text(`Thank you for your order! - ${restaurantName || 'Chopie'}`, pageW / 2, y, { align: 'center' });

    doc.save(`${restaurantName || 'Chopie'}-Receipt-${orderData.orderNumber}.pdf`);
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