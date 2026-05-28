import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import {
  IconArrowLeft,
  IconCheck,
  IconShield,
  IconTruck,
} from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { emojiFor, gradientFor } from '../lib/visuals';
import type { Product } from '../types';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getProduct(id)
      .then((r) => setProduct(r.product))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdd() {
    if (!product || !user) {
      window.location.href = '/login';
      return;
    }
    setAdding(true);
    try {
      await addItem(product, qty);
      toast.success(`Added ${qty} × ${product.name} to cart`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add');
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="page product-detail-grid">
        <div className="skeleton" style={{ minHeight: 420, borderRadius: 'var(--radius-lg)' }} />
        <div>
          <div className="skeleton skel-line sm" style={{ margin: '0 0 1rem' }} />
          <div className="skeleton skel-line lg" style={{ margin: '0 0 1rem', height: 32 }} />
          <div className="skeleton skel-line" style={{ margin: '0 0 0.6rem' }} />
          <div className="skeleton skel-line" style={{ margin: 0 }} />
        </div>
      </div>
    );
  }
  if (error || !product) return <p className="error-banner page-center">{error || 'Not found'}</p>;

  const emoji = emojiFor(product.name, product.categoryName);

  return (
    <div className="page product-detail">
      <Link to="/" className="back-link">
        <IconArrowLeft size={16} /> Back to shop
      </Link>
      <div className="product-detail-grid">
        <div>
          <div
            className="product-detail-visual"
            style={{ background: gradientFor(product.categoryName || product.name) }}
          >
            {emoji}
          </div>
          <div className="detail-thumbs">
            {[emoji, '🔍', '✨'].map((e, i) => (
              <div key={i} className="detail-thumb" style={i === 0 ? { borderColor: 'var(--accent)' } : undefined}>
                {e}
              </div>
            ))}
          </div>
        </div>

        <div className="detail-info">
          {product.categoryName && <span className="category">{product.categoryName}</span>}
          <h1>{product.name}</h1>
          <p className="price-lg">${product.price.toFixed(2)}</p>
          <p className="description" style={{ display: 'block', fontSize: '1rem' }}>
            {product.description}
          </p>

          <p className="muted small">
            {product.stock > 0 ? (
              <span className="status-badge status-paid">In stock · {product.stock} available</span>
            ) : (
              <span className="status-badge status-cancelled">Out of stock</span>
            )}
          </p>

          {user && product.stock > 0 && (
            <div className="add-row">
              <div className="qty-stepper">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
              <button type="button" className="btn btn-primary btn-lg" disabled={adding} onClick={handleAdd}>
                {adding ? 'Adding…' : `Add to cart · $${(product.price * qty).toFixed(2)}`}
              </button>
            </div>
          )}

          {!user && (
            <Link to="/login" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
              Sign in to purchase
            </Link>
          )}

          <ul className="feature-list">
            <li>
              <IconCheck size={18} /> Free returns within 30 days
            </li>
            <li>
              <IconTruck size={18} /> Fast, tracked shipping
            </li>
            <li>
              <IconShield size={18} /> Secure checkout via Stripe &amp; PayPal
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
