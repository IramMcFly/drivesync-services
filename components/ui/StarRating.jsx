// components/ui/StarRating.jsx
'use client';

import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'text-base', 
  showNumber = true,
  totalRatings = null,
  className = ''
}) => {
  const getStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={`full-${i}`} className="text-yellow-400" />
      );
    }
    
    // Media estrella
    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt key="half" className="text-yellow-400" />
      );
    }
    
    // Estrellas vacías
    const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar key={`empty-${i}`} className="text-gray-300" />
      );
    }
    
    return stars;
  };

  const formatRating = (num) => {
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className={`flex ${size}`}>
        {getStars()}
      </div>
      
      {showNumber && (
        <span className="text-sm text-gray-600">
          {rating > 0 ? (
            <>
              {formatRating(rating)}
              {totalRatings !== null && (
                <span className="text-gray-400">
                  {' '}({totalRatings} {totalRatings === 1 ? 'reseña' : 'reseñas'})
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400">Sin calificaciones</span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;