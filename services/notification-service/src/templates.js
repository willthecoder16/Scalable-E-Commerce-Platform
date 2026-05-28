function orderConfirmationEmail({ orderId, total, items }) {
  const itemLines = (items || [])
    .map((i) => `<li>${i.name || i.productName} × ${i.quantity} — $${(i.price * i.quantity || i.unitPrice * i.quantity).toFixed(2)}</li>`)
    .join('');

  return {
    subject: `Order Confirmation #${orderId.slice(0, 8)}`,
    body: `Thank you for your order!\n\nOrder ID: ${orderId}\nTotal: $${total.toFixed(2)}\n\nWe'll notify you when it ships.`,
    html: `
      <div style="font-family:sans-serif;max-width:560px">
        <h2>Order confirmed</h2>
        <p>Thank you for shopping with ShopFlow.</p>
        <p><strong>Order:</strong> #${orderId.slice(0, 8)}<br>
        <strong>Total:</strong> $${total.toFixed(2)}</p>
        ${itemLines ? `<ul>${itemLines}</ul>` : ''}
        <p>We'll send another email when your order ships.</p>
      </div>
    `,
  };
}

function paymentReceiptEmail({ orderId, amount, provider, transactionId }) {
  return {
    subject: `Payment Receipt — Order #${orderId.slice(0, 8)}`,
    body: `Payment of $${Number(amount).toFixed(2)} received via ${provider}.\nTransaction: ${transactionId}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px">
        <h2>Payment received</h2>
        <p>Your payment has been processed successfully.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td>Amount</td><td><strong>$${Number(amount).toFixed(2)}</strong></td></tr>
          <tr><td>Provider</td><td>${provider}</td></tr>
          <tr><td>Transaction ID</td><td><code>${transactionId}</code></td></tr>
        </table>
      </div>
    `,
  };
}

function shippingUpdateEmail({ orderId, status }) {
  const messages = {
    shipped: 'Your order is on its way!',
    delivered: 'Your order has been delivered.',
    cancelled: 'Your order has been cancelled.',
  };
  const msg = messages[status] || `Your order status is now: ${status}`;

  return {
    subject: `Order Update: ${status.charAt(0).toUpperCase() + status.slice(1)} — #${orderId.slice(0, 8)}`,
    body: `${msg}\n\nOrder ID: ${orderId}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px">
        <h2>${msg}</h2>
        <p>Order <strong>#${orderId.slice(0, 8)}</strong> — Status: <strong>${status}</strong></p>
        ${status === 'shipped' ? '<p>Track your package in your account orders page.</p>' : ''}
      </div>
    `,
  };
}

module.exports = {
  orderConfirmationEmail,
  paymentReceiptEmail,
  shippingUpdateEmail,
};
