export function cleanupOldGuestUserData() {
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.includes('guest_uuid_') && key.includes('_cred')) {
      localStorage.removeItem(key);
    }
  });
}

export function getAllGuestUuids() {
  const keys = Object.keys(localStorage);
  const guestUuids = {};
  
  keys.forEach(key => {
    if (key.startsWith('guest_uuid_') && !key.includes('_cred')) {
      const restaurantId = key.replace('guest_uuid_', '');
      const uuid = localStorage.getItem(key);
      if (uuid) {
        guestUuids[restaurantId] = uuid;
      }
    }
  });
  return guestUuids;  
}
