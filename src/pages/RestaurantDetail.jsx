import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Star, Clock, Heart, Share2, ShieldCheck, ArrowRight, ShoppingCart, Plus, Minus } from 'lucide-react';

export const RestaurantDetail = () => {
  const { id } = useParams();
  const { API_BASE, cart, addToCart, updateQuantity, getCartCount, getCartTotal, cartRestaurantId } = useApp();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlyVegMenu, setOnlyVegMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [alertDiffRestaurant, setAlertDiffRestaurant] = useState(false);

  useEffect(() => {
    fetchRestaurantDetail();
  }, [id]);

  const fetchRestaurantDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/restaurants/${id}`);
      if (res.ok) {
        const data = await res.ok ? await res.json() : null;
        setRestaurant(data);
        if (data && data.menu.length > 0) {
          setSelectedCategory(data.menu[0].category);
        }
      }
    } catch (err) {
      console.error('Failed to fetch restaurant details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-grid-spinner text-center" style={{ margin: '150px auto' }}>
        <div className="spinner-orbit"></div>
        <p>Preheating the woodfired ovens...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="main-content text-center">
        <h2>Restaurant not found</h2>
        <a href="/" className="reset-search-btn" style={{ display: 'inline-block', marginTop: '20px' }}>Back to Home</a>
      </div>
    );
  }

  const getItemQuantity = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const handleAddItem = (item) => {
    const success = addToCart(item, restaurant.id);
    if (!success) {
      setAlertDiffRestaurant(true);
    }
  };

  return (
    <div className="restaurant-detail-container animate-slide-in">
      {/* Hero Banner Header */}
      <div className="restaurant-hero glass-panel">
        <div className="hero-blur-bg" style={{ backgroundImage: `url(${restaurant.image})` }}></div>
        <div className="hero-content">
          <div className="hero-left">
            <img src={restaurant.image} alt={restaurant.name} className="hero-avatar" />
            <div className="hero-text">
              <h1 className="hero-name">{restaurant.name}</h1>
              <p className="hero-cuisines">{restaurant.cuisines.join(', ')}</p>
              <div className="hero-meta-row">
                <div className="hero-meta-item">
                  <Star size={16} fill="var(--color-warning)" stroke="var(--color-warning)" />
                  <span><strong>{restaurant.rating}</strong> ({restaurant.ratingCount})</span>
                </div>
                <span>•</span>
                <div className="hero-meta-item">
                  <Clock size={16} />
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <span>•</span>
                <div className="hero-meta-item">
                  <span>₹{restaurant.costForTwo} for two</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-right-actions">
            <button className="hero-action-circle" title="Share"><Share2 size={18} /></button>
            <button className="hero-action-circle" title="Favourite"><Heart size={18} /></button>
          </div>
        </div>
      </div>

      {/* Safety and Veg Switch bar */}
      <div className="menu-filter-bar glass-panel">
        <div className="safety-badge">
          <ShieldCheck size={18} className="safety-icon" />
          <span>FSSAI Certified | Gourmet & Hygiene Standards Met</span>
        </div>
        <div className="menu-toggle-controls">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={onlyVegMenu} 
              onChange={() => setOnlyVegMenu(!onlyVegMenu)} 
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-label">Veg Only</span>
        </div>
      </div>

      {/* Main Menu Layout: Left Side Category Tabs, Right Side Dish List */}
      <div className="menu-layout">
        
        {/* Left Side Navigation (Menu Categories) */}
        <aside className="menu-categories-sidebar glass-panel">
          <h3>Categories</h3>
          <div className="category-links">
            {restaurant.menu.map((cat, index) => (
              <button 
                key={index} 
                className={`category-tab-btn ${selectedCategory === cat.category ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.category);
                  const el = document.getElementById(cat.category);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                {cat.category}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Side Dish list */}
        <main className="menu-dishes-list">
          {restaurant.menu.map((cat, index) => {
            // Filter dishes if Veg Only is checked
            const dishesToShow = onlyVegMenu ? cat.items.filter(item => item.isVeg) : cat.items;

            if (dishesToShow.length === 0) return null;

            return (
              <section key={index} id={cat.category} className="menu-category-section glass-panel">
                <h2 className="category-section-title">{cat.category}</h2>
                <div className="dishes-grid">
                  {dishesToShow.map((dish) => {
                    const quantity = getItemQuantity(dish.id);
                    return (
                      <div key={dish.id} className="dish-card">
                        <div className="dish-details">
                          <div className="dish-veg-indicator">
                            <span className={`veg-indicator-dot ${dish.isVeg ? 'veg' : 'non-veg'}`}></span>
                            <span className="dish-badge-text">{dish.isVeg ? 'VEG' : 'NON-VEG'}</span>
                          </div>
                          <h4 className="dish-name">{dish.name}</h4>
                          <div className="dish-price">₹{dish.price}</div>
                          {dish.rating && (
                            <div className="dish-rating-row">
                              <Star size={12} fill="var(--color-warning)" stroke="var(--color-warning)" />
                              <span>{dish.rating}</span>
                            </div>
                          )}
                          <p className="dish-description">{dish.description}</p>
                        </div>

                        <div className="dish-image-action">
                          {dish.image && <img src={dish.image} alt={dish.name} className="dish-image" />}
                          <div className="dish-action-button-wrapper">
                            {quantity > 0 ? (
                              <div className="item-quantity-counter">
                                <button onClick={() => updateQuantity(dish.id, -1)} className="counter-btn">
                                  <Minus size={14} />
                                </button>
                                <span className="counter-val">{quantity}</span>
                                <button onClick={() => updateQuantity(dish.id, 1)} className="counter-btn">
                                  <Plus size={14} />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => handleAddItem(dish)} className="add-to-cart-action-btn">
                                ADD
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>

      </div>

      {/* Alert modal if adding from different restaurant */}
      {alertDiffRestaurant && (
        <div className="modal-overlay" onClick={() => setAlertDiffRestaurant(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: '10px' }}>Replace Cart Items?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Your cart contains items from a different restaurant. Adding this item will discard your current selection.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="filter-pill" 
                onClick={() => setAlertDiffRestaurant(false)}
              >
                Cancel
              </button>
              <button 
                className="reset-search-btn" 
                onClick={() => {
                  // Direct clear cart and add
                  const activeItem = restaurant.menu
                    .flatMap(cat => cat.items)
                    .find(dish => getItemQuantity(dish.id) > 0 || dish.id); // fallback to target
                  localStorage.removeItem('swiggy_cart');
                  localStorage.removeItem('swiggy_cart_restaurant');
                  addToCart(activeItem, restaurant.id);
                  setAlertDiffRestaurant(false);
                  window.location.reload();
                }}
              >
                Yes, Replace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating cart bar overlay */}
      {getCartCount() > 0 && cartRestaurantId === restaurant.id && (
        <div className="floating-cart-bar animate-pulse-glow">
          <div className="floating-cart-left">
            <ShoppingCart size={20} />
            <div className="floating-cart-stats">
              <span>{getCartCount()} items added</span>
              <span className="dot">•</span>
              <span className="price">₹{getCartTotal()}</span>
            </div>
          </div>
          <a href="/checkout" className="floating-checkout-link">
            <span>View Cart</span>
            <ArrowRight size={18} />
          </a>
        </div>
      )}

    </div>
  );
};
export default RestaurantDetail;
