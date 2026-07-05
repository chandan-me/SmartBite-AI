import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from "firebase/auth";

import {doc, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase";

import { serverTimestamp } from "firebase/firestore";

export const signupUser = async (
  name,
  email,
  password
) => {

  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  await updateProfile(
    userCredential.user,
    {
      displayName: name,
    }
  );

  await setDoc(
    doc(
      db,
      "users",
      userCredential.user.uid
    ),
    {
      uid: userCredential.user.uid,
      name,
      email,
      createdAt: serverTimestamp(),
    }
  );

  return userCredential.user;
};

export const loginUser = async (
  email,
  password
) => {

  const userCredential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  return userCredential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};