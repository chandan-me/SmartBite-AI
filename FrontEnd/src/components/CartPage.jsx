import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './CSS/Cart.css'
import { GlobalStateContext } from '../context/GlobalStateContext'
import {loadCart,removeCartItem,updateCartQty,} from "../services/cartService";

const CartPage = () => {
    const {user,isLoggedIn,} = useContext(GlobalStateContext);
    const [cartItems, setCartItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showOrderPopup, setShowOrderPopup] = useState(false)
    const [orderMessage, setOrderMessage] = useState('')
    const navigate = useNavigate()

    useEffect(() => {

    if (!user) return;

    const fetchCart = async () => {

        const items = await loadCart(user.uid);

        setCartItems(items);

        const totalPrice = items.reduce(
            (sum, item) =>
                sum + item.price * item.quantity,
            0
        );

        setTotal(totalPrice);

    };

    fetchCart();

    }, [user]);

    // ── Voice assistant event: open UPI payment ──
    useEffect(() => {
        const handleVoiceUPI = async (e) => {
            const { userId, total: voiceTotal, cartItems: voiceItems } = e.detail
            await triggerUPIPayment(userId, voiceTotal, voiceItems)
        }
        window.addEventListener('voice:open-upi', handleVoiceUPI)
        return () => window.removeEventListener('voice:open-upi', handleVoiceUPI)
    }, [])

    const triggerUPIPayment = async (uid, amount, items) => {
        setLoading(true)
        try {
            const orderResponse = await fetch('http://localhost:8000/create-order/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, amount, items, paymentMethod: 'UPI' })
            })
            const orderData = await orderResponse.json()
            if (!orderData.success) throw new Error(orderData.error || 'Failed to create order')

            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script')
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                    script.onload = resolve; script.onerror = reject
                    document.body.appendChild(script)
                })
            }

            const options = {
                key: 'rzp_test_SdTWYyzys8e6Zq',
                amount: amount * 100,
                currency: 'INR',
                name: 'SmartBite AI',
                description: 'Food Order Payment',
                order_id: orderData.razorpayOrderId,
                handler: async (response) => {
                    try {
                        const verifyRes = await fetch('http://localhost:8000/verify-payment/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: orderData.orderId
                            })
                        })
                        const verifyData = await verifyRes.json()
                        if (verifyData.success) {
                            await clearCartItems(items)
                            setOrderMessage('Payment successful! Order placed!')
                            setShowOrderPopup(true)
                            setTimeout(() => setShowOrderPopup(false), 3000)
                            navigate('/orders')
                        } else throw new Error('Payment verification failed')
                    } catch (err) { alert('Payment verification failed: ' + err.message) }
                },
                prefill: { name: user?.name, email: user?.email },
                theme: { color: '#ff6b00' },
                modal: { ondismiss: () => setLoading(false) }
            }
            const rzp = new window.Razorpay(options)
            rzp.on('payment.failed', (r) => { alert('Payment failed: ' + r.error.description); setLoading(false) })
            rzp.open()
        } catch (error) {
            alert('Payment failed: ' + error.message)
            setLoading(false)
        }
    }

    const handleIncreaseQuantity = async (item) => {

    await updateCartQty(
        user.uid,
        item.id,
        item.quantity + 1
    );

    const items = await loadCart(user.uid);

    setCartItems(items);

    setTotal(
        items.reduce(
            (sum, i) =>
                sum + i.price * i.quantity,
            0
        )
    );
    };

    const handleDecreaseQuantity = async (item) => {

    if (item.quantity === 1) {

        await removeCartItem(
            user.uid,
            item.id
        );

    } else {

        await updateCartQty(
            user.uid,
            item.id,
            item.quantity - 1
        );

    }

    const items = await loadCart(user.uid);

    setCartItems(items);

    setTotal(
        items.reduce(
            (sum, i) =>
                sum + i.price * i.quantity,
            0
        )
    );
    };

    const handleRemoveItem = async (item) => {

    await removeCartItem(
        user.uid,
        item.id
    );

    const items = await loadCart(user.uid);

    setCartItems(items);

    setTotal(
        items.reduce(
            (sum, i) =>
                sum + i.price * i.quantity,
            0
        )
    );
    };

    const handleCheckout = () => {
        if (!isLoggedIn) { navigate('/login', { state: { from: { pathname: '/cart' } } }); return }
        setShowPaymentModal(true)
    }

    const handleCOD = async () => {
        setShowPaymentModal(false)
        setLoading(true)
        try {
            const orderResponse = await fetch('http://localhost:8000/create-order/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, amount: total, items: cartItems, paymentMethod: 'COD' })
            })
            const orderData = await orderResponse.json()
            if (orderData.success) {
                setOrderMessage('Order placed successfully! Your food will be delivered soon. 🎉')
                setShowOrderPopup(true)
                await clearCartItems(cartItems)
                setTimeout(() => setShowOrderPopup(false), 3000)
                navigate('/orders')
            }
        } catch (error) { alert('Failed to place order') }
        finally { setLoading(false) }
    }

    const handleUPI = async () => {
        setShowPaymentModal(false)
        await triggerUPIPayment(user.uid, total, cartItems)
    }

    return (
        <div className="cart-container">
            {showOrderPopup && <div className="order-popup"><p>{orderMessage}</p></div>}

            {showPaymentModal && (
                <div className="payment-modal">
                    <div className="payment-modal-content">
                        <h3>💳 Select Payment Method</h3>
                        <button className="payment-option cod" onClick={handleCOD} disabled={loading}>💵 Cash on Delivery</button>
                        <button className="payment-option upi" onClick={handleUPI} disabled={loading}>📱 UPI / Card / NetBanking</button>
                        <button className="payment-option cancel" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <h1>Your Cart</h1>

            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <h2>Your cart is empty</h2>
                    <p>Add some delicious items from our menu!</p>
                    <button onClick={() => navigate('/')}>Browse Menu</button>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <img src={item.image} alt={item.name}
                                    onError={e => { e.target.src = 'https://via.placeholder.com/72x72/1a1a1a/ff6b00?text=Food' }} />
                                <div className="cart-item-details">
                                    <h3>{item.name}</h3>
                                    <p>₹{item.price}</p>
                                </div>
                                <div className="cart-item-quantity">
                                    <button onClick={() => handleDecreaseQuantity(item)}>−</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleIncreaseQuantity(item)}>+</button>
                                </div>
                                <div className="cart-item-total">₹{item.price * item.quantity}</div>
                                <button className="remove-btn" onClick={() => handleRemoveItem(item)}>Remove</button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-total">
                        <h3>Total: <span>₹{total.toFixed(2)}</span></h3>
                        <button className="checkout-btn" onClick={handleCheckout} disabled={loading}>
                            {loading ? 'Processing...' : 'Proceed to Checkout'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default CartPage
