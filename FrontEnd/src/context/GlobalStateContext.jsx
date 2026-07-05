import React, {createContext,useState,useEffect} from "react";
import { logoutUser } from "../services/authService";
import { loadCart } from "../services/cartService";
import { useNavigate } from "react-router-dom";


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

const [favorites, setFavorites] = useState(() => {
  const saved = localStorage.getItem("favorites");
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}, [favorites]);
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

const addFavorite = (recipe) => {
  setFavorites((prev) => {
    const exists = prev.find(
      (item) => item.id === recipe.id
    );

    if (exists) return prev;

    return [...prev, recipe];
  });
};

  const removeFavorite = (id) => {

    const updated = favorites.filter(
      (item) => item.id !== id
    );

    setFavorites(updated);

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