import { useState, useEffect } from "react";
import { Bell, MessageCircle, Clock, X } from "lucide-react";
import io from "socket.io-client";
import { toast } from "sonner";

const NotificationBell = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const socketUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '');
    console.log('🔔 NotificationBell connecting to Socket.IO:', socketUrl, 'User role:', user.role);
    
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    socket.on('connect', () => {
      console.log('✅ NotificationBell Socket.IO connected:', socket.id, 'User:', user.name, 'Role:', user.role);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ NotificationBell Socket.IO disconnected:', reason);
    });
    
    socket.on('connect_error', (error) => {
      console.error('🚨 NotificationBell Socket.IO connection error:', error);
    });
    
    // Listen for new orders (for SuperAdmin and MenuManager roles)
    if (user.role === 'SuperAdmin' || user.role === 'MenuManager') {
      socket.on('newOrder', (orderData) => {
        console.log('🔔 NotificationBell received new order for', user.role, ':', orderData);
        setNotifications(prev => [...prev, {
          id: `order-${orderData.orderId}-${Date.now()}`,
          type: 'order',
          title: 'New Order',
          message: `Order #${orderData.orderNumber} from ${orderData.customerName}`,
          timestamp: Date.now(),
          data: orderData
        }]);
        
        // Show toast notification
        toast.success(`New order #${orderData.orderNumber} from ${orderData.customerName}`, {
          duration: 5000
        });
      });
    }

    // Listen for new chat requests (only for MenuManager)
    if (user?.role === 'MenuManager') {
      // Load existing chats and join their rooms
      const loadChatsAndJoin = async () => {
        try {
          const restaurantUser = JSON.parse(sessionStorage.getItem('restaurantUser') || '{}');
          const token = restaurantUser.token;
          const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/staff/chats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success) {
            data.data.forEach(chat => {
              socket.emit('joinChat', {
                chatId: chat.chatId,
                userType: 'staff',
                userName: user.name
              });
            });
          }
        } catch (error) {
          console.error('Failed to load chats for notifications:', error);
        }
      };
      
      loadChatsAndJoin();

      socket.on('newChatAvailable', (chatData) => {
        setNotifications(prev => [...prev, {
          id: `chat-${chatData.chatId}-${Date.now()}`,
          type: 'chat',
          title: 'New Chat Request',
          message: `${chatData.customerName} wants to chat`,
          timestamp: Date.now(),
          data: chatData
        }]);
        
        // Show direct notification
        toast.info(`New chat request from ${chatData.customerName}`, {
          duration: 5000
        });
        
        // Join the new chat room for future message notifications
        socket.emit('joinChat', {
          chatId: chatData.chatId,
          userType: 'staff',
          userName: user.name
        });
      });

      // Listen for new messages in chats
      socket.on('receiveMessage', (data) => {
        const { chatId, message } = data;
        if (message.senderType === 'customer') {
          setNotifications(prev => [...prev, {
            id: `message-${chatId}-${Date.now()}`,
            type: 'message',
            title: 'New Message',
            message: `New message from ${message.sender}`,
            timestamp: Date.now(),
            data: { chatId, message }
          }]);
          
          // Show direct notification
          toast.success(`New message from ${message.sender}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`, {
            duration: 4000
          });
        }
      });
    }

    return () => {
      console.log('🔌 NotificationBell disconnecting Socket.IO for user:', user.name);
      socket.disconnect();
    };
  }, [user]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowDropdown(false);
  };

  const getNotificationIcon = (type) => {
    if (type === 'chat') return <MessageCircle className="w-4 h-4 text-blue-500" />;
    if (type === 'message') return <MessageCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-orange-500" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute left-full top-0 ml-2 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="p-4 border-b hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;