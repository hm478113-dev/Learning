import React, { useState } from 'react';
import { Star } from './Icons';

interface RatingStarsProps {
  onRate?: (rating: number) => void;
  initialRating?: number;
  readOnly?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ onRate, initialRating = 0, readOnly = false }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (value: number) => {
    if (readOnly) return;
    setRating(value);
    if (onRate) onRate(value);
  };

  return (
    <div className="flex gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`focus:outline-none transition-transform ${!readOnly ? 'hover:scale-110' : 'cursor-default'}`}
          disabled={readOnly}
        >
          <Star 
            className={`w-8 h-8 transition-colors ${
              star <= (hover || rating) 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-slate-700 hover:text-slate-600'
            }`} 
          />
        </button>
      ))}
    </div>
  );
};