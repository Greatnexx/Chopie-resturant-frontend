import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

const EventPopup = () => {
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveEvents();
  }, []);

  const fetchActiveEvents = async () => {
    try {
      // Get restaurant ID from URL parameters or path
      const urlParams = new URLSearchParams(window.location.search);
      let restaurantIdFromUrl = urlParams.get('restaurantId');
      
      // If not in URL params, try to extract from path (for tenant routes like /r/subdomain)
      if (!restaurantIdFromUrl) {
        const pathSegments = window.location.pathname.split('/');
        const rIndex = pathSegments.indexOf('r');
        if (rIndex !== -1 && pathSegments[rIndex + 1]) {
          // For tenant routes, we need to get restaurant ID by subdomain
          const subdomain = pathSegments[rIndex + 1];
          try {
            const tenantResponse = await fetch(`${import.meta.env.VITE_API_URL}/tenant/resolve/${subdomain}`);
            const tenantData = await tenantResponse.json();
            if (tenantData.status && tenantData.data) {
              restaurantIdFromUrl = tenantData.data._id;
            }
          } catch (error) {
            console.error('Error fetching tenant info:', error);
          }
        }
      }
      
      if (!restaurantIdFromUrl) {
        console.log('No restaurant ID found');
        return;
      }

      console.log('Fetching events for restaurant:', restaurantIdFromUrl);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/restaurant/${restaurantIdFromUrl}`);
      const data = await response.json();

      if (data.status && data.data.length > 0) {
        // Show events that haven't ended yet (both upcoming and currently active)
        const now = new Date();
        const visibleEvents = data.data.filter(event => {
          const endDate = new Date(event.endDate);
          return endDate >= now; // Show if event hasn't ended
        });
        
        setEvents(visibleEvents);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading || events.length === 0) {
    return null;
  }

  const currentEvent = events[currentEventIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 mb-6">
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl shadow-lg">
        {currentEvent.bannerImage ? (
          <img
            src={currentEvent.bannerImage.startsWith('http') ? currentEvent.bannerImage : `${import.meta.env.VITE_API_URL.split('/api')[0]}${currentEvent.bannerImage}`}
            alt={currentEvent.title || 'Event Banner'}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Image failed to load:', e.target.src);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-2">{currentEvent.title}</h3>
              <p className="text-lg opacity-90">{currentEvent.description}</p>
            </div>
          </div>
        )}
        
        {/* Date and Time Overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} />
            <span className="text-sm font-semibold">
              {formatDate(currentEvent.startDate)}
            </span>
          </div>
          {currentEvent.startTime && (
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span className="text-sm">
                {formatTime(currentEvent.startDate)}
              </span>
            </div>
          )}
        </div>

        {/* Event Info Overlay */}
        {currentEvent.bannerImage && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
            <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
              {currentEvent.title}
            </h3>
            {currentEvent.description && (
              <p className="text-white/90 text-sm md:text-base line-clamp-2">
                {currentEvent.description}
              </p>
            )}
          </div>
        )}
        
        {/* Navigation dots for multiple events */}
        {events.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentEventIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentEventIndex 
                    ? "bg-white scale-110" 
                    : "bg-white/50 hover:bg-white/70"
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