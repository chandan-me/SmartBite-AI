import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import "./CSS/Navbar.css";
import { GlobalStateContext } from "../context/GlobalStateContext";
import FavoritesPage from "./FavoritesPage";
import logo from "../assets/logo.png";

const Navbar = ({ darkMode, setDarkMode }) => {
  const {
    cart,
    isLoggedIn,
    user,
    logout
  } = useContext(GlobalStateContext);

  const [showDropdown, setShowDropdown] = useState(false);

  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "sb-nav-link active"
      : "sb-nav-link";

  const getUserName = () => {
    if (!user) return "User";

    return (
      user.displayName ||
      user.name ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  const getInitials = () => {
    const fullName = getUserName();

    const names = fullName.split(" ");

    if (names.length > 1) {
      return (
        names[0][0] + names[1][0]
      ).toUpperCase();
    }

    return fullName.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
  };

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
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

        {/* ---------------- MENU ---------------- */}

        <div className="sb-nav-links">

          <Link
            to="/"
            className={isActive("/")}
          >
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
            <>

              <Link
                to="/orders"
                className={isActive("/orders")}
              >
               My Orders
              </Link>
            </>
          )}

          <Link
          to="/favorites"
          className={isActive("/favorites")}
          >
          ❤️ Favorites
          </Link>

          <Link
            to="/about"
            className={isActive("/about")}
          >
            About
          </Link>

        </div>

        <div className="sb-navbar__spacer" />

        {/* ---------------- RIGHT ---------------- */}

        <div className="sb-navbar__right">

                    {/* Cart Icon */}

          {isLoggedIn && (
            <Link
              to="/cart"
              className="sb-cart-btn"
            >
              🛒

              {cartCount > 0 && (
                <span className="sb-cart-badge">
                  {cartCount}
                </span>
              )}
            </Link>
          )}


          {/* Theme Toggle */}

          <button
            className="sb-dark-toggle"
            onClick={() =>
              setDarkMode(!darkMode)
            }
            title={
              darkMode
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
          >
            <span className="sb-toggle-icon">
              {darkMode ? "☀️" : "🌙"}
            </span>

            <span className="sb-toggle-track">
              <span
                className={`sb-toggle-thumb ${
                  darkMode
                    ? ""
                    : "sb-toggle-thumb--light"
                }`}
              />
            </span>
          </button>


          {/* User */}

          {isLoggedIn ? (
            <div className="sb-user-wrap">

              <button
                className="sb-user-btn"
                onClick={() =>
                  setShowDropdown(!showDropdown)
                }
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
                    onClick={() =>
                      setShowDropdown(false)
                    }
                  >
                    👤 Profile
                  </Link>

                  <Link
                    to="/orders"
                    className="sb-dropdown-item"
                    onClick={() =>
                      setShowDropdown(false)
                    }
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
                    onClick={() =>
                      setShowDropdown(false)
                    }
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
            <Link
              to="/login"
              className="sb-login-btn"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;