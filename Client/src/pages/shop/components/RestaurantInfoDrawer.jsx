import { HiX, HiLocationMarker, HiClock, HiPhone, HiMail } from "react-icons/hi";

export default function RestaurantInfoDrawer({ isOpen, onClose, restaurant }) {
  if (!restaurant) return null;

  const formatBusinessHours = (hours) => {
    if (!hours) return [];

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };

    return daysOfWeek.map(day => {
      const dayData = hours[day];
      if (!dayData) return { day: dayLabels[day], hours: 'Not set', isClosed: false };

      return {
        day: dayLabels[day],
        hours: dayData.isClosed 
          ? 'Closed' 
          : dayData.timeSlots && dayData.timeSlots.length > 0
            ? dayData.timeSlots.map(slot => `${slot.open} - ${slot.close}`).join(', ')
            : 'Not set',
        isClosed: dayData.isClosed
      };
    });
  };

  const hoursData = formatBusinessHours(restaurant.hours);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const todayDateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const todaySpecialClosure = restaurant.specialClosures?.find(closure => {
    if (typeof closure === 'string') {
      return closure === todayDateStr;
    }
    return closure.date === todayDateStr;
  });

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <HiX className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-6 space-y-6">
            {/* Address */}
            {restaurant.address && (
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <HiLocationMarker className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-700 leading-relaxed">{restaurant.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Special Hours Notice - Only show if today is a special closure */}
            {todaySpecialClosure && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <HiClock className="w-5 h-5" />
                  🔒 Closed Today - Special Notice
                </h3>
                <div className="text-sm text-red-800">
                  <span className="font-medium">Reason:</span>{' '}
                  {typeof todaySpecialClosure === 'string' 
                    ? 'Special Closure' 
                    : todaySpecialClosure.reason || 'Special Closure'}
                </div>
              </div>
            )}

            {/* Open Hours */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <HiClock className="w-6 h-6 text-red-600" />
                Open Hours
              </h3>
              <div className="space-y-2">
                {hoursData.map((dayInfo, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                      dayInfo.day === today 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className={`font-medium ${
                      dayInfo.day === today ? 'text-red-900' : 'text-gray-700'
                    }`}>
                      {dayInfo.day}
                    </span>
                    <span className={`${
                      dayInfo.isClosed 
                        ? 'text-red-600 font-medium' 
                        : dayInfo.day === today
                          ? 'text-red-700 font-medium'
                          : 'text-gray-600'
                    }`}>
                      {dayInfo.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3 border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900">Contact</h3>
              <div className="space-y-3">
                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <HiPhone className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700">{restaurant.phone}</span>
                  </a>
                )}
                {restaurant.email && (
                  <a
                    href={`mailto:${restaurant.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <HiMail className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700">{restaurant.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
