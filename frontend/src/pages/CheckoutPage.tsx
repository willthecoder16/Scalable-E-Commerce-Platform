import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { PaymentForm, type PaymentDetails } from '../components/PaymentForm';
import { IconCart, IconLock } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export function CheckoutPage() {
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [payment, setPayment] = useState<PaymentDetails>({
    provider: 'stripe',
    cardNumber: '',
    exp: '',
    cvc: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = cart?.items ?? [];
  const total = cart?.total ?? items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <div className="empty-state">
          <div className="empty-icon">
            <IconCart size={28} />
          </div>
          <h3>Your cart is empty</h3>
          <p>Add items before checking out.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Shop now
          </Link>
        </div>
      </div>
    );
  }

  function handleShippingNext(e: FormEvent) {
    e.preventDefault();
    setError('');
    setStep('payment');
  }

  async function handlePaymentSubmit(e: FormEvent) {
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

      const paymentPayload: Parameters<typeof api.processPayment>[0] = {
        orderId: order.id,
        userId: user.id,
        amount: order.total,
        provider: payment.provider,
        email: user.email,
        phone: user.phone,
      };

      if (payment.provider === 'stripe') {
        const last4 = payment.cardNumber.slice(-4);
        paymentPayload.card = {
          number: payment.cardNumber,
          exp: payment.exp,
          cvc: payment.cvc,
          brand: payment.cardNumber.startsWith('4') ? 'visa' : 'mastercard',
          last4,
        };
      } else {
        paymentPayload.paypalEmail = payment.paypalEmail;
      }

      await api.processPayment(paymentPayload);
      await refresh();
      toast.success('Payment successful!');
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
      <div className="checkout-steps">
        <span className={`step ${step === 'shipping' ? 'active' : ''}`}>
          <span className="num">1</span> Shipping
        </span>
        <span className={`step ${step === 'payment' ? 'active' : ''}`}>
          <span className="num">2</span> Payment
        </span>
      </div>

      <div className="checkout-grid">
        {step === 'shipping' ? (
          <form onSubmit={handleShippingNext} className="card form">
            <h2>Shipping address</h2>
            <p className="muted small">Order Service</p>
            <label>
              Street
              <input required value={street} onChange={(e) => setStreet(e.target.value)} className="input" />
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
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              Continue to payment
            </button>
          </form>
        ) : (
          <form onSubmit={handlePaymentSubmit} className="card form">
            {error && <p className="error-text">{error}</p>}
            <PaymentForm value={payment} onChange={setPayment} />
            <div className="checkout-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep('shipping')}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Processing…' : `Pay $${total.toFixed(2)}`}
              </button>
            </div>
          </form>
        )}

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
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <p className="secure-note">
            <IconLock size={14} /> Encrypted &amp; secure
          </p>
        </aside>
      </div>
    </div>
  );
}
