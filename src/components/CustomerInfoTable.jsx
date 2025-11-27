import { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Save, X } from 'lucide-react';

const CustomerInfoTable = () => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editInfo, setEditInfo] = useState({});

  useEffect(() => {
    const savedInfo = localStorage.getItem('customerInfo');
    if (savedInfo) {
      const parsedInfo = JSON.parse(savedInfo);
      setCustomerInfo(parsedInfo);
    }
  }, []);

  const handleEdit = () => {
    setEditInfo({ ...customerInfo });
    setIsEditing(true);
  };

  const handleSave = () => {
    setCustomerInfo(editInfo);
    localStorage.setItem('customerInfo', JSON.stringify(editInfo));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditInfo({});
    setIsEditing(false);
  };

  if (!customerInfo.name && !customerInfo.email && !customerInfo.phone) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Customer Information</h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-600 w-16">Name:</span>
          {isEditing ? (
            <input
              type="text"
              value={editInfo.name || ''}
              onChange={(e) => setEditInfo({ ...editInfo, name: e.target.value })}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          ) : (
            <span className="text-gray-800">{customerInfo.name || 'Not provided'}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-600 w-16">Email:</span>
          {isEditing ? (
            <input
              type="email"
              value={editInfo.email || ''}
              onChange={(e) => setEditInfo({ ...editInfo, email: e.target.value })}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          ) : (
            <span className="text-gray-800">{customerInfo.email || 'Not provided'}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-600 w-16">Phone:</span>
          {isEditing ? (
            <input
              type="tel"
              value={editInfo.phone || ''}
              onChange={(e) => setEditInfo({ ...editInfo, phone: e.target.value })}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          ) : (
            <span className="text-gray-800">{customerInfo.phone || 'Not provided'}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoTable;