import { useContext, useEffect, useState } from "react";
import "./CSS/Items.css";
import "./CSS/RecipeModal.css";

import { getRecipes } from "../recipeApi";
import { GlobalStateContext } from "../context/GlobalStateContext";
import RecipeModal from "./RecipeModal";
import { handleAddToCart } from "../utils/handleAddToCart";
import toast from "react-hot-toast";

const ItemsPage = () => {

    const {
        user,
        setCart,
        addFavorite,
        favorites,
        removeFavorite,

    } = useContext(GlobalStateContext);

    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [cartQty, setCartQty] = useState({});

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
            const query = search.toLowerCase();
            if (query === 'veg' || query === 'vegetarian') {
                const vegKeywords = ['veg', 'vegetarian', 'vegetable', 'vegan', 'plant-based', 'paneer', 'tofu', 'margherita', 'cheese', 'beans', 'lentils', 'spinach', 'quinoa', 'salad'];
                const nonVegKeywords = ['chicken', 'mutton', 'beef', 'pork', 'fish', 'seafood', 'shrimp', 'prawn', 'salmon', 'meat', 'bacon', 'turkey', 'pepperoni'];
                temp = temp.filter((item) => {
                    const nameLower = item.name.toLowerCase();
                    const hasNonVeg = nonVegKeywords.some(kw => nameLower.includes(kw));
                    if (hasNonVeg) return false;
                    return vegKeywords.some(kw => nameLower.includes(kw)) ||
                           (!nameLower.includes('chicken') && !nameLower.includes('beef') && !nameLower.includes('shrimp'));
                });
            } else if (query === 'dessert' || query === 'sweet') {
                const sweetKeywords = ['cake', 'dessert', 'sweet', 'cookie', 'brownie', 'ice cream', 'lava', 'halwa', 'chocolate', 'donut', 'cupcake', 'pie', 'pudding'];
                temp = temp.filter((item) =>
                    sweetKeywords.some(kw => item.name.toLowerCase().includes(kw))
                );
            } else {
                temp = temp.filter((item) =>
                    item.name
                        .toLowerCase()
                        .includes(search.toLowerCase())
                );
            }
        }

        setFilteredRecipes(temp);

    }, [recipes, search, selectedCategory]);

    useEffect(() => {
        const handleVoiceFilter = (e) => {
            const cat = e.detail.category.toLowerCase();
            
            const matchedCuisine = (categories || []).find(
                c => c.toLowerCase() === cat
            );
            
            if (matchedCuisine) {
                setSelectedCategory(matchedCuisine);
                setSearch("");
            } else {
                setSelectedCategory("All");
                const keywordMap = {
                    veg: "veg",
                    vegetarian: "veg",
                    dessert: "cake",
                    sweet: "cake",
                    spicy: "chilli",
                    burger: "burger",
                    pizza: "pizza",
                    salad: "salad",
                    drinks: "juice"
                };
                setSearch(keywordMap[cat] || cat);
            }
        };

        window.addEventListener('voice:filter', handleVoiceFilter);
        return () => window.removeEventListener('voice:filter', handleVoiceFilter);
    }, [categories]);

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

    const onAddCart = async (item) => {

        const qty = cartQty[item.id] ?? 0;

        const success = await handleAddToCart({

            user,
            recipe: item,
            qty,
            setCart,

        });

        if (success) {

            toast.success(`${item.name} added to cart`);

        }
        else {

            toast.error(`Failed to add ${item.name} to cart`);
        }

    };

    if (loading) {

        return (

            <div className="loading">

                <h2>🍕 Loading Recipes...</h2>

            </div>

        );

    }

    return (

        <div
            className="sb-menu-section"
            id="items"
        >

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
                    className="sb-search"
                    placeholder="Search Recipes..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>

            <div className="sb-cat-nav">

                {categories.map((cat) => (

                    <button
                        key={cat}
                        className={`sb-cat-btn ${
                            selectedCategory === cat
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setSelectedCategory(cat)
                        }
                    >
                        {catEmoji(cat)} {cat}
                    </button>

                ))}

            </div>

            <div className="sb-menu-grid">

                {filteredRecipes.map((item) => {

                    const qty =
                        cartQty[item.id] ?? 0;

                    const isFavorite =
                        favorites.some(
                            (fav) => fav.id === item.id
                        );
                    
                                    const price = item.price


                    return (

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

                                <h3>{item.name}</h3>

  

                                <p>
                                    🍽 Serves: {item.servings}
                                </p>

                                <p>
                                    🔥{" "}
                                    {item.caloriesPerServing}
                                    {" "}Calories
                                </p>


                        <div className="sb-food-card__meta">

                          <div className="rating">

                              ⭐ {item.rating}

                              <span>
                                  ({item.reviewCount} Reviews)
                              </span>

                          </div>

                          <div className="price">

                              ₹{price}

                          </div>

                      </div>

                                <div className="sb-menu-card__footer">

                                <button
                                    className="favorite-btn-card"
                                    onClick={() => {

                                        if (isFavorite) {

                                            removeFavorite(item.id);

                                        } else {

                                            addFavorite(item);

                                        }

                                    }}
                                >
                                    {isFavorite ? "❤️ Added" : "🤍 Favorite"}
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
                                                setCartQty(
                                                    (prev) => ({
                                                        ...prev,
                                                        [item.id]:
                                                            Math.max(
                                                                0,
                                                                qty - 1
                                                            ),
                                                    })
                                                )
                                            }
                                        >
                                            −
                                        </button>

                                        <span className="qty-number">
                                            {qty}
                                        </span>

                                        <button
                                            className="qty-btn"
                                            onClick={() =>
                                                setCartQty(
                                                    (prev) => ({
                                                        ...prev,
                                                        [item.id]:
                                                            qty + 1,
                                                    })
                                                )
                                            }
                                        >
                                            +
                                        </button>

                                            <button
                                                className="add-cart-card-btn"
                                                onClick={() => onAddCart(item)}
                                                disabled={qty === 0}
                                            >
                                                {qty === 0 ? "🛒 Add" : `🛒 ${qty}`}
                                            </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    );

                })}

            </div>

            {showModal && selectedRecipe && (

                <RecipeModal
                    recipe={selectedRecipe}
                    closeModal={() => {

                        setShowModal(false);

                        setSelectedRecipe(null);

                    }}
                />

            )}

        </div>

    );

};

export default ItemsPage;