import { Link } from 'react-router-dom';
import type { Product } from '../types';

export function ProductCard({
  product,
  onAdd,
  adding,
}: {
  product: Product;
  onAdd?: () => void;
  adding?: boolean;
}) {
  return (
    <article className="product-card">
      <div className="product-card-visual">
        <span className="product-emoji" aria-hidden>
          {categoryEmoji(product.categoryName)}
        </span>
        {product.stock < 10 && product.stock > 0 && (
          <span className="stock-tag">Only {product.stock} left</span>
        )}
        {product.stock === 0 && <span className="stock-tag out">Out of stock</span>}
      </div>
      <div className="product-card-body">
        {product.categoryName && <span className="category">{product.categoryName}</span>}
        <h3>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="description">{product.description}</p>
        <div className="product-card-footer">
          <span className="price">${product.price.toFixed(2)}</span>
          {onAdd && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={product.stock === 0 || adding}
              onClick={onAdd}
            >
              {adding ? 'Adding…' : 'Add to cart'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function categoryEmoji(category?: string) {
  if (!category) return '📦';
  const c = category.toLowerCase();
  if (c.includes('electronic')) return '🎧';
  if (c.includes('cloth')) return '👕';
  if (c.includes('home')) return '🏠';
  return '📦';
}
