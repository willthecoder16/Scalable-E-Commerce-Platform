import { Link } from 'react-router-dom';
import { IconCart, IconLock, IconTrash } from '../components/icons';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { emojiFor, gradientFor } from '../lib/visuals';

export function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const toast = useToast();

  if (loading) return <p className="muted page-center">Loading cart…</p>;

  const items = cart?.items ?? [];
  const total = cart?.total ?? items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  async function handleRemove(productId: string, name: string) {
    await removeItem(productId);
    toast.notify(`${name} removed`);
  }

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Cart Service</span>
        <h1>Shopping cart</h1>
        <p className="muted">Redis-backed session cart — synced across the platform.</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <IconCart size={28} />
          </div>
          <h3>Your cart is empty</h3>
          <p>Browse the catalog and add something you love.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <article key={item.productId} className="cart-item">
                <div
                  className="cart-thumb"
                  style={{ background: gradientFor(item.name) }}
                >
                  {emojiFor(item.name)}
                </div>
                <div className="cart-item-main">
                  <h3>{item.name}</h3>
                  <p className="muted small">${item.price.toFixed(2)} each</p>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="line-total">${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => handleRemove(item.productId, item.name)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="card cart-summary">
            <h2>Order summary</h2>
            <div className="summary-row">
              <span>Items ({itemCount})</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1rem' }}>
              Proceed to checkout
            </Link>
            <p className="secure-note">
              <IconLock size={14} /> Secure checkout
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
