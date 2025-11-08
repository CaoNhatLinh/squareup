import { HiLocationMarker, HiPhone, HiMail, HiClock } from "react-icons/hi";

export default function Footer({ restaurant }) {
  if (!restaurant) return null;
  return (
    <footer className="bg-white text-gray-800 py-16 px-4 mt-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-extrabold mb-3 text-red-600 tracking-tight">
                {restaurant.name}
              </h2>
              <p className="text-gray-600 text-base leading-relaxed max-w-md">
                Thank you for choosing us! Order now for the best culinary experience.
              </p>
            </div>

            <div className="space-y-4">
              {restaurant.address && (
                <div className="flex items-start gap-4 p-5 bg-red-50/50 rounded-xl border border-gray-200 hover:border-red-500 transition-all">
                  <div className="p-3 bg-red-600/10 rounded-full">
                    <HiLocationMarker className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                    <p className="text-gray-800 font-semibold text-base">{restaurant.address}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors group border border-gray-200 hover:border-red-400"
                  >
                    <div className="p-3 bg-orange-600/10 rounded-full">
                      <HiPhone className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-gray-800 text-sm font-medium group-hover:text-red-600">{restaurant.phone}</p>
                    </div>
                  </a>
                )}
                {restaurant.email && (
                  <a
                    href={`mailto:${restaurant.email}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors group border border-gray-200 hover:border-red-400"
                  >
                    <div className="p-3 bg-red-600/10 rounded-full">
                      <HiMail className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-gray-800 text-sm font-medium group-hover:text-red-600 truncate">{restaurant.email}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600/10 rounded-xl">
                <HiClock className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 tracking-tight">Opening Hours</h3>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 space-y-2 border border-gray-200 shadow-lg">
              {restaurant.hours ? (
                <>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                    const dayData = restaurant.hours[day];
                    const dayLabels = {
                      monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
                      thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
                    };
                    
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                    const isToday = day === today;

                    return (
                      <div
                        key={day}
                        className={`flex justify-between items-center py-3 px-4 rounded-xl transition-all ${
                          isToday 
                            ? 'bg-red-50/50 border-l-4 border-red-500'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className={`font-bold ${isToday ? 'text-red-600' : 'text-gray-700'}`}>
                          {dayLabels[day]}
                          {isToday && <span className="ml-3 text-xs bg-red-600 text-white px-2.5 py-1 rounded-full font-extrabold">Hôm nay</span>}
                        </span>
                        <span className={`text-sm ${
                          dayData?.isClosed 
                            ? 'text-red-600 font-extrabold' 
                            : isToday 
                              ? 'text-red-500 font-extrabold'
                              : 'text-gray-600'
                        }`}>
                          {dayData?.isClosed ? (
                            'Đóng cửa'
                          ) : dayData?.timeSlots && dayData.timeSlots.length > 0 ? (
                            dayData.timeSlots.map((slot, idx) => (
                              <span key={idx}>
                                {slot.open} - {slot.close}
                                {idx < dayData.timeSlots.length - 1 && ', '}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">-- --</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">No opening hours information yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} {restaurant.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
              <a href="#" className="hover:text-red-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-red-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-red-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}