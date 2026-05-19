import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();

  if (loading) return <p className="muted page-center">Loading cart…</p>;

  const items = cart?.items ?? [];
  const total = cart?.total ?? items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="page">
      <h1>Shopping cart</h1>
      <p className="muted">Cart Service — Redis-backed session cart</p>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <article key={item.productId} className="cart-item">
                <div>
                  <h3>{item.name}</h3>
                  <p className="muted">${item.price.toFixed(2)} each</p>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <span className="line-total">${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm danger"
                    onClick={() => removeItem(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="cart-summary card">
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-block">
              Proceed to checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
