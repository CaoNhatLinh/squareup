import { useCallback, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getAllRestaurants, getAllUsers, setAdminRole, removeAdminRole } from '@/api/admin.js';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import {
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineEye,
  HiOutlineUserRemove,
  HiOutlineUserAdd
} from 'react-icons/hi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { error: showError, success: showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState('restaurants');
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllRestaurants();
      setRestaurants(response.restaurants || []);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      showError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const handleSetAdmin = async (userId) => {
    if (userId === currentUser?.uid) {
      showError('You cannot modify your own admin role');
      return;
    }

    try {
      await setAdminRole(userId);
      showSuccess('Admin role granted successfully');
      await fetchUsers();
    } catch (err) {
      console.error('Error setting admin role:', err);
      showError('Failed to grant admin role');
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (userId === currentUser?.uid) {
      showError('You cannot modify your own admin role');
      return;
    }

    try {
      await removeAdminRole(userId);
      showSuccess('Admin role removed successfully');
      await fetchUsers();
    } catch (err) {
      console.error('Error removing admin role:', err);
      showError('Failed to remove admin role');
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchUsers();
  }, [fetchRestaurants, fetchUsers]);

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManageRestaurant = (restaurantId) => {
    sessionStorage.setItem('adminManagingRestaurant', restaurantId);
    navigate(`/restaurant/dashboard`);
  };

  const stats = [
    {
      title: 'Total Restaurants',
      value: restaurants.length,
      icon: HiOutlineOfficeBuilding,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Users',
      value: users.length,
      icon: HiOutlineUsers,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Admin Users',
      value: users.filter(u => u.isAdmin).length,
      icon: HiOutlineShieldCheck,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-slate-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-700">Loading Admin Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl shadow-lg">
              <HiOutlineChartBar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage all restaurants and users in the system</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} p-6 rounded-2xl shadow-sm border border-white/50 hover:shadow-md transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'restaurants'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HiOutlineOfficeBuilding className="w-4 h-4" />
                Restaurants ({restaurants.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'users'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HiOutlineUsers className="w-4 h-4" />
                Users ({users.length})
              </button>
            </div>
          </div>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={
                activeTab === 'restaurants'
                  ? "Search by restaurant name, owner email, or owner name..."
                  : "Search by user email, display name, or UID..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-slate-50/50 transition-all duration-200"
            />
          </div>
        </div>
        {activeTab === 'restaurants' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <HiOutlineOfficeBuilding className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm ? 'No restaurants found' : 'No restaurants available'}
                </h3>
                <p className="text-slate-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'Restaurants will appear here once created'}
                </p>
              </div>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <div key={restaurant.id || restaurant.name} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {restaurant.logo ? (
                          <img
                            src={restaurant.logo}
                            alt={restaurant.name}
                            className="w-12 h-12 rounded-xl object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-slate-600 font-bold text-lg">
                              {restaurant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg group-hover:text-slate-700 transition-colors">
                            {restaurant.name}
                          </h3>
                          <p className="text-sm text-slate-500">ID: {restaurant.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleManageRestaurant(restaurant.id)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group-hover:bg-slate-100"
                      >
                        <HiOutlineEye className="w-5 h-5 text-slate-600" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <HiOutlineUsers className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{restaurant.ownerName || 'Unknown Owner'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <HiOutlineMail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{restaurant.ownerEmail || 'No email'}</span>
                      </div>
                      {restaurant.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <HiOutlinePhone className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{restaurant.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <HiOutlineCalendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          {restaurant.createdAt
                            ? new Date(restaurant.createdAt).toLocaleDateString()
                            : 'Unknown date'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <button
                      onClick={() => handleManageRestaurant(restaurant.id)}
                      className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
                    >
                      <HiOutlineCog className="w-4 h-4" />
                      Manage Restaurant
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <HiOutlineUsers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm ? 'No users found' : 'No users available'}
                </h3>
                <p className="text-slate-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'Users will appear here once registered'}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.uid} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || user.email}
                            className="w-12 h-12 rounded-xl object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-slate-600 font-bold text-lg">
                              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg">
                            {user.displayName || 'No display name'}
                          </h3>
                          <p className="text-sm text-slate-500">UID: {user.uid.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {user.role === 'guest' && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Guest
                          </span>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isAdmin
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.disabled
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.disabled ? 'Disabled' : 'Active'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <HiOutlineMail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{user.email}</span>
                        {user.emailVerified && (
                          <HiOutlineShieldCheck className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <HiOutlineCalendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          Last login: {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {user.isAdmin ? (
                        <button
                          onClick={() => handleRemoveAdmin(user.uid)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <HiOutlineUserRemove className="w-4 h-4" />
                          Remove Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSetAdmin(user.uid)}
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <HiOutlineUserAdd className="w-4 h-4" />
                          Make Admin
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
