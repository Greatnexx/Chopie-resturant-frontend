import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Edit2, Trash2, Users, Clock } from "lucide-react";
import io from "socket.io-client";
import EmojiPicker from "./EmojiPicker";

const StaffChatPanel = ({ user }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadChats();

    const newSocket = io(import.meta.env.VITE_API_URL.replace("/api/v1", ""));
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Separate useEffect for socket event handlers that need access to current state
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      console.log('Staff received new message:', data);
      
      // Update messages if this is the active chat
      setMessages((prev) => {
        // Check if this message is for the currently active chat
        if (activeChat && (data.chatId === activeChat.chatId || data.chatId === activeChat._id)) {
          return [...prev, data.message];
        }
        return prev;
      });
      
      // Always update the chat list to show new message preview
      setChats((prevChats) => 
        prevChats.map((chat) => {
          if (chat.chatId === data.chatId || chat._id === data.chatId) {
            return {
              ...chat,
              lastActivity: new Date().toISOString(),
              messages: chat.messages ? [...chat.messages, data.message] : [data.message]
            };
          }
          return chat;
        })
      );
    };

    const handleChatUpdate = (data) => {
      console.log('Staff received chat update:', data);
      loadChats();
    };

    const handleNewChatCreated = (data) => {
      console.log('New chat created:', data);
      loadChats();
    };

    const handleMessageEdited = (data) => {
      setMessages((prev) => {
        if (activeChat && (data.chatId === activeChat.chatId || data.chatId === activeChat._id)) {
          return prev.map((msg) =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  content: data.content,
                  isEdited: true,
                  editedAt: data.editedAt,
                }
              : msg
          );
        }
        return prev;
      });
    };

    const handleMessageDeleted = (data) => {
      setMessages((prev) => {
        if (activeChat && (data.chatId === activeChat.chatId || data.chatId === activeChat._id)) {
          return prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, content: "This message was deleted", isDeleted: true }
              : msg
          );
        }
        return prev;
      });
    };

    const handleTypingStatus = (data) => {
      if (
        activeChat &&
        (data.chatId === activeChat.chatId || data.chatId === activeChat._id) &&
        data.sender !== user.name
      ) {
        setTypingUser(data.sender);
        setIsTyping(data.isTyping);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("chatUpdate", handleChatUpdate);
    socket.on("newChatCreated", handleNewChatCreated);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("typingStatus", handleTypingStatus);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("chatUpdate", handleChatUpdate);
      socket.off("newChatCreated", handleNewChatCreated);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("typingStatus", handleTypingStatus);
    };
  }, [socket, activeChat, user.name]);

  useEffect(() => {
    if (activeChat && socket) {
      console.log('Joining chat room:', activeChat.chatId);
      socket.emit("joinChat", activeChat.chatId);
      loadMessages(activeChat.chatId);
    }
  }, [activeChat, socket]);

  // Auto-refresh chats every 30 seconds (reduced frequency since we have real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      loadChats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChats = async () => {
    try {
      const restaurantUser = JSON.parse(
        sessionStorage.getItem("restaurantUser") || "{}"
      );
      const token = restaurantUser.token;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/staff/chats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setChats(data.data);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/${chatId}/messages`
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/chat/${activeChat.chatId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: user.name,
            senderType: "staff",
            content: newMessage,
            messageType: "text",
          }),
        }
      );
      setNewMessage("");
      stopTyping();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = () => {
    if (socket && activeChat) {
      socket.emit("typingStatus", {
        chatId: activeChat.chatId,
        sender: user.name,
        isTyping: true,
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 1000);
    }
  };

  const stopTyping = () => {
    if (socket && activeChat) {
      socket.emit("typingStatus", {
        chatId: activeChat.chatId,
        sender: user.name,
        isTyping: false,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      handleTyping();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-96 flex">
      {/* Chat List */}
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
                  activeChat?._id === chat._id
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{chat.customerName}</p>
                    {chat.orderNumber && (
                      <p className="text-xs text-gray-500">
                        Order: {chat.orderNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(chat.lastActivity).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {chat.messages?.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {chat.messages[chat.messages.length - 1].content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-gray-50">
              <h4 className="font-semibold">{activeChat.customerName}</h4>
              {activeChat.orderNumber && (
                <p className="text-sm text-gray-600">
                  Order: {activeChat.orderNumber}
                </p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.senderType === "staff"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.senderType === "staff"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className={message.isDeleted ? "italic opacity-70" : ""}>
                      {message.content}
                    </p>
                    {message.isEdited && !message.isDeleted && (
                      <span className="text-xs opacity-70">(edited)</span>
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
                    className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <EmojiPicker
                      onEmojiSelect={(emoji) =>
                        setNewMessage((prev) => prev + emoji)
                      }
                    />
                  </div>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default StaffChatPanel;
