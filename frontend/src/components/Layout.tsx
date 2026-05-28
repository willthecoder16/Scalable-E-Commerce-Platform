import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import {
  IconBell,
  IconBolt,
  IconCart,
  IconClose,
  IconLogout,
  IconMenu,
  IconMoon,
  IconPackage,
  IconSearch,
  IconSun,
  IconUser,
} from './icons';

export function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    navigate(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : '/');
  }

  const initials = (user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="app">
      <header className="header">
        <button
          type="button"
          className="icon-btn menu-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>

        <Link to="/" className="logo">
          <span className="logo-mark">
            <IconBolt size={18} />
          </span>
          Shop<span>Flow</span>
        </Link>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end>
            Shop
          </NavLink>
          {user && (
            <>
              <NavLink to="/orders">Orders</NavLink>
              <NavLink to="/notifications">Notifications</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </>
          )}
        </nav>

        <form className="header-search" onSubmit={onSearch} role="search">
          <div className="input-wrap">
            <span className="field-icon">
              <IconSearch size={18} />
            </span>
            <input
              className="input"
              type="search"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>
        </form>

        <div className="header-actions">
          <button type="button" className="icon-btn" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>

          {user ? (
            <>
              <Link to="/cart" className="cart-link" aria-label="Cart">
                <IconCart size={18} />
                {itemCount > 0 && <span className="badge">{itemCount}</span>}
              </Link>

              <div className="user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="avatar"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-label="Account menu"
                >
                  {initials}
                </button>
                {userMenuOpen && (
                  <div className="user-menu-panel">
                    <div className="um-head">
                      <strong>{user.firstName || 'Account'}</strong>
                      <span>{user.email}</span>
                    </div>
                    <button className="um-item" onClick={() => navigate('/profile')}>
                      <IconUser size={17} /> Profile
                    </button>
                    <button className="um-item" onClick={() => navigate('/orders')}>
                      <IconPackage size={17} /> Orders
                    </button>
                    <button className="um-item" onClick={() => navigate('/notifications')}>
                      <IconBell size={17} /> Notifications
                    </button>
                    <button className="um-item danger" onClick={logout}>
                      <IconLogout size={17} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
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
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <span className="logo-mark">
                <IconBolt size={18} />
              </span>
              Shop<span>Flow</span>
            </Link>
            <p>
              A microservices e-commerce demo — independent services for users, catalog, cart,
              orders, payments, and notifications.
            </p>
            <div className="footer-chips">
              <span className="svc-chip">User</span>
              <span className="svc-chip">Catalog</span>
              <span className="svc-chip">Cart</span>
              <span className="svc-chip">Order</span>
              <span className="svc-chip">Payment</span>
              <span className="svc-chip">Notification</span>
            </div>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/">All products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Orders</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/profile">Profile</Link>
            <Link to="/notifications">Notifications</Link>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} ShopFlow — built on a scalable microservices architecture.
        </div>
      </footer>
    </div>
  );
}
