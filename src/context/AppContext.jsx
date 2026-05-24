import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const API_BASE = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartRestaurantId, setCartRestaurantId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({
    name: 'Indiranagar, Bengaluru',
    lat: 12.9715987,
    lng: 77.5945627
  });
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load auth and cart from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('swiggy_token');
    const savedUser = localStorage.getItem('swiggy_user');
    const savedCart = localStorage.getItem('swiggy_cart');
    const savedCartRestId = localStorage.getItem('swiggy_cart_restaurant');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedCartRestId) {
      setCartRestaurantId(savedCartRestId);
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('swiggy_cart', JSON.stringify(cart));
    localStorage.setItem('swiggy_cart_restaurant', cartRestaurantId || '');
  }, [cart, cartRestaurantId]);

  // Auth Operations
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('swiggy_token', data.token);
      localStorage.setItem('swiggy_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('swiggy_token', data.token);
      localStorage.setItem('swiggy_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('swiggy_token');
    localStorage.removeItem('swiggy_user');
  };

  // Cart Operations
  const addToCart = (item, restaurantId) => {
    if (cartRestaurantId && cartRestaurantId !== restaurantId) {
      // Return a signal to ask for confirmation if adding from a different restaurant
      return false;
    }
    
    setCartRestaurantId(restaurantId);
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    return true;
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const updated = prevCart
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
      
      if (updated.length === 0) {
        setCartRestaurantId(null);
      }
      return updated;
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prevCart) => {
      const updated = prevCart
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0);
      
      if (updated.length === 0) {
        setCartRestaurantId(null);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    setCartRestaurantId(null);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Order Operations
  const placeOrder = async (address) => {
    if (!user) throw new Error('You must be logged in to place an order.');
    if (cart.length === 0) throw new Error('Cart is empty.');

    setLoading(true);
    setError(null);
    try {
      const total = getCartTotal() + 40 + 15; // subtotal + delivery + taxes
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items: cart,
          total,
          address
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      clearCart();
      setActiveOrderId(data.id);
      fetchOrders(); // update list
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        API_BASE,
        user,
        token,
        cart,
        cartRestaurantId,
        currentLocation,
        setCurrentLocation,
        orders,
        activeOrderId,
        setActiveOrderId,
        loading,
        error,
        login,
        signup,
        logout,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        placeOrder,
        fetchOrders
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
