import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRestaurant } from '../../hooks/useRestaurant'
import * as apiClient from '../../api/apiClient'

export default function BusinessAbout() {
  const { user } = useAuth()
  const { restaurant, updateRestaurant } = useRestaurant()
  const [restaurantName, setRestaurantName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (restaurant?.name) {
      setRestaurantName(restaurant.name)
    }
  }, [restaurant])

  const handleSave = async () => {
    if (!restaurantName.trim()) {
      setMessage('Restaurant name cannot be empty')
      return
    }

    setSaving(true)
    setMessage('')
    
    try {
      const token = await user.getIdToken()
      await apiClient.put(`/api/restaurants/${user.uid}`, 
        { name: restaurantName },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      setMessage('Restaurant name updated successfully!')
      setTimeout(() => setMessage(''), 3000)
      updateRestaurant({ name: restaurantName })
    } catch (err) {
      console.error('Error updating restaurant:', err)
      setMessage('Failed to update restaurant name')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">About your business</h1>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.includes('success') 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg border p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant name
          </label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter restaurant name"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
