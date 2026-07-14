/* eslint-disable react-refresh/only-export-components */
import {createContext,useState,useEffect} from "react";
import { logoutUser } from "../services/authService";
import { loadCart } from "../services/cartService";
import { useNavigate } from "react-router-dom";
import { addFavoriteItem, loadFavorites, removeFavoriteItem,} from "../services/favoriteService";
import toast from "react-hot-toast";

export const GlobalStateContext = createContext();


export const GlobalStateProvider = ({ children }) => {

  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  // ---------------------------
  // Theme
  // ---------------------------

  const [Togg, setTogg] = useState(false);

  // ---------------------------
  // User
  // ---------------------------

  const [user, setUser] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loading, setLoading] = useState(true);

  // ---------------------------
  // Session
  // ---------------------------

  const [sessionId, setSessionId] = useState("");

  // ---------------------------
  // Cart
  // ---------------------------

  const [Quantity, setQuantity] = useState(0);

  const [displayCart, setDisplayCart] = useState(false);

  // ---------------------------
  // Favorites
  // ---------------------------

const [favorites, setFavorites] = useState([]);


  // ---------------------------
  // Create Session
  // ---------------------------

  useEffect(() => {

    let sid = localStorage.getItem("sessionId");

    if (!sid) {

      sid =
        "session_" +
        Math.random().toString(36).substring(2, 12);

      localStorage.setItem("sessionId", sid);

    }

    setSessionId(sid);

  }, []);

  // ---------------------------
  // Restore Login
  // ---------------------------

  useEffect(() => {

    const savedUser = localStorage.getItem("user");

    const loginState =
      localStorage.getItem("isLoggedIn");

    if (savedUser && loginState === "true") {

      setUser(JSON.parse(savedUser));

      setIsLoggedIn(true);

    }

    setLoading(false);

  }, []);

  // ---------------------------
  // Login
  // ---------------------------

const login = async (firebaseUser) => {

    setUser(firebaseUser);

    const items = await loadCart(
      firebaseUser.uid
    );

setCart(items);

    setIsLoggedIn(true);

    localStorage.setItem(
        "user",
        JSON.stringify(firebaseUser)
    );

    localStorage.setItem(
        "isLoggedIn",
        "true"
    );

};

useEffect(() => {

    if (!user) {

        setFavorites([]);

        return;

    }

    loadFavorites(user.uid)

        .then(setFavorites)

        .catch(console.error);

}, [user]);
  // ---------------------------
  // Logout
  // ---------------------------

const logout = async () => {

    await logoutUser();

    localStorage.removeItem("user");

    localStorage.removeItem("isLoggedIn");

    setUser(null);

    setIsLoggedIn(false);

    navigate("/");

};

  // ---------------------------
  // Toggle Theme
  // ---------------------------

const toggleTheme = () => {
  setTogg((prev) => !prev);
};
  // ---------------------------
  // Favorites
  // ---------------------------

const addFavorite = async (recipe) => {

    if (!user) {

        toast.error("Please login first");

        return;

    }

    const exists = favorites.find(

        item => item.id === recipe.id

    );

    if (exists) {

        return;

    }

    await addFavoriteItem(

        user.uid,

        recipe

    );

    const data = await loadFavorites(user.uid);

    setFavorites(data);

};


const removeFavorite = async (id) => {

    await removeFavoriteItem(

        user.uid,

        id

    );

    const data = await loadFavorites(user.uid);

    setFavorites(data);

};

const clearFavorites = () => {

    setFavorites([]);

};
  // ---------------------------
  // Context Values
  // ---------------------------

  const value = {

    Togg,
    setTogg,
    toggleTheme,

    user,
    setUser,

    isLoggedIn,
    setIsLoggedIn,

    loading,

    sessionId,

    login,
    logout,

    Quantity,
    setQuantity,

    displayCart,
    setDisplayCart,

    favorites,
    addFavorite,
    removeFavorite,
    clearFavorites,

    cart,
    setCart,

  };

  return (

    <GlobalStateContext.Provider value={value}>

      {children}

    </GlobalStateContext.Provider>

  );

};