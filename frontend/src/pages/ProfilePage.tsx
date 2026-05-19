import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
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
    setMessage('');
    try {
      await api.updateProfile(user.id, { firstName, lastName, phone });
      await refreshProfile();
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="page">
      <h1>Your profile</h1>
      <p className="muted">User Service — manage your account details</p>

      <div className="card profile-card">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p className="muted small">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>

        <form onSubmit={handleSubmit} className="form">
          {message && <p className="success-text">{message}</p>}
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
            Phone
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
