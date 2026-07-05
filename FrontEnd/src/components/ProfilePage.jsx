import React, {
    useContext,
    useEffect,
    useState,
} from "react";

import "./CSS/Profile.css";

import {
    GlobalStateContext,
} from "../context/GlobalStateContext";

import {
    loadProfile,
    updateUserName,
} from "../services/profileService";

import {
    loadOrders,
} from "../services/orderService";

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

    useEffect(() => {

        if (!user) return;

        fetchData();

    }, [user]);

    const fetchData = async () => {

        const p = await loadProfile(user.uid);

        const o = await loadOrders(user.uid);

        setProfile(p);

        setOrders(o);

        setName(p.name);

    };

    const saveName = async () => {

        await updateUserName(
            user.uid,
            name
        );

        const p = await loadProfile(user.uid);

        setProfile(p);

        setEditing(false);

    };

    if (!profile) {

        return (
            <div className="profile-loading">
                Loading...
            </div>
        );

    }

    return (

        <div className="profile-page">

            <div className="profile-card">

                <div className="profile-avatar">

                    {profile.name
                        .split(" ")
                        .map(x => x[0])
                        .join("")
                        .substring(0,2)
                        .toUpperCase()}

                </div>

                {
                    editing ?

                    <>

                        <input

                            value={name}

                            onChange={(e)=>

                                setName(e.target.value)

                            }

                        />

                        <button

                            onClick={saveName}

                        >

                            Save

                        </button>

                    </>

                    :

                    <>

                        <h2>{profile.name}</h2>

                        <button

                            onClick={()=>

                                setEditing(true)

                            }

                        >

                            ✏ Edit

                        </button>

                    </>

                }

                <p>{profile.email}</p>

                <div className="profile-stats">

                    <div>

                        ❤️

                        <h2>

                            {favorites.length}

                        </h2>

                        Favorites

                    </div>

                    <div>

                        🛒

                        <h2>

                            {cart.length}

                        </h2>

                        Cart

                    </div>

                    <div>

                        📦

                        <h2>

                            {orders.length}

                        </h2>

                        Orders

                    </div>

                </div>

                <button

                    className="logout-btn"

                    onClick={logout}

                >

                    Logout

                </button>

            </div>

        </div>

    );

};

export default ProfilePage;