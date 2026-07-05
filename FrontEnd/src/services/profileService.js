import {
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";

import {
    updateProfile,
} from "firebase/auth";

import { db, auth } from "../firebase";

export const loadProfile = async (uid) => {

    const snap = await getDoc(
        doc(db, "users", uid)
    );

    return snap.data();

};

export const updateUserName = async (uid, name) => {

    await updateDoc(
        doc(db, "users", uid),
        {
            name,
        }
    );

    if (auth.currentUser) {

        await updateProfile(
            auth.currentUser,
            {
                displayName: name,
            }
        );

    }

};