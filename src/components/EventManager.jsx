import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Image } from "lucide-react";
import { toast } from "sonner";
import { useBranding } from "../Context/BrandingContext";
import { getBaseUrl } from "../utils/apiUtils";

const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { branding } = useBranding();

  const getEventImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = getBaseUrl().replace('/api/v1', '');
    return `${baseUrl}${imagePath}`;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Get user token for authentication
      const userData = sessionStorage.getItem("restaurantUser");
      if (!userData) {
        console.error("User session not found");
        return;
      }
      
      const user = JSON.parse(userData).data || JSON.parse(userData);
      const token = user.token;
      
      if (!token) {
        console.error("Authentication token not found");
        return;
      }

      const response = await fetch(`${getBaseUrl()}/events/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get user token for authentication
      const userData = sessionStorage.getItem("restaurantUser");
      if (!userData) {
        toast.error("User session not found. Please login again.");
        return;
      }
      
      const user = JSON.parse(userData).data || JSON.parse(userData);
      const token = user.token;
      
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }

      const formDataToSend = new FormData();
      if (formData.title) formDataToSend.append('title', formData.title);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.startDate) formDataToSend.append('startDate', formData.startDate);
      if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
      
      if (selectedImage) {
        formDataToSend.append('bannerImage', selectedImage);
      }

      const response = await fetch(`${getBaseUrl()}/events`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });
      
      const result = await response.json();
      if (response.ok && result.status) {
        toast.success("Event banner created successfully!");
        await fetchEvents();
        setShowForm(false);
        setFormData({ title: "", description: "", startDate: "", endDate: "" });
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        toast.error(result.message || "Failed to create event banner");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        // Get user token for authentication
        const userData = sessionStorage.getItem("restaurantUser");
        if (!userData) {
          toast.error("User session not found. Please login again.");
          return;
        }
        
        const user = JSON.parse(userData).data || JSON.parse(userData);
        const token = user.token;
        
        if (!token) {
          toast.error("Authentication token not found. Please login again.");
          return;
        }

        const response = await fetch(`${getBaseUrl()}/events/${eventId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        
        if (response.ok && result.status) {
          toast.success("Event deleted successfully!");
          fetchEvents();
        } else {
          toast.error(result.message || "Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Failed to delete event");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Event Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          style={{ backgroundColor: branding.primaryColor }}
          onMouseEnter={(e) => e.target.style.backgroundColor = branding.primaryColor + 'dd'}
          onMouseLeave={(e) => e.target.style.backgroundColor = branding.primaryColor}
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          Add Event
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 border">
          <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Event Title (Optional)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border rounded-lg text-sm sm:text-base"
            />
            <textarea
              placeholder="Event Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded-lg h-20 sm:h-24 text-sm sm:text-base"
            />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 sm:p-3 border rounded-lg text-sm"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="datetime-local"
                  placeholder="Start Date (Optional)"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                />
                <input
                  type="datetime-local"
                  placeholder="End Date (Optional)"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: branding.primaryColor }}
                onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = branding.primaryColor + 'dd')}
                onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = branding.primaryColor)}
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {events.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events created yet</h3>
            <p className="text-gray-500 mb-4 text-sm sm:text-base px-4">Create your first event to engage with customers</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
              style={{ backgroundColor: branding.primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = branding.primaryColor + 'dd'}
              onMouseLeave={(e) => e.target.style.backgroundColor = branding.primaryColor}
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          events.map((event) => (
            <div key={event._id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {event.bannerImage && (
                  <img
                    src={getEventImageUrl(event.bannerImage)}
                    alt={event.title}
                    className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{event.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-2">
                    {event.startDate && event.endDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="sm:w-4 sm:h-4" />
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    )}
                    {event.bannerImage && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Image size={14} className="sm:w-4 sm:h-4" />
                        Banner uploaded
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end sm:self-center"
                  title="Delete Event"
                >
                  <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventManager;