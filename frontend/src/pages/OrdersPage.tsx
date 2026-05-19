import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
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

  if (loading) return <p className="muted page-center">Loading orders…</p>;
  if (error) return <p className="error-banner">{error}</p>;

  return (
    <div className="page">
      <h1>Order history</h1>
      <p className="muted">Order Service — track status and past purchases</p>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet.</p>
          <Link to="/" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card order-card">
              <div className="order-card-header">
                <span className="order-id">#{order.id.slice(0, 8)}</span>
                <span className={`status-badge ${STATUS_COLORS[order.status] || ''}`}>
                  {order.status}
                </span>
              </div>
              <p className="muted">
                {new Date(order.createdAt).toLocaleString()} · {order.items.length} item(s)
              </p>
              <p className="price-lg">${order.total.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
