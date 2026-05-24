import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, MapPin, ClipboardList, CheckCircle2, RefreshCw } from 'lucide-react';

export const RestaurantPanel = () => {
  const { user, API_BASE } = useApp();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(user && user.role === 'restaurant' && user.restaurantId ? true : false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'restaurant' || !user.restaurantId) {
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        const [restaurantRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/restaurants/${user.restaurantId}`),
          fetch(`${API_BASE}/orders?restaurantId=${user.restaurantId}`)
        ]);

        if (restaurantRes.ok) {
          setRestaurant(await restaurantRes.json());
        }
        if (ordersRes.ok) {
          setOrders(await ordersRes.json());
        }
      } catch (err) {
        console.error('Restaurant panel load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
        const updatedOrders = orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
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
        return { label: 'Start Preparing', status: 'Preparing' };
      case 'Preparing':
        return { label: 'Out for Delivery', status: 'Out for Delivery' };
      case 'Out for Delivery':
        return { label: 'Mark Delivered', status: 'Delivered' };
      default:
        return null;
    }
  };

  if (!user || user.role !== 'restaurant') {
    return (
      <div className="main-content text-center animate-slide-in" style={{ padding: '100px 20px' }}>
        <div className="empty-cart-box glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <h2>Restaurant Access Required</h2>
          <p>Please sign in as a restaurant manager to access this panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-grid-spinner" style={{ margin: '150px auto' }}>
        <div className="spinner-orbit"></div>
        <p>Loading your restaurant dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-slide-in">
      <div className="dashboard-header glass-panel">
        <div className="dash-header-left">
          <div>
            <h1>Restaurant Panel</h1>
            <p>Manage orders and view restaurant performance.</p>
          </div>
        </div>
        <button className="refresh-dash-btn" onClick={() => window.location.reload()}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="restaurant-panel-summary glass-panel">
        <div className="restaurant-panel-top">
          <img src={restaurant?.image} alt={restaurant?.name} className="restaurant-panel-img" />
          <div>
            <h2>{restaurant?.name}</h2>
            <p>{restaurant?.cuisines?.join(', ')}</p>
            <div className="restaurant-panel-meta">
              <span><Clock size={14} /> {restaurant?.deliveryTime}</span>
              <span><MapPin size={14} /> {restaurant?.distance}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-orders-section">
        {orders.length === 0 ? (
          <div className="empty-dashboard-state glass-panel text-center">
            <ClipboardList size={48} className="empty-dash-icon" />
            <h3>No orders for your restaurant yet</h3>
            <p>Orders will appear here once customers place them.</p>
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
                      <strong>Delivery To:</strong>
                      <p>{order.address}</p>
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
                        <CheckCircle2 size={18} />
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
export default RestaurantPanel;
