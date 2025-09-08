// Importa as dependências necessárias
import React, { useEffect, useRef } from 'react';
import Flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import { FaCalendarAlt } from 'react-icons/fa';

const DatePicker = ({ value, onChange, id }) => {
  const inputRef = useRef(null);
  const flatpickrInstanceRef = useRef(null);

  useEffect(() => {
    const flatpickrInstance = Flatpickr(inputRef.current, {
      dateFormat: 'Y-m-d',
      defaultDate: value,
      onChange: (selectedDates, dateStr) => {
        onChange(dateStr);
      },
      locale: Portuguese,
    });

    flatpickrInstanceRef.current = flatpickrInstance;

    return () => {
      if (flatpickrInstanceRef.current && typeof flatpickrInstanceRef.current.destroy === 'function') {
        flatpickrInstanceRef.current.destroy();
      }
    };
  }, [value, onChange]);

  return (
    <div className="date-input-container">
      {}
      <FaCalendarAlt className="calendar-icon" onClick={() => inputRef.current._flatpickr.open()} />
      {}
      <input
        type="text"
        id={id}
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};

export default DatePicker;