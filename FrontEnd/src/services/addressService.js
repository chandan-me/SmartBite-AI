import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
} from "firebase/firestore";

import { db } from "../firebase";

/* ==============================
        Save Address
============================== */

export const saveAddress = async (
    uid,
    address
) => {

    await addDoc(

        collection(
            db,
            "users",
            uid,
            "addresses"
        ),

        {

            ...address,

            createdAt: new Date(),

        }

    );

};

/* ==============================
        Load Addresses
============================== */

export const loadAddresses = async (
    uid
) => {

    const snap = await getDocs(

        collection(
            db,
            "users",
            uid,
            "addresses"
        )

    );

    return snap.docs.map(doc => ({

        id: doc.id,

        ...doc.data(),

    }));

};

/* ==============================
        Update Address
============================== */

export const updateAddress = async (
    uid,
    addressId,
    address
) => {

    await updateDoc(

        doc(
            db,
            "users",
            uid,
            "addresses",
            addressId
        ),

        address

    );

};

/* ==============================
        Delete Address
============================== */

export const deleteAddress = async (
    uid,
    addressId
) => {

    await deleteDoc(

        doc(
            db,
            "users",
            uid,
            "addresses",
            addressId
        )

    );

};