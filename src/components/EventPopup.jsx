import { useState, useEffect } from "react";
import { X } from "lucide-react";

const EventPopup = () => {
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveEvents();
  }, []);

  const fetchActiveEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/active`);
      const data = await response.json();
      
      console.log('Events data:', data);
      
      if (data.status && data.data.length > 0) {
        console.log('First event:', data.data[0]);
        console.log('Banner image:', data.data[0].bannerImage);
        setEvents(data.data);
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate events every 4 seconds if multiple events
  useEffect(() => {
    if (events.length > 1 && showPopup) {
      const interval = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % events.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [events.length, showPopup]);

  const handleClose = () => {
    setShowPopup(false);
  };

  if (loading || !showPopup || events.length === 0) {
    return null;
  }

  const currentEvent = events[currentEventIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-lg">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all"
        >
          <X size={20} />
        </button>
        
        {currentEvent.bannerImage ? (
          <img
            src={`http://localhost:8000/uploads/banners/${currentEvent.bannerImage}`}
            alt={currentEvent.title || 'Event Banner'}
            className="w-full h-full object-cover cursor-pointer"
            onClick={handleClose}
            onError={(e) => {
              console.error('Image failed to load:', e.target.src);
              console.log('Current event:', currentEvent);
            }}
            onLoad={() => console.log('Image loaded successfully:', currentEvent.bannerImage)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No banner image</p>
          </div>
        )}
        
        {events.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentEventIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentEventIndex ? "bg-white" : "bg-white bg-opacity-50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPopup;