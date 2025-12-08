import { useState, useEffect } from "react";
import { X } from "lucide-react";

const EventBanner = () => {
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveEvents();
  }, []);

  const fetchActiveEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/banners`);
      const data = await response.json();
      
      if (data.status && data.data.length > 0) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate events every 5 seconds if multiple events
  useEffect(() => {
    if (events.length > 1) {
      const interval = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % events.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [events.length]);

  if (loading || !isVisible || events.length === 0) {
    return null;
  }

  const currentEvent = events[currentEventIndex];

  return (
    <div className="relative bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 mb-4 rounded-lg shadow-lg">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-center gap-4">
        {currentEvent.bannerImage && (
          <img
            src={`${import.meta.env.VITE_API_URL}/uploads/banners/${currentEvent.bannerImage}`}
            alt={currentEvent.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{currentEvent.title}</h3>
          <p className="text-sm opacity-90">{currentEvent.description}</p>
          <p className="text-xs opacity-75 mt-1">
            Until {new Date(currentEvent.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {events.length > 1 && (
        <div className="flex justify-center mt-3 gap-1">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentEventIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentEventIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventBanner; 