import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNNM_hVFvAz-ajiPaMHOEIziK4UriaTJI",
  authDomain: "smartbite-4eedd.firebaseapp.com",
  projectId: "smartbite-4eedd",
  storageBucket: "smartbite-4eedd.firebasestorage.app",
  messagingSenderId: "541194192888",
  appId: "1:541194192888:web:ff31213f3cbff6ef06f80d",
  measurementId: "G-4M6WP33X3V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;