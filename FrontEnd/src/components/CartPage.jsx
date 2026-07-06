import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './CSS/Cart.css'
import { GlobalStateContext } from '../context/GlobalStateContext'
import {loadCart,removeCartItem,updateCartQty,} from "../services/cartService";
import {placeOrder, clearCart,} from "../services/orderService";
import toast from "react-hot-toast";
import AddressModal from "./cart/AddressModal";
import { openRazorpay } from "../services/paymentService";

const CartPage = () => {
    const {user,isLoggedIn,} = useContext(GlobalStateContext);
    const [cartItems, setCartItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
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

            if (!isLoggedIn) {

                navigate("/login");

                return;

            }

                setShowAddressModal(true);


        };
    

        const handleAddressContinue = (address) => {

        setSelectedAddress(address);

        setShowAddressModal(false);

        setShowPaymentModal(true);

        };


    const handleRazorpay = async () => {

    if (!selectedAddress) {

        toast.error("Please select address");

        return;

    }

    openRazorpay({

        amount: total,

        user,

        onSuccess: async (payment) => {

            await placeOrder(

                user.uid,

                cartItems,

                total,

                "Razorpay",

                selectedAddress,

                "Paid",

                payment.razorpay_payment_id

            );

            await clearCart(

                user.uid,

                cartItems

            );

            toast.success("Payment Successful 🎉");

            navigate("/orders");

        },

        onFailure: () => {

            toast.error("Payment Cancelled");

        }

    });

};

const handleCOD = async () => {

    if (!selectedAddress) {

        toast.error("Please select an address");

        return;

    }

    try {

        setLoading(true);

        await placeOrder(

            user.uid,
            cartItems,
            total,

            "Cash On Delivery",

            selectedAddress,

            "Pending",

            ""

        );

        await clearCart(user.uid, cartItems);

        toast.success("Order Placed Successfully 🎉");

        setShowPaymentModal(false);

        navigate("/orders");

    } catch (err) {

        console.error(err);

        toast.error("Failed to place order");

    } finally {

        setLoading(false);

    }

};

    return (
        <div className="cart-container">
            {
                showAddressModal && (

                <AddressModal

                onClose={() => setShowAddressModal(false)}

                onContinue={handleAddressContinue}

                />

                )
                }
            {showPaymentModal && (
                <div className="payment-modal">
                    <div className="payment-modal-content">
                        <h3>💳 Select Payment Method</h3>
                        <button className="payment-option cod" onClick={handleCOD} disabled={loading}>💵 Cash on Delivery</button>
                        {/* <button className="payment-option upi" onClick={handleUPI} disabled={loading}>📱 UPI / Card / NetBanking</button> */}
                        <button
                            className="payment-option upi"
                            onClick={handleRazorpay}
                        >
                            💳 Pay with UPI / Card / NetBanking
                        </button>
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
