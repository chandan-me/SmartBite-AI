import React, { useContext, useEffect, useState,} from "react";
import "./CSS/Items.css";
import { getRecipes } from "../recipeApi";
import { GlobalStateContext } from "../context/GlobalStateContext";
import RecipeModal from "./RecipeModal";
import "./CSS/RecipeModal.css";
import { addCartItem } from "../services/cartService";

const ItemsPage = () => {

  const { addFavorite } = useContext(GlobalStateContext);

  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cartQty, setCartQty] = useState({});
  const {user,cart,setCart} = useContext(GlobalStateContext);

  useEffect(() => {
    async function loadRecipes() {
      const data = await getRecipes();

      setRecipes(data);
      setFilteredRecipes(data);

      setCategories([
        "All",
        ...new Set(data.map((item) => item.cuisine)),
      ]);

      setLoading(false);
    }

    loadRecipes();
  }, []);

  useEffect(() => {
    let temp = [...recipes];

    if (selectedCategory !== "All") {
      temp = temp.filter(
        (item) => item.cuisine === selectedCategory
      );
    }

    if (search !== "") {
      temp = temp.filter((item) =>
        item.name
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    setFilteredRecipes(temp);
  }, [recipes, search, selectedCategory]);

  const catEmoji = (cat) => {
    const map = {
      All: "🍽️",
      Italian: "🍕",
      Indian: "🍛",
      American: "🍔",
      Mexican: "🌮",
      Mediterranean: "🥗",
      Japanese: "🍣",
      Thai: "🍜",
      Korean: "🍱",
    };

    return map[cat] || "🍴";
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>🍕 Loading Recipes...</h2>
      </div>
    );
  }

  return (
  <div className="sb-menu-section">

    <div className="sb-menu-header">
      <h2 className="sb-menu-title">
        🍴 Our Full Menu
      </h2>

      <span>
        {filteredRecipes.length} Recipes
      </span>
    </div>

    <div className="sb-search-container">
      <input
        type="text"
        className="sb-search"
        placeholder="Search Recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    <div className="sb-cat-nav">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`sb-cat-btn ${
            selectedCategory === cat ? "active" : ""
          }`}
          onClick={() => setSelectedCategory(cat)}
        >
          {catEmoji(cat)} {cat}
        </button>
      ))}
    </div>

    {/* Recipe Cards will come here */}
    <div className="sb-menu-grid">

  {filteredRecipes.map((item) => (

    <div
      key={item.id}
      className="sb-menu-card"
    >

      <div className="sb-menu-card__img-wrap">

        <img
          src={item.image}
          alt={item.name}
          className="sb-menu-card__img"
        />

        <span className="sb-menu-card__cat-badge">
          {item.cuisine}
        </span>

      </div>

      <div className="sb-menu-card__body">

        <h3 className="sb-menu-card__name">
          {item.name}
        </h3>
        <div className="rating">
        <p>⭐ {item.rating}  <span>({item.reviewCount} Reviews)</span></p>
        </div>
        <p>🍽 Serves: {item.servings}</p>

        <p>🔥 {item.caloriesPerServing} Calories</p>

<div className="sb-menu-card__footer">

    <button
        className="favorite-btn-card"
        onClick={() => addFavorite(item)}
    >
        ❤️ Favorite
    </button>

    <button
        className="view-btn-card"
        onClick={() => {
            setSelectedRecipe(item);
            setShowModal(true);
        }}
    >
        👁 View Recipe
    </button>

</div>

<div className="sb-menu-card__footer">

  <div className="card-add-cart">

    <button
      className="qty-btn"
      onClick={() =>
        setCartQty((prev) => ({
          ...prev,
          [item.id]: Math.max(1, (prev[item.id] || 1) - 1),
        }))
      }
    >
      −
    </button>

    <span className="qty-number">
      {cartQty[item.id] || 1}
    </span>

    <button
      className="qty-btn"
      onClick={() =>
        setCartQty((prev) => ({
          ...prev,
          [item.id]: (prev[item.id] || 1) + 1,
        }))
      }
    >
      +
    </button>

    <button
      className="add-cart-card-btn"
      onClick={(handleAddCart) =>
        addToCart(item, cartQty[item.id] || 1)
      }
    >
      🛒 {cartQty[item.id] || 1}
    </button>

  </div>

</div>

      </div>

    </div>

  ))}

</div>
        {
        showModal && selectedRecipe && (

        <RecipeModal

        recipe={selectedRecipe}

        closeModal={() => {setShowModal(false)
                  setSelectedRecipe(null);

        }}
        />

        )
        }
  </div>

  
);
};

export default ItemsPage;