import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency";

const PaymentModal = ({ order, onConfirm, onClose, isLoading }) => {
  const [cash, setCash] = useState("");
  const [transfer, setTransfer] = useState("");

  useEffect(() => {
    setCash("");
    setTransfer("");
  }, [order]);

  if (!order) return null;

  const cashNum = Number(cash) || 0;
  const transferNum = Number(transfer) || 0;
  const totalEntered = cashNum + transferNum;
  const remaining = order.totalAmount - totalEntered;
  const isOverpaid = totalEntered > order.totalAmount;

  const getPaymentStatus = () => {
    if (totalEntered >= order.totalAmount) return "paid";
    if (totalEntered > 0) return "partial";
    return "unpaid";
  };

  const handleConfirm = () => {
    onConfirm({ orderId: order._id, paymentStatus: getPaymentStatus(), cash: cashNum, transfer: transferNum });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
            <p className="text-sm text-gray-500">Order #{order.orderNumber} • Table {order.tableNumber}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Total */}
        <div className="px-5 pt-4">
          <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
            <span className="text-sm text-gray-600">Order Total</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">💵 Cash</label>
            <input
              type="number"
              min="0"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">💳 Card / Transfer</label>
            <input
              type="number"
              min="0"
              value={transfer}
              onChange={(e) => setTransfer(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-gray-900"
            />
          </div>

          {/* Live Summary */}
          <div className="border-t pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount entered</span>
              <span className={`font-medium ${isOverpaid ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(totalEntered)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{remaining > 0 ? 'Remaining' : remaining < 0 ? 'Overpaid by' : 'Balance'}</span>
              <span className={`font-medium ${remaining > 0 ? 'text-red-600' : remaining < 0 ? 'text-orange-500' : 'text-green-600'}`}>
                {remaining === 0 ? '✓ Settled' : formatCurrency(Math.abs(remaining))}
              </span>
            </div>
            {totalEntered > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium capitalize ${
                  getPaymentStatus() === 'paid' ? 'text-green-600' :
                  getPaymentStatus() === 'partial' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {getPaymentStatus()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || totalEntered === 0 || isOverpaid}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              isOverpaid ? 'bg-red-600 hover:bg-red-700' :
              totalEntered === 0 ? 'bg-gray-400' :
              getPaymentStatus() === 'paid' ? 'bg-green-600 hover:bg-green-700' :
              'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {isLoading ? 'Saving...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
