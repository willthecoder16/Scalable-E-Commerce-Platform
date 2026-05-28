import { Link } from 'react-router-dom';
import { emojiFor, gradientFor } from '../lib/visuals';
import type { Product } from '../types';
import { IconHeart, IconPlus } from './icons';

export function ProductCard({
  product,
  onAdd,
  adding,
  favorite,
  onToggleFavorite,
}: {
  product: Product;
  onAdd?: () => void;
  adding?: boolean;
  favorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  return (
    <article className="product-card">
      <div
        className="product-card-visual"
        style={{ background: gradientFor(product.categoryName || product.name) }}
      >
        <Link to={`/products/${product.id}`} className="product-emoji" aria-label={product.name}>
          {emojiFor(product.name, product.categoryName)}
        </Link>
        {product.stock > 0 && product.stock < 10 && (
          <span className="stock-tag">Only {product.stock} left</span>
        )}
        {product.stock === 0 && <span className="stock-tag out">Sold out</span>}
        {onToggleFavorite && (
          <button
            type="button"
            className={`fav-btn ${favorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            aria-label="Save for later"
          >
            <IconHeart size={17} />
          </button>
        )}
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
              className="icon-add"
              disabled={product.stock === 0 || adding}
              onClick={onAdd}
              aria-label={`Add ${product.name} to cart`}
              title="Add to cart"
            >
              <IconPlus size={20} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
