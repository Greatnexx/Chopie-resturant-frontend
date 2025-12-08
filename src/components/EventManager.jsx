import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Image } from "lucide-react";
import { toast } from "sonner";

const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events/active`);
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
    try {
      const formDataToSend = new FormData();
      if (formData.title) formDataToSend.append('title', formData.title);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.startDate) formDataToSend.append('startDate', formData.startDate);
      if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
      
      if (selectedImage) {
        formDataToSend.append('bannerImage', selectedImage);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        method: "POST",
        body: formDataToSend,
      });
      
      const result = await response.json();
      console.log('Response:', result);
      
      if (response.ok && result.status) {
        toast.success("Event banner created successfully!");
        fetchEvents();
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
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
          method: "DELETE",
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border">
          <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Event Title (Optional)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border rounded-lg"
            />
            <textarea
              placeholder="Event Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded-lg h-24"
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
                  className="w-full p-3 border rounded-lg"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="datetime-local"
                  placeholder="Start Date (Optional)"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="p-3 border rounded-lg"
                />
                <input
                  type="datetime-local"
                  placeholder="End Date (Optional)"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="p-3 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                Create Event
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <div key={event._id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-4">
              {event.bannerImage && (
                <img
                  src={`http://localhost:8000/uploads/banners/${event.bannerImage}`}
                  alt={event.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-gray-600">{event.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  {event.startDate && event.endDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </span>
                  )}
                  {event.bannerImage && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Image size={16} />
                      Banner uploaded
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(event._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Event"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventManager;