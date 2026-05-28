import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api/client';
import {
  IconArrowLeft,
  IconBell,
  IconCheckCircle,
  IconReceipt,
  IconTruck,
} from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Order, Payment } from '../types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  paid: 'status-paid',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
};

const SHIPPING_STATUSES = ['shipped', 'delivered'] as const;
const TIMELINE = ['pending', 'paid', 'shipped', 'delivered'] as const;

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const success = (location.state as { success?: boolean })?.success;

  async function load() {
    if (!id) return;
    const [orderRes, payRes] = await Promise.all([
      api.getOrder(id),
      api.getPaymentsForOrder(id).catch(() => ({ payments: [] })),
    ]);
    setOrder(orderRes.order);
    setPayments(payRes.payments);
  }

  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function markShipped() {
    if (!order || !user) return;
    setUpdating(true);
    try {
      const { order: updated } = await api.updateOrderStatus(
        order.id,
        'shipped',
        user.email,
        user.phone
      );
      setOrder(updated);
      toast.success('Order marked shipped — notifications sent');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="muted page-center">Loading order…</p>;
  if (error || !order) return <p className="error-banner">{error || 'Order not found'}</p>;

  const addr = order.shippingAddress as Record<string, string> | undefined;
  const canMarkShipped = order.status === 'paid' || order.status === 'confirmed';
  const currentStep = TIMELINE.indexOf(order.status as (typeof TIMELINE)[number]);

  return (
    <div className="page">
      <Link to="/orders" className="back-link">
        <IconArrowLeft size={16} /> All orders
      </Link>

      {success && (
        <div className="success-banner">
          <IconCheckCircle size={18} />
          Order placed and payment processed. Check Notifications for confirmation messages.
        </div>
      )}

      <div className="order-detail-header">
        <h1>Order #{order.id.slice(0, 8)}</h1>
        <span className={`status-badge ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
      </div>
      <p className="muted">Placed {new Date(order.createdAt).toLocaleString()}</p>

      {order.status !== 'cancelled' && (
        <div className="card">
          <h2>Progress</h2>
          <ul className="timeline">
            {TIMELINE.map((step, i) => (
              <li key={step} className={i <= currentStep ? 'done' : ''}>
                <span className="dot" />
                <div>
                  <strong style={{ textTransform: 'capitalize' }}>{step}</strong>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canMarkShipped && (
        <div className="card demo-actions">
          <div>
            <strong>Demo action</strong>
            <p className="muted small">
              Trigger a shipping notification (email + SMS via Notification Service)
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={updating}
            onClick={markShipped}
          >
            <IconTruck size={16} /> {updating ? 'Updating…' : 'Mark as shipped'}
          </button>
        </div>
      )}

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

        <section className="card">
          <h2>
            <IconReceipt size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
            Payment
          </h2>
          <p className="muted small">Payment Service — Stripe / PayPal</p>
          {payments.length === 0 ? (
            <p className="muted">No payment record found.</p>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="payment-record">
                <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{p.provider}</strong>
                  <span className={`status-badge ${STATUS_COLORS[p.status] || 'status-paid'}`}>
                    {p.status}
                  </span>
                </p>
                <p className="muted small">
                  ${p.amount.toFixed(2)} {p.currency}
                </p>
                {p.transactionId && <p className="muted small">Txn: {p.transactionId}</p>}
                {p.cardLast4 && (
                  <p className="muted small">
                    Card: {p.cardBrand || 'card'} •••• {p.cardLast4}
                  </p>
                )}
                {p.paypalEmail && <p className="muted small">PayPal: {p.paypalEmail}</p>}
              </div>
            ))
          )}
        </section>

        {addr && (
          <section className="card">
            <h2>Shipping address</h2>
            <p>
              {addr.street}
              <br />
              {addr.city}
              {addr.state ? `, ${addr.state}` : ''} {addr.zip}
            </p>
            {SHIPPING_STATUSES.includes(order.status as (typeof SHIPPING_STATUSES)[number]) && (
              <p className="success-text small" style={{ marginTop: '0.75rem' }}>
                Shipping notifications sent.
              </p>
            )}
          </section>
        )}
      </div>

      <Link to="/notifications" className="btn btn-ghost" style={{ marginTop: '1.5rem' }}>
        <IconBell size={16} /> View notification history
      </Link>
    </div>
  );
}
