import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Edit2, Trash2, X } from 'lucide-react';
import io from 'socket.io-client';
import EmojiPicker from './EmojiPicker';

const LiveChat = ({ isOpen, onClose, customerName, customerEmail, orderNumber }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !chatId) {
      createChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatId) {
      const newSocket = io(import.meta.env.VITE_API_URL.replace('/api/v1', ''), {
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });
      setSocket(newSocket);
      
      newSocket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
      });

      newSocket.emit('joinChat', chatId);

      newSocket.on('newMessage', (data) => {
        if (data.chatId === chatId) {
          setMessages(prev => [...prev, data.message]);
        }
      });

      newSocket.on('messageEdited', (data) => {
        if (data.chatId === chatId) {
          setMessages(prev => prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, content: data.content, isEdited: true, editedAt: data.editedAt }
              : msg
          ));
        }
      });

      newSocket.on('messageDeleted', (data) => {
        if (data.chatId === chatId) {
          setMessages(prev => prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, content: 'This message was deleted', isDeleted: true }
              : msg
          ));
        }
      });

      newSocket.on('typingStatus', (data) => {
        if (data.chatId === chatId && data.sender !== customerName) {
          setTypingUser(data.sender);
          setIsTyping(data.isTyping);
        }
      });

      return () => {
        if (newSocket.connected) {
          newSocket.emit('leaveChat', chatId);
        }
        newSocket.disconnect();
      };
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createChat = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, customerEmail, orderNumber })
      });
      const data = await response.json();
      if (data.success) {
        setChatId(data.data.chatId);
        loadMessages(data.data.chatId);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const loadMessages = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/${id}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    try {
      console.log('Customer sending message:', { chatId, customerName, content: newMessage });
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/${chatId}/messages`, {
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
      console.log('Message send result:', result);
      setNewMessage('');
      stopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/chat/${chatId}/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      setEditingMessage(null);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/chat/${chatId}/messages/${messageId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleTyping = () => {
    if (socket && chatId) {
      socket.emit('typingStatus', { chatId, sender: customerName, isTyping: true });
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 1000);
    }
  };

  const stopTyping = () => {
    if (socket && chatId) {
      socket.emit('typingStatus', { chatId, sender: customerName, isTyping: false });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      handleTyping();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="bg-red-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Live Support</span>
          </div>
          <button onClick={onClose} className="hover:bg-red-600 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg relative group ${
                  message.senderType === 'customer'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {editingMessage === message._id ? (
                  <input
                    type="text"
                    defaultValue={message.content}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        editMessage(message._id, e.target.value);
                      }
                    }}
                    onBlur={(e) => editMessage(message._id, e.target.value)}
                    className="bg-transparent border-b border-white text-white placeholder-white/70 w-full"
                    autoFocus
                  />
                ) : (
                  <>
                    <p className={message.isDeleted ? 'italic opacity-70' : ''}>
                      {message.content}
                    </p>
                    {message.isEdited && !message.isDeleted && (
                      <span className="text-xs opacity-70">(edited)</span>
                    )}
                  </>
                )}
                
                {message.senderType === 'customer' && !message.isDeleted && (
                  <div className="absolute -left-16 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => setEditingMessage(message._id)}
                      className="p-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm">
                {typingUser} is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <EmojiPicker onEmojiSelect={(emoji) => setNewMessage(prev => prev + emoji)} />
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;