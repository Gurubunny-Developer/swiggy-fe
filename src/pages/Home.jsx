import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import RestaurantCard from '../components/RestaurantCard';
import { Flame, Compass, Filter, Search, RotateCcw, Award } from 'lucide-react';

const CUISINES = [
  { name: 'Biryani', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=150&auto=format&fit=crop&q=80' },
  { name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80' },
  { name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=80' },
  { name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=150&auto=format&fit=crop&q=80' },
  { name: 'Healthy', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=80' },
  { name: 'Desserts', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=150&auto=format&fit=crop&q=80' }
];

export const Home = ({ searchQuery }) => {
  const { API_BASE } = useApp();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [onlyVeg, setOnlyVeg] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [sortBy, setSortBy] = useState('default'); // 'default', 'cost-asc', 'cost-desc', 'delivery-asc'

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/restaurants`);
      const data = await res.json();
      setRestaurants(data);
      setFilteredRestaurants(data);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and searches
  useEffect(() => {
    let result = [...restaurants];

    // 1. Search Query (matches restaurant name, cuisines, or menu items)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.cuisines.some(c => c.toLowerCase().includes(query)) ||
        r.menu.some(cat => 
          cat.items.some(item => 
            item.name.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)
          )
        )
      );
    }

    // 2. Cuisine Carousel Selection
    if (selectedCuisine) {
      result = result.filter(r => 
        r.cuisines.some(c => c.toLowerCase() === selectedCuisine.toLowerCase())
      );
    }

    // 3. Veg filter
    if (onlyVeg) {
      result = result.filter(r => r.isVeg === true);
    }

    // 4. Rating filter (4.5+)
    if (topRated) {
      result = result.filter(r => r.rating >= 4.5);
    }

    // 5. Sorting
    if (sortBy === 'cost-asc') {
      result.sort((a, b) => a.costForTwo - b.costForTwo);
    } else if (sortBy === 'cost-desc') {
      result.sort((a, b) => b.costForTwo - a.costForTwo);
    } else if (sortBy === 'delivery-asc') {
      // Parse integers out of deliveryTime strings e.g. "20-25 mins" -> 20
      const getMinTime = (timeStr) => parseInt(timeStr.split('-')[0], 10) || 999;
      result.sort((a, b) => getMinTime(a.deliveryTime) - getMinTime(b.deliveryTime));
    }

    setFilteredRestaurants(result);
  }, [searchQuery, selectedCuisine, onlyVeg, topRated, sortBy, restaurants]);

  const clearFilters = () => {
    setSelectedCuisine('');
    setOnlyVeg(false);
    setTopRated(false);
    setSortBy('default');
  };

  return (
    <div className="home-container animate-slide-in">
      
      {/* Cuisine Carousel Banner */}
      <section className="cuisine-carousel-section">
        <h2 className="section-title">
          <Flame size={20} className="title-icon orange" /> What's on your mind?
        </h2>
        <div className="cuisine-carousel">
          {CUISINES.map((c, i) => (
            <div 
              key={i} 
              className={`cuisine-item ${selectedCuisine === c.name ? 'active' : ''}`}
              onClick={() => setSelectedCuisine(selectedCuisine === c.name ? '' : c.name)}
            >
              <div className="cuisine-img-wrapper">
                <img src={c.image} alt={c.name} className="cuisine-img" />
              </div>
              <span className="cuisine-name">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Filter toolbar */}
      <section className="filter-toolbar-section">
        <div className="filter-controls">
          <button 
            className={`filter-pill ${onlyVeg ? 'active' : ''}`}
            onClick={() => setOnlyVeg(!onlyVeg)}
          >
            Pure Veg
          </button>
          
          <button 
            className={`filter-pill ${topRated ? 'active' : ''}`}
            onClick={() => setTopRated(!topRated)}
          >
            Ratings 4.5+
          </button>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select-pill"
          >
            <option value="default">Sort By: Relevance</option>
            <option value="cost-asc">Cost: Low to High</option>
            <option value="cost-desc">Cost: High to Low</option>
            <option value="delivery-asc">Fast Delivery</option>
          </select>

          {(onlyVeg || topRated || sortBy !== 'default' || selectedCuisine) && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <RotateCcw size={14} /> Clear All
            </button>
          )}
        </div>

        <div className="search-summary-text">
          Showing {filteredRestaurants.length} premium restaurants
        </div>
      </section>

      {/* Restaurant List Grid */}
      <section className="restaurants-grid-section">
        {loading ? (
          <div className="loading-grid-spinner">
            <div className="spinner-orbit"></div>
            <p>Gathering fresh ingredients...</p>
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="restaurant-grid">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="no-results-panel glass-panel">
            <Compass size={48} className="no-results-icon" />
            <h3>No restaurants found</h3>
            <p>Try searching for another dish, or resetting the active filters.</p>
            <button className="reset-search-btn" onClick={clearFilters}>Reset Filters</button>
          </div>
        )}
      </section>

    </div>
  );
};
export default Home;
