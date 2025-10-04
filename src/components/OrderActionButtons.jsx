import { useState } from "react";
import { useAcceptOrderMutation, useRejectOrderMutation } from "../slices/restaurantSlice";
import { toast } from "sonner";
import { X, Check, Loader2 } from "lucide-react";

const OrderActionButtons = ({ orderId, onAccept, onReject }) => {
  const [acceptOrder, { isLoading: accepting }] = useAcceptOrderMutation();
  const [rejectOrderMutation, { isLoading: rejecting }] = useRejectOrderMutation();

  const handleAccept = async () => {
    try {
      await acceptOrder(orderId).unwrap();
      toast.success("Order accepted!");
      onAccept(orderId);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to accept order");
    }
  };

  const handleReject = async () => {
    try {
      await rejectOrderMutation(orderId).unwrap();
      toast.info("Order rejected");
      onReject(orderId);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reject order");
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleReject}
        disabled={accepting || rejecting}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        {rejecting ? "Rejecting..." : "Reject"}
      </button>
      <button
        onClick={handleAccept}
        disabled={accepting || rejecting}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {accepting ? "Accepting..." : "Accept"}
      </button>
    </div>
  );
};

export default OrderActionButtons;