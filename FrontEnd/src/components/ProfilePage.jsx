import { useContext, useEffect, useState, useCallback } from "react";
import "./CSS/Profile.css";
import { GlobalStateContext } from "../context/GlobalStateContext";
import { loadProfile, updateUserName } from "../services/profileService";
import { loadOrders } from "../services/orderService";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const {
    user,
    logout,
    favorites,
    cart,
  } = useContext(GlobalStateContext);

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [memberSince, setMemberSince] = useState('N/A');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const p = await loadProfile(user.uid);
      const o = await loadOrders(user.uid);
      setProfile(p);
      setOrders(o);
      setName(p?.name || user.displayName || user.email?.split('@')[0] || 'User');
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get member since date from multiple sources
  useEffect(() => {
    if (user) {
      let creationDate = null;
      
      // Try multiple sources for the creation date
      if (user?.metadata?.creationTime) {
        creationDate = new Date(user.metadata.creationTime);
      } else if (user?.createdAt) {
        creationDate = new Date(user.createdAt);
      } else if (user?.metadata?.createdAt) {
        creationDate = new Date(user.metadata.createdAt);
      } else if (user?.reloadUserInfo?.createdAt) {
        creationDate = new Date(user.reloadUserInfo.createdAt);
      } else if (user?.stsTokenManager?.expirationTime) {
        // Sometimes the token manager has creation info
        const timestamp = parseInt(user.stsTokenManager.expirationTime);
        if (!isNaN(timestamp)) {
          creationDate = new Date(timestamp - 3600000); // Subtract 1 hour as rough estimate
        }
      }
      
      // Check if we got a valid date
      if (creationDate && !isNaN(creationDate.getTime())) {
        const formattedDate = creationDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        setMemberSince(formattedDate);
        // Save to localStorage for future use
        localStorage.setItem('userCreatedAt', creationDate.toISOString());
      } else {
        // Try localStorage as fallback
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
              return;
            }
          } catch (error) {
            console.error('Error parsing saved date:', error);
          }
        }
        
        // Last resort: use current date as fallback
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
  }, [user]);


  const saveName = async () => {
    try {
      await updateUserName(user.uid, name);
      const p = await loadProfile(user.uid);
      setProfile(p);
      setEditing(false);
    } catch (error) {
      console.error('Error saving name:', error);
    }
  };

  const getInitials = () => {
    const displayName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
    const names = displayName.split(" ");
    if (names.length > 1) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  const getOrderStats = () => {
    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'Delivered' || o.status === 'delivered').length;
    const pending = orders.filter(o => o.status === 'Placed' || o.status === 'placed' || o.status === 'Processing' || o.status === 'processing').length;
    return { total, delivered, pending };
  };

  const orderStats = getOrderStats();

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header-card">
            <div className="profile-error">
              <span className="error-icon">😕</span>
              <h2>Something went wrong</h2>
              <p>We couldn't load your profile. Please try again.</p>
              <button onClick={fetchData} className="retry-btn">Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-lg">
                {getInitials()}
              </div>
              <div className="profile-status-dot"></div>
            </div>
            <div className="profile-info">
              {editing ? (
                <div className="profile-edit-name">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="profile-name-input"
                    placeholder="Enter your name"
                  />
                  <div className="profile-edit-actions">
                    <button onClick={saveName} className="save-btn">
                      ✓ Save
                    </button>
                    <button onClick={() => setEditing(false)} className="cancel-btn">
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="profile-name-row">
                    <h2 className="profile-name">{profile.name || user?.displayName || 'User'}</h2>
                    <button onClick={() => setEditing(true)} className="edit-btn">
                      ✏️ Edit
                    </button>
                  </div>
                  <p className="profile-email">{profile.email || user?.email}</p>
                  <div className="profile-badges">
                    <span className="profile-badge member-badge">
                      🎖️ Member since {memberSince}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="profile-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <h3>{favorites.length}</h3>
              <p>Favorites</p>
            </div>
            <Link to="/favorites" className="stat-link">View All →</Link>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <h3>{cart.length}</h3>
              <p>Cart Items</p>
            </div>
            <Link to="/cart" className="stat-link">View Cart →</Link>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{orderStats.total}</h3>
              <p>Total Orders</p>
            </div>
            <Link to="/orders" className="stat-link">View All →</Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders
          </button>
          <button 
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            ⏱️ Activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="profile-details-card">
                <h3>📋 Account Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{profile.name || user?.displayName || 'User'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{profile.email || user?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value" style={{ color: '#ffd700' }}>{memberSince}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">User ID</span>
                  <span className="detail-value user-id">{user?.uid?.substring(0, 12)}...</span>
                </div>
              </div>

              <div className="profile-actions">
                <button onClick={logout} className="logout-btn">
                  🚪 Logout
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-tab">
              {orders.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <h3>No Orders Yet</h3>
                  <p>Start ordering your favorite food today!</p>
                  <Link to="/" className="browse-btn">Browse Menu →</Link>
                </div>
              ) : (
                <div className="orders-list">
                  <div className="orders-stats-mini">
                    <div className="mini-stat">
                      <span className="mini-stat-value">{orderStats.total}</span>
                      <span className="mini-stat-label">Total</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-value" style={{ color: '#4caf50' }}>{orderStats.delivered}</span>
                      <span className="mini-stat-label">Delivered</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-value" style={{ color: '#ff8c00' }}>{orderStats.pending}</span>
                      <span className="mini-stat-label">Pending</span>
                    </div>
                  </div>
                  {orders.slice(0, 5).map((order, index) => (
                    <div key={index} className="order-mini-card">
                      <div className="order-mini-header">
                        <span className="order-mini-id">#{order.id?.substring(0, 8) || 'N/A'}</span>
                        <span className={`order-mini-status ${order.status?.toLowerCase() || 'placed'}`}>
                          {order.status || 'Placed'}
                        </span>
                      </div>
                      <div className="order-mini-items">
                        {order.items?.slice(0, 2).map((item, i) => (
                          <span key={i} className="order-mini-item">
                            {item.name || item.FoodName}
                          </span>
                        ))}
                        {order.items?.length > 2 && (
                          <span className="order-mini-more">+{order.items.length - 2} more</span>
                        )}
                      </div>
                      <div className="order-mini-footer">
                        <span className="order-mini-total">₹{order.total || 0}</span>
                        <Link to={`/orders/${order.id}`} className="order-mini-link">View →</Link>
                      </div>
                    </div>
                  ))}
                  {orders.length > 5 && (
                    <Link to="/orders" className="view-all-orders">View All Orders →</Link>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-tab">
              <div className="activity-card">
                <h3>📊 Activity Summary</h3>
                <div className="activity-grid">
                  <div className="activity-item">
                    <span className="activity-icon">❤️</span>
                    <div>
                      <div className="activity-count">{favorites.length}</div>
                      <div className="activity-label">Favorite Items</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">🛒</span>
                    <div>
                      <div className="activity-count">{cart.length}</div>
                      <div className="activity-label">Cart Items</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">📦</span>
                    <div>
                      <div className="activity-count">{orderStats.total}</div>
                      <div className="activity-label">Orders Placed</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">✅</span>
                    <div>
                      <div className="activity-count">{orderStats.delivered}</div>
                      <div className="activity-label">Delivered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;