import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Users } from 'lucide-react';
import io from 'socket.io-client';
import ChatRequestModal from './ChatRequestModal';
import { toast } from 'sonner';

const SimpleStaffChat = ({ user }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatRequest, setChatRequest] = useState(null);
  const [showChatRequest, setShowChatRequest] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChats();
    
    const newSocket = io(import.meta.env.VITE_API_URL.replace('/api/v1', ''));
    setSocket(newSocket);
    
    // Join all existing chat rooms for instant message reception
    const joinAllChats = async () => {
      try {
        const restaurantUser = JSON.parse(sessionStorage.getItem('restaurantUser') || '{}');
        const token = restaurantUser.token;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/staff/chats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          data.data.forEach(chat => {
            newSocket.emit('joinChat', {
              chatId: chat.chatId,
              userType: 'staff',
              userName: user.name
            });
          });
        }
      } catch (error) {
        console.error('Failed to join all chats:', error);
      }
    };
    
    joinAllChats();

    newSocket.on('newChatAvailable', (data) => {
      console.log('Staff received new chat notification:', data);
      setChatRequest({
        ...data,
        initialMessage: `Hi! I need help with my order ${data.orderNumber || ''}. Can someone assist me?`
      });
      setShowChatRequest(true);
      toast.info(`New chat request from ${data.customerName}`);
      
      // Join the new chat room immediately
      newSocket.emit('joinChat', {
        chatId: data.chatId,
        userType: 'staff',
        userName: user.name
      });
    });

    newSocket.on('receiveMessage', (data) => {
      console.log('Staff received message:', data);
      // Update messages if this is the active chat
      if (activeChat && data.chatId === activeChat.chatId) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some(msg => 
            msg.content === data.message.content && 
            msg.sender === data.message.sender &&
            Math.abs(new Date(msg.timestamp).getTime() - new Date(data.timestamp).getTime()) < 1000
          );
          
          if (!messageExists) {
            return [...prev, {
              id: data.message._id || Date.now() + Math.random(),
              content: data.message.content,
              sender: data.message.sender,
              senderType: data.message.senderType,
              timestamp: data.timestamp || new Date().toISOString()
            }];
          }
          return prev;
        });
      }
      // Always reload chats to update the chat list
      loadChats();
    });



    newSocket.on('userTyping', (data) => {
      if (activeChat && data.chatId === activeChat.chatId && data.userName !== user.name) {
        setIsTyping(data.isTyping);
      }
    });

    return () => newSocket.disconnect();
  }, [user.name]);

  useEffect(() => {
    if (activeChat && socket) {
      console.log('Staff joining chat:', activeChat.chatId);
      socket.emit('joinChat', {
        chatId: activeChat.chatId,
        userType: 'staff',
        userName: user.name
      });
      loadChatMessages(activeChat.chatId);
    }
  }, [activeChat, socket, user.name]);

  const loadChatMessages = async (chatId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/${chatId}/messages`);
      const data = await response.json();
      if (data.success && data.data.messages) {
        const formattedMessages = data.data.messages.map(msg => ({
          id: msg._id,
          content: msg.content,
          sender: msg.sender,
          senderType: msg.senderType,
          timestamp: msg.createdAt
        }));
        setMessages(formattedMessages);
        console.log('Loaded chat messages:', formattedMessages.length);
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChats = async () => {
    try {
      const restaurantUser = JSON.parse(sessionStorage.getItem('restaurantUser') || '{}');
      const token = restaurantUser.token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/staff/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Staff chats loaded:', data);
      if (data.success) {
        setChats(data.data);
        console.log('Active chats count:', data.data.length);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      // Save message to database first
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/${activeChat.chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: user.name,
          senderType: 'staff',
          content: newMessage,
          messageType: 'text'
        })
      });
      
      const result = await response.json();
      console.log('Staff message saved to DB:', result);
      
      if (result.success && socket) {
        // Then emit via socket for real-time
        const messageData = {
          chatId: activeChat.chatId,
          message: {
            content: newMessage,
            sender: user.name,
            senderType: 'staff',
            _id: Date.now().toString()
          }
        };
        
        console.log('Staff emitting message:', messageData);
        socket.emit('sendMessage', messageData);
        
        // Add to local messages immediately
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: newMessage,
          sender: user.name,
          senderType: 'staff',
          timestamp: new Date().toISOString()
        }]);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = () => {
    if (socket && activeChat) {
      socket.emit('typing', {
        chatId: activeChat.chatId,
        isTyping: true,
        userName: user.name
      });
      
      setTimeout(() => {
        socket.emit('typing', {
          chatId: activeChat.chatId,
          isTyping: false,
          userName: user.name
        });
      }, 1000);
    }
  };

  const handleAcceptChat = async (chatRequest) => {
    try {
      const restaurantUser = JSON.parse(sessionStorage.getItem('restaurantUser') || '{}');
      const token = restaurantUser.token;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/${chatRequest.chatId}/accept`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ staffId: user._id })
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success(`Chat accepted! You can now chat with ${chatRequest.customerName}`);
        setShowChatRequest(false);
        setChatRequest(null);
        loadChats();
      }
    } catch (error) {
      console.error('Failed to accept chat:', error);
      toast.error('Failed to accept chat');
    }
  };

  const handleDeclineChat = () => {
    setShowChatRequest(false);
    setChatRequest(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-96 flex">
      <div className="w-1/3 border-r">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Customer Chats
          </h3>
        </div>
        <div className="overflow-y-auto h-80">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active chats</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setActiveChat(chat)}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  activeChat?._id === chat._id ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                }`}
              >
                <p className="font-medium text-sm">{chat.customerName}</p>
                {chat.orderNumber && (
                  <p className="text-xs text-gray-500">Order: {chat.orderNumber}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 border-b bg-gray-50">
              <h4 className="font-semibold">{activeChat.customerName}</h4>
              {activeChat.orderNumber && (
                <p className="text-sm text-gray-600">Order: {activeChat.orderNumber}</p>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'staff' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.senderType === 'staff'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm">
                    Customer is typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
      
      <ChatRequestModal
        isOpen={showChatRequest}
        chatRequest={chatRequest}
        onAccept={handleAcceptChat}
        onDecline={handleDeclineChat}
      />
    </div>
  );
};

export default SimpleStaffChat;