import React, { useEffect, useState, useContext } from "react";
import "./CSS/RecipeModal.css";
import { GlobalStateContext } from "../context/GlobalStateContext";
import { handleAddToCart } from "../utils/handleAddToCart";

const RecipeModal = ({ recipe, closeModal }) => {

    const [qty, setQty] = useState(1);

    const { user, setCart } = useContext(GlobalStateContext);

    if (!recipe) return null;

    const price = 149 + recipe.id * 18;

    useEffect(() => {

        const handleEsc = (e) => {

            if (e.key === "Escape") {

                closeModal();

            }

        };

        window.addEventListener("keydown", handleEsc);

        return () => {

            window.removeEventListener("keydown", handleEsc);

        };

    }, [closeModal]);

    const onAddCart = async () => {

        const success = await handleAddToCart({

            user,

            recipe,

            qty,

            setCart,

        });

        if (success) {

            alert("✅ Added to Cart");

            closeModal();

        }

    };

    return (

        <div
            className="recipe-overlay"
            onClick={closeModal}
        >

            <div
                className="recipe-modal"
                onClick={(e) => e.stopPropagation()}
            >

                <button
                    className="recipe-close"
                    onClick={closeModal}
                >
                    ✕
                </button>

                <div className="recipe-left">

                    <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="recipe-image"
                    />

                </div>

                <div className="recipe-right">

                    <span className="recipe-category">

                        {recipe.cuisine}

                    </span>

                    <h1>{recipe.name}</h1>

                    <div className="recipe-info">

                        <div>
                            <h4>Prep Time</h4>
                            <p>{recipe.prepTimeMinutes} mins</p>
                        </div>

                        <div>
                            <h4>Serves</h4>
                            <p>{recipe.servings}</p>
                        </div>

                        <div>
                            <h4>Calories</h4>
                            <p>🔥 {recipe.caloriesPerServing}</p>
                        </div>

                    </div>

                    <h3>🥬 Ingredients</h3>

                    <ul className="ingredients-list">

                        {recipe.ingredients.map((item, index) => (

                            <li key={index}>

                                {item}

                            </li>

                        ))}

                    </ul>

                    <div className="combo-box">

                        <h3>Recommended Combo</h3>

                        <div className="combo-items">

                            <span>🥤 Coke</span>

                            <span>🍟 French Fries</span>

                            <span>🍰 Dessert</span>

                            <span>🥗 Salad</span>

                        </div>

                    </div>

                    <div className="nutrition-grid">

                        <div>
                            Protein
                            <h2>25g</h2>
                        </div>

                        <div>
                            Carbs
                            <h2>40g</h2>
                        </div>

                        <div>
                            Fat
                            <h2>12g</h2>
                        </div>

                        <div>
                            Fiber
                            <h2>8g</h2>
                        </div>

                    </div>

                    <div className="recipe-rating-price">

                        <span>

                            ⭐ {recipe.rating}

                        </span>

                        <span>

                            ₹{price}

                        </span>

                    </div>

                    <div className="recipe-buttons">

                        <div className="qty-wrapper">

                            <button
                                onClick={() =>
                                    setQty((prev) => Math.max(1, prev - 1))
                                }
                            >
                                −
                            </button>

                            <span>{qty}</span>

                            <button
                                onClick={() =>
                                    setQty((prev) => prev + 1)
                                }
                            >
                                +
                            </button>

                        </div>

                        <button
                            className="cart-btn"
                            onClick={onAddCart}
                        >
                            🛒 Add {qty}
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default RecipeModal;