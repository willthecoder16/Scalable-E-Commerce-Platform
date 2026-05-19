import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem } = useCart();
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
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add');
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <p className="muted page-center">Loading…</p>;
  if (error || !product) return <p className="error-banner page-center">{error || 'Not found'}</p>;

  return (
    <div className="page product-detail">
      <Link to="/" className="back-link">
        ← Back to shop
      </Link>
      <div className="product-detail-grid">
        <div className="product-detail-visual">📦</div>
        <div>
          {product.categoryName && <span className="category">{product.categoryName}</span>}
          <h1>{product.name}</h1>
          <p className="price-lg">${product.price.toFixed(2)}</p>
          <p className="description">{product.description}</p>
          <p className="muted">In stock: {product.stock}</p>

          {user && product.stock > 0 && (
            <div className="add-row">
              <label>
                Qty
                <input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="input qty-input"
                />
              </label>
              <button
                type="button"
                className="btn btn-primary"
                disabled={adding}
                onClick={handleAdd}
              >
                {adding ? 'Adding…' : 'Add to cart'}
              </button>
            </div>
          )}
          {!user && (
            <Link to="/login" className="btn btn-primary">
              Sign in to purchase
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
