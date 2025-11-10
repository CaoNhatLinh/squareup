import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useRestaurant } from "../../hooks/useRestaurant";
import { updateBusinessHours } from "../../api/restaurants";
import {
  HiPlus,
  HiTrash,
  HiClock,
  HiCheckCircle,
  HiExclamationCircle,
  HiChevronDoubleRight,
  HiOutlineClock,
} from "react-icons/hi";

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function BusinessHours() {
  const { user } = useAuth();
  const { restaurant, updateRestaurant } = useRestaurant();
  const [hours, setHours] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (restaurant?.hours && Object.keys(restaurant.hours).length > 0) {
      setHours(restaurant.hours);
    } else {
      const defaultHours = {};
      DAYS_OF_WEEK.forEach((day) => {
        defaultHours[day.key] = {
          isClosed: false,
          timeSlots: [{ open: "08:00", close: "17:00" }],
        };
      });
      setHours(defaultHours);
    }
  }, [restaurant]);

  const toggleDayClosed = (dayKey) => {
    setHours((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isClosed: !prev[dayKey]?.isClosed,
      },
    }));
  };

  const addTimeSlot = (dayKey) => {
    setHours((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: [
          ...(prev[dayKey]?.timeSlots || []),
          { open: "09:00", close: "17:00" },
        ],
      },
    }));
  };

  const removeTimeSlot = (dayKey, slotIndex) => {
    setHours((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: prev[dayKey].timeSlots.filter((_, i) => i !== slotIndex),
      },
    }));
  };

  const updateTimeSlot = (dayKey, slotIndex, field, value) => {
    setHours((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: prev[dayKey].timeSlots.map((slot, i) =>
          i === slotIndex ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const copyToAllDays = (sourceDayKey) => {
    if (
      !window.confirm(
        `Are you sure you want to copy ${
          hours[sourceDayKey]?.isClosed ? "closed" : "hours"
        } from ${
          DAYS_OF_WEEK.find((d) => d.key === sourceDayKey).label
        } to ALL other days? This will overwrite existing hours.`
      )
    ) {
      return;
    }

    setCopying(true);
    const sourceDay = hours[sourceDayKey];
    const newHours = {};
    DAYS_OF_WEEK.forEach((day) => {
      newHours[day.key] = {
        ...sourceDay,
        timeSlots: (sourceDay.timeSlots || []).map((slot) => ({ ...slot })),
      };
    });
    setHours(newHours);
    setMessage(
      `Successfully copied hours from ${
        DAYS_OF_WEEK.find((d) => d.key === sourceDayKey).label
      } to all days.`
    );
    setTimeout(() => {
      setMessage("");
      setCopying(false);
    }, 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const token = await user.getIdToken();
      await updateBusinessHours(user.uid, hours, token);
      updateRestaurant({ hours });
      setMessage("Business hours updated successfully!");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Error updating business hours:", err);
      setMessage("Failed to update business hours");
    } finally {
      setSaving(false);
    }
  };

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Business Hours Configuration
          </h1>

          <p className="text-gray-600">
            Set your restaurant's operating schedule for the weekly routine.
          </p>
        </div>
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 shadow-md border-l-4 ${
              message.includes("success") || message.includes("copied")
                ? "bg-green-50 text-green-800 border-green-500"
                : "bg-red-50 text-red-800 border-red-500"
            }`}
          >
            {message.includes("success") || message.includes("copied") ? (
              <HiCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <HiExclamationCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>{message}</div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 divide-y divide-gray-100">
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = hours[day.key] || {
              isClosed: false,
              timeSlots: [],
            };
            const isToday = day.key === today;

            return (
              <div
                key={day.key}
                className={`p-6 transition-colors grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 ${
                  isToday ? "bg-red-50/50" : "hover:bg-gray-50"
                }`}
              >

                <div className="md:col-span-1 lg:col-span-1 flex flex-col justify-start">
                  <div
                    className={`font-extrabold text-lg flex items-center gap-2 ${
                      isToday ? "text-red-700" : "text-gray-900"
                    }`}
                  >
                    <HiClock className="w-5 h-5" />
                    {day.label}
                  </div>
                  {isToday && (
                    <span className="text-xs text-red-500 font-semibold mt-1">
                      Today
                    </span>
                  )}
                </div>
                <div className="md:col-span-1 lg:col-span-1 flex flex-col justify-start">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={dayHours.isClosed || false}
                      onChange={() => toggleDayClosed(day.key)}
                      className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 border-gray-300"
                    />
                    <span
                      className={`text-base font-medium ${
                        dayHours.isClosed
                          ? "text-red-600 font-bold"
                          : "text-gray-700"
                      }`}
                    >
                      Closed All Day
                    </span>
                  </label>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  {!dayHours.isClosed ? (
                    <div className="space-y-3">
                      {(dayHours.timeSlots || []).map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="relative w-28 flex-shrink-0">
                            <input
                              type="time"
                              value={slot.open}
                              onChange={(e) =>
                                updateTimeSlot(
                                  day.key,
                                  index,
                                  "open",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-700 w-full appearance-none pr-3"
                            />
                            <HiOutlineClock className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          <span className="text-gray-500 font-semibold">-</span>
                          <div className="relative w-28 flex-shrink-0">
                            <input
                              type="time"
                              value={slot.close}
                              onChange={(e) =>
                                updateTimeSlot(
                                  day.key,
                                  index,
                                  "close",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-700 w-full appearance-none pr-3"
                            />
                            <HiOutlineClock className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {(dayHours.timeSlots || []).length > 1 ? (
                            <button
                              onClick={() => removeTimeSlot(day.key, index)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-all"
                            >
                              <HiTrash className="w-5 h-5" />
                            </button>
                          ) : (
                            <div className="w-9 h-9"></div> // Spacer
                          )}
                          {index === dayHours.timeSlots.length - 1 && (
                            <button
                              onClick={() => addTimeSlot(day.key)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-all"
                              title="Add new time slot"
                            >
                              <HiPlus className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}

                      {(dayHours.timeSlots || []).length === 0 && (
                        <button
                          onClick={() => addTimeSlot(day.key)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-all"
                        >
                          <HiPlus className="w-4 h-4" />
                          Add First Slot
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic font-medium py-2">
                      Closed all day
                    </div>
                  )}
                </div>
                <div className="md:col-span-1 lg:col-span-1 flex flex-col justify-start items-start">
                  <button
                    onClick={() => copyToAllDays(day.key)}
                    disabled={copying || saving}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all disabled:opacity-50"
                  >
                    <HiChevronDoubleRight className="w-4 h-4" />
                    Copy to All
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-red-200 transition-all"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
