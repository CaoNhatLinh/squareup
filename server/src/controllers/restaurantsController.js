const admin = require("firebase-admin");
const db = admin.database();
const { calculateItemDiscounts } = require("../utils/itemDiscountCalculator");

// --- Helper Functions ---

const generateSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const findNextOpenTime = (hoursData, currentDayKey, currentTime) => {
  const todayHours = hoursData[currentDayKey];
  if (todayHours?.timeSlots) {
    for (const slot of todayHours.timeSlots) {
      if (currentTime < slot.open) {
        return slot.open;
      }
    }
  }
  return null;
};

const checkRestaurantStatus = (data) => {
  const now = new Date();
  const todayDateStr = now.toISOString().split("T")[0];
  const dayOfWeekKey = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);

  let isOpen = false;
  let nextOpenTime = null;
  let closureReason = null;

  const specialClosures = data.specialClosures
    ? Array.isArray(data.specialClosures)
      ? data.specialClosures
      : Object.values(data.specialClosures)
    : [];

  const todaySpecialClosure = specialClosures.find((closure) =>
    typeof closure === "string"
      ? closure === todayDateStr
      : closure.date === todayDateStr
  );

  if (todaySpecialClosure) {
    isOpen = false;
    closureReason =
      typeof todaySpecialClosure === "string"
        ? "Special Closure"
        : todaySpecialClosure.reason || "Special Closure";
  } else if (data.hours && data.hours[dayOfWeekKey]) {
    const todayHours = data.hours[dayOfWeekKey];

    if (!todayHours.isClosed && todayHours.timeSlots?.length > 0) {
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

  return { isOpen, nextOpenTime, closureReason, specialClosures };
};

// --- Main Controllers ---

async function getUserRestaurants(req, res) {
  const { uid } = req.user;
  try {
    const userRecord = await admin.auth().getUser(uid);
    if (userRecord.customClaims?.role === "guest") {
      return res.status(403).json({
        error: "Guest users cannot manage restaurants",
        isGuest: true,
      });
    }

    const userRestaurantsSnap = await db.ref(`users/${uid}/restaurants`).get();
    if (!userRestaurantsSnap.exists()) return res.json([]);

    const restaurantEntries = Object.entries(userRestaurantsSnap.val());
    const restaurants = await Promise.all(
      restaurantEntries.map(async ([id, meta]) => {
        const snap = await db.ref(`restaurants/${id}`).get();
        if (!snap.exists()) return null;
        const data = snap.val();
        return {
          id,
          name: data.name || "",
          description: data.description || "",
          logo: data.logo || "",
          role: meta.role || "owner",
          active: meta.active !== false,
          createdAt: meta.createdAt || null,
        };
      })
    );

    return res.json(restaurants.filter(Boolean));
  } catch (err) {
    console.error("getUserRestaurants error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

async function createRestaurant(req, res) {
  const { uid } = req.user;
  const { name, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Restaurant name is required" });
  }

  try {
    const userRecord = await admin.auth().getUser(uid);
    if (userRecord.customClaims?.role === "guest") {
      return res.status(403).json({
        error: "Guest users cannot create restaurants",
        isGuest: true,
      });
    }

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

    return res.status(201).json(restaurantData);
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
      ...data,
      id: restaurantId,
      active: data.active !== false,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function getRestaurantForShop(req, res) {
  const { restaurantId } = req.params;
  try {
    const snap = await db.ref(`restaurants/${restaurantId}`).get();
    if (!snap.exists())
      return res.status(404).json({ error: "Restaurant not found" });

    const data = snap.val();
    const status = checkRestaurantStatus(data);

    let items = data.items || {};
    try {
      items = calculateItemDiscounts(
        items,
        data.categories || {},
        data.discounts || {}
      );
    } catch (e) {
      console.error("Discount calculation error:", e);
    }

    return res.json({
      id: restaurantId,
      ...data,
      items,
      ...status,
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
      await db
        .ref(`users/${userId}/restaurants/${restaurantId}`)
        .update({ active: updateData.active, updatedAt: Date.now() });
    }

    const snap = await db.ref(`restaurants/${restaurantId}`).get();
    return res.json({ ...snap.val(), id: restaurantId });
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

async function findRestaurantBySlug(req, res) {
  const { slug } = req.params;
  try {
    const snap = await db
      .ref("restaurants")
      .orderByChild("slug")
      .equalTo(slug)
      .once("value");

    if (!snap.exists()) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const dataMap = snap.val();
    const restaurantId = Object.keys(dataMap)[0];
    const data = dataMap[restaurantId];
    const status = checkRestaurantStatus(data);

    let items = data.items || {};
    try {
      items = calculateItemDiscounts(
        items,
        data.categories || {},
        data.discounts || {}
      );
    } catch (e) {
      console.error("Discount error:", e);
    }

    return res.json({
      restaurantId,
      data: {
        id: restaurantId,
        ...data,
        items,
        ...status,
        active: data.active !== false,
        siteConfig: data.siteConfig || {},
      },
    });
  } catch (error) {
    console.error("Error finding by slug:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function updateRestaurantSiteConfig(req, res) {
  const { restaurantId } = req.params;
  const { slug, siteConfig, draftConfig } = req.body;
  const userId = req.user.uid;

  try {
    const userAccess = await db
      .ref(`users/${userId}/restaurants/${restaurantId}`)
      .get();
    if (!userAccess.exists()) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updates = { updatedAt: Date.now() };
    if (slug !== undefined) updates.slug = slug;
    if (siteConfig !== undefined) updates.siteConfig = siteConfig;
    if (draftConfig !== undefined) updates.draftConfig = draftConfig;

    await db.ref(`restaurants/${restaurantId}`).update(updates);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function checkSlugAvailability(req, res) {
  const { slug } = req.params;
  const { currentRestaurantId } = req.query;

  try {
    const snap = await db
      .ref("restaurants")
      .orderByChild("slug")
      .equalTo(slug)
      .once("value");

    if (!snap.exists()) return res.json({ available: true });

    const data = snap.val();
    const foundId = Object.keys(data)[0];

    if (currentRestaurantId && foundId === currentRestaurantId) {
      return res.json({ available: true });
    }
    return res.json({ available: false });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function generateSlugEndpoint(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  return res.json({ slug: generateSlug(name) });
}

module.exports = {
  getUserRestaurants,
  createRestaurant,
  getRestaurant,
  getRestaurantForShop,
  updateRestaurant,
  deleteRestaurant,
  findRestaurantBySlug,
  updateRestaurantSiteConfig,
  checkSlugAvailability,
  generateSlugEndpoint,
};