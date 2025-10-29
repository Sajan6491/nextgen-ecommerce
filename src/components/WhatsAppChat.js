import React, { useState } from 'react';
import './WhatsAppChat.css';

const sampleMessages = [
  "Hi! I need help with my shipping details.",
  "Where's my order?",
  "Do you have coupons or discounts?",
];

function openWhatsAppWith(text) {
  const encoded = encodeURIComponent(text);
  // opens WhatsApp Web or mobile app with a prefilled message
  const url = `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [wiggled, setWiggled] = useState(false);

  // trigger a one-time wiggle after mount
  React.useEffect(() => {
    const t = setTimeout(() => setWiggled(true), 400);
    const t2 = setTimeout(() => setWiggled(false), 1600);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  return (
    <div className="wa-chat-root" aria-hidden={false}>
      {open && (
        <div className="wa-panel" role="dialog" aria-label="WhatsApp help">
          <div className="wa-header">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.52 3.48A11.85 11.85 0 0 0 12 1C6.48 1 2 5.48 2 11c0 1.93.52 3.74 1.44 5.33L2 23l6.98-1.8A11.9 11.9 0 0 0 12 23c5.52 0 10-4.48 10-10 0-3.02-1.28-5.75-3.48-7.52z" fill="white"/></svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="title">Funsanalist Help</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Say hello — we'll answer fast!</div>
            </div>
            <div className="wa-close" onClick={() => setOpen(false)} title="Close">✕</div>
          </div>
          <div className="wa-body">
            <div className="wa-quick">
              {sampleMessages.map((m) => (
                <button key={m} onClick={() => openWhatsAppWith(m)}>{m}</button>
              ))}
            </div>

            <div style={{ marginTop: 10 }}>
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e6e6e6' }} />
            </div>

            <div className="wa-action">
              <a onClick={(e) => { e.preventDefault(); const txt = message || 'Hello from Funsanalist! I need help.'; openWhatsAppWith(txt); setMessage(''); }} href="#" role="button">Chat on WhatsApp</a>
              <button onClick={() => { setMessage(''); openWhatsAppWith('Can I get help with shipping?'); }} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e6e6e6', background: '#fff' }}>Quick Ship Help</button>
            </div>

            <div className="wa-note">We respect your privacy — this opens WhatsApp to start a conversation.</div>
          </div>
        </div>
      )}

      <div
        className={`wa-fab ${wiggled ? 'wiggle' : ''}`}
        onClick={() => setOpen((s) => !s)}
        aria-label="Open WhatsApp chat"
        aria-expanded={open}
        title="WhatsApp chat">
        <span className="wa-icon" aria-hidden="true">
          {/* Simple phone glyph on top of the FAB background (use white fill) */}
          <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" focusable="false" role="img" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3.09 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12.88.39 1.72.8 2.5a2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l1.5-1.5a2 2 0 0 1 2.11-.45c.78.41 1.62.68 2.5.8A2 2 0 0 1 22 16.92z" fill="#fff" />
          </svg>
        </span>
      </div>
    </div>
  );
}
