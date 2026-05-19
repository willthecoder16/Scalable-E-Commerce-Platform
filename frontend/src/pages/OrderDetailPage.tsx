import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Order } from '../types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  paid: 'status-paid',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const success = (location.state as { success?: boolean })?.success;

  useEffect(() => {
    if (!id) return;
    api
      .getOrder(id)
      .then((r) => setOrder(r.order))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="muted page-center">Loading order…</p>;
  if (error || !order) return <p className="error-banner">{error || 'Order not found'}</p>;

  const addr = order.shippingAddress as Record<string, string> | undefined;

  return (
    <div className="page">
      <Link to="/orders" className="back-link">
        ← All orders
      </Link>

      {success && (
        <div className="success-banner">Order placed and payment processed successfully.</div>
      )}

      <div className="order-detail-header">
        <h1>Order #{order.id.slice(0, 8)}</h1>
        <span className={`status-badge ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
      </div>

      <p className="muted">Placed {new Date(order.createdAt).toLocaleString()}</p>

      <div className="detail-grid">
        <section className="card">
          <h2>Items</h2>
          <ul className="summary-list">
            {order.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row total">
            <span>Total</span>
            <strong>${order.total.toFixed(2)}</strong>
          </div>
        </section>

        {addr && (
          <section className="card">
            <h2>Shipping</h2>
            <p>
              {addr.street}
              <br />
              {addr.city}
              {addr.state ? `, ${addr.state}` : ''} {addr.zip}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
