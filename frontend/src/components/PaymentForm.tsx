import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { PaymentProvider } from '../types';

export type PaymentDetails =
  | { provider: 'stripe'; cardNumber: string; exp: string; cvc: string }
  | { provider: 'paypal'; paypalEmail: string };

interface PaymentFormProps {
  value: PaymentDetails;
  onChange: (details: PaymentDetails) => void;
}

export function PaymentForm({ value, onChange }: PaymentFormProps) {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);

  useEffect(() => {
    api.getPaymentProviders().then((r) => setProviders(r.providers)).catch(() => {});
  }, []);

  const provider = value.provider;

  function selectProvider(id: 'stripe' | 'paypal') {
    if (id === 'stripe') {
      onChange({ provider: 'stripe', cardNumber: '', exp: '', cvc: '' });
    } else {
      onChange({ provider: 'paypal', paypalEmail: '' });
    }
  }

  return (
    <div className="payment-form">
      <h2>Payment method</h2>
      <p className="muted small">Payment Service — Stripe & PayPal</p>

      <div className="provider-tabs">
        {providers.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`provider-tab ${provider === p.id ? 'active' : ''}`}
            onClick={() => selectProvider(p.id as 'stripe' | 'paypal')}
          >
            <span className="provider-name">{p.name}</span>
            <span className="provider-mode">{p.mode} mode</span>
          </button>
        ))}
        {providers.length === 0 && (
          <>
            <button
              type="button"
              className={`provider-tab ${provider === 'stripe' ? 'active' : ''}`}
              onClick={() => selectProvider('stripe')}
            >
              Stripe
            </button>
            <button
              type="button"
              className={`provider-tab ${provider === 'paypal' ? 'active' : ''}`}
              onClick={() => selectProvider('paypal')}
            >
              PayPal
            </button>
          </>
        )}
      </div>

      {provider === 'stripe' && value.provider === 'stripe' && (
        <div className="card-fields">
          <label>
            Card number
            <input
              className="input"
              placeholder="4242 4242 4242 4242"
              value={value.cardNumber}
              onChange={(e) =>
                onChange({ ...value, cardNumber: e.target.value.replace(/\s/g, '') })
              }
              required
            />
          </label>
          <div className="form-row">
            <label>
              Expiry
              <input
                className="input"
                placeholder="MM/YY"
                value={value.exp}
                onChange={(e) => onChange({ ...value, exp: e.target.value })}
                required
              />
            </label>
            <label>
              CVC
              <input
                className="input"
                placeholder="123"
                value={value.cvc}
                onChange={(e) => onChange({ ...value, cvc: e.target.value })}
                required
              />
            </label>
          </div>
          <p className="muted small">Mock: use any number except ending in 0000 to succeed.</p>
        </div>
      )}

      {provider === 'paypal' && value.provider === 'paypal' && (
        <label>
          PayPal email
          <input
            type="email"
            className="input"
            placeholder="you@paypal.com"
            value={value.paypalEmail}
            onChange={(e) => onChange({ ...value, paypalEmail: e.target.value })}
            required
          />
        </label>
      )}
    </div>
  );
}
