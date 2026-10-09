import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Globe,
  User,
  LogOut,
  LogIn,
  ChevronDown,
  Menu,
  X,
  Compass,
  BookOpen,
  ShieldAlert,
  CalendarCheck,
  Bot,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    logout,
    setAuthModalOpen,
    setAuthModalMode,
    currentCity,
    setCurrentCity
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clean Sequential Navigation Links
  const navLinks = [
    { to: '/', label: 'Home', icon: Globe },
    { to: '/explore', label: 'Explore & Map', icon: Compass },
    { to: '/history', label: 'History & Culture', icon: BookOpen },
    { to: '/safety', label: 'Safety Insights', icon: ShieldAlert },
    { to: '/itinerary', label: 'Trip Planner', icon: CalendarCheck },
    { to: '/ai-assistant', label: 'AI Assistant', icon: Bot }
  ];

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/" onClick={handleNavClick} className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #0f172a 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
              }}
            >
              <Globe size={20} color="#6ee7b7" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                CitySphere
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  background: 'var(--emerald-light)',
                  color: 'var(--emerald-dark)',
                  border: '1px solid #a7f3d0',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                AI
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Sequential Navigation Links */}
        <nav className="nav-links desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {navLinks.map((link) => {
            const isExplorePage = location.pathname.startsWith('/explore');
            const isActive = link.to === '/explore'
              ? isExplorePage
              : (location.pathname === link.to || (link.to === '/' && location.pathname === '/'));

            return (
              <Link
                key={link.label}
                to={link.to}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{
                  textDecoration: 'none',
                  padding: '7px 14px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem'
                }}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Auth / User Profile / Mobile Hamburger Toggle */}
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-profile-pill"
                style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)' }}
                title="User profile settings"
              >
                <div className="user-avatar" style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #0f172a, var(--emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.78rem' }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user.name || 'Citizen'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--emerald-dark)', fontWeight: 600 }}>
                    {user.role === 'admin' ? '🛡️ Admin' : 'Local Explorer'}
                  </span>
                </div>
                <ChevronDown size={12} color="var(--text-muted)" />
              </div>

              {showUserMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 42,
                    width: 200,
                    background: 'white',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border-color)',
                    padding: '8px',
                    zIndex: 1500,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-color)', marginBottom: 4 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                  </div>

                  <Link
                    to="/saved"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      padding: '6px 8px',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    className="hover-bg"
                  >
                    <span>⭐ Saved Places</span>
                  </Link>

                  <Link
                    to="/report"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      padding: '6px 8px',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    className="hover-bg"
                  >
                    <span>📝 Submit Civic Report</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    style={{
                      marginTop: 4,
                      padding: '6px 8px',
                      fontSize: '0.8rem',
                      color: 'var(--rose-dark)',
                      background: 'var(--rose-light)',
                      border: 'none',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      fontWeight: 600,
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={13} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleOpenAuth('login')}
              className="btn btn-emerald btn-sm desktop-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              <LogIn size={14} />
              <span>Login / Sign Up</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="mobile-hamburger-btn mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer mobile-only">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px' }}>
            {/* Active City Selector in Mobile Drawer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <MapPin size={15} color="var(--emerald)" />
                <span>Active City:</span>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.78rem', fontWeight: 800 }}>
                {currentCity}
              </span>
            </div>

            {/* Mobile Nav Links */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isExplorePage = location.pathname.startsWith('/explore');
              const isActive = link.to === '/explore'
                ? isExplorePage
                : (location.pathname === link.to || (link.to === '/' && location.pathname === '/'));

              return (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={handleNavClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: isActive ? '#065f46' : 'var(--text-primary)',
                    background: isActive ? 'var(--emerald-light)' : 'white',
                    border: isActive ? '1px solid #a7f3d0' : '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--emerald-dark)' : 'var(--text-secondary)'} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Actions */}
            {!user ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="btn btn-emerald"
                  style={{ flex: 1, padding: '10px', fontSize: '0.88rem', fontWeight: 700 }}
                >
                  <LogIn size={15} />
                  <span>Login / Sign Up</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="btn btn-secondary"
                style={{
                  marginTop: 8,
                  padding: '10px',
                  color: 'var(--rose-dark)',
                  background: 'var(--rose-light)',
                  border: '1px solid #fecdd3',
                  fontWeight: 700
                }}
              >
                <LogOut size={15} />
                <span>Log Out ({user.name})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
