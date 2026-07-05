import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './CSS/Orders.css'
import { GlobalStateContext } from '../context/GlobalStateContext'
import { loadOrders } from "../services/orderService";

const OrdersPage = () => {
    const { isLoggedIn, user } = useContext(GlobalStateContext)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {

        if (!isLoggedIn) {

            navigate("/login");

            return;

        }

        fetchOrders();

    }, [user, isLoggedIn, navigate]);

const fetchOrders = async () => {

    if (!user) return;

    try {

        const data = await loadOrders(user.uid);

        setOrders(
    data.sort((a, b) => {

        if (!a.createdAt || !b.createdAt)
            return 0;

        return (
            b.createdAt.seconds -
            a.createdAt.seconds
        );

        })
    );

    } catch (error) {

        console.error(error);

    }

    setLoading(false);

};

        const getStatusClass = (status) => {
            switch (status) {
                case "Placed":
                    return "status-placed";

                case "Confirmed":
                    return "status-confirmed";

                case "Preparing":
                    return "status-preparing";

                case "Out For Delivery":
                    return "status-out-for-delivery";

                case "Delivered":
                    return "status-delivered";

                default:
                    return "";
            }
        };

        const getStatusIcon = (status) => {
            switch (status) {
                case "Placed":
                    return "📝";

                case "Confirmed":
                    return "✅";

                case "Preparing":
                    return "👨‍🍳";

                case "Out For Delivery":
                    return "🛵";

                case "Delivered":
                    return "🍽️";

                default:
                    return "📦";
            }
        };

    if (!isLoggedIn) {
        return null
    }

    return (
        <div className="orders-container">
            <h1>My Orders</h1>
            
            {loading ? (
                <div className="orders-loading">Loading your orders...</div>
            ) : !Array.isArray(orders) || orders.length === 0 ? (
                <div className="no-orders">
                    <h2>No orders yet</h2>
                    <p>Hungry? Order some delicious food!</p>
                    <button onClick={() => navigate('/#items')}>Browse Menu</button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <div className="order-id">
                                    Order #{order.id.slice(0,8)}
                                </div>
                                <div className="order-date">
                                   {
                                        order.createdAt
                                            ? order.createdAt.toDate().toLocaleString("en-IN")
                                            : "Just Now"
                                    }
                                </div>
                            </div>

                            <div className="order-items">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-quantity">x{item.quantity}</span>
                                        <span className="item-price">₹{item.price}</span>
                                    </div>
                                ))}
                            </div>

                                <div className="order-footer">

                                    <div className="order-total">
                                        Total: <span>₹{order.total}</span>
                                    </div>

                                    <div className="order-payment">
                                        Payment: {order.paymentMethod}
                                    </div>

                                    <div className={`order-status ${getStatusClass(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {" "}
                                        {order.status}
                                    </div>

                                </div>

                                {order.status === "Delivered" && (

                                    <div className="order-review">

                                        <button className="review-btn">

                                            Rate & Review

                                        </button>

                                    </div>

                                )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default OrdersPage