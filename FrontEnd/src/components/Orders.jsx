import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/Orders.css";
import { GlobalStateContext } from "../context/GlobalStateContext";
import { loadOrders } from "../services/orderService";

const OrdersPage = () => {

    const { isLoggedIn, user } = useContext(GlobalStateContext);

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const orderSteps = [
        "Placed",
        "Confirmed",
        "Preparing",
        "Out For Delivery",
        "Delivered",
    ];

    useEffect(() => {

        if (!isLoggedIn) {

            navigate("/login");

            return;

        }

        fetchOrders();

        const interval = setInterval(() => {

            fetchOrders();

        }, 3000);

        return () => clearInterval(interval);

    }, [user, isLoggedIn]);

    const fetchOrders = async () => {

        if (!user) return;

        try {

            const data = await loadOrders(user.uid);

            const sorted = data.sort((a, b) => {

                if (!a.createdAt || !b.createdAt) return 0;

                return (

                    b.createdAt.seconds -

                    a.createdAt.seconds

                );

            });

            setOrders(sorted);

        } catch (err) {

            console.error(err);

        }

        setLoading(false);

    };

    const getCurrentStatus = (createdAt) => {

        if (!createdAt) return "Placed";

        const seconds = Math.floor(

            (Date.now() - createdAt.toDate().getTime()) /

            1000

        );

        if (seconds < 1000) return "Placed";

        if (seconds < 2000) return "Confirmed";

        if (seconds < 3000) return "Preparing";

        if (seconds < 4000) return "Out For Delivery";

        return "Delivered";

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

    if (!isLoggedIn) return null;

        return (
        <div className="orders-container">

            <h1 className="orders-title">
                📦 My Orders
            </h1>

            {loading ? (

                <div className="orders-loading">

                    Loading your orders...

                </div>

            ) : orders.length === 0 ? (

                <div className="no-orders">

                    <h2>🍔 No Orders Yet</h2>

                    <p>
                        Looks like you haven't ordered anything.
                    </p>

                    <button
                        onClick={() => navigate("/")}
                    >
                        Browse Menu
                    </button>

                </div>

            ) : (

                <div className="orders-list">

                    {orders.map((order) => {

                        const liveStatus =
                            getCurrentStatus(
                                order.createdAt
                            );

                        return (

                            <div
                                key={order.id}
                                className="order-card"
                            >

                                {/* Header */}

                                <div className="order-header">

                                    <div>

                                        <h3>

                                            Order #

                                            {order.id.slice(0, 8)}

                                        </h3>

                                        <p>

                                            {order.createdAt

                                                ? order.createdAt
                                                      .toDate()
                                                      .toLocaleString(
                                                          "en-IN"
                                                      )

                                                : "Just Now"}

                                        </p>

                                    </div>

                                    <div
                                        className={`order-status ${getStatusClass(
                                            liveStatus
                                        )}`}
                                    >

                                        {getStatusIcon(
                                            liveStatus
                                        )}

                                        {" "}

                                        {liveStatus}

                                    </div>

                                </div>

                                {/* Items */}

                                <div className="order-items">

                                    {order.items?.map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <div
                                                key={index}
                                                className="order-item"
                                            >

                                                <img
                                                    src={
                                                        item.image
                                                    }
                                                    alt={
                                                        item.name
                                                    }
                                                    className="order-food-img"
                                                />

                                                <div className="order-food-details">

                                                    <h4>

                                                        {
                                                            item.name
                                                        }

                                                    </h4>

                                                    <p>

                                                        Qty :
                                                        {" "}
                                                        {
                                                            item.quantity
                                                        }

                                                    </p>

                                                </div>

                                                <div className="order-food-price">

                                                    ₹
                                                    {item.price}

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                                {/* Timeline */}

                                <div className="order-tracker">

                                    {orderSteps.map(
                                        (
                                            step,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    step
                                                }
                                                className={`track-step ${
                                                    orderSteps.indexOf(
                                                        liveStatus
                                                    ) >=
                                                    index
                                                        ? "track-active"
                                                        : ""
                                                }`}
                                            >

                                                <div className="track-circle">

                                                    {step ===
                                                    "Placed"
                                                        ? "📝"
                                                        : step ===
                                                          "Confirmed"
                                                        ? "✅"
                                                        : step ===
                                                          "Preparing"
                                                        ? "👨‍🍳"
                                                        : step ===
                                                          "Out For Delivery"
                                                        ? "🛵"
                                                        : "🍽️"}

                                                </div>

                                                <div className="track-title">

                                                    {step}

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                                {/* Footer */}

                                <div className="order-footer">

                                    <div>

                                        <strong>

                                            💰 Total

                                        </strong>

                                        <br />

                                        ₹
                                        {order.total}

                                    </div>

                                    <div>

                                        <strong>

                                            💳 Payment

                                        </strong>

                                        <br />

                                        {
                                            order.paymentMethod
                                        }

                                    </div>

                                    <div>

                                        <strong>

                                            🚚 ETA

                                        </strong>

                                        <br />

                                        {liveStatus ===
                                        "Delivered"

                                            ? "Delivered"

                                            : liveStatus ===
                                              "Out For Delivery"

                                            ? "10 mins"

                                            : liveStatus ===
                                              "Preparing"

                                            ? "20 mins"

                                            : liveStatus ===
                                              "Confirmed"

                                            ? "30 mins"

                                            : "40 mins"}

                                    </div>

                                </div>

                                {liveStatus ===
                                    "Delivered" && (

                                    <div className="order-review">

                                        <button className="review-btn">

                                            ⭐ Rate &
                                            Review

                                        </button>

                                        <button className="review-btn reorder-btn">

                                            🔁 Reorder

                                        </button>

                                    </div>

                                )}

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

};

export default OrdersPage;