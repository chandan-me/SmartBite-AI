import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./CSS/Navbar.css";
import { GlobalStateContext } from "../context/GlobalStateContext";
import logo from "../assets/logo.png";

const Navbar = ({ darkMode, setDarkMode }) => {
  const {
    cart,
    isLoggedIn,
    user,
    logout
  } = useContext(GlobalStateContext);

  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileUserExpanded, setIsMobileUserExpanded] = useState(false);
  const [memberSince, setMemberSince] = useState('N/A');
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileUserExpanded(false);
  }, [location]);

  const isActive = (path) =>
    location.pathname === path
      ? "sb-nav-link active"
      : "sb-nav-link";

  const getUserName = () => {
    if (!user) return "Guest";
    return (
      user.displayName ||
      user.name ||
      user.email?.split("@")[0] ||
      "Guest"
    );
  };

  const getInitials = () => {
    const fullName = getUserName();
    const names = fullName.split(" ");
    if (names.length > 1) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
    setIsMobileUserExpanded(false);
    await logout();
  };

  const cartCount = cart.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  // Get member since date from Firebase user metadata
  useEffect(() => {
    if (user) {
      const creationTime = user?.metadata?.creationTime || 
                          user?.createdAt || 
                          user?.metadata?.createdAt;
      
      if (creationTime) {
        try {
          const date = new Date(creationTime);
          if (!isNaN(date.getTime())) {
            const formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            setMemberSince(formattedDate);
          } else {
            setMemberSince('N/A');
          }
        } catch (error) {
          console.error('Error formatting date:', error);
          setMemberSince('N/A');
        }
      } else {
        const savedDate = localStorage.getItem('userCreatedAt');
        if (savedDate) {
          try {
            const date = new Date(savedDate);
            if (!isNaN(date.getTime())) {
              const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              setMemberSince(formattedDate);
            } else {
              setMemberSince('N/A');
            }
          } catch {
            setMemberSince('N/A');
          }
        } else {
          const now = new Date();
          const formattedDate = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          setMemberSince(formattedDate);
          localStorage.setItem('userCreatedAt', now.toISOString());
        }
      }
    }
  }, [user]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Toggle mobile user expansion
  const toggleMobileUser = () => {
    setIsMobileUserExpanded(!isMobileUserExpanded);
  };

  return (
    <nav className="sb-navbar">
      <div className="sb-navbar__inner">

        {/* ---------------- LOGO ---------------- */}
        <Link to="/" className="sb-logo">
          <div className="sb-logo__icon">
            <img
              src={logo}
              alt="SmartBite AI Logo"
              className="logo-img"
            />
          </div>
          <div className="sb-logo__text">
            SmartBite <span>AI</span>
          </div>
        </Link>

        {/* ---------------- DESKTOP NAVIGATION LINKS ---------------- */}
        <div className="sb-nav-links">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
          <Link
            to="/"
            className="sb-nav-link"
            onClick={() =>
              setTimeout(() => {
                document
                  .getElementById("items")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }, 100)
            }
          >
            Menu
          </Link>
          {isLoggedIn && (
            <Link to="/orders" className={isActive("/orders")}>
              My Orders
            </Link>
          )}
          <Link to="/favorites" className={isActive("/favorites")}>
            ❤️ Favorites
          </Link>
          <Link to="/about" className={isActive("/about")}>
            About
          </Link>
        </div>

        <div className="sb-navbar__spacer" />

        {/* ---------------- RIGHT SECTION ---------------- */}
        <div className="sb-navbar__right">

          {/* Cart Icon - Only on Desktop */}
          {isLoggedIn && (
            <Link to="/cart" className="sb-cart-btn">
              🛒
              {cartCount > 0 && (
                <span className="sb-cart-badge">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Desktop Theme Toggle - Hidden on Mobile */}
          <button
            className="sb-dark-toggle sb-desktop-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span className="sb-toggle-icon">
              {darkMode ? "☀️" : "🌙"}
            </span>
            <span className="sb-toggle-track">
              <span
                className={`sb-toggle-thumb ${
                  darkMode ? "" : "sb-toggle-thumb--light"
                }`}
              />
            </span>
          </button>

          {/* Desktop User Section - Only show when logged in */}
          {isLoggedIn ? (
            <div className="sb-user-wrap sb-desktop-user">
              <button
                className="sb-user-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="sb-avatar">
                  {getInitials()}
                </div>
                <span className="sb-user-name">
                  Hi, {getUserName().split(" ")[0]}
                </span>
                <span className="sb-chevron">
                  {showDropdown ? "▲" : "▼"}
                </span>
              </button>

              {showDropdown && (
                <div className="sb-dropdown">
                  <Link
                    to="/profile"
                    className="sb-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    👤 Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="sb-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    📦 My Orders
                  </Link>
                  <Link
                    to="/favorites"
                    className="sb-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    ❤️ Favorites
                  </Link>
                  <Link
                    to="/cart"
                    className="sb-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    🛒 Cart
                  </Link>
                  <div className="sb-dropdown-divider" />
                  <button
                    className="sb-dropdown-item danger"
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="sb-login-btn">Login</Link>
          )}

          {/* ---------------- MOBILE HAMBURGER MENU BUTTON ---------------- */}
          <button
            className={`sb-mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="sb-hamburger-line"></span>
            <span className="sb-hamburger-line"></span>
            <span className="sb-hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* ---------------- MOBILE OVERLAY ---------------- */}
      {isMobileMenuOpen && (
        <div 
          className="sb-mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ---------------- MOBILE MENU ---------------- */}
      <div className={`sb-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sb-mobile-menu-content">
          {/* Mobile Menu Header - Clickable */}
          <div 
            className="sb-mobile-menu-header"
            onClick={toggleMobileUser}
            style={{ cursor: 'pointer' }}
          >
            <div className="sb-mobile-user-info">
              <div className="sb-mobile-avatar">
                {getInitials()}
              </div>
              <div className="sb-mobile-user-details">
                <div className="sb-mobile-greeting">
                  {isLoggedIn ? 'Hello' : 'Welcome'}
                </div>
                <div className="sb-mobile-user-name">
                  {getUserName()}
                </div>
              </div>
            </div>
            <div className="sb-mobile-header-actions">
              <span className={`sb-mobile-expand-icon ${isMobileUserExpanded ? 'expanded' : ''}`}>
                {isMobileUserExpanded ? '▲' : '▼'}
              </span>
              <button 
                className="sb-mobile-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(false);
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Expanded User Details */}
          {isMobileUserExpanded && isLoggedIn && (
            <div className="sb-mobile-user-expanded">
              <div className="sb-mobile-user-email">
                📧 {user?.email || 'No email'}
              </div>
              {user?.phoneNumber && (
                <div className="sb-mobile-user-phone">
                  📱 {user.phoneNumber}
                </div>
              )}
              <div className="sb-mobile-user-member">
                🎖️ Member since {memberSince}
              </div>
              <Link 
                to="/profile" 
                className="sb-mobile-profile-link"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsMobileUserExpanded(false);
                }}
              >
                👤 View Full Profile →
              </Link>
            </div>
          )}

          {/* Expanded Guest Details */}
          {isMobileUserExpanded && !isLoggedIn && (
            <div className="sb-mobile-user-expanded">
              <div className="sb-mobile-guest-message">
                🔑 Sign in to access your orders, favorites, and personalized experience!
              </div>
              <Link 
                to="/login" 
                className="sb-mobile-profile-link"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsMobileUserExpanded(false);
                }}
              >
                🔐 Login Now →
              </Link>
            </div>
          )}

          <div className="sb-mobile-nav-links">
            {/* Theme Toggle in Mobile Menu */}
            <div className="sb-mobile-theme-toggle">
              <span className="sb-mobile-nav-icon">
                {darkMode ? "☀️" : "🌙"}
              </span>
              <span className="sb-mobile-theme-label">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </span>
              <button
                className="sb-mobile-toggle-switch"
                onClick={() => setDarkMode(!darkMode)}
              >
                <span className={`sb-mobile-toggle-slider ${darkMode ? 'active' : ''}`}>
                  <span className="sb-mobile-toggle-knob"></span>
                </span>
              </button>
            </div>

            <div className="sb-mobile-divider" />

            <Link to="/" className="sb-mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="sb-mobile-nav-icon">🏠</span> Home
            </Link>
            <Link
              to="/"
              className="sb-mobile-nav-link"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById("items")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }, 200);
              }}
            >
              <span className="sb-mobile-nav-icon">📋</span> Menu
            </Link>
            
            {/* Show these only when logged in */}
            {isLoggedIn && (
              <>
                <Link to="/orders" className="sb-mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="sb-mobile-nav-icon">📦</span> My Orders
                </Link>
                <Link to="/favorites" className="sb-mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="sb-mobile-nav-icon">❤️</span> Favorites
                </Link>
              </>
            )}
            
            <Link to="/about" className="sb-mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="sb-mobile-nav-icon">ℹ️</span> About
            </Link>
            
            <div className="sb-mobile-divider" />
            
            {/* Login/Logout in mobile menu */}
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="sb-mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="sb-mobile-nav-icon">👤</span> My Profile
                </Link>
                <Link to="/cart" className="sb-mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="sb-mobile-nav-icon">🛒</span> Cart
                  {cartCount > 0 && (
                    <span className="sb-mobile-cart-badge">{cartCount}</span>
                  )}
                </Link>
                <button className="sb-mobile-nav-link sb-mobile-logout-btn" onClick={handleLogout}>
                  <span className="sb-mobile-nav-icon">🚪</span> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="sb-mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="sb-mobile-nav-icon">🔑</span> Login
                </Link>
                <Link to="/signup" className="sb-mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="sb-mobile-nav-icon">📝</span> Sign Up
                </Link>
              </>
            )}
            
            {/* Spacer to push content up and remove empty space */}
            <div className="sb-mobile-spacer"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;