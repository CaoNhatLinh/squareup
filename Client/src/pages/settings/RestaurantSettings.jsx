import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRestaurant } from "../../hooks/useRestaurant";
import { useToast } from "../../hooks/useToast";
import { upsertRestaurant, deleteRestaurant } from "../../api/restaurants";
import {
  HiOutlineExclamationTriangle,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";

export default function RestaurantSettings() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { restaurant, updateRestaurant: updateLocalRestaurant } = useRestaurant();
  const { success, error } = useToast();

  const [active, setActive] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setActive(restaurant.active !== false); // Default to true if not set
    }
  }, [restaurant]);

  const handleToggleActive = async () => {
    try {
      setUpdating(true);
      const newActiveStatus = !active;

      await upsertRestaurant(restaurantId, { active: newActiveStatus });
      updateLocalRestaurant({ active: newActiveStatus });
      setActive(newActiveStatus);

      success(
        `Restaurant ${newActiveStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      console.error("Error updating restaurant status:", err);
      error("Failed to update restaurant status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    if (deleteConfirmation !== restaurant?.name) {
      error("Restaurant name doesn't match. Please try again.");
      return;
    }

    try {
      setDeleting(true);
      await deleteRestaurant(restaurantId);
      success("Restaurant deleted successfully");

      navigate("/restaurants");
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      error("Failed to delete restaurant");
    } finally {
      setDeleting(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Restaurant Settings
        </h1>
        <p className="text-gray-600">
          Manage your restaurant's operational status and account settings.
        </p>
      </div>

      {/* Active/Inactive Toggle */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              active ? "bg-green-100" : "bg-gray-100"
            }`}>
              {active ? (
                <HiOutlineEye className="w-6 h-6 text-green-600" />
              ) : (
                <HiOutlineEyeSlash className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Restaurant Status
              </h3>
              <p className="text-gray-600">
                {active
                  ? "Your restaurant is active and visible to customers"
                  : "Your restaurant is inactive and hidden from customers"
                }
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleActive}
            disabled={updating}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              active
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : active ? (
              <>
                <HiOutlineEyeSlash className="w-5 h-5" />
                Deactivate
              </>
            ) : (
              <>
                <HiOutlineEye className="w-5 h-5" />
                Activate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Danger Zone</h3>
            <p className="text-gray-600">
              Irreversible and destructive actions for your restaurant.
            </p>
          </div>
        </div>

        <div className="border-t border-red-200 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                Delete Restaurant
              </h4>
              <p className="text-gray-600 text-sm">
                Permanently delete this restaurant and all associated data.
                This action cannot be undone.
              </p>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <HiOutlineTrash className="w-5 h-5" />
              Delete Restaurant
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <HiOutlineExclamationTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Delete Restaurant
              </h2>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                This action <strong>cannot be undone</strong>. This will permanently delete{" "}
                <strong>"{restaurant.name}"</strong> and all associated data.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-700 font-medium mb-2">
                  Please type <strong>"{restaurant.name}"</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={`Type "${restaurant.name}" here`}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteRestaurant}
                disabled={deleting || deleteConfirmation !== restaurant.name}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <HiOutlineTrash className="w-5 h-5" />
                    Delete Restaurant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}