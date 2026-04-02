import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition ${readonly ? 'cursor-default' : 'cursor-pointer'} ${
            star <= display ? 'text-yellow-400' : 'text-gray-600'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
