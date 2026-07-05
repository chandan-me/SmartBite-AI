import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";

/* -----------------------------
   Place Order
------------------------------ */

export const placeOrder = async (
  uid,
  cartItems,
  total,
  paymentMethod
) => {

  await addDoc(
    collection(db, "users", uid, "orders"),
    {
      items: cartItems,
      total,
      paymentMethod,
      status: "Placed",
      createdAt: serverTimestamp(),
    }
  );

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