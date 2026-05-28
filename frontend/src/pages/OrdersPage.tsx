import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { ListSkeleton } from '../components/Skeleton';
import { IconArrowRight, IconPackage } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  paid: 'status-paid',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
};

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    api
      .getOrders(user.id)
      .then((r) => setOrders(r.orders))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Order Service</span>
        <h1>Order history</h1>
        <p className="muted">Track status and revisit past purchases.</p>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <ListSkeleton />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <IconPackage size={28} />
          </div>
          <h3>No orders yet</h3>
          <p>When you place an order, it'll show up here.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card order-card">
              <span className="order-card-icon">
                <IconPackage size={22} />
              </span>
              <div className="order-card-body">
                <div className="order-card-header">
                  <span className="order-id">#{order.id.slice(0, 8)}</span>
                  <span className={`status-badge ${STATUS_COLORS[order.status] || ''}`}>
                    {order.status}
                  </span>
                </div>
                <p className="muted small">
                  {new Date(order.createdAt).toLocaleString()} · {order.items.length} item
                  {order.items.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="order-card-amount">
                <p className="price-lg">${order.total.toFixed(2)}</p>
              </div>
              <IconArrowRight size={18} className="muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
