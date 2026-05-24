import React from 'react';
import { Star, Clock, MapPin, BadgePercent } from 'lucide-react';

export const RestaurantCard = ({ restaurant }) => {
  const { id, name, image, cuisines, rating, deliveryTime, distance, costForTwo, isVeg } = restaurant;

  return (
    <a href={`/restaurant/${id}`} className="restaurant-card-link">
      <div className="restaurant-card glass-panel">
        {/* Card Header Image */}
        <div className="card-image-container">
          <img src={image} alt={name} className="restaurant-card-image" />
          <div className="image-overlay-gradient"></div>
          {isVeg && (
            <span className="veg-badge-overlay">
              <span className="veg-dot"></span> Pure Veg
            </span>
          )}
          <span className="distance-badge-overlay">
            <MapPin size={12} className="inline-icon" /> {distance}
          </span>
        </div>

        {/* Card Body Details */}
        <div className="card-body">
          <h3 className="restaurant-name-title">{name}</h3>
          
          <p className="cuisines-list">{cuisines.join(', ')}</p>
          
          <div className="restaurant-meta-row">
            {/* Rating badge */}
            <div className={`rating-badge ${rating >= 4.5 ? 'excellent' : 'good'}`}>
              <Star size={14} className="star-icon" />
              <span>{rating.toFixed(1)}</span>
            </div>
            
            {/* Delivery time */}
            <div className="meta-item delivery-time">
              <Clock size={14} />
              <span>{deliveryTime}</span>
            </div>
            
            {/* Cost For Two */}
            <div className="meta-item cost-for-two">
              <span>₹{costForTwo} for two</span>
            </div>
          </div>

          {/* Quick promotion indicator */}
          <div className="promo-row">
            <BadgePercent size={14} className="promo-icon" />
            <span>50% OFF up to ₹100 | Use WELCOME50</span>
          </div>
        </div>
      </div>
    </a>
  );
};
export default RestaurantCard;
