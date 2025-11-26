import { useEffect, useRef, useState } from "react";
import { HiCalendar, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import Input from '@/components/ui/Input';

const DatePicker = ({
  value,
  selected,
  onChange,
  label,
  placeholder = 'Select date',
  disabled = false,
  required = false,
  error,
  helperText,
  minDate,
  maxDate,
  className = '',
  isClearable = false,
  placeholderText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const pickerRef = useRef(null);

  const selectedDate = (value || selected) ? new Date(value || selected) : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange && onChange(newDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange && onChange(null);
    setIsOpen(false);
  };

  const isDateDisabled = (date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const changeMonth = (delta) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const isDisabled = disabled || isDateDisabled(date);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateSelect(day)}
          disabled={isDisabled}
          className={[
            'p-2 text-sm rounded-lg transition-colors',
            isSelected ? 'bg-indigo-600 text-white font-semibold' : '',
            !isSelected && isToday ? 'bg-indigo-50 text-indigo-600 font-semibold' : '',
            !isSelected && !isToday && !isDisabled ? 'hover:bg-gray-100 text-gray-900' : '',
            isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'
          ].filter(Boolean).join(' ')}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
        <Input
        label={label}
        value={formatDate(selectedDate)}
        placeholder={placeholderText || placeholder}
        readOnly
        disabled={disabled}
        required={required}
        error={error}
        helperText={helperText}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        rightIcon={HiCalendar}
        className="cursor-pointer"
      />

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            {isClearable && selectedDate && (
              <button
                type="button"
                onClick={() => handleClear()}
                className="px-2 py-1 ml-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-sm font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="p-2 text-xs font-semibold text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
