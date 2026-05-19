import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function CheckoutPage() {
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const navigate = useNavigate();

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = cart?.items ?? [];
  const total = cart?.total ?? items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <p className="muted">Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">
          Shop now
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const { order } = await api.createOrder({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        shippingAddress: { street, city, state, zip },
      });

      await api.processPayment({
        orderId: order.id,
        userId: user.id,
        amount: order.total,
      });

      await refresh();
      navigate(`/orders/${order.id}`, { state: { success: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page checkout-page">
      <h1>Checkout</h1>
      <p className="muted">Order Service + Payment Service</p>

      <div className="checkout-grid">
        <form onSubmit={handleSubmit} className="card form">
          <h2>Shipping address</h2>
          {error && <p className="error-text">{error}</p>}
          <label>
            Street
            <input
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="input"
            />
          </label>
          <div className="form-row">
            <label>
              City
              <input required value={city} onChange={(e) => setCity(e.target.value)} className="input" />
            </label>
            <label>
              State
              <input value={state} onChange={(e) => setState(e.target.value)} className="input" />
            </label>
          </div>
          <label>
            ZIP
            <input required value={zip} onChange={(e) => setZip(e.target.value)} className="input" />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Placing order…' : `Pay $${total.toFixed(2)}`}
          </button>
        </form>

        <aside className="card order-summary">
          <h2>Order summary</h2>
          <ul className="summary-list">
            {items.map((i) => (
              <li key={i.productId}>
                <span>
                  {i.name} × {i.quantity}
                </span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
