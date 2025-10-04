import { useState } from 'react';
import { MessageCircle, Check, X } from 'lucide-react';

const ChatRequestModal = ({ isOpen, chatRequest, onAccept, onDecline }) => {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    await onAccept(chatRequest);
    setIsAccepting(false);
  };

  if (!isOpen || !chatRequest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold">New Chat Request</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            <strong>{chatRequest.customerName}</strong> is requesting chat support
          </p>
          {chatRequest.orderNumber && (
            <p className="text-sm text-gray-600">
              Order: {chatRequest.orderNumber}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {chatRequest.initialMessage}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAccepting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isAccepting ? 'Accepting...' : 'Accept Chat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRequestModal;