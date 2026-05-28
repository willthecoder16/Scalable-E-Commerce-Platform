export function ProductCardSkeleton() {
  return (
    <div className="skel-card">
      <div className="skeleton skel-visual" />
      <div className="skel-line sm" style={{ marginTop: '1rem' }} />
      <div className="skel-line lg" />
      <div className="skel-line" />
      <div className="skel-line sm" style={{ marginBottom: '1.25rem' }} />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="orders-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ marginTop: 0 }}>
          <div className="skeleton skel-line lg" style={{ margin: '0 0 0.8rem' }} />
          <div className="skeleton skel-line sm" style={{ margin: 0 }} />
        </div>
      ))}
    </div>
  );
}
