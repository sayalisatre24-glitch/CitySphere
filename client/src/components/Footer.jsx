import React from 'react';
import { Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        marginTop: 'auto',
        padding: '16px 24px'
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #0f172a 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <Globe size={13} color="#6ee7b7" />
          </div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>CitySphere AI</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link>
          <Link to="/explore" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Explore & Map</Link>
          <Link to="/safety" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Safety</Link>
          <Link to="/ai-assistant" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI Assistant</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
