import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Dashboard from './pages/Dashboard';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          {/* Navbar rendered on all user client pages */}
          <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home searchQuery={searchQuery} />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/tracking/:id" element={<OrderTracking />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>

          {/* Simple Premium Footer */}
          <footer className="app-footer glass-panel">
            <div className="footer-content">
              <p>© 2026 SwiggyCraft Food Delivery. All rights reserved.</p>
              <div className="footer-links">
                <a href="/dashboard" className="footer-link">Merchant Portal</a>
                <span className="dot">•</span>
                <a href="#" className="footer-link">Terms of Service</a>
                <span className="dot">•</span>
                <a href="#" className="footer-link">Privacy Policy</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
