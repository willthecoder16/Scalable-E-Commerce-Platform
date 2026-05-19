import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          Shop<span>Flow</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            Shop
          </NavLink>
          {user && (
            <>
              <NavLink to="/orders">Orders</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </>
          )}
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <Link to="/cart" className="cart-link">
                Cart
                {itemCount > 0 && <span className="badge">{itemCount}</span>}
              </Link>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>Microservices demo — User · Catalog · Cart · Order services</p>
      </footer>
    </div>
  );
}
