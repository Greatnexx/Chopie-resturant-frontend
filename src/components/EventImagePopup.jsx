import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EventImagePopup = ({ isOpen, onClose, restaurantId, branding }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shouldShowPopup, setShouldShowPopup] = useState(false);

  useEffect(() => {
    if (isOpen && restaurantId) {
      fetchActiveEvents();
    }
  }, [isOpen, restaurantId]);

  useEffect(() => {
    if (shouldShowPopup && events.length > 0) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [shouldShowPopup, events]);

  // Auto-rotate events every 4 seconds if multiple events
  useEffect(() => {
    if (events.length > 1) {
      const interval = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % events.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [events.length]);

  const getEventImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) {
      return imagePath; // Already a full URL (Cloudinary)
    }
    // Fallback for local images
    const baseUrl = import.meta.env.VITE_API_URL?.split('/api')[0] || 'https://backend-chopie-project.onrender.com';
    return `${baseUrl}${imagePath}`;
  };

  const shouldShowEvent = (event) => {
    const now = new Date();
    const endDate = new Date(event.endDate);
    
    // Show events that haven't ended yet (includes future and current events)
    return endDate >= now;
  };

  const fetchActiveEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/restaurant/${restaurantId}`);
      const data = await response.json();
      
      if (data.status && data.data.length > 0) {
        // Filter events that should be displayed as banners
        const visibleEvents = data.data.filter(event => shouldShowEvent(event));
        
        if (visibleEvents.length > 0) {
          setEvents(visibleEvents);
          setShouldShowPopup(true);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setShouldShowPopup(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen || !shouldShowPopup || loading || events.length === 0) {
    return null;
  }

  const currentEvent = events[currentEventIndex];

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Full screen overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Full screen popup content */}
      <div className={`relative w-full h-full flex items-center justify-center transition-transform duration-300 ${
        isVisible ? 'scale-100' : 'scale-95'
      }`}>
        <div 
          className="relative w-full h-full max-w-none max-h-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Full Screen Image */}
          <div className="relative w-full h-full">
            {currentEvent.bannerImage ? (
              <img
                src={getEventImageUrl(currentEvent.bannerImage)}
                alt={currentEvent.title || 'Event'}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Event image failed to load:', e.target.src);
                }}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-white"
                style={{ 
                  background: `linear-gradient(135deg, ${branding?.primaryColor || '#ef4444'} 0%, ${branding?.secondaryColor || '#dc2626'} 100%)` 
                }}
              >
                <div className="text-center">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {currentEvent.title}
                  </h1>
                  {currentEvent.description && (
                    <p className="text-lg md:text-xl opacity-90">
                      {currentEvent.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation dots for multiple events */}
            {events.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {events.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentEventIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentEventIndex 
                        ? "bg-white scale-110 shadow-lg" 
                        : "bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventImagePopup;