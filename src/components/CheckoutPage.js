import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const CheckoutPage = () => {
  const { cart, clearCart, removeFromCart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  // If navigated with state.singleItem, checkout just that item
  const singleItem = location.state?.singleItem || null;
  const items = singleItem ? [singleItem] : cart;

  const toNumber = (val) => {
    if (val == null) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const n = parseFloat(val.replace(/[^0-9.-]+/g, ""));
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const total = items
    .reduce((s, p) => s + toNumber(p.price) * (p.quantity || 1), 0)
    .toFixed(2);

  // multi-step: review -> shipping -> payment -> confirmation
  const [step, setStep] = useState('review');
  const [address, setAddress] = useState({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal: '',
    country: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});

  const validateField = (field, value) => {
    if (field === 'fullName') {
      if (!value || value.trim().length < 2 || !/[A-Za-z]/.test(value)) return 'Please enter a valid full name (at least 2 letters)';
    }
    if (field === 'line1') {
      if (!value || value.trim().length < 3) return 'Please enter address line 1';
    }
    if (field === 'city') {
      if (!value || value.trim().length < 2) return 'Please enter a valid city';
    }
    if (field === 'postal') {
      if (!value || value.trim().length < 3) return 'Please enter a valid postal code';
    }
    if (field === 'phone') {
      if (value && !/^\+?[0-9]{7,15}$/.test(value.trim())) return 'Please enter a valid phone number (digits only, 7-15 characters)';
    }
    if (field === 'country') {
      if (['India', 'United States', 'United Kingdom'].includes(value) && !value) return 'Please select a country';
    }
    if (field === 'state') {
      if (['India', 'United States', 'United Kingdom'].includes(address.country) && !value) return 'Please select a state/province';
    }
    return '';
  };

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    // validate this field live and clear error if valid
    const err = validateField(field, value);
    setErrors((prev) => {
      const copy = { ...prev };
      if (err) copy[field] = err; else delete copy[field];
      return copy;
    });
  };

  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'card'
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvv: '' });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const startShipping = () => setStep('shipping');

  const validateAddress = () => {
    const e = {};

    // Name should be at least 2 characters and contain letters
    if (!address.fullName || address.fullName.trim().length < 2 || !/[A-Za-z]/.test(address.fullName)) {
      e.fullName = 'Please enter a valid full name (at least 2 letters)';
    }

    // Address line 1 required
    if (!address.line1 || address.line1.trim().length < 3) {
      e.line1 = 'Please enter address line 1';
    }

    // City required
    if (!address.city || address.city.trim().length < 2) {
      e.city = 'Please enter a valid city';
    }

    // Postal code required (basic check)
    if (!address.postal || address.postal.trim().length < 3) {
      e.postal = 'Please enter a valid postal code';
    }

    // If country selected and requires state, ensure state provided
    if (['India', 'United States', 'United Kingdom'].includes(address.country) && !address.state) {
      e.state = 'Please select a state/province';
    }

    // Phone optional, but if provided must be digits (allow +) and 7-15 chars
    if (address.phone && !/^\+?[0-9]{7,15}$/.test(address.phone.trim())) {
      e.phone = 'Please enter a valid phone number (digits only, 7-15 characters)';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const continueToPayment = () => {
    if (!validateAddress()) return;
    setStep('payment');
  };

  const processPayment = async () => {
    if (paymentMethod === 'upi' && !upiId) {
      alert('Please enter UPI ID');
      return;
    }
    if (paymentMethod === 'card' && (!card.number || !card.name || !card.exp || !card.cvv)) {
      alert('Please fill card details');
      return;
    }

    setIsProcessing(true);
    try {
      // simulate payment network call
      await new Promise((res) => setTimeout(res, 900));

      // on success: clear cart (if full-cart) or remove single item if it exists in cart
      if (singleItem) {
        // remove single item from cart if present
        removeFromCart(singleItem.id, true);
      } else {
        clearCart();
      }

      // generate a tiny order id
      const id = 'ORD-' + Math.random().toString(36).slice(2, 9).toUpperCase();
      setOrderId(id);
      setStep('confirmation');
      // optionally redirect to order confirmation page after a delay
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Payment failed', err);
      alert('Payment failed — please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const [coupon, setCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const couponList = {
    SAVE10: { type: 'percent', value: 10 },
    NEW20: { type: 'percent', value: 20 },
    FLAT5: { type: 'fixed', value: 5 },
  };

  const applyCoupon = () => {
    const code = (coupon || '').trim().toUpperCase();
    if (!code) {
      setCouponError('Enter a coupon code');
      return;
    }
    const found = couponList[code];
    if (!found) {
      setCouponError('Invalid coupon code');
      return;
    }
    setAppliedCoupon({ code, ...found });
    setCouponError('');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCoupon('');
    setCouponError('');
  };

  const discountedTotal = () => {
    const base = items.reduce((s, p) => s + toNumber(p.price) * (p.quantity || 1), 0);
    if (!appliedCoupon) return base;
    if (appliedCoupon.type === 'percent') {
      return +(base * (1 - appliedCoupon.value / 100)).toFixed(2);
    }
    return Math.max(0, +(base - appliedCoupon.value).toFixed(2));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ textAlign: 'center' }}>Checkout</h1>

      {items.length === 0 && step !== 'confirmation' ? (
        <p>No items to checkout.</p>
      ) : step === 'review' ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((p) => (
              <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
                <img src={p.image} alt={p.title || p.name} style={{ width: 80, height: 80, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{p.title || p.name}</div>
                  <div>Qty: {p.quantity || 1}</div>
                </div>
                <div style={{ fontWeight: 700 }}>${(toNumber(p.price) * (p.quantity || 1)).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
            <button onClick={applyCoupon} style={{ padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6 }}>Apply</button>
            {appliedCoupon ? <button onClick={removeCoupon} style={{ padding: '8px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6 }}>Remove</button> : null}
          </div>
          {couponError && <div style={{ color: '#e74c3c', marginTop: 8 }}>{couponError}</div>}

          <div style={{ marginTop: 12 }}>
            <strong>Subtotal: ${total}</strong>
          </div>
          {appliedCoupon && (
            <div style={{ marginTop: 6, color: '#059669' }}>
              Applied {appliedCoupon.code}: {appliedCoupon.type === 'percent' ? `${appliedCoupon.value}% off` : `$${appliedCoupon.value} off`}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <strong>Total: ${discountedTotal().toFixed(2)}</strong>
          </div>

          <div style={{ marginTop: 16 }}>
            <button onClick={startShipping} style={{ padding: '8px 14px', background: '#0b74de', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Continue to Shipping
            </button>
          </div>
        </>
      ) : step === 'shipping' ? (
        <>
          <h2 style={{ marginBottom: 8, textAlign: 'center', color: '#0b74de' }}>Shipping Address</h2>
          <p style={{ textAlign: 'center', marginTop: 0, marginBottom: 12, color: '#6b7280' }}>Enter your shipping details below — need help? Tap the WhatsApp bubble at the bottom-right for a quick chat.</p>

          <div style={{ maxWidth: 820, background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 4px 18px rgba(0,0,0,0.06)', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, color: '#333', marginBottom: 6 }}>Full name *</span>
                <input value={address.fullName} onChange={(e) => handleAddressChange('fullName', e.target.value)} style={{ padding: 8, borderRadius: 6, border: errors.fullName ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                {errors.fullName && <span style={{ color: '#e74c3c', fontSize: 12, marginTop: 6 }}>{errors.fullName}</span>}
              </label>

              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, color: '#333', marginBottom: 6 }}>Phone</span>
                <input value={address.phone} onChange={(e) => handleAddressChange('phone', e.target.value)} style={{ padding: 8, borderRadius: 6, border: errors.phone ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                {errors.phone && <span style={{ color: '#e74c3c', fontSize: 12, marginTop: 6 }}>{errors.phone}</span>}
              </label>

              <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, color: '#333', marginBottom: 6 }}>Address line 1 *</span>
                <input value={address.line1} onChange={(e) => handleAddressChange('line1', e.target.value)} style={{ padding: 8, borderRadius: 6, border: errors.line1 ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                {errors.line1 && <span style={{ color: '#e74c3c', fontSize: 12, marginTop: 6 }}>{errors.line1}</span>}
              </label>

              <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, color: '#333', marginBottom: 6 }}>Address line 2</span>
                <input value={address.line2} onChange={(e) => handleAddressChange('line2', e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, color: '#333', marginBottom: 6 }}>Country *</span>
                <select value={address.country} onChange={(e) => {
                    const c = e.target.value;
                    handleAddressChange('country', c);
                    // reset state when country changes
                    setAddress((prev) => ({ ...prev, country: c, state: '' }));
                  }} style={{ padding: 8, borderRadius: 6, border: errors.country ? '1px solid #e74c3c' : '1px solid #ddd' }}>
                  <option value="">Select country</option>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
                {errors.country && <span style={{ color: '#e74c3c', fontSize: 12, marginTop: 6 }}>{errors.country}</span>}
              </label>

              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, color: '#333', marginBottom: 6 }}>State / Province *</span>
                <select value={address.state} onChange={(e) => handleAddressChange('state', e.target.value)} style={{ padding: 8, borderRadius: 6, border: errors.state ? '1px solid #e74c3c' : '1px solid #ddd' }}>
                  <option value="">Select state</option>
                  {address.country === 'India' && (
                    <>
                      <option value="Delhi">Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                    </>
                  )}
                  {address.country === 'United States' && (
                    <>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                    </>
                  )}
                  {address.country === 'United Kingdom' && (
                    <>
                      <option value="England">England</option>
                      <option value="Scotland">Scotland</option>
                      <option value="Wales">Wales</option>
                    </>
                  )}
                </select>
                {errors.state && <span style={{ color: '#e74c3c', fontSize: 12, marginTop: 6 }}>{errors.state}</span>}
              </label>

              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, color: '#333', marginBottom: 6 }}>City *</span>
                <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} style={{ padding: 8, borderRadius: 6, border: errors.city ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                {errors.city && <span style={{ color: '#e74c3c', fontSize: 12, marginTop: 6 }}>{errors.city}</span>}
              </label>

              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, color: '#333', marginBottom: 6 }}>Postal code *</span>
                <input value={address.postal} onChange={(e) => setAddress({ ...address, postal: e.target.value })} style={{ padding: 8, borderRadius: 6, border: errors.postal ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                {errors.postal && <span style={{ color: '#e74c3c', fontSize: 12, marginTop: 6 }}>{errors.postal}</span>}
              </label>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setStep('review')} style={{ padding: '8px 12px' }}>Back</button>
              <button onClick={continueToPayment} style={{ padding: '8px 14px', background: '#0b74de', color: '#fff', border: 'none', borderRadius: 6 }}>Continue to Payment</button>
            </div>
          </div>
        </>
      ) : step === 'payment' ? (
        <>
          <h2>Payment</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="radio" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} /> UPI
            </label>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Card
            </label>
          </div>

          {paymentMethod === 'upi' ? (
            <div style={{ marginTop: 12 }}>
              <input placeholder="UPI ID (example: yourid@upi)" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
            </div>
          ) : (
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <input placeholder="Card number" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
              <input placeholder="Name on card" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
                <input placeholder="CVV" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
              </div>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button onClick={() => setStep('shipping')} style={{ marginRight: 8 }}>Back</button>
            <button onClick={processPayment} disabled={isProcessing} style={{ padding: '8px 14px', background: '#0b74de', color: '#fff', border: 'none', borderRadius: 6 }}>
              {isProcessing ? 'Processing...' : `Pay $${total}`}
            </button>
          </div>
        </>
      ) : (
        // confirmation
        <>
          <h2>Order Confirmed</h2>
          <p style={{ color: 'green' }}>Thank you! Your order {orderId ? `(${orderId})` : ''} has been placed.</p>
          <p>You will be redirected to home shortly.</p>
        </>
      )}
    </div>
  );
};

export default CheckoutPage;
