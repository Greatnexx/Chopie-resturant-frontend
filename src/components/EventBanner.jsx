import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EventBanner = ({ restaurantId }) => {
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      fetchEventBanners();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (events.length > 1) {
      const interval = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % events.length);
      }, 5000); // Change banner every 5 seconds
      return () => clearInterval(interval);
    }
  }, [events.length]);

  const fetchEventBanners = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/banners`, {
        headers: {
          'X-Tenant-Subdomain': window.location.pathname.split('/')[2] || 'default'
        }
      });
      const data = await response.json();
      
      if (data.status && data.data.length > 0) {
        // Filter events that should be shown (upcoming or current)
        const now = new Date();
        const activeEvents = data.data.filter(event => {
          const endDate = new Date(event.endDate);
          return endDate >= now && event.bannerImage;
        });
        
        setEvents(activeEvents);
        setShowBanner(activeEvents.length > 0);
      }
    } catch (error) {
      console.error('Error fetching event banners:', error);
    }
  };

  if (!showBanner || events.length === 0) {
    return null;
  }

  const currentEvent = events[currentEventIndex];

  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center space-x-4">
            {currentEvent.bannerImage && (
              <img
                src={currentEvent.bannerImage.startsWith('http') ? currentEvent.bannerImage : `${import.meta.env.VITE_API_URL.split('/api')[0]}${currentEvent.bannerImage}`}
                alt={currentEvent.title}
                className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-lg"
              />
            )}
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                  🎉 EVENT
                </span>
                {events.length > 1 && (
                  <span className="text-xs opacity-75">
                    {currentEventIndex + 1} of {events.length}
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-lg leading-tight">
                {currentEvent.title || 'Special Event'}
              </h3>
              
              {currentEvent.description && (
                <p className="text-sm opacity-90 mt-1 line-clamp-2">
                  {currentEvent.description}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowBanner(false)}
            className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            title="Close banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress indicators for multiple events */}
        {events.length > 1 && (
          <div className="flex justify-center space-x-2 mt-3">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentEventIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentEventIndex 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBanner;