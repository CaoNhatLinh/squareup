import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useRestaurant } from "../../hooks/useRestaurant";
import { upsertRestaurant } from "../../api/restaurants";
import {
  HiPhone,
  HiMail,
  HiLocationMarker,
  HiTag,
  HiCheckCircle,
  HiExclamationCircle,
} from "react-icons/hi";

export default function BusinessAbout() {
  const { user } = useAuth();
  const { restaurant, updateRestaurant } = useRestaurant();
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (restaurant) {
      setRestaurantName(restaurant.name || "");
      setAddress(restaurant.address || "");
      setPhone(restaurant.phone || "");
      setEmail(restaurant.email || "");
    }
  }, [restaurant]);

  const handleSave = async () => {
    if (!restaurantName.trim()) {
      setMessage("Restaurant name cannot be empty");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const token = await user.getIdToken();
      const updateData = {
        name: restaurantName,
        address,
        phone,
        email,
      };
      await upsertRestaurant(user.uid, updateData, token);
      setMessage("Restaurant information updated successfully!");
      setTimeout(() => setMessage(""), 4000); // Tăng thời gian hiển thị message
      updateRestaurant(updateData);
    } catch (err) {
      console.error("Error updating restaurant:", err);
      setMessage("Failed to update restaurant information");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Business Information
          </h1>
          <p className="text-gray-600">
            Manage your restaurant's basic information and contact details
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-md flex items-start gap-3 border-l-4 ${
              message.includes("success")
                ? "bg-green-50 text-green-800 border-green-500"
                : "bg-red-50 text-red-800 border-red-500"
            }`}
          >
            {message.includes("success") ? (
              <HiCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <HiExclamationCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>{message}</div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <HiTag className="w-5 h-5 text-red-600" />
              Restaurant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all text-gray-800"
              placeholder="Enter restaurant name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <HiLocationMarker className="w-5 h-5 text-red-600" />
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all text-gray-800"
              placeholder="75 5th Street NW, Atlanta, GA 30308"
            />
            <p className="text-xs text-gray-500 mt-2">
              This address will be visible to your customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <HiPhone className="w-5 h-5 text-red-600" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all text-gray-800"
                placeholder="+1 (404) 123-4567"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <HiMail className="w-5 h-5 text-red-600" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all text-gray-800"
                placeholder="contact@restaurant.com"
              />
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-red-200 transition-all"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
