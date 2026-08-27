import { X, Check, Loader2 } from "lucide-react";

const OrderActionButtons = ({ orderId, onAccept, onReject, isAccepting = false, isRejecting = false }) => {
  const handleAccept = async () => {
    if (!onAccept) return;
    await onAccept(orderId);
  };

  const handleReject = async () => {
    if (!onReject) return;
    await onReject(orderId);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleReject}
        disabled={isAccepting || isRejecting}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        {isRejecting ? "Rejecting..." : "Reject"}
      </button>
      <button
        onClick={handleAccept}
        disabled={isAccepting || isRejecting}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {isAccepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {isAccepting ? "Accepting..." : "Accept"}
      </button>
    </div>
  );
};

export default OrderActionButtons;