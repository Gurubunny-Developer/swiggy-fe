import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, MapPin, BadgePercent, ChevronRight, Check, Trash2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export const Checkout = () => {
  const { user, cart, updateQuantity, getCartTotal, getCartCount, placeOrder, loading } = useApp();
  
  // Form Address State
  const [houseNo, setHouseNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');
  const [addressError, setAddressError] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(''); // 'WELCOME50'
  const [couponError, setCouponError] = useState('');

  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(null);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    if (couponCode.toUpperCase() === 'WELCOME50') {
      setActiveCoupon('WELCOME50');
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try WELCOME50.');
    }
  };

  const removeCoupon = () => {
    setActiveCoupon('');
  };

  // Fees configuration
  const deliveryFee = 40;
  const platformTaxFee = 15;
  const subtotal = getCartTotal();
  const discount = activeCoupon === 'WELCOME50' ? Math.min(subtotal * 0.5, 100) : 0;
  const total = subtotal + deliveryFee + platformTaxFee - discount;

  const handlePlaceOrder = async () => {
    setAddressError('');
    if (!houseNo || !landmark) {
      setAddressError('Please provide your complete address details (House/Flat No and Landmark).');
      return;
    }

    try {
      const fullAddress = `${houseNo.trim()}, near ${landmark.trim()}. Note: ${instructions.trim()}`;
      const order = await placeOrder(fullAddress);
      setOrderPlacedSuccess(order);
    } catch (err) {
      console.error(err);
    }
  };

  // Redirect to order tracking page
  if (orderPlacedSuccess) {
    return (
      <div className="main-content text-center animate-slide-in" style={{ padding: '100px 20px' }}>
        <div className="success-order-box glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <div className="success-checkmark-circle">
            <Check size={48} className="checkmark-icon" style={{ color: 'var(--color-success)' }} />
          </div>
          <h2 style={{ margin: '20px 0 10px', color: 'var(--text-primary)' }}>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
            Your order ID is <strong>{orderPlacedSuccess.id}</strong>. We have alerted our kitchen partners.
          </p>
          <a href={`/tracking/${orderPlacedSuccess.id}`} className="reset-search-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>Track Live Order</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="main-content text-center animate-slide-in" style={{ padding: '100px 20px' }}>
        <div className="empty-cart-box glass-panel" style={{ maxWidth: '400px', margin: '0 auto', padding: '40px' }}>
          <ShoppingBag size={48} style={{ color: 'var(--color-primary)', marginBottom: '20px' }} />
          <h3>Your cart is empty</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '10px 0 30px' }}>
            Good food is always cooking! Go ahead and add some delicious items.
          </p>
          <a href="/" className="reset-search-btn">Browse Restaurants</a>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container animate-slide-in">
      <div className="checkout-header-row">
        <a href="/" className="back-to-home-link"><ArrowLeft size={16} /> Continue Shopping</a>
        <h1 className="checkout-title">Secured Checkout</h1>
      </div>

      <div className="checkout-layout">
        
        {/* Left Side: Address Details & Payment */}
        <div className="checkout-details-left">
          
          {/* Address Section */}
          <section className="checkout-section-card glass-panel">
            <h2 className="section-subtitle"><MapPin className="section-icon" /> Delivery Address</h2>
            
            {addressError && <div className="address-error-msg" style={{ color: 'var(--color-danger)', marginBottom: '15px', fontSize: '14px' }}>{addressError}</div>}
            
            <div className="address-form-grid">
              <div className="form-group-full">
                <label>House / Flat No / Building Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Flat 302, Royal Residency" 
                  value={houseNo} 
                  onChange={(e) => setHouseNo(e.target.value)} 
                />
              </div>
              <div className="form-group-full">
                <label>Landmark & Area</label>
                <input 
                  type="text" 
                  placeholder="e.g. Near Indiranagar Metro Station" 
                  value={landmark} 
                  onChange={(e) => setLandmark(e.target.value)} 
                />
              </div>
              <div className="form-group-full">
                <label>Delivery Instructions (Optional)</label>
                <textarea 
                  placeholder="e.g. Leave with security, Ring bell once" 
                  value={instructions} 
                  onChange={(e) => setInstructions(e.target.value)} 
                  rows="2"
                />
              </div>
            </div>
          </section>

          {/* User authentication warning */}
          {!user ? (
            <div className="checkout-auth-card glass-panel text-center">
              <h3 style={{ color: 'var(--color-warning)' }}>Almost There!</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '10px 0 20px' }}>
                Please sign in or create an account to finalize your order delivery details.
              </p>
              <button 
                className="reset-search-btn"
                onClick={() => {
                  // Direct trigger nav bar auth modal
                  const btn = document.querySelector('.sign-in-btn');
                  if (btn) btn.click();
                }}
              >
                Sign In / Sign Up
              </button>
            </div>
          ) : (
            /* Secure payment placeholder */
            <section className="checkout-section-card glass-panel">
              <h2 className="section-subtitle"><ShieldCheck className="section-icon" /> Secured Payment Method</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                For this demo application, payment is simulated via cash on delivery (COD) or instant mock UPI.
              </p>
              <div className="payment-select-row">
                <div className="payment-pill active">
                  <span className="payment-dot"></span>
                  <span>Simulated Pay on Delivery / UPI</span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Side: Order summary & Invoice */}
        <div className="checkout-invoice-right">
          <div className="sticky-invoice-panel glass-panel">
            <h3 className="invoice-title">Order Summary</h3>
            
            {/* Cart itemized list */}
            <div className="invoice-items-list">
              {cart.map((item) => (
                <div key={item.id} className="invoice-item-row">
                  <div className="invoice-item-left">
                    <span className={`veg-indicator-dot ${item.isVeg ? 'veg' : 'non-veg'}`}></span>
                    <span className="invoice-item-name">{item.name}</span>
                  </div>
                  <div className="invoice-item-right">
                    {/* Quantity selectors */}
                    <div className="invoice-quantity-selector">
                      <button onClick={() => updateQuantity(item.id, -1)} className="inv-qty-btn">-</button>
                      <span className="inv-qty-val">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="inv-qty-btn">+</button>
                    </div>
                    <span className="invoice-item-price">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon codes box */}
            <div className="coupon-code-container">
              {activeCoupon ? (
                <div className="active-coupon-badge">
                  <div className="coupon-info">
                    <BadgePercent size={18} className="coupon-icon-g" />
                    <span><strong>{activeCoupon}</strong> applied! Saved ₹{discount}</span>
                  </div>
                  <button className="coupon-remove-btn" onClick={removeCoupon}>Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-apply-form">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon: WELCOME50" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value)} 
                    className="coupon-input"
                  />
                  <button type="submit" className="coupon-btn">Apply</button>
                </form>
              )}
              {couponError && <div className="coupon-error-msg">{couponError}</div>}
              {!activeCoupon && (
                <div className="coupon-suggest-tip" onClick={() => setCouponCode('WELCOME50')}>
                  Tip: Click here to apply <strong>WELCOME50</strong> (50% Off)
                </div>
              )}
            </div>

            {/* Bill details */}
            <div className="invoice-billing-details">
              <div className="billing-title">Billing Details</div>
              
              <div className="bill-row">
                <span>Item Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Partner Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="bill-row">
                <span>Taxes & Platform Charges</span>
                <span>₹{platformTaxFee}</span>
              </div>
              
              {activeCoupon && (
                <div className="bill-row discount" style={{ color: 'var(--color-success)' }}>
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              
              <div className="bill-row total">
                <span>To Pay</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* Pay Action button */}
            <button 
              className="pay-order-btn animate-pulse-glow"
              disabled={loading || !user}
              onClick={handlePlaceOrder}
            >
              {loading ? 'Processing...' : user ? `PAY & PLACE ORDER (₹${total})` : 'SIGN IN TO PLACE ORDER'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Checkout;
