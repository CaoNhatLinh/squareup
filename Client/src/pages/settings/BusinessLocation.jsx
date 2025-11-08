import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRestaurant } from '../../hooks/useRestaurant';
import { updateBusinessLocation } from '../../api/restaurants';

export default function BusinessLocation() {
  const { user } = useAuth();
  const { restaurant, updateRestaurant } = useRestaurant();
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (restaurant) {
      setFormData({
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
      });
    }
  }, [restaurant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.address.trim()) {
      setMessage('Address is required');
      return;
    }

    setSaving(true);
    setMessage('');
    
    try {
      const token = await user.getIdToken();
      await updateBusinessLocation(user.uid, formData, token);
      updateRestaurant(formData);
      setMessage('Location information updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating location:', err);
      setMessage('Failed to update location information');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Location</h1>
        <p className="text-gray-600 mt-1">Manage your restaurant's contact information</p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.includes('success') 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="75 5th Street NW, Atlanta, GA 30308"
          />
          <p className="text-sm text-gray-500 mt-1">
            Full street address including city, state, and ZIP code
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1 (404) 123-4567"
          />
          <p className="text-sm text-gray-500 mt-1">
            Customer contact number for inquiries
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="contact@restaurant.com"
          />
          <p className="text-sm text-gray-500 mt-1">
            Public email for customer communications
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
