import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './CSS/Navbar.css'
import { GlobalStateContext } from '../context/GlobalStateContext'
import { useContext } from 'react'

const Navbar = ({ darkMode, setDarkMode }) => {
  const { displayCart, Quantity, isLoggedIn, user, logout } = useContext(GlobalStateContext)
  const [showDropdown, setShowDropdown] = useState(false)
  const location = useLocation()
  

  const getInitials = () => {
    if (!user || !user.name) return '?'
    const names = user.name.split(' ')
    if (names.length > 1) return (names[0][0] + names[1][0]).toUpperCase()
    return user.name.slice(0, 2).toUpperCase()
  }

  const handleLogout = () => { setShowDropdown(false); logout() }

  const isActive = (path) => location.pathname === path ? 'sb-nav-link active' : 'sb-nav-link'

  return (
    <nav className='sb-navbar'>
      <div className='sb-navbar__inner'>
        <Link to="/" className='sb-logo'>
          <div className='sb-logo__icon'>🍽️</div>
          <div className='sb-logo__text'>SmartBite <span>AI</span></div>
        </Link>

        <div className='sb-nav-links'>
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/" className='sb-nav-link' onClick={() => setTimeout(() => document.getElementById('items')?.scrollIntoView({behavior:'smooth'}), 100)}>Menu</Link>
          {isLoggedIn && <Link to="/orders" className={isActive('/orders')}>Orders</Link>}
          {displayCart && <Link to="/cart" className={isActive('/cart')}>Cart</Link>}
          <Link to="/about" className={isActive('/about')}>About</Link>
        </div>

        <div className='sb-navbar__spacer' />

        <div className='sb-navbar__right'>

          {/* Dark / Light mode toggle */}
          <button
            className='sb-dark-toggle'
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            <span className='sb-toggle-icon'>{darkMode ? '☀️' : '🌙'}</span>
            <span className='sb-toggle-track'>
              <span className={`sb-toggle-thumb${darkMode ? '' : ' sb-toggle-thumb--light'}`} />
            </span>
          </button>

          {displayCart && (
            <Link to="/cart" className='sb-cart-btn'>
              🛒
              {Quantity > 0 && <span className='sb-cart-badge'>{Quantity}</span>}
            </Link>
          )}

          {isLoggedIn ? (
            <div className='sb-user-wrap'>
              <button className='sb-user-btn' onClick={() => setShowDropdown(!showDropdown)}>
                <div className='sb-avatar'>{getInitials()}</div>
                <span className='sb-user-name'>Hi, {user?.name?.split(' ')[0] || 'User'}</span>
                <span className='sb-chevron'>{showDropdown ? '▲' : '▼'}</span>
              </button>
              {showDropdown && (
                <div className='sb-dropdown'>
                  <Link to="/profile" className='sb-dropdown-item' onClick={() => setShowDropdown(false)}>
                    👤 Profile
                  </Link>
                  <Link to="/orders" className='sb-dropdown-item' onClick={() => setShowDropdown(false)}>
                    📦 My Orders
                  </Link>
                  {displayCart && (
                    <Link to="/cart" className='sb-dropdown-item' onClick={() => setShowDropdown(false)}>
                      🛒 Cart {Quantity > 0 && `(${Quantity})`}
                    </Link>
                  )}
                  <div className='sb-dropdown-divider' />
                  <div className='sb-dropdown-item danger' onClick={handleLogout}>
                    🚪 Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className='sb-login-btn'>Login / Sign Up</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
