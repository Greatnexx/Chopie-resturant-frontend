import { X, Download, Printer } from "lucide-react";

const ReceiptModal = ({ isOpen, onClose, orderData }) => {
  if (!isOpen || !orderData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = document.getElementById('receipt-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Order #${orderData.orderNumber}</title>
          <style>
            body { font-family: monospace; margin: 20px; }
            .receipt { max-width: 300px; margin: 0 auto; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
            .total { font-weight: bold; font-size: 16px; }
          </style>
        </head>
        <body>${receiptContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Receipt</h2>
          <div className="flex gap-2">
            <button onClick={handleDownload} className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="p-6 font-mono text-sm">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold">🍽️ CHOPIE RESTAURANT</h1>
            <p className="text-xs text-gray-600">Thank you for dining with us!</p>
            <div className="border-b border-dashed border-gray-400 my-3"></div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between">
              <span>Order #:</span>
              <span className="font-bold">{orderData.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(orderData.createdAt || Date.now()).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Table:</span>
              <span>{orderData.tableNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{orderData.customerName}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-gray-400 my-3"></div>

          <div className="mb-4">
            {orderData.items?.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <span>{item.name}</span>
                  <span>${(item.totalPrice || 0).toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-600 ml-2">
                  {item.quantity} x ${((item.totalPrice || 0) / item.quantity).toFixed(2)}
                </div>
                {item.specialInstructions && (
                  <div className="text-xs text-gray-500 ml-2 italic">
                    Note: {item.specialInstructions}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-gray-400 my-3"></div>

          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL:</span>
            <span>${(orderData.totalAmount || 0).toFixed(2)}</span>
          </div>

          <div className="border-b border-dashed border-gray-400 my-3"></div>

          <div className="text-center text-xs text-gray-600">
            <p>Thank you for your order!</p>
            <p>Visit us again soon</p>
            <p className="mt-2">Chopie Restaurant © 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;