import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

export function HomePage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
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

  async function handleAdd(product: Product) {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setAddingId(product.id);
    try {
      await addItem(product);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add');
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="page">
      <section className="hero">
        <h1>Curated tech for everyday life</h1>
        <p className="hero-sub">
          Browse the product catalog, build your cart, and checkout through our microservices
          platform.
        </p>
      </section>

      <section className="filters">
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input search-input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input select-input"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      {error && <p className="error-banner">{error}</p>}
      {loading ? (
        <p className="muted page-center">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="muted page-center">No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={user ? () => handleAdd(p) : undefined}
              adding={addingId === p.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
