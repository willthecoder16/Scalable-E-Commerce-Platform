import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';
import { IconUser } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await api.updateProfile(user.id, { firstName, lastName, phone });
      await refreshProfile();
      toast.success('Profile updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const initials = (user.firstName?.[0] || user.email[0]).toUpperCase();

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">
          <IconUser size={14} /> User Service
        </span>
        <h1>Your profile</h1>
        <p className="muted">Manage your account details and contact info.</p>
      </div>

      <div className="profile-layout">
        <aside className="card profile-aside">
          <div className="profile-avatar">{initials}</div>
          <h3>{user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'ShopFlow member'}</h3>
          <p className="muted small">{user.email}</p>
          <p className="muted small">
            Member since{' '}
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </p>
        </aside>

        <div className="card" style={{ marginTop: 0 }}>
          <h2>Edit details</h2>
          <form onSubmit={handleSubmit} className="form">
            {error && <p className="error-text">{error}</p>}
            <div className="form-row">
              <label>
                First name
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                />
              </label>
              <label>
                Last name
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                />
              </label>
            </div>
            <label>
              Phone <span className="muted small">(for SMS order updates)</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
              />
            </label>
            <div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
