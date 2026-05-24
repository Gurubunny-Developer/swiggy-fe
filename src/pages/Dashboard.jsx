import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChefHat, Truck, Check, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export const Dashboard = () => {
  const { API_BASE } = useApp();
  const [localOrders, setLocalOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores orderId being updated

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (res.ok) {
        const data = await res.json();
        setLocalOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    loadOrders(); // eslint-disable-line react-hooks/set-state-in-effect
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const updateStatus = async (orderId, newStatus) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Refresh local items
        loadOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const getNextStatusConfig = (currentStatus) => {
    switch (currentStatus) {
      case 'Confirmed':
        return { label: 'Start Preparing', status: 'Preparing', icon: <ChefHat size={16} />, color: 'var(--color-primary)' };
      case 'Preparing':
        return { label: 'Send Out for Delivery', status: 'Out for Delivery', icon: <Truck size={16} />, color: 'var(--color-secondary)' };
      case 'Out for Delivery':
        return { label: 'Mark Delivered', status: 'Delivered', icon: <Check size={16} />, color: 'var(--color-success)' };
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container animate-slide-in">
      
      {/* Header */}
      <div className="dashboard-header glass-panel">
        <div className="dash-header-left">
          <Layers className="dash-header-icon" />
          <div>
            <h1>Merchant & Dispatch Hub</h1>
            <p>Interactive Order Simulation Console (Simulates Restaurant Kitchen and Delivery Rider)</p>
          </div>
        </div>
        <button className="refresh-dash-btn" onClick={loadOrders} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Sync Dashboard</span>
        </button>
      </div>

      {/* Orders Grid */}
      <div className="dashboard-orders-section">
        {loading && localOrders.length === 0 ? (
          <div className="loading-grid-spinner" style={{ margin: '80px auto' }}>
            <div className="spinner-orbit"></div>
            <p>Listening for incoming orders...</p>
          </div>
        ) : localOrders.length > 0 ? (
          <div className="dashboard-orders-list">
            {localOrders.map((order) => {
              const nextAction = getNextStatusConfig(order.status);
              return (
                <div key={order.id} className="order-dashboard-card glass-panel">
                  
                  {/* Card Header info */}
                  <div className="order-card-header">
                    <div>
                      <span className="order-id-label">ID: {order.id}</span>
                      <span className="order-time-label">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`status-pill ${order.status.toLowerCase().replace(/ /g, '-')}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Card Items list */}
                  <div className="order-card-body">
                    <div className="order-items-scroll">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-list-row">
                          <span>{item.name} <strong>x {item.quantity}</strong></span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-card-divider"></div>
                    
                    <div className="order-summary-row">
                      <div className="order-total-lbl">Total Payable</div>
                      <div className="order-total-val">₹{order.total}</div>
                    </div>
                    
                    <div className="order-address-box">
                      <strong>Deliver To:</strong>
                      <p>{order.address}</p>
                    </div>
                  </div>

                  {/* Card Footer status actions */}
                  <div className="order-card-actions">
                    {nextAction ? (
                      <button 
                        className="action-btn"
                        style={{ backgroundColor: nextAction.color }}
                        onClick={() => updateStatus(order.id, nextAction.status)}
                        disabled={actionLoading === order.id}
                      >
                        {actionLoading === order.id ? 'Updating...' : (
                          <>
                            {nextAction.icon}
                            <span>{nextAction.label}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="completed-order-status">
                        <ShieldCheck size={18} />
                        <span>Order Completed / Delivered</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-dashboard-state glass-panel text-center">
            <ChefHat size={48} className="empty-dash-icon" />
            <h3>No orders received yet</h3>
            <p>Place an order from the user client view first, then return here to update its status.</p>
          </div>
        )}
      </div>

    </div>
  );
};
export default Dashboard;
