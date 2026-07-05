import {
    collection,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase";

/* --------------------
   Add Favorite
---------------------*/

export const addFavoriteItem = async (uid, recipe) => {

    await setDoc(
        doc(
            db,
            "users",
            uid,
            "favorites",
            recipe.id.toString()
        ),
        {
            ...recipe,
        }
    );

};

/* --------------------
   Load Favorites
---------------------*/

export const loadFavorites = async (uid) => {

    const snap = await getDocs(
        collection(
            db,
            "users",
            uid,
            "favorites"
        )
    );

    return snap.docs.map(doc => doc.data());

};

/* --------------------
   Remove Favorite
---------------------*/

export const removeFavoriteItem = async (
    uid,
    recipeId
) => {

    await deleteDoc(
        doc(
            db,
            "users",
            uid,
            "favorites",
            recipeId.toString()
        )
    );

};