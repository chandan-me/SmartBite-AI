import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './CSS/Profile.css'
import { GlobalStateContext } from '../context/GlobalStateContext'

const ProfilePage = () => {
  const { isLoggedIn, user, logout } = useContext(GlobalStateContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { state: { from: { pathname: '/profile' } } }); return }
    fetchUserOrders()
  }, [isLoggedIn])

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`http://localhost:8000/orders/${user.user_id}/`)
      const data = await response.json()
      setOrders(data)
    } catch (error) { console.error("Error fetching orders:", error) }
    finally { setLoading(false) }
  }

  const getStatusIcon = (status) => {
    const map = { placed:'📝', confirmed:'✅', preparing:'👨‍🍳', 'out-for-delivery':'🛵', delivered:'🍽️' }
    return map[status] || '📦'
  }

  if (!isLoggedIn) return null

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const tabStyle = (tab) => ({
    background: activeTab === tab ? 'var(--orange-gradient)' : 'var(--bg-card)',
    color: activeTab === tab ? 'white' : 'var(--text-secondary)',
    border: activeTab === tab ? 'none' : '1px solid var(--border-subtle)',
    borderRadius: '8px', padding: '9px 20px',
    fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
    transition: 'var(--transition)',
  })

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
        </div>
      </div>

      <div style={{display:'flex', gap:'0.5rem', marginBottom:'1.5rem'}}>
        <button style={tabStyle('profile')} onClick={() => setActiveTab('profile')}>👤 Profile Details</button>
        <button style={tabStyle('orders')} onClick={() => setActiveTab('orders')}>📦 Orders ({orders.length})</button>
      </div>

      {activeTab === 'profile' ? (
        <div className="profile-section">
          <h3>Personal Information</h3>
          {[
            ['Full Name', user?.name],
            ['Email Address', user?.email],
            ['Member Since', new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })],
            ['Total Orders', orders.length],
          ].map(([label, value]) => (
            <div key={label} className="profile-field">
              <label>{label}</label>
              <span>{value}</span>
            </div>
          ))}
          <div style={{marginTop:'1.5rem'}}>
            <button onClick={logout} style={{
              background:'rgba(255,80,80,0.1)', border:'1px solid rgba(255,80,80,0.3)',
              color:'#ff8080', fontWeight:700, padding:'10px 24px', borderRadius:'8px',
              cursor:'pointer', transition:'var(--transition)',
            }}>
              🚪 Logout
            </button>
          </div>
        </div>
      ) : (
        <div>
          {loading ? (
            <div style={{textAlign:'center', padding:'3rem', color:'var(--text-muted)'}}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <h2>No orders yet</h2>
              <p>You haven't placed any orders. Start browsing our menu!</p>
              <button onClick={() => navigate('/')} style={{
                background:'var(--orange-gradient)', color:'white', fontWeight:700,
                padding:'12px 24px', borderRadius:'8px', border:'none', cursor:'pointer',
                marginTop:'1rem',
              }}>Browse Menu</button>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'0.85rem'}}>
              {orders.map(order => (
                <div key={order.order_id} className="order-item">
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                    <h3>Order #{order.order_id}</h3>
                    <span className="order-stat">{getStatusIcon(order.order_status)} {order.order_status}</span>
                  </div>
                  <p>{new Date(order.order_date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
                  {order.items?.map((item, idx) => (
                    <p key={idx} style={{fontSize:'0.82rem'}}>{item.name} × {item.quantity} — ₹{item.price}</p>
                  ))}
                  <p className="order-amount" style={{marginTop:'0.5rem'}}>Total: ₹{order.total_amount}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProfilePage
