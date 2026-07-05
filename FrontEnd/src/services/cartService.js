import {collection,doc,setDoc,getDocs,deleteDoc,updateDoc,} from "firebase/firestore";

import { db } from "../firebase";

/* --------------------------
   Add Item
---------------------------*/

export const addCartItem = async (
  uid,
  recipe,
  qty = 1
) => {

  const ref = doc(
    db,
    "users",
    uid,
    "cart",
    recipe.id.toString()
  );

  await setDoc(
    ref,
    {
      id: recipe.id,
      name: recipe.name,
      image: recipe.image,
      cuisine: recipe.cuisine,
      rating: recipe.rating,
      quantity: qty,
      price: 149 + recipe.id * 18,
    },
    {
      merge: true,
    }
  );
};

/* --------------------------
   Load Cart
---------------------------*/

export const loadCart = async (uid) => {

  const snap = await getDocs(
    collection(
      db,
      "users",
      uid,
      "cart"
    )
  );

  return snap.docs.map((doc) => ({
    ...doc.data(),
  }));
};

/* --------------------------
   Remove Item
---------------------------*/

export const removeCartItem = async (
  uid,
  id
) => {

  await deleteDoc(
    doc(
      db,
      "users",
      uid,
      "cart",
      id.toString()
    )
  );

};

/* --------------------------
   Update Qty
---------------------------*/

export const updateCartQty = async (
  uid,
  id,
  qty
) => {

  await updateDoc(
    doc(
      db,
      "users",
      uid,
      "cart",
      id.toString()
    ),
    {
      quantity: qty,
    }
  );

};