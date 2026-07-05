import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase";

/* -----------------------------
   Place Order
------------------------------ */

export const placeOrder = async (
    uid,
    cartItems,
    total,
    paymentMethod,
    address
) => {

    const orderRef = await addDoc(

        collection(
            db,
            "users",
            uid,
            "orders"
        ),

        {

            items: cartItems,

            total,

            paymentMethod,

            address,

            status: "Placed",

            createdAt: serverTimestamp(),

        }

    );

    // Auto Update Status

    setTimeout(() => {

        updateOrderStatus(
            uid,
            orderRef.id,
            "Confirmed"
        );

    }, 10000);

    setTimeout(() => {

        updateOrderStatus(
            uid,
            orderRef.id,
            "Preparing"
        );

    }, 20000);

    setTimeout(() => {

        updateOrderStatus(
            uid,
            orderRef.id,
            "Out For Delivery"
        );

    }, 30000);

    setTimeout(() => {

        updateOrderStatus(
            uid,
            orderRef.id,
            "Delivered"
        );

    }, 40000);

};

/* -----------------------------
   Load Orders
------------------------------ */

export const loadOrders = async (uid) => {

  const snap = await getDocs(
    collection(db, "users", uid, "orders")
  );

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

};

/* -----------------------------
   Clear Cart
------------------------------ */

export const clearCart = async (
  uid,
  cartItems
) => {

  for (const item of cartItems) {

    await deleteDoc(
      doc(
        db,
        "users",
        uid,
        "cart",
        item.id.toString()
      )
    );

  }

};

/* -----------------------------
   Update Order Status
------------------------------ */

export const updateOrderStatus = async (
    uid,
    orderId,
    status
) => {

    await updateDoc(
        doc(
            db,
            "users",
            uid,
            "orders",
            orderId
        ),
        {
            status
        }
    );

};