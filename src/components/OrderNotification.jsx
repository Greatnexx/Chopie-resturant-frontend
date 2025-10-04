import { useState } from "react";
import { Clock, DollarSign, User, X } from "lucide-react";
import OrderActionButtons from "./OrderActionButtons";

const OrderNotification = ({ order, onClose, onAccept, onReject }) => {

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-xl border-l-4 border-red-500 p-4 max-w-sm z-50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">New Order</h4>
            <p className="text-sm text-gray-600">#{order.orderNumber}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{order.customerName}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-600">Table {order.tableNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="font-semibold">${order.totalAmount?.toFixed(2)}</span>
        </div>
      </div>

      <OrderActionButtons
        orderId={order.orderId}
        onAccept={(orderId) => {
          onAccept(orderId);
          onClose();
        }}
        onReject={(orderId) => {
          onReject(orderId);
          onClose();
        }}
      />
    </div>
  );
};

export default OrderNotification;