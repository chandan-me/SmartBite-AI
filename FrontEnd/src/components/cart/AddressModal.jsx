import React, { useContext, useEffect, useState } from "react";
import "../CSS/AddressModal.css";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import {
    saveAddress,
    loadAddresses,
    deleteAddress,
} from "../../services/addressService";

const emptyAddress = {
    fullName: "",
    phone: "",
    house: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
};

const AddressModal = ({ onClose, onContinue }) => {

    const { user } = useContext(GlobalStateContext);

    const [address, setAddress] = useState(emptyAddress);

    const [addresses, setAddresses] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (user) {

            fetchAddresses();

        }

    }, [user]);

    const fetchAddresses = async () => {

        const data = await loadAddresses(user.uid);

        setAddresses(data);

    };

    const handleChange = (e) => {

        setAddress({

            ...address,

            [e.target.name]: e.target.value,

        });

    };

    const handleSave = async () => {

        if (

            !address.fullName ||

            !address.phone ||

            !address.house ||

            !address.city ||

            !address.state ||

            !address.pincode

        ) {

            alert("Please fill all required fields.");

            return;

        }

        setLoading(true);

        await saveAddress(

            user.uid,

            address

        );

        await fetchAddresses();

        setAddress(emptyAddress);

        setLoading(false);

    };

    const handleDelete = async (id) => {

        await deleteAddress(

            user.uid,

            id

        );

        fetchAddresses();

    };

    return (

        <div className="address-overlay">

            <div className="address-modal">

                <button
                    className="address-close"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2>📍 Delivery Address</h2>

                {addresses.length > 0 && (

                    <div className="saved-addresses">

                        <h3>Saved Addresses</h3>

                        {addresses.map((item) => (

                            <div
                                key={item.id}
                                className="saved-card"
                            >

                                <div>

                                    <h4>{item.fullName}</h4>

                                    <p>

                                        {item.house},

                                        {" "}

                                        {item.area},

                                        {" "}

                                        {item.city}

                                    </p>

                                    <p>

                                        {item.state}

                                        {" "}

                                        -

                                        {" "}

                                        {item.pincode}

                                    </p>

                                </div>

                                <div className="saved-actions">

                                    <button

                                        onClick={() =>

                                            onContinue(item)

                                        }

                                    >

                                        Select

                                    </button>

                                    <button

                                        className="delete-btn"

                                        onClick={() =>

                                            handleDelete(item.id)

                                        }

                                    >

                                        Delete

                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

                <h3>Add New Address</h3>

                <div className="address-form">

                    <input
                        name="fullName"
                        placeholder="Full Name"
                        value={address.fullName}
                        onChange={handleChange}
                    />

                    <input
                        name="phone"
                        placeholder="Phone Number"
                        value={address.phone}
                        onChange={handleChange}
                    />

                    <input
                        name="house"
                        placeholder="House No / Street"
                        value={address.house}
                        onChange={handleChange}
                    />

                    <input
                        name="area"
                        placeholder="Area"
                        value={address.area}
                        onChange={handleChange}
                    />

                    <input
                        name="city"
                        placeholder="City"
                        value={address.city}
                        onChange={handleChange}
                    />

                    <input
                        name="state"
                        placeholder="State"
                        value={address.state}
                        onChange={handleChange}
                    />

                    <input
                        name="pincode"
                        placeholder="Pincode"
                        value={address.pincode}
                        onChange={handleChange}
                    />

                    <input
                        name="landmark"
                        placeholder="Landmark"
                        value={address.landmark}
                        onChange={handleChange}
                    />

                </div>

                <div className="address-buttons">

                    <button

                        className="save-address"

                        onClick={handleSave}

                        disabled={loading}

                    >

                        {loading

                            ? "Saving..."

                            : "💾 Save Address"}

                    </button>

                </div>

            </div>

        </div>

    );

};

export default AddressModal;