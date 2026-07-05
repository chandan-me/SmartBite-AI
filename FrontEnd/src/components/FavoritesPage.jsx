import React, { useContext, useState } from "react";
import { GlobalStateContext } from "../context/GlobalStateContext";
import { handleAddToCart } from "../utils/handleAddToCart";
import RecipeModal from "./RecipeModal";
import "./CSS/Favorites.css";

const FavoritesPage = () => {

    const {
        favorites,
        removeFavorite,
        user,
        setCart,
    } = useContext(GlobalStateContext);

    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = favorites.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <div className="favorites-page">

            <div className="favorites-header">

                <h1>    ❤️ My Favorites</h1>

                <div className="favorite-count">

                {filtered.length} Favorite Recipes

                </div>

            </div>

            <input
                className="favorite-search"
                placeholder="Search Favorites..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {filtered.length === 0 ? (

                    <div className="favorite-empty">

                        <div className="empty-icon">

                            ❤️

                        </div>

                        <h1>No Favorite Recipes</h1>
                        <br/>

                        <p>

                            Start exploring delicious recipes and add them here.

                        </p>

                    </div>

            ) : (

                <div className="favorite-grid">

                    {filtered.map((item) => (

                        <div
                            key={item.id}
                            className="favorite-card"
                        >

                            <img
                                src={item.image}
                                alt={item.name}
                            />

                            <div className="favorite-body">

                                <h3>{item.name}</h3>

                                <div className="favorite-rating">

                                    ⭐ {item.rating}

                                </div>

                                <div className="favorite-info">

                                    🍽 {item.servings} Servings

                                </div>

                                <div className="favorite-info">

                                    🔥 {item.caloriesPerServing} Calories

                                </div>

                            </div>

                            <div className="favorite-buttons">

                                <button

                                    className="favorite-remove"

                                    onClick={() => removeFavorite(item.id)}

                                >

                                    ❤️ Remove

                                </button>

                                <button

                                    className="favorite-view"

                                    onClick={() => {

                                        setSelectedRecipe(item);

                                        setShowModal(true);

                                    }}

                                >

                                    👁 View

                                </button>

                                <button

                                    className="favorite-cart"

                                    onClick={() =>

                                        handleAddToCart({

                                            user,

                                            recipe: item,

                                            qty: 1,

                                            setCart,

                                        })

                                    }

                                >

                                    🛒 Add

                                </button>

                            </div>

                            </div>


                    ))}

                </div>

            )}

            {showModal && (

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

export default FavoritesPage;