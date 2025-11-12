const admin = require("firebase-admin");
const db = admin.database();
const { calculateItemDiscounts } = require("../utils/itemDiscountCalculator");

async function getUserRestaurants(req, res) {
  const { uid } = req.user;
  try {
    const userRestaurantMetasSnapshot = await db
      .ref(`users/${uid}/restaurants`)
      .get();
    if (!userRestaurantMetasSnapshot.exists()) {
      return res.json([]);
    }
    const userRestaurantMetas = userRestaurantMetasSnapshot.val();
    const restaurantEntries = Object.entries(userRestaurantMetas);
    const restaurantPromises = restaurantEntries.map(
      ([restaurantId, restaurantMeta]) => {
        return db
          .ref(`restaurants/${restaurantId}`)
          .get()
          .then((restaurantSnap) => {
            if (restaurantSnap.exists()) {
              const restaurantData = restaurantSnap.val();
              return {
                id: restaurantId,
                name: restaurantData.name || "",
                description: restaurantData.description || "",
                logo: restaurantData.logo || "", 
                role: restaurantMeta.role || "owner",
                active: restaurantMeta.active !== false, 
                createdAt: restaurantMeta.createdAt || null,
              };
            }
            return null;
          });
      }
    );
    const results = await Promise.all(restaurantPromises);
    const restaurants = results.filter((restaurant) => restaurant !== null);
    return res.json(restaurants);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function createRestaurant(req, res) {
  const { uid } = req.user;
  const { name, description } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Restaurant name is required" });
  }

  try {
    const restaurantId = db.ref("restaurants").push().key;
    const restaurantData = {
      id: restaurantId,
      ownerId: uid,
      name: name.trim(),
      description: description || "",
      createdAt: Date.now(),
    };

    await db.ref(`restaurants/${restaurantId}`).set(restaurantData);
    await db.ref(`users/${uid}/restaurants/${restaurantId}`).set({
      name: restaurantData.name,
      role: "owner",
      createdAt: Date.now(),
      active: true,
    });

    return res.status(201).json({
      id: restaurantId,
      name: restaurantData.name,
      description: restaurantData.description,
      address: restaurantData.address,
      phone: restaurantData.phone,
      email: restaurantData.email,
      website: restaurantData.website,
      logo: restaurantData.logo,
      coverImage: restaurantData.coverImage,
      featuredImage: restaurantData.featuredImage,
      createdAt: restaurantData.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function getRestaurant(req, res) {
  const { restaurantId } = req.params;
  try {
    const snap = await db.ref(`restaurants/${restaurantId}`).get();
    if (!snap.exists())
      return res.status(404).json({ error: "Restaurant not found" });

    const data = snap.val();

    return res.json({
      id: restaurantId,
      name: data.name || "",
      description: data.description || "",
      address: data.address || "",
      phone: data.phone || "",
      email: data.email || "",
      website: data.website || "",
      logo: data.logo || "",
      coverImage: data.coverImage || "",
      featuredImage: data.featuredImage || "",
      hours: data.hours || {},
      socialMedia: data.socialMedia || {},
      settings: data.settings || {},
      active: data.active !== false,
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
function findNextOpenTime(hoursData, currentDayKey, currentTime) {
  const todayHours = hoursData[currentDayKey];
  if (todayHours && todayHours.timeSlots) {
    for (const slot of todayHours.timeSlots) {
      if (currentTime < slot.open) {
        return slot.open;
      }
    }
  }

  return null;
}
async function getRestaurantForShop(req, res) {
  const { restaurantId } = req.params;
  try {
    const snap = await db.ref(`restaurants/${restaurantId}`).get();
    if (!snap.exists())
      return res.status(404).json({ error: "Restaurant not found" });

    const data = snap.val();
    const now = new Date();
    const todayDateStr = now.toISOString().split("T")[0];
    const dayOfWeekKey = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);

    let isOpen = false;
    let nextOpenTime = null;
    let closureReason = null;

    const specialClosuresData = data.specialClosures || [];
    let specialClosures = [];
    if (specialClosuresData) {
      if (Array.isArray(specialClosuresData)) {
        specialClosures = specialClosuresData;
      } else if (typeof specialClosuresData === "object") {
        specialClosures = Object.values(specialClosuresData);
      }
    }

    const todaySpecialClosure = specialClosures.find((closure) => {
      if (typeof closure === "string") {
        return closure === todayDateStr;
      }
      return closure.date === todayDateStr;
    });

    if (todaySpecialClosure) {
      isOpen = false;
      closureReason =
        typeof todaySpecialClosure === "string"
          ? "Special Closure"
          : todaySpecialClosure.reason || "Special Closure";
    } else if (data.hours && data.hours[dayOfWeekKey]) {
      const todayHours = data.hours[dayOfWeekKey];

      if (todayHours.isClosed) {
        isOpen = false;
      } else if (todayHours.timeSlots && todayHours.timeSlots.length > 0) {
        for (const slot of todayHours.timeSlots) {
          if (currentTime >= slot.open && currentTime < slot.close) {
            isOpen = true;
            break;
          }
        }

        if (!isOpen) {
          nextOpenTime = findNextOpenTime(
            data.hours,
            dayOfWeekKey,
            currentTime
          );
        }
      }
    }

    let itemsWithDiscounts = data.items || {};
    try {
      const discounts = data.discounts || {};
      itemsWithDiscounts = calculateItemDiscounts(
        data.items || {},
        data.categories || {},
        discounts
      );
    } catch (discountError) {
      console.error("Error calculating discounts:", discountError);
      
    }

    return res.json({
      id: restaurantId,
      name: data.name || "",
      description: data.description || "",
      address: data.address || "",
      phone: data.phone || "",
      email: data.email || "",
      website: data.website || "",
      logo: data.logo || "",
      coverImage: data.coverImage || "",
      featuredImage: data.featuredImage || "",
      socialMedia: data.socialMedia || [],
      categories: data.categories || {},
      items: itemsWithDiscounts,
      modifiers: data.modifiers || {},
      hours: data.hours || {},
      isOpen,
      nextOpenTime,
      closureReason,
      specialClosures: specialClosures,
      active: data.active !== false,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function updateRestaurant(req, res) {
  const { restaurantId } = req.params;
  const userId = req.user.uid;

  try {
    const updateData = { ...req.body, updatedAt: Date.now() };
    await db.ref(`restaurants/${restaurantId}`).update(updateData);

    if (updateData.active !== undefined) {
      await db.ref(`users/${userId}/restaurants/${restaurantId}`).update({
        active: updateData.active,
        updatedAt: Date.now(),
      });
    }

    const updatedSnap = await db.ref(`restaurants/${restaurantId}`).get();
    const data = updatedSnap.val();

    return res.json({
      id: restaurantId,
      name: data.name || "",
      description: data.description || "",
      address: data.address || "",
      phone: data.phone || "",
      email: data.email || "",
      website: data.website || "",
      logo: data.logo || "",
      coverImage: data.coverImage || "",
      featuredImage: data.featuredImage || "",
      hours: data.hours || {},
      socialMedia: data.socialMedia || {},
      settings: data.settings || {},
      specialClosures: data.specialClosures || [],
      active: data.active !== false,
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function deleteRestaurant(req, res) {
  const { restaurantId } = req.params;
  const userId = req.user.uid;

  try {

    await db.ref(`restaurants/${restaurantId}`).remove();

    await db.ref(`users/${userId}/restaurants/${restaurantId}`).remove();

    return res.json({ message: "Restaurant deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getUserRestaurants,
  createRestaurant,
  getRestaurant,
  getRestaurantForShop,
  updateRestaurant,
  deleteRestaurant,
};
