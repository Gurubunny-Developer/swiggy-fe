import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClipboardList, Layers, ShieldCheck, RefreshCw } from 'lucide-react';

export const AdminPanel = () => {
  const { user, API_BASE } = useApp();
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(user && user.role === 'admin' ? true : false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return;
    }

    async function loadAdminData() {
      setLoading(true);
      try {
        const [restaurantsRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/restaurants`),
          fetch(`${API_BASE}/orders`)
        ]);
        if (restaurantsRes.ok) setRestaurants(await restaurantsRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
      } catch (err) {
        console.error('Admin panel load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [API_BASE, user]);

  const updateStatus = async (orderId, newStatus) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, status: newStatus } : order));
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getNextAction = (status) => {
    switch (status) {
      case 'Confirmed':
        return { label: 'Mark Preparing', status: 'Preparing' };
      case 'Preparing':
        return { label: 'Mark Out for Delivery', status: 'Out for Delivery' };
      case 'Out for Delivery':
        return { label: 'Mark Delivered', status: 'Delivered' };
      default:
        return null;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="main-content text-center animate-slide-in" style={{ padding: '100px 20px' }}>
        <div className="empty-cart-box glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <h2>Admin Access Required</h2>
          <p>Please sign in as an admin to access this panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-grid-spinner" style={{ margin: '150px auto' }}>
        <div className="spinner-orbit"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="dashboard-container animate-slide-in">
      <div className="dashboard-header glass-panel">
        <div className="dash-header-left">
          <Layers className="dash-header-icon" />
          <div>
            <h1>Admin Control Panel</h1>
            <p>Monitor restaurants, orders, and overall platform activity.</p>
          </div>
        </div>
        <button className="refresh-dash-btn" onClick={() => window.location.reload()}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="admin-summary-grid">
        <div className="summary-card glass-panel">
          <div className="summary-title">Restaurants</div>
          <div className="summary-value">{restaurants.length}</div>
        </div>
        <div className="summary-card glass-panel">
          <div className="summary-title">Total Orders</div>
          <div className="summary-value">{orders.length}</div>
        </div>
        <div className="summary-card glass-panel">
          <div className="summary-title">Pending</div>
          <div className="summary-value">{statusCounts.Confirmed || 0}</div>
        </div>
        <div className="summary-card glass-panel">
          <div className="summary-title">Preparing</div>
          <div className="summary-value">{statusCounts.Preparing || 0}</div>
        </div>
      </div>

      <div className="dashboard-orders-section">
        {orders.length === 0 ? (
          <div className="empty-dashboard-state glass-panel text-center">
            <ClipboardList size={48} className="empty-dash-icon" />
            <h3>No orders found</h3>
            <p>Orders will appear here as customers place them.</p>
          </div>
        ) : (
          <div className="dashboard-orders-list">
            {orders.map((order) => {
              const nextAction = getNextAction(order.status);
              return (
                <div key={order.id} className="order-dashboard-card glass-panel">
                  <div className="order-card-header">
                    <div>
                      <span className="order-id-label">Order: {order.id}</span>
                      <span className="order-time-label">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <span className={`status-pill ${order.status.toLowerCase().replace(/ /g, '-')}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <div className="order-items-scroll">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item-list-row">
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-card-divider"></div>
                    <div className="order-summary-row">
                      <div className="order-total-lbl">Total</div>
                      <div className="order-total-val">₹{order.total}</div>
                    </div>
                    <div className="order-address-box">
                      <strong>Deliver To:</strong>
                      <p>{order.address}</p>
                    </div>
                    <div className="order-address-box">
                      <strong>Restaurant ID:</strong>
                      <p>{order.restaurantId}</p>
                    </div>
                  </div>
                  <div className="order-card-actions">
                    {nextAction ? (
                      <button
                        className="action-btn"
                        onClick={() => updateStatus(order.id, nextAction.status)}
                        disabled={actionLoading === order.id}
                      >
                        {actionLoading === order.id ? 'Updating...' : nextAction.label}
                      </button>
                    ) : (
                      <div className="completed-order-status">
                        <ShieldCheck size={18} />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminPanel;
