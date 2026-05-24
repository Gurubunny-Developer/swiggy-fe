import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, User, MapPin, ChevronDown, LogOut, Search, Flame, X, Compass, KeyRound, Mail, UserCheck } from 'lucide-react';

export const Navbar = ({ onSearch, searchQuery }) => {
  const { user, logout, login, signup, getCartCount, getCartTotal, currentLocation, setCurrentLocation } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Address Dropdown State
  const [showLocationList, setShowLocationList] = useState(false);
  const locations = [
    { name: 'Indiranagar, Bengaluru', lat: 12.9715987, lng: 77.5945627 },
    { name: 'Bandra West, Mumbai', lat: 19.060014, lng: 72.836208 },
    { name: 'Connaught Place, New Delhi', lat: 28.6304, lng: 77.2177 },
    { name: 'Salt Lake City, Kolkata', lat: 22.5735, lng: 88.4331 }
  ];

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      setShowAuthModal(false);
      // Reset forms
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (loc) => {
    setCurrentLocation(loc);
    setShowLocationList(false);
  };

  return (
    <>
      <nav className="navbar-container glass-panel">
        <div className="navbar-content">
          {/* Logo & Location */}
          <div className="nav-left">
            <a href="/" className="logo-link">
              <div className="logo-box">
                <Flame className="logo-icon animate-float" />
                <span className="logo-text">SWIGGY<span className="logo-accent">CRAFT</span></span>
              </div>
            </a>
            
            <div className="location-selector" onClick={() => setShowLocationList(!showLocationList)}>
              <MapPin className="pin-icon" />
              <span className="location-name">{currentLocation.name}</span>
              <ChevronDown className={`chevron-icon ${showLocationList ? 'rotate' : ''}`} />
              
              {showLocationList && (
                <div className="location-dropdown glass-panel">
                  <div className="dropdown-title">Select Delivery Location</div>
                  {locations.map((loc, index) => (
                    <div 
                      key={index} 
                      className={`location-item ${currentLocation.name === loc.name ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLocationChange(loc);
                      }}
                    >
                      <MapPin className="item-pin-icon" />
                      <span>{loc.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search bar */}
          {onSearch && (
            <div className="nav-search-box">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search for restaurants or dishes..." 
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="search-input"
              />
            </div>
          )}

          {/* Nav Links */}
          <div className="nav-right">
            {/* User Account */}
            {user ? (
              <div className="user-profile-menu">
                <div className="user-info">
                  <div className="avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                </div>
                <button className="logout-btn" onClick={logout} title="Log Out">
                  <LogOut className="logout-icon" />
                </button>
              </div>
            ) : (
              <button className="sign-in-btn" onClick={() => setShowAuthModal(true)}>
                <User className="nav-icon" />
                <span>Sign In</span>
              </button>
            )}

            {/* Cart Button */}
            <a href="/checkout" className={`cart-nav-btn ${getCartCount() > 0 ? 'animate-pulse-glow active' : ''}`}>
              <div className="cart-icon-wrapper">
                <ShoppingBag className="nav-icon" />
                {getCartCount() > 0 && <span className="cart-count-badge">{getCartCount()}</span>}
              </div>
              <span className="cart-nav-text">
                {getCartCount() > 0 ? `₹${getCartTotal()}` : 'Cart'}
              </span>
            </a>
          </div>
        </div>
      </nav>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAuthModal(false)}>
              <X />
            </button>
            
            <div className="modal-header">
              <Flame className="modal-logo" />
              <h2>{isSignUp ? 'Join SwiggyCraft' : 'Welcome Back'}</h2>
              <p>{isSignUp ? 'Create an account to order delicious food' : 'Sign in to track your orders and checkout faster'}</p>
            </div>

            {authError && <div className="auth-error-msg">{authError}</div>}

            <form onSubmit={handleAuthSubmit} className="auth-form">
              {isSignUp && (
                <div className="form-group">
                  <label><UserCheck className="form-icon" /> Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
              )}
              
              <div className="form-group">
                <label><Mail className="form-icon" /> Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label><KeyRound className="form-icon" /> Password</label>
                <input 
                  type="password" 
                  placeholder="Enter password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="auth-toggle-msg">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} className="toggle-link">
                {isSignUp ? 'Sign In Now' : 'Create One Now'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Navbar;
