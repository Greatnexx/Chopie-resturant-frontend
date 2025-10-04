import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import io from 'socket.io-client';

const SimpleLiveChat = ({ isOpen, onClose, customerName, customerEmail, orderNumber }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && !chatId) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatId && !socket) {
      const newSocket = io(import.meta.env.VITE_BASE_URL.replace('/api/v1', ''));
      setSocket(newSocket);

      // Join chat room
      newSocket.emit('joinChat', {
        chatId,
        userType: 'customer',
        userName: customerName
      });

      // Listen for messages
      newSocket.on('receiveMessage', (data) => {
        console.log('Customer received message:', data);
        if (data.chatId === chatId && data.message.senderType !== 'customer') {
          setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            content: data.message.content,
            sender: data.message.sender,
            senderType: data.message.senderType,
            timestamp: data.timestamp
          }]);
        }
      });



      newSocket.on('userTyping', (data) => {
        if (data.userName !== customerName) {
          setIsTyping(data.isTyping);
        }
      });

      newSocket.on('chatAccepted', (data) => {
        console.log('Chat accepted by staff:', data.staffName);
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: `${data.staffName} has joined the chat and will assist you.`,
          sender: 'System',
          senderType: 'system',
          timestamp: new Date().toISOString()
        }]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [chatId, customerName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeChat = async () => {
    try {
      console.log('Creating chat for:', { customerName, customerEmail, orderNumber });
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/chat/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, customerEmail, orderNumber })
      });
      const data = await response.json();
      console.log('Chat creation response:', data);
      
      if (data.success) {
        setChatId(data.data.chatId);
        
        // Send initial greeting message
        setTimeout(async () => {
          try {
            await fetch(`${import.meta.env.VITE_BASE_URL}/chat/${data.data.chatId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sender: customerName,
                senderType: 'customer',
                content: `Hi! I need help with my order ${orderNumber || ''}. Can someone assist me?`,
                messageType: 'text'
              })
            });
            
            // Add to local messages
            setMessages([{
              id: Date.now(),
              content: `Hi! I need help with my order ${orderNumber || ''}. Can someone assist me?`,
              sender: customerName,
              senderType: 'customer',
              timestamp: new Date().toISOString()
            }]);
          } catch (error) {
            console.error('Failed to send initial message:', error);
          }
        }, 1000);
        
        // Load existing messages if any
        if (data.data.messages && data.data.messages.length > 0) {
          const formattedMessages = data.data.messages.map(msg => ({
            id: msg._id,
            content: msg.content,
            sender: msg.sender,
            senderType: msg.senderType,
            timestamp: msg.createdAt
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    try {
      // Save message to database first
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/chat/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: customerName,
          senderType: 'customer',
          content: newMessage,
          messageType: 'text'
        })
      });
      
      const result = await response.json();
      console.log('Message saved to DB:', result);
      
      if (result.success && socket) {
        // Then emit via socket for real-time
        const messageData = {
          chatId,
          message: {
            content: newMessage,
            sender: customerName,
            senderType: 'customer',
            _id: Date.now().toString()
          }
        };
        
        console.log('Customer emitting message:', messageData);
        socket.emit('sendMessage', messageData);
        
        // Add to local messages immediately
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: newMessage,
          sender: customerName,
          senderType: 'customer',
          timestamp: new Date().toISOString()
        }]);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = () => {
    if (socket && chatId) {
      socket.emit('typing', {
        chatId,
        isTyping: true,
        userName: customerName
      });
      
      setTimeout(() => {
        socket.emit('typing', {
          chatId,
          isTyping: false,
          userName: customerName
        });
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md h-96 flex flex-col">
        <div className="bg-red-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Live Support</span>
          </div>
          <button onClick={onClose} className="hover:bg-red-600 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.senderType === 'customer'
                    ? 'bg-red-500 text-white'
                    : message.senderType === 'system'
                    ? 'bg-blue-100 text-blue-800'
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
                Support is typing...
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
      </div>
    </div>
  );
};

export default SimpleLiveChat;