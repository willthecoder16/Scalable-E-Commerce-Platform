import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { IconBolt, IconSearch, IconShield, IconTruck } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';

export function HomePage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<SortKey>('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    api.getCategories().then((r) => setCategories(r.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .getProducts({ search: search || undefined, category: category || undefined })
      .then((r) => setProducts(r.products))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, category]);

  const sorted = useMemo(() => {
    const list = [...products];
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [products, sort]);

  async function handleAdd(product: Product) {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setAddingId(product.id);
    try {
      await addItem(product);
      toast.success(`${product.name} added to cart`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add');
    } finally {
      setAddingId(null);
    }
  }

  function setSearch(value: string) {
    setSearchParams(value ? { q: value } : {});
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">
            <IconBolt size={14} /> New season drop
          </span>
          <h1>Premium tech, delivered with care.</h1>
          <p>
            Discover a curated catalog of electronics and accessories. Build your cart, check out
            securely, and track every order — all powered by an independent microservices backend.
          </p>
          <div className="hero-actions">
            <a href="#catalog" className="btn btn-primary btn-lg">
              Shop the catalog
            </a>
            {!user && (
              <Link to="/register" className="btn btn-ghost btn-lg">
                Create account
              </Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">{products.length || '—'}</div>
              <div className="lbl">Products</div>
            </div>
            <div className="hero-stat">
              <div className="num">{categories.length || '—'}</div>
              <div className="lbl">Categories</div>
            </div>
            <div className="hero-stat">
              <div className="num">24/7</div>
              <div className="lbl">Order tracking</div>
            </div>
          </div>
        </div>
      </section>

      <section className="value-row">
        <div className="value-item">
          <span className="value-icon"><IconTruck size={20} /></span>
          <div>
            <strong>Fast fulfillment</strong>
            <p className="muted small">Real-time order &amp; status updates</p>
          </div>
        </div>
        <div className="value-item">
          <span className="value-icon"><IconShield size={20} /></span>
          <div>
            <strong>Secure checkout</strong>
            <p className="muted small">Stripe &amp; PayPal supported</p>
          </div>
        </div>
        <div className="value-item">
          <span className="value-icon"><IconBolt size={20} /></span>
          <div>
            <strong>Instant notifications</strong>
            <p className="muted small">Email &amp; SMS for every event</p>
          </div>
        </div>
      </section>

      <section id="catalog">
        <div className="chip-row">
          <button
            type="button"
            className={`chip ${category === '' ? 'active' : ''}`}
            onClick={() => setCategory('')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip ${category === c.name ? 'active' : ''}`}
              onClick={() => setCategory(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="toolbar">
          <div className="input-wrap search-input">
            <span className="field-icon">
              <IconSearch size={18} />
            </span>
            <input
              type="search"
              placeholder="Search the catalog…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="input select-input"
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>

        {error && <p className="error-banner">{error}</p>}

        {loading ? (
          <ProductGridSkeleton />
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <IconSearch size={28} />
            </div>
            <h3>No products found</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <>
            <div className="results-meta">
              <span className="muted small">
                {sorted.length} product{sorted.length === 1 ? '' : 's'}
                {search ? ` for “${search}”` : ''}
              </span>
            </div>
            <div className="product-grid">
              {sorted.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={user ? () => handleAdd(p) : undefined}
                  adding={addingId === p.id}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
