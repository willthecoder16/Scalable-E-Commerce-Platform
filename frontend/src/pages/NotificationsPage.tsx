import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ListSkeleton } from '../components/Skeleton';
import { IconBell, IconMail, IconPhone } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import type { Notification } from '../types';

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [providers, setProviders] = useState<{ id: string; name: string; type: string; mode: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getNotifications({ userId: user.id, email: user.email }),
      api.getNotificationProviders(),
    ])
      .then(([n, p]) => {
        setNotifications(n.notifications);
        setProviders(p.providers);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (error) return <p className="error-banner">{error}</p>;

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">
          <IconBell size={14} /> Notification Service
        </span>
        <h1>Notifications</h1>
        <p className="muted">SendGrid (email) &amp; Twilio (SMS) for every order event.</p>
      </div>

      <div className="provider-pills">
        {providers.map((p) => (
          <span key={p.id} className="provider-pill">
            {p.type === 'email' ? <IconMail size={14} /> : <IconPhone size={14} />} {p.name} —{' '}
            <em>{p.mode}</em>
          </span>
        ))}
      </div>

      <section className="card">
        <h2>What triggers a message</h2>
        <ul className="event-list muted">
          <li>
            <strong>order.created</strong> — Order confirmation email + SMS (if phone on profile)
          </li>
          <li>
            <strong>payment.completed</strong> — Payment receipt email
          </li>
          <li>
            <strong>order.status.updated</strong> — Shipping email; SMS when status is shipped
          </li>
        </ul>
      </section>

      {loading ? (
        <ListSkeleton />
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <IconBell size={28} />
          </div>
          <h3>No notifications yet</h3>
          <p>Place an order to receive confirmation emails and SMS.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((n) => (
            <article key={n.id} className="card notification-card">
              <span className={`notif-icon ${n.type}`}>
                {n.type === 'email' ? <IconMail size={20} /> : <IconPhone size={20} />}
              </span>
              <div className="notification-body">
                <div className="notification-header">
                  <span className={`notif-type ${n.type}`}>{n.type.toUpperCase()}</span>
                  <span className="muted small">{n.provider}</span>
                  {n.eventType && <span className="event-tag">{n.eventType}</span>}
                </div>
                <p className="muted small">To: {n.to}</p>
                {n.subject && <p className="notif-subject">{n.subject}</p>}
                <p className="notif-body-text">{n.body || n.message}</p>
                <p className="muted small" style={{ marginTop: '0.4rem' }}>
                  {n.orderId ? `Order #${n.orderId.slice(0, 8)} · ` : ''}
                  {new Date(n.sentAt).toLocaleString()}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
