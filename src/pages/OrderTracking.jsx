import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TrackingMap from '../components/TrackingMap';
import { CheckCircle2, Clock, MapPin, ClipboardList, ExternalLink } from 'lucide-react';

export const OrderTracking = () => {
  const { id } = useParams();
  const { API_BASE } = useApp();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll order status every 3 seconds
  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const res = await fetch(`${API_BASE}/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Error fetching order status:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 3000);
    return () => clearInterval(interval);
  }, [id, API_BASE]);

  if (loading) {
    return (
      <div className="loading-grid-spinner" style={{ margin: '150px auto' }}>
        <div className="spinner-orbit"></div>
        <p>Connecting to delivery rider GPS...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="main-content text-center">
        <h2>Order not found</h2>
        <a href="/" className="reset-search-btn" style={{ display: 'inline-block', marginTop: '20px' }}>Back to Home</a>
      </div>
    );
  }

  // Define steps and active states
  const steps = [
    { label: 'Confirmed', desc: 'Order received by restaurant', statuses: ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'] },
    { label: 'Preparing', desc: 'Chef is baking your dish', statuses: ['Preparing', 'Out for Delivery', 'Delivered'] },
    { label: 'Out for Delivery', desc: 'Rider is zooming to your area', statuses: ['Out for Delivery', 'Delivered'] },
    { label: 'Delivered', desc: 'Enjoy your warm craft meal!', statuses: ['Delivered'] }
  ];

  const getStepStatus = (stepStatuses) => {
    if (stepStatuses.includes(order.status)) {
      if (order.status === stepStatuses[0] && order.status !== 'Delivered') {
        return 'current'; // actively highlight current step
      }
      return 'completed';
    }
    return 'pending';
  };

  return (
    <div className="tracking-container animate-slide-in">
      
      {/* Title Header */}
      <div className="tracking-header">
        <div className="tracking-header-left">
          <h1>Track Your Order</h1>
          <p className="order-uid-tag">Order ID: <strong>{order.id}</strong></p>
        </div>
        <div className="tracking-header-right">
          <div className="eta-card glass-panel">
            <Clock className="eta-icon" />
            <div className="eta-details">
              <span className="eta-title">Estimated Delivery</span>
              <span className="eta-time">
                {order.status === 'Delivered' ? 'Delivered' : '20-25 mins'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Map on left, Progression Stepper on Right */}
      <div className="tracking-grid">
        
        {/* Left Side: Dynamic Animated Map */}
        <div className="tracking-map-panel">
          <TrackingMap status={order.status} />
        </div>

        {/* Right Side: Step Progress & Items Invoice summary */}
        <div className="tracking-progress-panel">
          
          {/* Dashboard Tip Banner */}
          <div className="dashboard-tip-banner glass-panel">
            <div className="tip-header">
              <ExternalLink size={16} />
              <span>Interactive Simulation Tip</span>
            </div>
            <p>
              To manually advance the delivery rider, open the 
              {' '}<a href="/dashboard" target="_blank" className="tip-link">Owner/Rider Dashboard <ExternalLink size={10} className="inline-icon" /></a> 
              {' '}in a split window and toggle the stages.
            </p>
          </div>

          {/* Stepper Card */}
          <div className="progress-stepper-card glass-panel">
            <div className="stepper-title">Delivery Progress</div>
            
            <div className="stepper-list">
              {steps.map((step, idx) => {
                const state = getStepStatus(step.statuses);
                return (
                  <div key={idx} className={`stepper-item ${state}`}>
                    <div className="stepper-marker-wrapper">
                      <div className="stepper-marker">
                        {state === 'completed' ? (
                          <CheckCircle2 size={16} fill="var(--color-success)" stroke="#fff" />
                        ) : (
                          <span className="stepper-dot"></span>
                        )}
                      </div>
                      {idx < steps.length - 1 && <div className="stepper-line"></div>}
                    </div>
                    <div className="stepper-content">
                      <div className="stepper-label">{step.label}</div>
                      <div className="stepper-desc">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered items brief */}
          <div className="ordered-items-summary-card glass-panel">
            <div className="summary-title"><ClipboardList size={16} /> Order Receipt</div>
            <div className="summary-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="summary-item-row">
                  <span>{item.name} <strong>x {item.quantity}</strong></span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="summary-divider"></div>
              <div className="summary-total-row">
                <span>Grand Total Paid</span>
                <span>₹{order.total}</span>
              </div>
            </div>
            <div className="delivery-address-footer">
              <MapPin size={14} />
              <span>Delivering to: {order.address}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default OrderTracking;
